import {MediaStreamAudioStatistics} from "./MediaStreamAudioStatistics";
import {MediaStreamVideoStatistics} from "./MediaStreamVideoStatistics";

/**
 * MediaStream class is used for representing audio/video content which participants can send and receive. Unlike the
 * standard {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream MediaStream} it can contain one audio
 * and one video only. There are two types of media streams: local and remote. The distinction is nominal — still there
 * is only one class to represent both of them.
 *
 * Local media streams are created explicitly with a help of {@link MindSDK.createMediaStream createMediaStream} method
 * of {@link MindSDK} class. They can contain audio/video from local suppliers only (such as {@link Microphone},
 * {@link Camera} and {@link Screen}). Local media streams are intended to be
 * {@link Me#setMediaStream streamed on behalf of the local participant} only.
 *
 * Remote media streams contain audio/video of remote participants or the conference. The primary and the secondary
 * media streams of any remote participant can be got with help of {@link Participant#getMediaStream getMediaStream} or
 * {@link Participant#getSecondaryMediaStream getSecondaryMediaStream} methods of {@link Participant} class,
 * respectively. The media stream of the conference can be got with {@link Conference#getMediaStream getMediaStream}
 * method of {@link Conference} class.
 *
 * Any media stream can be played with `<video/>` or `<audio/>` HTML elements — just assign the stream to `mediaStream`
 * property which Mind Web SDK adds to prototypes of HTMLVideoElement and HTMLAudioElement automatically. Keep in mind
 * that `<video/>` tries to play (tries to consume) audio and video of the media stream, whereas `<audio/>` tries to
 * play (tries to consume) audio only of the media stream. This means that if you want to play only audio of a remote
 * media stream, it is better to play it with `<audio/>` instead of playing it with invisible `<video/>` because the
 * latter will force underlying WebRTC connection to receive and decode both audio and video.
 *
 * ```
 * let myVideo = document.getElementById("myVideo");
 * let mySecondaryStream = document.getElementById("mySecondaryVideo");
 * let participantVideo = document.getElementById("participantVideo");
 *
 * let me = conference.getMe();
 *
 * // We assume that microphone and camera have been already acquired or will be acquired later
 * let myStream = MindSDK.createMediaStream(microphone, camera);
 * me.setMediaStream(myStream);
 * myVideo.mediaStream = myStream;
 *
 * // We assume that screen has been already acquired or will be acquired later
 * let mySecondaryStream = MindSDK.createMediaStream(null, screen);
 * me.setSecondaryMediaStream(mySecondaryStream);
 * mySecondaryVideo.mediaStream = mySecondaryStream;
 *
 * let participant = conference.getParticipantById("<PARTICIPANT_ID>");
 * if (participant) {
 *     participantVideo.mediaStream = participant.getMediaStream();
 * }
 *
 * ...
 *
 * let conferenceAudio = document.createElement("audio");
 * conferenceAudio.mediaStream = conference.getMediaStream();
 * document.body.append(conferenceAudio);
 * ```
 */
export class MediaStream {

    /**
     * @package
     */
    constructor(label, audioSupplier, videoSupplier) {
        this.label = label;
        this.audioConsumers = new Set();
        this.videoConsumers = new Set();
        this.audioBuffer = null;
        this.videoBuffer = null;
        this.audioSupplier = audioSupplier;
        this.videoSupplier = videoSupplier;
        this.audioStatistics = new MediaStreamAudioStatistics(0, 0, 0, 0, 0, 0);
        this.videoStatistics = new MediaStreamVideoStatistics(0, 0, 0, 0, 0, 0, 0);
        this.maxVideoBitrate = Number.POSITIVE_INFINITY;
        this.maxVideoFrameArea = Number.POSITIVE_INFINITY;
        this.maxVideoFrameRate = Number.POSITIVE_INFINITY;
        this.oldStatistics = null;
    }

    /**
     * Returns the current maximum video frame area of the media stream. The maximum video frame area of the media
     * stream is a product of the width and height which the video should not exceed while being transmitting over the
     * network.
     *
     * @returns {Number} The current maximum video frame area of the media stream.
     */
    getMaxVideoFrameArea() {
        return this.maxVideoFrameArea;
    }

    /**
     * Sets the maximum video frame area of the media stream. The maximum video frame area of the media stream is a
     * product of the width and height which the video should not exceed while being transmitting over the network.
     * This method can be used for limiting the video frame area of any media stream, but the limiting effect depends
     * on the type of the media stream: setting the maximum video frame area for a local media stream (the video of
     * which usually consist of multiple encodings) leads to filtering out from the transmission all the encodings with
     * the higher video frame areas; setting the maximum video frame area for a remote media stream (the video of which
     * always consists of only one encoding) leads to decreasing the frame area of the transmitted video to make it fit
     * into the limit. Though this method cannot be used for stopping the transmission of the stream's video completely
     * — if the limit cannot be satisfied, the encoding with the lowest video frame area will be transmitted anyway. By
     * default, the maximum video frame area of any media stream is unlimited.
     *
     * @param {Number} maxVideoFrameArea The maximum video frame area of the media stream.
     */
    setMaxVideoFrameArea(maxVideoFrameArea) {
        if (maxVideoFrameArea <= 0) {
            throw new Error("Can't change max video frame area to `" + maxVideoFrameArea + "`");
        }
        if (this.maxVideoFrameArea !== maxVideoFrameArea) {
            this.maxVideoFrameArea = maxVideoFrameArea;
            if (this.videoConsumers.size > 0 && this.videoSupplier != null) {
                this.videoSupplier.addVideoConsumer(this);
            }
        }
    }

    /**
     * Returns the current maximum video frame rate of the media stream. The maximum video frame rate of the media
     * stream is a frame rate which the video should not exceed while being transmitting over the network.
     *
     * @returns {Number} The current maximum video frame rate of the media stream.
     */
    getMaxVideoFrameRate() {
        return this.maxVideoFrameRate;
    }

    /**
     * Sets the maximum video frame rate of the media stream. The maximum video frame rate of the media stream is a
     * frame rate which the video should not exceed while being transmitting over the network. This method can be used
     * for limiting the video frame rate of any media stream, but the limiting effect depends on the type of the media
     * stream: setting the maximum video frame rate for a local media stream (the video of which usually consist of
     * multiple encodings) leads to filtering out from the transmission all the encodings with the higher video frame
     * rates; setting the maximum video frame rate for a remote media stream (the video of which always consists of
     * only one encoding) leads to decreasing the frame rate of the transmitted video to make it fit into the limit.
     * Though this method cannot be used for stopping the transmission of the stream's video completely — if the limit
     * cannot be satisfied, the encoding with the lowest video frame rate will be transmitted anyway. By default, the
     * maximum video frame rate of any media stream is unlimited.
     *
     * @param {Number} maxVideoFrameRate The maximum video frame rate of the media stream.
     */
    setMaxVideoFrameRate(maxVideoFrameRate) {
        if (maxVideoFrameRate <= 0) {
            throw new Error("Can't change max video frame rate to `" + maxVideoFrameRate + "`");
        }
        if (this.maxVideoFrameRate !== maxVideoFrameRate) {
            this.maxVideoFrameRate = maxVideoFrameRate;
            if (this.videoConsumers.size > 0 && this.videoSupplier != null) {
                this.videoSupplier.addVideoConsumer(this);
            }
        }
    }

    /**
     * Returns the current maximum video bitrate of the media stream. The maximum video bitrate of the media stream is
     * a number of bits which each second of stream's video should not exceed while being transmitting over the network.
     *
     * @returns {Number} The current maximum video bitrate of the media stream.
     */
    getMaxVideoBitrate() {
        return this.maxVideoBitrate;
    }

    /**
     * Sets the maximum video bitrate of the media stream. The maximum video bitrate of the media stream is a number of
     * bits which each second of stream's video should not exceed while being transmitting over the network. This
     * method can be used for limiting the maximum video bitrate of any media stream, but the limiting effect depends
     * on the type of the media stream: setting the maximum video bitrate for a local media stream (the video of which
     * usually consist of multiple encodings) leads to filtering out (from the transmission) all the encodings which do
     * not fit into the limit (starting from the most voluminous one); setting the maximum video bitrate for a remote
     * media stream (the video of which always consists of only one encoding) leads to decreasing the maximum quality
     * of the transmitted video to make it fit into the limit. Though, this method cannot be used for stopping the
     * transmission of the stream's video completely — if the limit cannot be satisfied, the video in the least
     * voluminous encoding (in case of local stream) or with the poorest quality (in case of remote stream) will be
     * transmitted anyway. By default, the maximum video bitrate of any media stream is unlimited.
     *
     * @param {Number} maxVideoBitrate The maximum video bitrate of the media stream.
     */
    setMaxVideoBitrate(maxVideoBitrate) {
        if (maxVideoBitrate <= 0) {
            throw new Error("Can't change max video bitrate to `" + maxVideoBitrate + "`");
        }
        if (this.maxVideoBitrate !== maxVideoBitrate) {
            this.maxVideoBitrate = maxVideoBitrate;
            if (this.videoConsumers.size > 0 && this.videoSupplier != null) {
                this.videoSupplier.addVideoConsumer(this);
            }
        }
    }

    /**
     * Returns the latest {@link MediaStreamAudioStatistics audio statistics} of the media stream. The statistics
     * consists of instant measures of the network connection which is currently used for transmitting the audio of the
     * media stream.
     *
     * @returns {MediaStreamAudioStatistics} The latest audio statistics of the media stream.
     */
    getAudioStatistics() {
        return this.audioStatistics;
    }

    /**
     * Returns the latest {@link MediaStreamVideoStatistics video statistics} of the media stream. The statistics
     * consists of instant measures of the network connection which is currently used for transmitting the video of the
     * media stream.
     *
     * @returns {MediaStreamVideoStatistics} The latest video statistics of the media stream.
     */
    getVideoStatistics() {
        return this.videoStatistics;
    }

    /**
     * @package
     */
    getLabel() {
        return this.label;
    }

    /**
     * @package
     */
    hasAudioSupplier() {
        return this.audioSupplier != null;
    }

    /**
     * @package
     */
    setAudioSupplier(audioSupplier) {
        if (this.audioSupplier !== audioSupplier) {
            if (this.audioConsumers.size > 0) {
                if (this.audioSupplier != null) {
                    let oldAudioSupplier = this.audioSupplier;
                    this.audioSupplier = null;
                    oldAudioSupplier.removeAudioConsumer(this);
                }
                this.audioSupplier = audioSupplier;
                if (audioSupplier != null) {
                    audioSupplier.addAudioConsumer(this);
                } else {
                    this.resetAudioStatistics();
                }
            } else {
                this.audioSupplier = audioSupplier;
            }
        }
    }

    /**
     * @package
     */
    hasVideoSupplier() {
        return this.videoSupplier != null;
    }

    /**
     * @package
     */
    setVideoSupplier(videoSupplier) {
        if (this.videoSupplier !== videoSupplier) {
            if (this.videoConsumers.size > 0) {
                if (this.videoSupplier != null) {
                    let oldVideoSupplier = this.videoSupplier;
                    this.videoSupplier = null;
                    oldVideoSupplier.removeVideoConsumer(this);
                }
                this.videoSupplier = videoSupplier;
                if (videoSupplier != null) {
                    videoSupplier.addVideoConsumer(this);
                } else {
                    this.resetVideoStatistics();
                }
            } else {
                this.videoSupplier = videoSupplier;
            }
        }
    }

    /**
     * @package
     */
    onAudioBuffer(audioBuffer) {
        if (this.audioBuffer !== audioBuffer) {
            this.audioBuffer = audioBuffer;
            for (let consumer of this.audioConsumers) {
                consumer.onAudioBuffer(audioBuffer, this);
            }
        }
    }

    /**
     * @package
     */
    onVideoBuffer(videoBuffer) {
        if (this.videoBuffer !== videoBuffer) {
            this.videoBuffer = videoBuffer;
            for (let consumer of this.videoConsumers) {
                consumer.onVideoBuffer(videoBuffer, this);
            }
        }
    }

    /**
     * @package
     */
    addAudioConsumer(consumer) {
        if (!this.audioConsumers.has(consumer) && this.audioConsumers.add(consumer)) {
            if (this.audioConsumers.size === 1 && this.audioSupplier != null) {
                this.audioSupplier.addAudioConsumer(this);
            } else {
                consumer.onAudioBuffer(this.audioBuffer, this);
            }
        }
    }

    /**
     * @package
     */
    removeAudioConsumer(consumer) {
        if (this.audioConsumers.delete(consumer)) {
            consumer.onAudioBuffer(null, this);
            if (this.audioConsumers.size === 0 && this.audioSupplier != null) {
                this.audioSupplier.removeAudioConsumer(this);
                this.resetAudioStatistics();
            }
        }
    }

    /**
     * @package
     */
    addVideoConsumer(consumer) {
        if (!this.videoConsumers.has(consumer) && this.videoConsumers.add(consumer)) {
            if (this.videoConsumers.size === 1 && this.videoSupplier != null) {
                this.videoSupplier.addVideoConsumer(this);
            } else {
                consumer.onVideoBuffer(this.videoBuffer, this);
            }
        }
    }

    /**
     * @package
     */
    removeVideoConsumer(consumer) {
        if (this.videoConsumers.delete(consumer)) {
            consumer.onVideoBuffer(null, this);
            if (this.videoConsumers.size === 0 && this.videoSupplier != null) {
                this.videoSupplier.removeVideoConsumer(this);
                this.resetVideoStatistics();
            }
        }
    }

    /**
     * @package
     */
    resetStatistics() {
        this.oldStatistics = null;
        this.updateStatistics(null);
    }

    /**
     * @package
     */
    updateStatistics(report) {
        let newStatistics = {
            roundTripTime: 0,
            audioBytesSent: 0,
            audioBytesReceived: 0,
            audioPacketsSent: 0,
            audioPacketsReceived: 0,
            audioPacketsLost: 0,
            audioPacketSendDelay: 0,
            audioJitterBufferDelay: 0,
            audioJitterBufferEmittedCount: 0,
            audioLevel: 0,
            audioSamplesSent: 0,
            audioSamplesPlayedOut: 0,
            audioSilenceDuration: 0,
            videoBytesSent: 0,
            videoBytesReceived: 0,
            videoPacketsSent: 0,
            videoPacketsReceived: 0,
            videoPacketsLost: 0,
            videoPacketSendDelay: 0,
            videoJitterBufferDelay: 0,
            videoJitterBufferEmittedCount: 0,
            videoWidth: 0,
            videoHeight: 0,
            videoFramesSent: 0,
            videoFramesPlayedOut: 0,
        };
        if (this.oldStatistics == null) {
            let currentTimestamp = Date.now();
            newStatistics.timestamp = currentTimestamp;
            this.oldStatistics = newStatistics;
        } else {
            let currentTimestamp = Date.now();
            newStatistics.timestamp = currentTimestamp;
            if (report != null) {
                let selectedCandidatePair = null;
                let audioTrack = null;
                let videoTrack = null;
                let audioSource = null;
                let videoSource = null;
                let audioOutboundRtp = null;
                let videoOutboundRtps = [];
                let audioRemoteInboundRtp = null;
                let videoRemoteInboundRtps = [];
                let audioInboundRtp = null;
                let videoInboundRtp = null;
                for (let stats of report) {
                    switch ((stats.kind || stats.mediaType) + "-" + stats.type) { // FIXME: The `|| stats.mediaType` is a workaround for Safari (of version 13 at least)
                        case "undefined-candidate-pair": // FIXME: This is a workaround for Firefox (of version 80 at least)
                            selectedCandidatePair = stats;
                            break;
                        case "audio-track":
                            audioTrack = stats;
                            break;
                        case "video-track":
                            videoTrack = stats;
                            break;
                        case "audio-media-source":
                            audioSource = stats;
                            break;
                        case "video-media-source":
                            videoSource = stats;
                            break;
                        case "audio-outbound-rtp":
                            audioOutboundRtp = stats;
                            break;
                        case "video-outbound-rtp":
                            videoOutboundRtps.push(stats);
                            break;
                        case "audio-remote-inbound-rtp":
                            audioRemoteInboundRtp = stats;
                            break;
                        case "video-remote-inbound-rtp":
                            videoRemoteInboundRtps.push(stats);
                            break;
                        case "audio-inbound-rtp":
                            audioInboundRtp = stats;
                            break;
                        case "video-inbound-rtp":
                            videoInboundRtp = stats;
                            break;
                    }
                }
                if (selectedCandidatePair != null) {
                    newStatistics.roundTripTime = Math.trunc(selectedCandidatePair.currentRoundTripTime * 1000);
                }
                if (this.label === "local") { // FIXME: We should use more robust approach for detecting local media streams
                    if (audioOutboundRtp != null) {
                        newStatistics.audioBytesSent = audioOutboundRtp.bytesSent;
                        newStatistics.audioPacketSendDelay = 0; // TODO: Replace with `totalPacketSendDelay` when it is added
                        newStatistics.audioPacketsSent = audioOutboundRtp.packetsSent;
                    }
                    if (audioRemoteInboundRtp != null) {
                        newStatistics.audioPacketsLost = audioRemoteInboundRtp.packetsLost;
                        // FIXME: This is a workaround for Firefox (of version 80 at least)
                        if (!newStatistics.roundTripTime) { // TODO: We also set it below!
                            newStatistics.roundTripTime = Math.trunc((audioRemoteInboundRtp.roundTripTime * 1000) || 1);
                        }
                    }
                    if (audioSource != null) {
                        if (audioSource.audioLevel) { // FIXME: In Safari (of version 14.0.1) `audioSource` doesn't have `audioLevel` property
                            newStatistics.audioLevel = Math.trunc(audioSource.audioLevel * 100);
                        }
                        if (audioSource.totalSamplesDuration) { // FIXME: In Safari (of version 14.0.1) `audioSource` doesn't have `totalSamplesDuration` property
                            newStatistics.audioSamplesSent = Math.trunc(audioSource.totalSamplesDuration * 48000);
                        }
                    }
                    // FIXME: This is a workaround for Firefox (of version 80 at least) and Safari (of version 13 at least)
                    if ((!audioSource || !audioSource.totalSamplesDuration) && (newStatistics.audioPacketsSent - this.oldStatistics.audioPacketsSent) > 0) {
                        newStatistics.audioSamplesSent = this.oldStatistics.audioSamplesSent + 48 * (newStatistics.timestamp - this.oldStatistics.timestamp);
                    }
                    for (let i = 0; i < videoOutboundRtps.length; i++) {
                        let videoOutboundRtp = videoOutboundRtps[i];
                        newStatistics.videoBytesSent += videoOutboundRtp.bytesSent;
                        newStatistics.videoPacketSendDelay += Math.trunc(videoOutboundRtp.totalPacketSendDelay * 1000);
                        newStatistics.videoPacketsSent += videoOutboundRtp.packetsSent;
                        if (videoOutboundRtp.ssrc && videoOutboundRtp.ssrc) { // if we are running in a recent version of Chromium (M110 or newer for sure) or Firefox
                            newStatistics["videoFramesSent" + videoOutboundRtp.ssrc] = videoOutboundRtp.framesSent ? videoOutboundRtp.framesSent : videoOutboundRtp.framesEncoded; // FIXME: The `framesEncoded` is a workaround for Firefox (of version 80 at least)
                            if (!this.oldStatistics["videoFramesSent" + videoOutboundRtp.ssrc]) {
                                this.oldStatistics["videoFramesSent" + videoOutboundRtp.ssrc] = 0;
                            }
                            if (newStatistics["videoFramesSent" + videoOutboundRtp.ssrc] - this.oldStatistics["videoFramesSent" + videoOutboundRtp.ssrc] > 0) {
                                if (videoOutboundRtp.frameWidth && videoOutboundRtp.frameHeight && newStatistics.videoWidth < videoOutboundRtp.frameWidth && newStatistics.videoHeight < videoOutboundRtp.frameHeight) {
                                    newStatistics.videoWidth = videoOutboundRtp.frameWidth;
                                    newStatistics.videoHeight = videoOutboundRtp.frameHeight;
                                    newStatistics.videoFramesSent = newStatistics["videoFramesSent" + videoOutboundRtp.ssrc];
                                    this.oldStatistics.videoFramesSent = this.oldStatistics["videoFramesSent" + videoOutboundRtp.ssrc];
                                }
                            }
                        } else if (videoTrack != null) { // if we are running in an outdated version of Chromium
                            if (videoTrack.frameWidth) {
                                newStatistics.videoWidth = videoTrack.frameWidth;
                            }
                            if (videoTrack.frameHeight) {
                                newStatistics.videoHeight = videoTrack.frameHeight;
                            }
                            newStatistics.videoFramesSent = videoTrack.framesSent;
                        }
                    }
                    for (let videoRemoteInboundRtp of videoRemoteInboundRtps) {
                        newStatistics.videoPacketsLost += videoRemoteInboundRtp.packetsLost;
                        // FIXME: This is a workaround for Firefox (of version 80 at least)
                        if (!newStatistics.roundTripTime) { // TODO: We also set it below!
                            newStatistics.roundTripTime = Math.max(newStatistics.roundTripTime, Math.trunc((videoRemoteInboundRtp.roundTripTime * 1000) || 1));
                        }
                    }
                } else { // this.label !== "local"
                    if (audioInboundRtp != null) {
                        newStatistics.audioBytesReceived = audioInboundRtp.bytesReceived;
                        newStatistics.audioPacketsReceived = audioInboundRtp.packetsReceived;
                        newStatistics.audioPacketsLost = audioInboundRtp.packetsLost;
                        if (audioInboundRtp.jitterBufferDelay && audioInboundRtp.jitterBufferEmittedCount) { // if we are running in a recent version of Chromium (M110 or newer for sure) or Firefox (110 or newer for sure)
                            newStatistics.audioJitterBufferDelay = Math.trunc(audioInboundRtp.jitterBufferDelay * 1000);
                            newStatistics.audioJitterBufferEmittedCount = audioInboundRtp.jitterBufferEmittedCount;
                        } else if (audioTrack != null) { // if we are running in an outdated version of Chromium
                            newStatistics.audioJitterBufferDelay = Math.trunc(audioTrack.jitterBufferDelay * 1000);
                            newStatistics.audioJitterBufferEmittedCount = audioTrack.jitterBufferEmittedCount;
                        }
                        if (audioInboundRtp.audioLevel) { // if we are running in a recent version of Chromium (M110 or newer for sure) or Firefox (110 or newer for sure)
                            newStatistics.audioLevel = Math.trunc(audioInboundRtp.audioLevel * 100);
                        } else if (audioTrack != null) { // if we are running in an outdated version of Chromium
                            newStatistics.audioLevel = Math.trunc(audioTrack.audioLevel * 100);
                        }
                        if (audioInboundRtp.totalSamplesReceived && audioInboundRtp.concealedSamples >= 0) { // if we are running in a recent version of Chromium (M110 or newer for sure) or Firefox (110 or newer for sure)
                            newStatistics.audioSamplesPlayedOut = audioInboundRtp.totalSamplesReceived - audioInboundRtp.concealedSamples;
                        } else if (audioTrack != null) { // if we are running in an outdated version of Chromium
                            newStatistics.audioSamplesPlayedOut = audioTrack.totalSamplesReceived - audioTrack.concealedSamples;
                        } else if (newStatistics.audioPacketsReceived - this.oldStatistics.audioPacketsReceived > 0) { // FIXME: This is a workaround for Firefox (of version 80 at least) and Safari (of version 13 at least)
                            newStatistics.audioSamplesPlayedOut = this.oldStatistics.audioSamplesPlayedOut + 48 * (newStatistics.timestamp - this.oldStatistics.timestamp);
                        }
                        if (audioInboundRtp.silentConcealedSamples) { // if we are running in a recent version of Chromium (M110 or newer for sure) or Firefox (110 or newer for sure)
                            newStatistics.audioSilenceDuration = Math.trunc(audioInboundRtp.silentConcealedSamples / 48);
                        } else if (audioTrack != null) { // if we are running in an outdated version of Chromium
                            newStatistics.audioSilenceDuration = Math.trunc(audioTrack.silentConcealedSamples / 48);
                        }
                    }
                    if (videoInboundRtp != null) {
                        newStatistics.videoBytesReceived = videoInboundRtp.bytesReceived;
                        newStatistics.videoPacketsReceived = videoInboundRtp.packetsReceived;
                        newStatistics.videoPacketsLost = videoInboundRtp.packetsLost;
                        if (videoInboundRtp.jitterBufferDelay && videoInboundRtp.jitterBufferEmittedCount) { // if we are running in a recent version of Chromium (M110 or newer for sure) or Firefox (110 or newer for sure)
                            newStatistics.videoJitterBufferDelay = Math.trunc(videoInboundRtp.jitterBufferDelay * 1000);
                            newStatistics.videoJitterBufferEmittedCount = videoInboundRtp.jitterBufferEmittedCount;
                        } else if (videoTrack != null) { // if we are running in an outdated version of Chromium
                            newStatistics.videoJitterBufferDelay = Math.trunc(videoTrack.jitterBufferDelay * 1000);
                            newStatistics.videoJitterBufferEmittedCount = videoTrack.jitterBufferEmittedCount;
                        }
                        if (videoInboundRtp.frameWidth && videoInboundRtp.frameHeight) { // if we are running in a recent version of Chromium (M110 or newer for sure) or Firefox (110 or newer for sure)
                            newStatistics.videoWidth = videoInboundRtp.frameWidth;
                            newStatistics.videoHeight = videoInboundRtp.frameHeight;
                        } else if (videoTrack != null) { // if we are running in an outdated version of Chromium
                            newStatistics.videoWidth = videoTrack.frameWidth;
                            newStatistics.videoHeight = videoTrack.frameHeight;
                        }
                        if (videoInboundRtp.framesReceived && videoInboundRtp.framesDropped) { // if we are running in a recent version of Chromium (M110 or newer for sure) or Firefox (110 or newer for sure)
                            newStatistics.videoFramesPlayedOut = videoInboundRtp.framesReceived - videoInboundRtp.framesDropped;
                        } else if (videoInboundRtp.framesDecoded) { // FIXME: This is a workaround for Firefox (of version 80 at least)
                            newStatistics.videoFramesPlayedOut = videoInboundRtp.framesDecoded;
                        } else if (videoTrack != null) { // if we are running in an outdated version of Chromium
                            newStatistics.videoFramesPlayedOut = videoTrack.framesReceived - videoTrack.framesDropped;
                        }
                    }
                }
                // FIXME: This is a workaround for Firefox (of version 80 at least)
                if (this.videoBuffer != null && newStatistics.videoWidth === 0 && newStatistics.videoHeight === 0) {
                    newStatistics.videoWidth = this.videoBuffer.getTrack().getSettings().width;
                    newStatistics.videoHeight = this.videoBuffer.getTrack().getSettings().height;
                }
            }
            let dT = (newStatistics.timestamp - this.oldStatistics.timestamp) / 1000.0;
            let audioStatistics = new MediaStreamAudioStatistics(0, 0, 0, 0, 0, 0);
            let videoStatistics = new MediaStreamVideoStatistics(0, 0, 0, 0, 0, 0, 0);
            if (this.audioBuffer != null) {
                if (this.label === "local") { // FIXME: We should use more robust approach for detecting local media streams
                    audioStatistics = new MediaStreamAudioStatistics(newStatistics.roundTripTime || 1, // FIXME: The `|| 1` is a workaround for Firefox (of version 80 at least)
                                                                     (newStatistics.audioBytesSent - this.oldStatistics.audioBytesSent) * 8.0 / dT,
                                                                     (newStatistics.audioPacketSendDelay - this.oldStatistics.audioPacketSendDelay) / (newStatistics.audioPacketsSent - this.oldStatistics.audioPacketsSent),
                                                                     (newStatistics.audioPacketsLost - this.oldStatistics.audioPacketsLost) * 100.0 / (newStatistics.audioPacketsSent - this.oldStatistics.audioPacketsSent + newStatistics.audioPacketsLost - this.oldStatistics.audioPacketsLost),
                                                                     newStatistics.audioLevel,
                                                                     (newStatistics.audioSamplesSent - this.oldStatistics.audioSamplesSent) / dT);
                } else {
                    audioStatistics = new MediaStreamAudioStatistics(newStatistics.roundTripTime || 1, // FIXME: The `|| 1` is a workaround for Firefox (of version 80 at least)
                                                                     (newStatistics.audioBytesReceived - this.oldStatistics.audioBytesReceived) * 8.0 / dT,
                                                                     (newStatistics.audioJitterBufferDelay - this.oldStatistics.audioJitterBufferDelay) / (newStatistics.audioJitterBufferEmittedCount - this.oldStatistics.audioJitterBufferEmittedCount),
                                                                     (newStatistics.audioPacketsLost - this.oldStatistics.audioPacketsLost) * 100.0 / (newStatistics.audioPacketsReceived - this.oldStatistics.audioPacketsReceived + newStatistics.audioPacketsLost - this.oldStatistics.audioPacketsLost),
                                                                     newStatistics.audioLevel,
                                                                     (newStatistics.audioSamplesPlayedOut - this.oldStatistics.audioSamplesPlayedOut) / dT);
                }
            }
            if (this.videoBuffer != null) {
                if (this.label === "local") { // FIXME: We should use more robust approach for detecting local media streams
                    videoStatistics = new MediaStreamVideoStatistics(newStatistics.roundTripTime || 1, // FIXME: The `|| 1` is a workaround for Firefox (of version 80 at least)
                                                                     (newStatistics.videoBytesSent - this.oldStatistics.videoBytesSent) * 8.0 / dT,
                                                                     (newStatistics.videoPacketSendDelay - this.oldStatistics.videoPacketSendDelay) / (newStatistics.videoPacketsSent - this.oldStatistics.videoPacketsSent),
                                                                     (newStatistics.videoPacketsLost - this.oldStatistics.videoPacketsLost) * 100.0 / (newStatistics.videoPacketsSent - this.oldStatistics.videoPacketsSent + newStatistics.videoPacketsLost - this.oldStatistics.videoPacketsLost),
                                                                     newStatistics.videoWidth,
                                                                     newStatistics.videoHeight,
                                                                     (newStatistics.videoFramesSent - this.oldStatistics.videoFramesSent) / dT);
                } else {
                    videoStatistics = new MediaStreamVideoStatistics(newStatistics.roundTripTime || 1, // FIXME: The `|| 1` is a workaround for Firefox (of version 80 at least) where `roundTripTime` isn't available,
                                                                     (newStatistics.videoBytesReceived - this.oldStatistics.videoBytesReceived) * 8.0 / dT,
                                                                     (newStatistics.videoJitterBufferDelay - this.oldStatistics.videoJitterBufferDelay) / (newStatistics.videoJitterBufferEmittedCount - this.oldStatistics.videoJitterBufferEmittedCount),
                                                                     (newStatistics.videoPacketsLost - this.oldStatistics.videoPacketsLost) * 100.0 / (newStatistics.videoPacketsReceived - this.oldStatistics.videoPacketsReceived + newStatistics.videoPacketsLost - this.oldStatistics.videoPacketsLost),
                                                                     newStatistics.videoWidth,
                                                                     newStatistics.videoHeight,
                                                                     (newStatistics.videoFramesPlayedOut - this.oldStatistics.videoFramesPlayedOut) / dT);
                }
            }
            if (this.audioSupplier != null && this.audioConsumers.size > 0) {
                this.audioStatistics = audioStatistics;
            }
            if (this.videoSupplier != null && this.videoConsumers.size > 0) {
                this.videoStatistics = videoStatistics;
            }
            this.oldStatistics = newStatistics;
        }
    }

    /**
     * @private
     */
    resetAudioStatistics() {
        this.audioStatistics = new MediaStreamAudioStatistics(0, 0, 0, 0, 0, 0);
    }

    /**
     * @private
     */
    resetVideoStatistics() {
        this.videoStatistics = new MediaStreamVideoStatistics(0, 0, 0, 0, 0, 0, 0);
    }

}
