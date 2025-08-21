/**
 * @package
 */
export class WebRtcTransceiver {

    /**
     * @package
     */
    constructor(transceiver, mediaType, sdpSectionIndex) {
        this.transceiver = transceiver;
        this.mediaType = mediaType;
        this.sdpSectionIndex = sdpSectionIndex;
    }

    /**
     * @package
     */
    getMediaType() {
        return this.mediaType;
    }

    /**
     * @package
     */
    getSdpSectionIndex() {
        return this.sdpSectionIndex;
    }

    /**
     * @package
     */
    getDirection() {
        return this.transceiver.direction;
    }

    /**
     * @package
     */
    setDirection(direction) {
        this.transceiver.direction = direction;
    }

    /**
     * @package
     */
    getReceivingTrack() {
        return this.transceiver.receiver.track;
    }

    /**
     * @package
     */
    getSendingTrack() {
        return this.transceiver.sender.track;
    }

    /**
     * @package
     */
    setSendingTrack(track) {
        this.transceiver.sender.replaceTrack(track);
    }

    /**
     * @package
     */
    getSendingParameters() {
        return this.transceiver.sender.getParameters();
    }

    /**
     * @package
     */
    setSendingParameters(parameters) {
        this.transceiver.sender.setParameters(parameters);
    }

    /**
     * @package
     */
    setCodecPreferences(codecs) {
        if (RTCRtpTransceiver.prototype.setCodecPreferences) {
            this.transceiver.setCodecPreferences(codecs);
        }
    }

}
