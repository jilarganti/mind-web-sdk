import "webrtc-adapter";
import {DistortionRegistry} from "./DistortionRegistry";
import {MediaStreamAudioBuffer} from "./MediaStreamAudioBuffer";
import {MediaStreamVideoBuffer} from "./MediaStreamVideoBuffer";
import {MindSDK} from "./MindSDK";
import {WebRtcPublication} from "./WebRtcPublication";
import {WebRtcSubscription} from "./WebRtcSubscription";
import {WebRtcTransceiver} from "./WebRtcTransceiver";

let AUDIO_CODECS = [];
let VIDEO_CODECS = [];
if (typeof RTCRtpSender !== "undefined" && typeof RTCRtpSender.getCapabilities !== "undefined") {
    AUDIO_CODECS = RTCRtpSender.getCapabilities("audio").codecs.filter(codec => !codec.mimeType.toLowerCase().match(/audio\/(isac|g722|ilbc|pcmu|pcma|cn|telephone-event)/)).sort((c1, c2) => c2.mimeType === "audio/red" ? 1 : -1);
    VIDEO_CODECS = RTCRtpSender.getCapabilities("video").codecs.filter(codec => !codec.mimeType.toLowerCase().match(/video\/(vp9|h264|av1x?)/) ||
                                                                                 codec.mimeType.toLowerCase() === "video/h264" && codec.sdpFmtpLine.toLowerCase().match("packetization-mode=1") && codec.sdpFmtpLine.toLowerCase().match("profile-level-id=42e01f") ||
                                                                                 codec.mimeType.toLowerCase() === "video/vp9" && codec.sdpFmtpLine.toLowerCase().match("profile-id=0"));
}

let VP8_RTPMAP_PATTERN = /\r\na=rtpmap:([0-9]+) VP8\/90000/;
let H264_RTPMAP_PATTERN = /\r\na=rtpmap:([0-9]+) H264\/90000/;
let VP9_RTPMAP_PATTERN = /\r\na=rtpmap:([0-9]+) VP9\/90000/;

/**
 * @implements {MediaStreamAudioConsumer}
 * @implements {MediaStreamVideoConsumer}
 * @implements {MediaStreamAudioSupplier}
 * @implements {MediaStreamVideoSupplier}
 *
 * @package
 */
export class WebRtcConnection {

    /**
     * @package
     */
    constructor(session) {
        this.session = session;
        this.useVP9 = false;
        if (window.chrome && parseInt(navigator.userAgent.replace(/.* Chrome\/(\d+).*/, "$1")) >= 111) {
            this.useVP9 = MindSDK.getOptions().isUseVp9ForSendingVideo();
            if (session.getOptions().isUseVp9ForSendingVideo() != null) {
                this.useVP9 = session.getOptions().isUseVp9ForSendingVideo();
            }
        }
        this.pc = null;
        this.iceCandidatesGatheringCompletePromise = null;
        this.negotiationTimeoutId = null;
        this.negotiations = 0;
        this.httpPost = null;
        this.dataChannel = null;
        this.dataChannelOpened = false;
        this.primaryPublication = new WebRtcPublication();
        this.secondaryPublication = new WebRtcPublication();
        this.lagging = false;
        this.destroyed = false;
        this.statisticsUpdatingIntervalId = null;
        this.oldStatistics = null;
        this.webRtcTransceiverLastSdpSectionIndex = 1;
        this.inactiveAudioTransceivers = [];
        this.inactiveVideoTransceivers = [];
        this.subscriptions = new Map();
        this.distortionRegistry = new DistortionRegistry();
    }

    /**
     * @package
     */
    onOpened() {}

    /**
     * @package
     */
    onMessageReceived(message) {}

    /**
     * @package
     */
    onStartedLagging() {}

    /**
     * @package
     */
    onStoppedLagging() {}

    /**
     * @package
     */
    onFailed(error) {}

    /**
     * @package
     */
    onClosed(code) {}

    /**
     * @package
     */
    open() {
        let onFailed = (error) => {
            this.abort();
            this.onFailed(error);
        };
        try {
            if (this.pc == null) {
                let iceServers = [];
                let desiredIceCandidateTypes = new Set();
                if (this.session.getOptions().getStunServerURL() != null) {
                    desiredIceCandidateTypes.add("srflx");
                    iceServers.push({ urls: [ this.session.getOptions().getStunServerURL() ] });
                }
                if (this.session.getOptions().getTurnServerURL() != null) {
                    desiredIceCandidateTypes.add("relay");
                    iceServers.push({ urls: [ this.session.getOptions().getTurnServerURL() ],
                                      username: this.session.getOptions().getTurnServerUsername(),
                                      credential: this.session.getOptions().getTurnServerPassword() });
                }
                this.pc = new RTCPeerConnection({ iceServers: iceServers });
                this.iceCandidatesGatheringCompletePromise = this.createdPromiseWithReolovers();
                this.pc.onconnectionstatechange = (event) => {
                    switch (event.target.connectionState) {
                        case "failed":
                            onFailed(new Error("Connection failed"));
                            break;
                    }
                };
                this.pc.onnegotiationneeded = (event) => {
                    if (this.negotiationTimeoutId == null) {
                        this.negotiationTimeoutId = setTimeout(() => {
                            this.negotiationTimeoutId = null;
                            this.negotiations++;
                            if (this.negotiations === 1) {
                                let localSdp;
                                this.pc.createOffer().then((description) => {
                                    localSdp = description.sdp;
                                    localSdp = this.fixLocalSdpBeforeSetting(localSdp);
                                    return this.pc.setLocalDescription(new RTCSessionDescription({ type: "offer", sdp: localSdp }));
                                }).then(() => {
                                    return this.iceCandidatesGatheringCompletePromise;
                                }).then(() => {
                                    localSdp = this.fixLocalSdpBeforeSending(this.pc.localDescription.sdp);
                                    let requestDTO = { sdp: localSdp };
                                    return this.session.newHttpPost("/", requestDTO, (httpPost) => this.httpPost = httpPost).then((responseDTO) => {
                                        // It is important to pass to `fixRemoteSdp` method the same local SDP, which was set into `PeerConnection` object
                                        // (but not the one that was modified with `fixLocalSdpBeforeSending` method afterward), because otherwise the simulcast
                                        // attributes for inactive video sections wouldn't be removed properly from the remote SDP.
                                        let remoteSdp = this.fixRemoteSdp(responseDTO.sdp, this.pc.localDescription.sdp);
                                        let description = new RTCSessionDescription({ type: "answer", sdp: remoteSdp });
                                        return this.pc.setRemoteDescription(description);
                                    });
                                }).then(() => {
                                    this.negotiations--;
                                    if (this.negotiations > 0) {
                                        this.negotiations = 0;
                                        this.pc.onnegotiationneeded();
                                    } else {
                                        if (this.lagging) {
                                            this.lagging = false;
                                            this.onStoppedLagging();
                                        }
                                    }
                                }).catch((error) => {
                                    if (this.dataChannelOpened && error.message === "HTTP request timed out") {
                                        if (!this.lagging) {
                                            this.lagging = true;
                                            this.onStartedLagging();
                                        }
                                        this.negotiations = 0;
                                        this.pc.onnegotiationneeded();
                                    } else {
                                        onFailed(error);
                                    }
                                });
                            }
                        }, 0);
                    }
                };
                this.pc.onicecandidate = (event) => {
                    if (event.candidate != null) {
                        desiredIceCandidateTypes.delete(event.candidate.type);
                    }
                    if (desiredIceCandidateTypes.size === 0) {
                        this.iceCandidatesGatheringCompletePromise.resolve();
                    }
                }
                this.pc.onicegatheringstatechange = () => {
                    if (this.pc.iceGatheringState === "complete") {
                        this.iceCandidatesGatheringCompletePromise.resolve();
                    }
                };
                this.dataChannel = this.pc.createDataChannel("", this.createDataChannelInit());
                this.dataChannel.onopen = () => {
                    this.dataChannelOpened = true;
                    this.open();
                    this.onOpened();
                };
                this.dataChannel.onmessage = (event) => {
                    if (event.data === "4000" || event.data === "4001") {
                        this.onClosed(parseInt(event.data));
                    } else {
                        this.onMessageReceived(event.data);
                    }
                };
                this.dataChannel.onclose = () => {
                    if (this.pc != null) {
                        onFailed(new Error("Data channel closed without closing code"));
                    }
                };
                if (this.statisticsUpdatingIntervalId == null) {
                    if (this.primaryPublication.getStream() != null) {
                        this.primaryPublication.getStream().resetStatistics();
                    }
                    if (this.secondaryPublication.getStream() != null) {
                        this.secondaryPublication.getStream().resetStatistics();
                    }
                    for (let stream of this.subscriptions.keys()) {
                        stream.resetStatistics();
                    }
                    this.oldStatistics = null;
                    this.updateStatistics();
                    this.statisticsUpdatingIntervalId = setInterval(() => this.updateStatistics(), 1000);
                }
            }
            if (this.dataChannelOpened) {
                if (this.primaryPublication.getAudioTransceiver() == null) {
                    this.webRtcTransceiverLastSdpSectionIndex += 1;
                    this.primaryPublication.setAudioTransceiver(new WebRtcTransceiver(this.pc.addTransceiver("audio", this.createAudioTransceiverInit()), "audio", this.webRtcTransceiverLastSdpSectionIndex));
                    this.primaryPublication.getAudioTransceiver().setCodecPreferences(AUDIO_CODECS);
                }
                if (this.primaryPublication.getVideoTransceiver() == null) {
                    this.webRtcTransceiverLastSdpSectionIndex += 1;
                    this.primaryPublication.setVideoTransceiver(new WebRtcTransceiver(this.pc.addTransceiver("video", this.createVideoTransceiverInit()), "video", this.webRtcTransceiverLastSdpSectionIndex));
                    this.primaryPublication.getVideoTransceiver().setCodecPreferences(VIDEO_CODECS);
                }
                if (this.secondaryPublication.getAudioTransceiver() == null) {
                    this.webRtcTransceiverLastSdpSectionIndex += 1;
                    this.secondaryPublication.setAudioTransceiver(new WebRtcTransceiver(this.pc.addTransceiver("audio", this.createAudioTransceiverInit()), "audio", this.webRtcTransceiverLastSdpSectionIndex));
                    this.secondaryPublication.getAudioTransceiver().setCodecPreferences(AUDIO_CODECS);
                }
                if (this.secondaryPublication.getVideoTransceiver() == null) {
                    this.webRtcTransceiverLastSdpSectionIndex += 1;
                    this.secondaryPublication.setVideoTransceiver(new WebRtcTransceiver(this.pc.addTransceiver("video", this.createVideoTransceiverInit()), "video", this.webRtcTransceiverLastSdpSectionIndex));
                    this.secondaryPublication.getVideoTransceiver().setCodecPreferences(VIDEO_CODECS);
                }
                if (this.isSendingPrimaryAudio()) {
                    this.primaryPublication.getAudioTransceiver().setDirection("sendonly");
                    this.primaryPublication.getAudioTransceiver().setSendingTrack(this.primaryPublication.getAudioBuffer().getTrack());
                    this.configureAudioTransceiver(this.primaryPublication.getAudioTransceiver(), this.primaryPublication.getAudioBuffer(), this.primaryPublication.getStream());
                } else {
                    this.primaryPublication.getAudioTransceiver().setDirection("inactive");
                    this.primaryPublication.getAudioTransceiver().setSendingTrack(null);
                }
                if (this.isSendingPrimaryVideo()) {
                    this.primaryPublication.getVideoTransceiver().setDirection("sendonly");
                    this.primaryPublication.getVideoTransceiver().setSendingTrack(this.primaryPublication.getVideoBuffer().getTrack());
                    this.configureVideoTransceiver(this.primaryPublication.getVideoTransceiver(), this.primaryPublication.getVideoBuffer(), this.primaryPublication.getStream());
                } else {
                    this.primaryPublication.getVideoTransceiver().setDirection("inactive");
                    this.primaryPublication.getVideoTransceiver().setSendingTrack(null);
                }
                if (this.isSendingSecondaryAudio()) {
                    this.secondaryPublication.getAudioTransceiver().setDirection("sendonly");
                    this.secondaryPublication.getAudioTransceiver().setSendingTrack(this.secondaryPublication.getAudioBuffer().getTrack());
                    this.configureAudioTransceiver(this.secondaryPublication.getAudioTransceiver(), this.secondaryPublication.getAudioBuffer(), this.secondaryPublication.getStream());
                } else {
                    this.secondaryPublication.getAudioTransceiver().setDirection("inactive");
                    this.secondaryPublication.getAudioTransceiver().setSendingTrack(null);
                }
                if (this.isSendingSecondaryVideo()) {
                    this.secondaryPublication.getVideoTransceiver().setDirection("sendonly");
                    this.secondaryPublication.getVideoTransceiver().setSendingTrack(this.secondaryPublication.getVideoBuffer().getTrack());
                    this.configureVideoTransceiver(this.secondaryPublication.getVideoTransceiver(), this.secondaryPublication.getVideoBuffer(), this.secondaryPublication.getStream());
                } else {
                    this.secondaryPublication.getVideoTransceiver().setDirection("inactive");
                    this.secondaryPublication.getVideoTransceiver().setSendingTrack(null);
                }
                for (let subscription of this.subscriptions.values()) {
                    if (subscription.getAudioConsumer() != null) {
                        if (subscription.getAudioTransceiver() == null) {
                            subscription.setAudioTransceiver(this.acquireTransceiver("audio"));
                            subscription.getAudioConsumer().onAudioBuffer(new MediaStreamAudioBuffer(subscription.getAudioTransceiver().getReceivingTrack(), true));
                            subscription.getAudioTransceiver().setCodecPreferences(AUDIO_CODECS);
                        }
                    } else {
                        if (subscription.getAudioTransceiver() != null) {
                            this.releaseTransceiver(subscription.getAudioTransceiver());
                            subscription.setAudioTransceiver(null);
                        }
                    }
                    if (subscription.getVideoConsumer() != null) {
                        if (subscription.getVideoTransceiver() == null) {
                            subscription.setVideoTransceiver(this.acquireTransceiver("video"));
                            subscription.getVideoConsumer().onVideoBuffer(new MediaStreamVideoBuffer(subscription.getVideoTransceiver().getReceivingTrack(), true, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 1, 1.0));
                            subscription.getVideoTransceiver().setCodecPreferences(VIDEO_CODECS);
                        }
                    } else {
                        if (subscription.getVideoTransceiver() != null) {
                            this.releaseTransceiver(subscription.getVideoTransceiver());
                            subscription.setVideoTransceiver(null);
                        }
                    }
                }
            }
            this.pc.onnegotiationneeded();
        } catch (error) {
            onFailed(error);
        }
    }

    /**
     * @package
     */
    close() {
        this.destroyed = true;
        this.abort();
        if (this.statisticsUpdatingIntervalId != null) {
            clearInterval(this.statisticsUpdatingIntervalId);
            this.statisticsUpdatingIntervalId = null;
        }
        this.primaryPublication.setAudioBuffer(null);
        this.primaryPublication.setVideoBuffer(null);
        if (this.primaryPublication.getStream() != null) {
            this.primaryPublication.getStream().removeAudioConsumer(this);
            this.primaryPublication.getStream().removeVideoConsumer(this);
            this.primaryPublication.setStream(null);
        }
        this.secondaryPublication.setAudioBuffer(null);
        this.secondaryPublication.setVideoBuffer(null);
        if (this.secondaryPublication.getStream() != null) {
            this.secondaryPublication.getStream().removeAudioConsumer(this);
            this.secondaryPublication.getStream().removeVideoConsumer(this);
            this.secondaryPublication.setStream(null);
        }
        this.subscriptions.clear();
    }

    /**
     * @package
     */
    getPrimaryMediaStream() {
        return this.primaryPublication.getStream();
    }

    /**
     * @package
     */
    setPrimaryMediaStream(primaryStream) {
        if (this.destroyed) {
            throw new Error("WebRTC connection has been already destroyed")
        }
        if (this.primaryPublication.getStream() !== primaryStream) {
            if (this.primaryPublication.getStream() != null) {
                this.primaryPublication.getStream().removeAudioConsumer(this);
                this.primaryPublication.getStream().removeVideoConsumer(this);
            }
            this.primaryPublication.setStream(primaryStream);
            if (primaryStream != null){
                primaryStream.addAudioConsumer(this);
                primaryStream.addVideoConsumer(this);
            }
        }
    }

    /**
     * @package
     */
    isSendingPrimaryAudio() {
        return this.primaryPublication.getAudioBuffer() != null;
    }

    /**
     * @package
     */
    isSendingPrimaryVideo() {
        return this.primaryPublication.getVideoBuffer() != null;
    }

    /**
     * @package
     */
    getSecondaryMediaStream() {
        return this.secondaryPublication.getStream();
    }

    /**
     * @package
     */
    setSecondaryMediaStream(secondaryStream) {
        if (this.destroyed) {
            throw new Error("WebRTC connection has been already destroyed")
        }
        if (this.secondaryPublication.getStream() !== secondaryStream) {
            if (this.secondaryPublication.getStream() != null) {
                this.secondaryPublication.getStream().removeAudioConsumer(this);
                this.secondaryPublication.getStream().removeVideoConsumer(this);
            }
            this.secondaryPublication.setStream(secondaryStream);
            if (secondaryStream != null){
                secondaryStream.addAudioConsumer(this);
                secondaryStream.addVideoConsumer(this);
            }
        }
    }

    /**
     * @package
     */
    isSendingSecondaryAudio() {
        return this.secondaryPublication.getAudioBuffer() != null;
    }

    /**
     * @package
     */
    isSendingSecondaryVideo() {
        return this.secondaryPublication.getVideoBuffer() != null;
    }

    /**
     * @package
     */
    onAudioBuffer(audioBuffer, supplier) {
        if (!this.destroyed) {
            if (supplier === this.primaryPublication.getStream()) {
                if (this.primaryPublication.getAudioBuffer() !== audioBuffer) {
                    this.primaryPublication.setAudioBuffer(audioBuffer);
                    this.open();
                }
            }
            if (supplier === this.secondaryPublication.getStream()) {
                if (this.secondaryPublication.getAudioBuffer() !== audioBuffer) {
                    this.secondaryPublication.setAudioBuffer(audioBuffer);
                    this.open();
                }
            }
        }
    }

    /**
     * @package
     */
    onVideoBuffer(videoBuffer, supplier) {
        if (!this.destroyed) {
            if (supplier === this.primaryPublication.getStream()) {
                if (this.primaryPublication.getVideoBuffer() !== videoBuffer) {
                    this.primaryPublication.setVideoBuffer(videoBuffer);
                    this.open();
                }
            }
            if (supplier === this.secondaryPublication.getStream()) {
                if (this.secondaryPublication.getVideoBuffer() !== videoBuffer) {
                    this.secondaryPublication.setVideoBuffer(videoBuffer);
                    this.open();
                }
            }
        }
    }

    /**
     * @package
     */
    addAudioConsumer(consumer) {
        if (!this.destroyed) {
            let subscription = this.subscriptions.get(consumer);
            if (!subscription) {
                subscription = new WebRtcSubscription();
                this.subscriptions.set(consumer, subscription);
            }
            subscription.setAudioConsumer(consumer);
            this.distortionRegistry.addMtid(consumer.getLabel() + "#audio");
            this.open();
        }
    }

    /**
     * @package
     */
    removeAudioConsumer(consumer) {
        if (!this.destroyed) {
            let subscription = this.subscriptions.get(consumer);
            subscription.setAudioConsumer(null);
            this.distortionRegistry.removeMtid(consumer.getLabel() + "#audio");
            consumer.onAudioBuffer(null);
            this.open();
            if (subscription.getAudioConsumer() == null && subscription.getVideoConsumer() == null) {
                this.subscriptions.delete(consumer);
            }
        }
    }

    /**
     * @package
     */
    addVideoConsumer(consumer) {
        if (!this.destroyed) {
            let subscription = this.subscriptions.get(consumer);
            if (!subscription) {
                subscription = new WebRtcSubscription();
                this.subscriptions.set(consumer, subscription);
            }
            subscription.setVideoConsumer(consumer);
            this.distortionRegistry.addMtid(consumer.getLabel() + "#video");
            this.open();
        }
    }

    /**
     * @package
     */
    removeVideoConsumer(consumer) {
        if (!this.destroyed) {
            let subscription = this.subscriptions.get(consumer);
            subscription.setVideoConsumer(null);
            this.distortionRegistry.removeMtid(consumer.getLabel() + "#video");
            consumer.onVideoBuffer(null);
            this.open();
            if (subscription.getAudioConsumer() == null && subscription.getVideoConsumer() == null) {
                this.subscriptions.delete(consumer);
            }
        }
    }

    /**
     * @private
     */
    abort() {
        if (this.negotiationTimeoutId != null) {
            clearTimeout(this.negotiationTimeoutId);
            this.negotiationTimeoutId = null;
        }
        this.negotiations = 0;
        if (this.dataChannel != null) {
            if (this.destroyed) {
                this.dataChannel.close();
            }
            this.dataChannel = null;
            this.dataChannelOpened = false;
        }
        if (this.pc != null) {
            this.pc.close();
            this.pc = null;
            this.iceCandidatesGatheringCompletePromise = null;
            this.primaryPublication.setAudioTransceiver(null);
            this.primaryPublication.setVideoTransceiver(null);
            this.secondaryPublication.setAudioTransceiver(null);
            this.secondaryPublication.setVideoTransceiver(null);
            for (let subscription of this.subscriptions.values()) {
                if (subscription.getAudioConsumer() != null) {
                    subscription.getAudioConsumer().onAudioBuffer(null);
                }
                if (subscription.getVideoConsumer() != null) {
                    subscription.getVideoConsumer().onVideoBuffer(null);
                }
                subscription.setAudioTransceiver(null);
                subscription.setVideoTransceiver(null);
            }
            this.inactiveAudioTransceivers = [];
            this.inactiveVideoTransceivers = [];
            this.webRtcTransceiverLastSdpSectionIndex = 1;
        }
        if (this.httpPost != null) {
            this.httpPost.abort();
            this.httpPost = null;
        }
        this.lagging = false;
        if (this.oldStatistics != null) {
            if (this.primaryPublication.getStream() != null) {
                this.primaryPublication.getStream().resetStatistics();
            }
            if (this.secondaryPublication.getStream() != null) {
                this.secondaryPublication.getStream().resetStatistics();
            }
            for (let stream of this.subscriptions.keys()) {
                stream.resetStatistics();
            }
            this.oldStatistics = null;
            this.updateStatistics();
        }
    }

    /**
     * @private
     */
    updateStatistics() {
        let newStatistics = {};
        if (this.oldStatistics == null) {
            this.session.updateStatistics(null);
            if (this.primaryPublication.getStream() != null) {
                this.primaryPublication.getStream().updateStatistics(null);
            }
            if (this.secondaryPublication.getStream() != null) {
                this.secondaryPublication.getStream().updateStatistics(null);
            }
            for (let stream of this.subscriptions.keys()) {
                stream.updateStatistics(null);
            }
            this.oldStatistics = newStatistics;
        } else {
            let gettingStatsPromise = new Promise((resolve) => {
                if (!this.dataChannelOpened) {
                    resolve(null);
                } else {
                    this.pc.getStats().then((report) => {
                        resolve(report);
                    });
                }
            });
            gettingStatsPromise.then((report) => {
                let sessionReport = [];
                let streamReportMap = new Map();
                if (report != null) {
                    if (this.primaryPublication.getStream() != null) {
                        streamReportMap.set(this.primaryPublication.getStream(), []);
                    }
                    if (this.secondaryPublication.getStream() != null) {
                        streamReportMap.set(this.secondaryPublication.getStream(), []);
                    }
                    for (let stream of this.subscriptions.keys()) {
                        streamReportMap.set(stream, []);
                    }
                    let selectedCandidatePair = null;
                    let localCandidate = null;
                    let remoteCandidate = null;
                    for (let stats of report.values()) {
                        switch ((stats.kind || stats.mediaType) + "-" + stats.type) { // FIXME: The `|| stats.mediaType` is a workaround for Safari (of version 13 at least)
                            case "undefined-candidate-pair": // FIXME: This is a workaround for Firefox (of version 80 at least)
                                if (stats.selected) {
                                    selectedCandidatePair = stats;
                                    localCandidate = report.get(selectedCandidatePair.localCandidateId);
                                    remoteCandidate = report.get(selectedCandidatePair.remoteCandidateId);
                                }
                                break;
                            case "undefined-transport":
                                if (stats.selectedCandidatePairId) {
                                    selectedCandidatePair = report.get(stats.selectedCandidatePairId);
                                    if (selectedCandidatePair) {
                                        localCandidate = report.get(selectedCandidatePair.localCandidateId);
                                        remoteCandidate = report.get(selectedCandidatePair.remoteCandidateId);
                                    }
                                }
                                break;
                            case "undefined-track":
                                stats.kind = stats.frameWidth ? "video" : "audio"; // FIXME: This is a workaround for Safari (of version 13 at least)
                            case "audio-track":
                            case "video-track":
                            case "audio-media-source":
                            case "video-media-source":
                            case "audio-outbound-rtp":
                            case "video-outbound-rtp":
                            case "audio-remote-inbound-rtp":
                            case "video-remote-inbound-rtp":
                            case "audio-inbound-rtp":
                            case "video-inbound-rtp":
                                let stream = this.getMediaStreamForStats(stats, report);
                                if (stream) {
                                    streamReportMap.get(stream).push(stats);
                                }
                                break;
                        }
                    }
                    if (selectedCandidatePair != null) {
                        sessionReport.push(selectedCandidatePair);
                        sessionReport.push(localCandidate);
                        sessionReport.push(remoteCandidate);
                        for (let stats of streamReportMap.values()) {
                            stats.push(selectedCandidatePair);
                        }
                    }
                }
                this.session.updateStatistics(sessionReport);
                if (this.primaryPublication.getStream() != null) {
                    this.primaryPublication.getStream().updateStatistics(streamReportMap.get(this.primaryPublication.getStream()));
                }
                if (this.secondaryPublication.getStream() != null) {
                    this.secondaryPublication.getStream().updateStatistics(streamReportMap.get(this.secondaryPublication.getStream()));
                }
                for (let stream of this.subscriptions.keys()) {
                    stream.updateStatistics(streamReportMap.get(stream));
                }
                if (report != null) {
                    for (let subscription of this.subscriptions.values()) {
                        if (subscription.getAudioConsumer() != null && subscription.getAudioConsumer().getAudioStatistics().getRate() < 40_000) {
                            this.distortionRegistry.registerDistortion(subscription.getAudioConsumer().getLabel() + "#audio");
                        }
                        if (subscription.getVideoConsumer() != null && subscription.getVideoConsumer().getVideoStatistics().getRate() < 1) {
                            this.distortionRegistry.registerDistortion(subscription.getVideoConsumer().getLabel() + "#video");
                        }
                    }
                }
                if (this.dataChannelOpened) {
                    this.distortionRegistry.report(this.dataChannel);
                }
                this.oldStatistics = newStatistics;
            });
        }
    }

    /**
     * @private
     */
    getMediaStreamForStats(stats, report) {
        if (stats.mid) { // if we are running in a recent version of Chromium and the stats has an associated `mid` (e.g. `inbound-rtp` and `outbound-rtp`)
            let sdpSectionIndex = parseInt(stats.mid) + 1;
            for (let publication of [ this.primaryPublication, this.secondaryPublication ]) {
                if (publication.getAudioTransceiver() != null && publication.getAudioTransceiver().getSdpSectionIndex() === sdpSectionIndex) {
                    return publication.getStream();
                }
                if (publication.getVideoTransceiver() != null && publication.getVideoTransceiver().getSdpSectionIndex() === sdpSectionIndex) {
                    return publication.getStream();
                }
            }
            for (let subscription of this.subscriptions.values()) {
                if (subscription.getAudioTransceiver() != null && subscription.getAudioTransceiver().getSdpSectionIndex() === sdpSectionIndex) {
                    return subscription.getAudioConsumer();
                }
                if (subscription.getVideoTransceiver() != null && subscription.getVideoTransceiver().getSdpSectionIndex() === sdpSectionIndex) {
                    return subscription.getVideoConsumer();
                }
            }
        }
        if (stats.trackIdentifier) { // if we are running in a recent version of Chromium and the stats doesn't have an associated `mid` (i.e. `media-source`) or if we are running in Safari and an outdated version of Chromium
            for (let publication of [ this.primaryPublication, this.secondaryPublication ]) {
                if (publication.getAudioTransceiver() != null && publication.getAudioTransceiver().getSendingTrack() != null && publication.getAudioTransceiver().getSendingTrack().id === stats.trackIdentifier) {
                    return publication.getStream();
                }
                if (publication.getVideoTransceiver() != null && publication.getVideoTransceiver().getSendingTrack() != null && publication.getVideoTransceiver().getSendingTrack().id === stats.trackIdentifier) {
                    return publication.getStream();
                }
            }
            for (let subscription of this.subscriptions.values()) {
                if (subscription.getAudioTransceiver() != null && subscription.getAudioTransceiver().getReceivingTrack() != null && subscription.getAudioTransceiver().getReceivingTrack().id === stats.trackIdentifier) {
                    return subscription.getAudioConsumer();
                }
                if (subscription.getVideoTransceiver() != null && subscription.getVideoTransceiver().getReceivingTrack() != null && subscription.getVideoTransceiver().getReceivingTrack().id === stats.trackIdentifier) {
                    return subscription.getVideoConsumer();
                }
            }
        }
        if (stats.trackId) { // if we are running in Safari or an outdated version of Chromium
            stats.trackIdentifier = report.get(stats.trackId).trackIdentifier
            stats.trackId = null; // Infinite recursion protection
            return this.getMediaStreamForStats(stats, report);
        }
        if (stats.localId) { // if the stats has only reference to another stats through `localId` (e.g. any `remote-inbound-rtp` stats has only a reference to corresponding `outbound-rtp` stats)
            return this.getMediaStreamForStats(report.get(stats.localId), report);
        }
        if (stats.ssrc) { // if we are running in Firefox
            for (let publication of [ this.primaryPublication, this.secondaryPublication ]) {
                if (publication.getAudioTransceiver() != null && publication.getAudioTransceiver().getSendingTrack() != null && publication.getAudioTransceiver().getSendingTrack().ssrcs && publication.getAudioTransceiver().getSendingTrack().ssrcs.includes(stats.ssrc)) {
                    return publication.getStream();
                }
                if (publication.getVideoTransceiver() != null && publication.getVideoTransceiver().getSendingTrack() != null && publication.getVideoTransceiver().getSendingTrack().ssrcs && publication.getVideoTransceiver().getSendingTrack().ssrcs.includes(stats.ssrc)) {
                    return publication.getStream();
                }
            }
            for (let subscription of this.subscriptions.values()) {
                if (subscription.getAudioTransceiver() != null && subscription.getAudioTransceiver().getReceivingTrack() != null && subscription.getAudioTransceiver().getReceivingTrack().ssrcs && subscription.getAudioTransceiver().getReceivingTrack().ssrcs.includes(stats.ssrc)) {
                    return subscription.getAudioConsumer();
                }
                if (subscription.getVideoTransceiver() != null && subscription.getVideoTransceiver().getReceivingTrack() != null && subscription.getVideoTransceiver().getReceivingTrack().ssrcs && subscription.getVideoTransceiver().getReceivingTrack().ssrcs.includes(stats.ssrc)) {
                    return subscription.getVideoConsumer();
                }
            }
        }
        return null;
    }

    /**
     * @private
     */
    acquireTransceiver(mediaType) {
        let inactiveTransceivers = mediaType === "audio" ? this.inactiveAudioTransceivers : this.inactiveVideoTransceivers;
        if (inactiveTransceivers.length > 0) {
            let transceiver = inactiveTransceivers.pop();
            transceiver.setDirection("recvonly");
            return transceiver;
        } else {
            this.webRtcTransceiverLastSdpSectionIndex += 1;
            return new WebRtcTransceiver(this.pc.addTransceiver(mediaType, {direction: "recvonly"}), mediaType, this.webRtcTransceiverLastSdpSectionIndex);
        }
    }

    /**
     * @private
     */
    releaseTransceiver(transceiver) {
        let inactiveTransceivers = transceiver.getMediaType() === "audio" ? this.inactiveAudioTransceivers : this.inactiveVideoTransceivers;
        transceiver.setDirection("inactive");
        inactiveTransceivers.push(transceiver);
    }

    /**
     * @private
     */
    createAudioTransceiverInit() {
        let direction = "inactive";
        return { direction: direction };
    }

    /**
     * @private
     */
    createVideoTransceiverInit() {
        let direction = "inactive";
        if (this.useVP9) {
            let rtpEncodingParameters = { active: false, scaleResolutionDownBy: 1 };
            let encodings = [ rtpEncodingParameters ];
            return { direction: direction, sendEncodings: encodings };
        } else {
            let lowRtpEncodingParameters = { rid: "l", active: false, scaleResolutionDownBy: 4 };
            let mediumRtpEncodingParameters = { rid: "m", active: false, scaleResolutionDownBy: 2 };
            let highRtpEncodingParameters = { rid: "h", active: false, scaleResolutionDownBy: 1 };
            let encodings = [ lowRtpEncodingParameters, mediumRtpEncodingParameters, highRtpEncodingParameters ];
            return { direction: direction, sendEncodings: encodings };
        }
    }

    /**
     * @private
     */
    createDataChannelInit() {
        return { ordered: true, negotiated: true, id: 1 };
    }

    /**
     * @private
     */
    configureAudioTransceiver(audioTransceiver, audioBuffer, stream) {}

    /**
     * @private
     */
    configureVideoTransceiver(videoTransceiver, videoBuffer, stream) {
        let parameters = videoTransceiver.getSendingParameters();
        let adaptivityToBitrateFractionMap = [ 1, 5, 21 ]; // 1, 1 + 4, 1 + 4 + 16
        let adaptivityToResolutionScaleMap = [ 4, 2, 1 ];
        if (this.useVP9) {
            let maxBitrateFraction = Math.floor(stream.getMaxVideoBitrate() / (videoBuffer.getBitrate() / adaptivityToBitrateFractionMap[videoBuffer.getAdaptivity() - 1]));
            let spatialLayersCount = 1;
            for (let i = 1; i < videoBuffer.getAdaptivity(); i++) {
                if (adaptivityToBitrateFractionMap[i] <= maxBitrateFraction && videoBuffer.getWidth() * videoBuffer.getHeight() / Math.pow(adaptivityToResolutionScaleMap[i], 2) <= stream.getMaxVideoFrameArea()) {
                    spatialLayersCount += 1;
                } else {
                    break;
                }
            }
            parameters.encodings[0].active = true;
            parameters.encodings[0].scaleResolutionDownBy = videoBuffer.getScale() * Math.pow(2, videoBuffer.getAdaptivity() - spatialLayersCount);
            parameters.encodings[0].maxBitrate = Math.min(videoBuffer.getBitrate(), stream.getMaxVideoBitrate());
            parameters.encodings[0].scalabilityMode = spatialLayersCount > 1 ? "L" + spatialLayersCount + "T3_KEY" : "L1T3";
            parameters.encodings[0].maxFramerate = stream.getMaxVideoFrameRate() === Number.POSITIVE_INFINITY ? undefined : stream.getMaxVideoFrameRate();
        } else {
            for (let i = 0; i < parameters.encodings.length; i++) {
                parameters.encodings[i].active = false;
                parameters.encodings[i].scaleResolutionDownBy = 1;
                parameters.encodings[i].maxBitrate = 0;
            }
            if (parameters.encodings.length === 3) {
                let totalMaxBitrate = 0;
                for (let i = 0; i < videoBuffer.getAdaptivity(); i++) {
                    let maxBitrate = Math.floor(videoBuffer.getBitrate() / adaptivityToBitrateFractionMap[videoBuffer.getAdaptivity() - 1]) * Math.pow(4, i);
                    totalMaxBitrate += maxBitrate;
                    if (i === 0 || (totalMaxBitrate <= stream.getMaxVideoBitrate() && videoBuffer.getWidth() * videoBuffer.getHeight() / Math.pow(adaptivityToResolutionScaleMap[i], 2) <= stream.getMaxVideoFrameArea())) {
                        // Regardless whether a browser supports RID-based simulcast (and each encoding have not empty
                        // `rid` field) or (like Safari of version 14 or older) it supports SSRC-based simulcast only
                        // (and none of the encoding have `rid` field, or it is an empty), the encodings (according to
                        // https://www.w3.org/TR/webrtc/) should be listed in order from the lowest quality (`l` RID)
                        // to the highest one (`h` RID).
                        parameters.encodings[i].active = true;
                        parameters.encodings[i].scaleResolutionDownBy = videoBuffer.getScale() * Math.pow(2, videoBuffer.getAdaptivity() - 1 - i);
                        parameters.encodings[i].maxBitrate = maxBitrate;
                        parameters.encodings[i].scalabilityMode = "L1T3";
                        parameters.encodings[i].maxFramerate = stream.getMaxVideoFrameRate() === Number.POSITIVE_INFINITY ? undefined : stream.getMaxVideoFrameRate();
                    }
                }
            }
        }
        videoTransceiver.setSendingParameters(parameters);
    }

    /**
     * @private
     */
    fixLocalSdpBeforeSetting(localSdp) {
        let localSdpSections = localSdp.replace(/\r\nm=/g, "\r\n\0m=").split("\0");
        for (let i = 2; i < localSdpSections.length; i++) {
            if (!this.useVP9) {
                // Checks whether we are running in a browser with outdated WebRTC implementation (e.g. Safari of
                // version <= 14.4) which doesn't support RID-based simulcast, but supports SSRC-based simulcast, and
                // if it so, this method mungs the passed description to activate SSRC-based simulcast. Then the
                // munged description should be passed to `setLocalDescription` method and after that (in
                // {@link #fixLocalSdpBeforeSending}) is called to reconfigure primary and secondary video transceivers.
                if (i === 3 || i === 5) {
                    if (!localSdpSections[i].match("\r\na=simulcast") && localSdpSections[i].match("\r\na=ssrc-group:FID") && !localSdpSections[i].match("\r\na=ssrc-group:SIM")) {
                        let fids = [], snippet = "";
                        for (let line of localSdpSections[i].split("\r\n")) {
                            if (line.match(/^a=ssrc[:-].*$/)) {
                                let found = line.match(/^a=ssrc-group:FID ([^\s]+) ([^\s]+)$/);
                                if (found) {
                                    fids.push({ ssrc1: parseInt(found[1]), ssrc2: parseInt(found[2]) });
                                }
                                snippet = snippet + line + "\r\n";
                            }
                        }
                        for (let j = 1; j < 3; j++) {
                            fids.push({ ssrc1: Math.floor(Math.random() * 0xFFFFFFFF), ssrc2: Math.floor(Math.random() * 0xFFFFFFFF) });
                            localSdpSections[i] = localSdpSections[i] + snippet.replace(new RegExp(fids[0].ssrc1, "g"), fids[j].ssrc1).replace(new RegExp(fids[0].ssrc2, "g"), fids[j].ssrc2);
                        }
                        localSdpSections[i] = localSdpSections[i] + "a=ssrc-group:SIM " + fids[0].ssrc1 + " " + fids[1].ssrc1 + " " + fids[2].ssrc1 + "\r\n";
                    }
                }
            }
            /**
             * FIXME: Chrome 97 (at least) has a bug (https://bugs.chromium.org/p/chromium/issues/detail?id=1276427)
             * due to which using `setCodecPreferences` function can lead to creation of an invalid offer SDP with RTX
             * for ULPFEC and to a failure of `setLocalDescription` function afterwards with "Failed to execute
             * 'setLocalDescription' on 'RTCPeerConnection': Failed to set local offer SDP: Failed to set local video
             * description recv parameters for m-section" error. That's why we have to mung the offer SDP and disable
             * RTX for ULPFEC (if there is any).
             */
            if (localSdpSections[i].startsWith("m=video")) {
                let ulpfecPayloadType = (localSdpSections[i].match(/\r\na=rtpmap:(\d+) ulpfec\/90000/) || {})[1];
                if (ulpfecPayloadType) {
                    let rtxForUlpfecPayloadType = (localSdpSections[i].match(new RegExp("\r\na=fmtp:(\\d+) apt=" + ulpfecPayloadType)) || {})[1];
                    if (rtxForUlpfecPayloadType) {
                        localSdpSections[i] = localSdpSections[i].replace(new RegExp("(^m=video.*)( " + rtxForUlpfecPayloadType + ")(\\s)"), "$1$3");
                        localSdpSections[i] = localSdpSections[i].replace(new RegExp("\r\na=rtpmap:" + rtxForUlpfecPayloadType + " rtx/90000"), "");
                        localSdpSections[i] = localSdpSections[i].replace(new RegExp("\r\na=fmtp:" + rtxForUlpfecPayloadType + " apt=" + ulpfecPayloadType), "");
                    }
                }
            }
            // All up-to-date browsers (Chromium of a version >= 124 and Safari version >= 17.4 for sure) except
            // Firefox (of a version <= 125 for sure) silently support RTCP Extended Reports with Receiver Reference
            // Time parameters. These reports help non-senders to estimate their round trip time (see RFC3611). In
            // order to enable such reports, we have to add manually `a=rtcp-fb:* rrtr` line to each media section of
            // the offer SDP before setting it to `PeerConnection`. Once enabled (and confirmed in the answer SDP),
            // there is no need to add such lines manually again because the browser will keep them in the following
            // offers.
            let isFirefox = !!navigator.mozGetUserMedia;
            if (!isFirefox && !localSdpSections[i].match("\r\na=rtcp-fb:[^ ]+ rrtr")) {
                localSdpSections[i] = localSdpSections[i] + "a=rtcp-fb:* rrtr\r\n";
            }
        }
        return localSdpSections.join("");
    }

    /**
     * @private
     */
    fixLocalSdpBeforeSending(localSdp) {
        let localSdpSections = localSdp.replace(/\r\na=candidate:.*typ host.*/g, "").replace(/\r\nm=/g, "\r\n\0m=").split("\0");
        if (this.dataChannelOpened) {
            for (let i = 2; i < 6 && i < localSdpSections.length; i++) {
                localSdpSections[i] = localSdpSections[i].replace(/\r\na=msid:.*/, "");
                localSdpSections[i] = localSdpSections[i].replace(/\r\na=mid:.*/, "$&\r\na=msid:- " + (i - 1));
                if (i === 2 && this.primaryPublication.getAudioTransceiver().getSendingTrack()) {
                    localSdpSections[i] = localSdpSections[i].replace(/\r\na=msid:.*/, "\r\na=msid:me#primary " + this.primaryPublication.getAudioTransceiver().getSendingTrack().id);
                    // FIXME: This is a workaround for Firefox (of version 89 at least)
                    if (this.primaryPublication.getAudioTransceiver().getSendingTrack()) {
                        this.primaryPublication.getAudioTransceiver().getSendingTrack().ssrcs = this.getSsrcs(localSdpSections[i]);
                    }
                }
                if (i === 3 && this.primaryPublication.getVideoTransceiver().getSendingTrack()) {
                    localSdpSections[i] = localSdpSections[i].replace(/\r\na=msid:.*/, "\r\na=msid:me#primary " + this.primaryPublication.getVideoTransceiver().getSendingTrack().id);
                    // FIXME: This is a workaround for Firefox (of version 89 at least)
                    if (this.primaryPublication.getVideoTransceiver().getSendingTrack()) {
                        this.primaryPublication.getVideoTransceiver().getSendingTrack().ssrcs = this.getSsrcs(localSdpSections[i]);
                    }
                }
                if (i === 4 && this.secondaryPublication.getAudioTransceiver().getSendingTrack()) {
                    localSdpSections[i] = localSdpSections[i].replace(/\r\na=msid:.*/, "\r\na=msid:me#secondary " + this.secondaryPublication.getAudioTransceiver().getSendingTrack().id);
                    // FIXME: This is a workaround for Firefox (of version 89 at least)
                    if (this.secondaryPublication.getAudioTransceiver().getSendingTrack()) {
                        this.secondaryPublication.getAudioTransceiver().getSendingTrack().ssrcs = this.getSsrcs(localSdpSections[i]);
                    }
                }
                if (i === 5 && this.secondaryPublication.getVideoTransceiver().getSendingTrack()) {
                    localSdpSections[i] = localSdpSections[i].replace(/\r\na=msid:.*/, "\r\na=msid:me#secondary " + this.secondaryPublication.getVideoTransceiver().getSendingTrack().id);
                    // FIXME: This is a workaround for Firefox (of version 89 at least)
                    if (this.secondaryPublication.getVideoTransceiver().getSendingTrack()) {
                        this.secondaryPublication.getVideoTransceiver().getSendingTrack().ssrcs = this.getSsrcs(localSdpSections[i]);
                    }
                }
                if (!this.useVP9 && (i === 3 || i === 5)) {
                    // FIXME: Mind API doesn't support switching simulcast on/off on the fly, but browsers don't add
                    // simulcast attributes to video sections which are initialized in `inactive` state, that's why we have
                    // to add all necessary simulcast attributes to the offer SDP, if they are missing.
                    if (!localSdpSections[i].match("\r\na=simulcast") && !localSdpSections[i].match("\r\na=ssrc-group:SIM")) {
                        let videoTransceiver = i === 3 ? this.primaryPublication.getVideoTransceiver() : this.secondaryPublication.getVideoTransceiver();
                        if (videoTransceiver.getSendingParameters().encodings.length > 0) {
                            // The browser does support RIDs, add RID-based simulcast attributes
                            localSdpSections[i] = localSdpSections[i] + "a=rid:l send\r\na=rid:m send\r\na=rid:h send\r\na=simulcast:send ~l;~m;h\r\n";
                        } else {
                            // The browser doesn't support RIDs, add SSRC-based simulcast attributes
                            let sim = "a=ssrc-group:SIM";
                            for (let j = 0; j < 3; j++) {
                                let ssrc1 = Math.floor(Math.random() * 0xFFFFFFFF);
                                let ssrc2 = Math.floor(Math.random() * 0xFFFFFFFF);
                                localSdpSections[i] = localSdpSections[i] + "a=ssrc-group:FID " + ssrc1 + " " + ssrc2 + "\r\n";
                                for (let ssrc of [ssrc1, ssrc2]) {
                                    localSdpSections[i] = localSdpSections[i] + "a=ssrc:" + ssrc + " cname:-\r\na=ssrc:" + ssrc + " msid:- -\r\na=ssrc:" + ssrc + " mslabel:-\r\na=ssrc:" + ssrc + " label:-\r\n";
                                }
                                sim = sim + " " + ssrc1;
                            }
                            localSdpSections[i] = localSdpSections[i] + sim + "\r\n";
                        }
                    }
                }
            }
            for (let i = 6; i < localSdpSections.length; i++) {
                localSdpSections[i] = localSdpSections[i].replace(/\r\na=msid:.*/, "");
                localSdpSections[i] = localSdpSections[i].replace(/\r\na=mid:.*/, "$&\r\na=msid:- " + (i - 1));
            }
            for (let subscription of this.subscriptions.values()) {
                if (subscription.getAudioConsumer() != null && subscription.getAudioTransceiver() != null) {
                    let i = subscription.getAudioTransceiver().getSdpSectionIndex();
                    if (i < localSdpSections.length) {
                        localSdpSections[i] = localSdpSections[i].replace(/\r\na=msid:.*/, "\r\na=msid:" + subscription.getAudioConsumer().getLabel() + ' ' + subscription.getAudioTransceiver().getReceivingTrack().id);
                    }
                }
                if (subscription.getVideoConsumer() != null && subscription.getVideoTransceiver() != null) {
                    let i = subscription.getVideoTransceiver().getSdpSectionIndex();
                    if (i < localSdpSections.length) {
                        localSdpSections[i] = localSdpSections[i].replace(/\r\na=msid:.*/, "\r\na=msid:" + subscription.getVideoConsumer().getLabel() + ' ' + subscription.getVideoTransceiver().getReceivingTrack().id);
                        // FIXME: Since WebRTC provides no API for choosing maximum bitrate of the receiving video, we have to
                        // munge the offer SDP and add `b=TIAS` attribute for video section manually to set the maximum bitrate
                        // of the video which we are going to receive.
                        if (subscription.getVideoConsumer().getMaxVideoBitrate() < Number.POSITIVE_INFINITY) {
                            localSdpSections[i] = localSdpSections[i] + "b=TIAS:" + subscription.getVideoConsumer().getMaxVideoBitrate() + "\r\n";
                        }
                        // We enforce maximum frame area and frame rate of the receiving video through the custom
                        // video-level `x-preferences` attribute in our offer SDP.
                        localSdpSections[i] = localSdpSections[i] + "a=x-preferences:" + (subscription.getVideoConsumer().getMaxVideoFrameArea() === Number.POSITIVE_INFINITY ? 0 : subscription.getVideoConsumer().getMaxVideoFrameArea()) + "@" +
                                                                                         (subscription.getVideoConsumer().getMaxVideoFrameRate() === Number.POSITIVE_INFINITY ? 0 : subscription.getVideoConsumer().getMaxVideoFrameRate()) + "\r\n";
                    }
                }
            }
            if (!this.useVP9) {
                // Checks whether we are running in a browser with outdated WebRTC implementation (e.g. Safari of
                // version <= 14.4) which doesn't support RID-based simulcast, but supports SSRC-based simulcast, and
                // if it so, this method checks whether the passed local SDP was munged with
                // {@link #fixLocalSdpBeforeSending} (to activate SSRC-based simulcast) and reconfigures primary and
                // secondary video transceivers (since the initial configuration of transceivers has no effect in
                // browsers which supports SSRC-based simulcast only because the configuration is performed before the
                // SSRC-based simulcast is activated).
                if (localSdpSections.length > 3 && localSdpSections[3].match("\r\na=ssrc-group:SIM") && this.primaryPublication.getVideoBuffer() != null) {
                    this.configureVideoTransceiver(this.primaryPublication.getVideoTransceiver(), this.primaryPublication.getVideoBuffer(), this.primaryPublication.getStream());
                }
                if (localSdpSections.length > 5 && localSdpSections[5].match("\r\na=ssrc-group:SIM") && this.secondaryPublication.getVideoBuffer() != null) {
                    this.configureVideoTransceiver(this.secondaryPublication.getVideoTransceiver(), this.secondaryPublication.getVideoBuffer(), this.secondaryPublication.getStream());
                }
            }
        }
        return localSdpSections.join("");
    }

    /**
     * @private
     */
    fixRemoteSdp(remoteSdp, localSdp) {
        if (this.dataChannelOpened) {
            let remoteSdpSections = remoteSdp.replace(/\r\nm=/g, "\r\n\0m=").split("\0");
            let localSdpSections = localSdp.replace(/\r\nm=/g, "\r\n\0m=").split("\0");
            for (let i = 2; i < 6 && i < remoteSdpSections.length; i++) {
                if (i === 3 || i === 5) {
                    let patterns;
                    if (this.useVP9) {
                        patterns = [ VP9_RTPMAP_PATTERN ];
                    } else {
                        // FIXME: Mind API doesn't support switching simulcast on/off on the fly, but browsers don't add
                        // simulcast attributes to video sections which are initialized in `inactive` state, but if we add
                        // simulcast attributes to the offer SDP in our own (in `fixLocalSdp` method), we have to to remove
                        // all simulcast attributes from the answer SDP if we are running in Firefox < 110 (otherwise SDP
                        // negotiation would fail with "SIPCC Failed to parse SDP: simulcast attribute has a direction that
                        // is inconsistent with the direction of this media section"), and we have to keep them if we are
                        // running in Firefox >= 110 (otherwise SDP negotiation HTTP-request would fail because Firefox
                        // somehow would use SSRC-based simulcast instead of RID-based simulcast). Chromium-based browsers
                        // and Safari seem to be indifferent to whether simulcast attributes are removed from the answer
                        // SDP or not, but in Mind Android SDK (which uses the same WebRTC library) we encountered a problem
                        // where the video from the camera was not being transmitted, if we did not remove simulcast
                        // attributes from the answer SDP. That's why now if we added simulcast attributes to the offer SDP
                        // in `fixLocalSdp` method, we remove simulcast attributes from the answer SDP unless we are running
                        // in Firefox >= 110.
                        if (!localSdpSections[i].match("\r\na=simulcast")) {
                            if (!navigator.mozGetUserMedia || parseInt(navigator.userAgent.match(/Firefox\/(\d+)/)[1]) < 110) {
                                remoteSdpSections[i] = remoteSdpSections[i].replace(/\r\na=(rid:[lmh]|simulcast).*/g, "");
                            }
                        }
                        patterns = [ VP8_RTPMAP_PATTERN, H264_RTPMAP_PATTERN ];
                    }
                    // FIXME: For sending its video browsers always uses the codec which corresponds to the first
                    // payload stated in corresponding `m=video` section of the answer SDP. In order to force it use
                    // VP9 or VP8/H.264 regardless of the order of the payload types, we change the answer SDP and move
                    // the payload type which corresponds to the desired codec in front of the others.
                    for (let pattern of patterns) {
                        let match = remoteSdpSections[i].match(pattern);
                        if (match) {
                            let payloadType = parseInt(match[1]);
                            remoteSdpSections[i] = remoteSdpSections[i].replace(new RegExp("^(m=video [^ ]+ [^ ]+)(.*)( " + payloadType + ")( .*)?"), "$1$3$2$4");
                        }
                    }
                    // FIXME: Without `transport-cc` (i.e. with REMB only) the phase of discovering of the available
                    // bandwidth can take a significant time. During that time browsers can send video in a low
                    // resolution. That's why if we are connected to Mind API which doesn't support `transport-cc` (i.e.
                    // which supports REMB only), we add a corresponding `x-google-start-bitrate` FMTP parameter to
                    // each active `recvonly` section in the answer SDP in order to force at least Chromium-based
                    // browsers to send video in the highest available resolution from very beginning.
                    let videoBuffer = i === 3 ? this.primaryPublication.getVideoBuffer() : this.secondaryPublication.getVideoBuffer();
                    if (videoBuffer != null) {
                        let payloadType = parseInt(remoteSdpSections[i].match(/^m=video [^ ]+ [^ ]+ ([0-9]+)/)[1]);
                        if (!remoteSdpSections[i].match(new RegExp("\\r\\na=rtcp-fb:" + payloadType + " transport-cc"))) {
                            let fmtpRegex = new RegExp("\\r\\na=fmtp:" + payloadType + ".*");
                            let startBitrateFmtpParameter = "x-google-start-bitrate=" + Math.floor(videoBuffer.getBitrate() / 1000);
                            if (remoteSdpSections[i].match(fmtpRegex)) {
                                remoteSdpSections[i] = remoteSdpSections[i].replace(fmtpRegex, "$&; " + startBitrateFmtpParameter);
                            } else {
                                remoteSdpSections[i] = remoteSdpSections[i] + "a=fmtp:" + payloadType + " " + startBitrateFmtpParameter + "\r\n";
                            }
                        }
                    }
                }
            }
            for (let i = 6; i < remoteSdpSections.length; i++) {
                if (remoteSdpSections[i].startsWith("m=video")) {
                    // FIXME: Any attempt to set remote SDP which contains `b=TIAS` line(s) in any `m=video` section (even
                    // if it corresponds to receiving or video) forces Chromium-based browsers (Chrome 94.1 at least) and
                    // Safari (Safari 15.0 at least) to pause (for a while) medium & high simulcast substreams of all videos
                    // which we are sending.
                    remoteSdpSections[i] = remoteSdpSections[i].replace(/\r\nb=TIAS:.*/g, "");
                }
            }
            for (let subscription of this.subscriptions.values()) {
                if (subscription.getAudioTransceiver() != null) {
                    let i = subscription.getAudioTransceiver().getSdpSectionIndex();
                    if (i < remoteSdpSections.length) {
                        subscription.getAudioTransceiver().getReceivingTrack().ssrcs = this.getSsrcs(remoteSdpSections[i]); // FIXME: This is a workaround for Firefox (of version 89 at least)
                    }
                }
                if (subscription.getVideoTransceiver() != null) {
                    let i = subscription.getVideoTransceiver().getSdpSectionIndex();
                    if (i < remoteSdpSections.length) {
                        subscription.getVideoTransceiver().getReceivingTrack().ssrcs = this.getSsrcs(remoteSdpSections[i]); // FIXME: This is a workaround for Firefox (of version 89 at least)
                    }
                }
            }
            return remoteSdpSections.join("");
        } else {
            return remoteSdp;
        }
    }

    /**
     * @private
     */
    getSsrcs(section) {
        let ssrcs = section.match(/[\r\n]a=ssrc:[0-9]+/g) || [];
        return ssrcs.map((ssrc) => { return parseInt(ssrc.split(":")[1]); });
    }

    /**
     * @private
     */
    createdPromiseWithReolovers() {
        let resolveFunction, rejectFunction;
        let promise = new Promise((resolve, reject) => {
            resolveFunction = resolve;
            rejectFunction = reject;
        });
        promise.resolve = resolveFunction;
        promise.reject = rejectFunction;
        return promise;
    }

}
