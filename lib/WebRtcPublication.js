/**
 * @package
 */
export class WebRtcPublication {

    /**
     * @package
     */
    constructor() {
        this.audioTransceiver = null;
        this.videoTransceiver = null;
        this.audioBuffer = null;
        this.videoBuffer = null;
        this.stream = null
    }

    /**
     * @package
     */
    getAudioTransceiver() {
        return this.audioTransceiver;
    }

    /**
     * @package
     */
    setAudioTransceiver(audioTransceiver) {
        this.audioTransceiver = audioTransceiver;
    }

    /**
     * @package
     */
    getVideoTransceiver() {
        return this.videoTransceiver;
    }

    /**
     * @package
     */
    setVideoTransceiver(videoTransceiver) {
        this.videoTransceiver = videoTransceiver;
    }

    /**
     * @package
     */
    getAudioBuffer() {
        return this.audioBuffer;
    }

    /**
     * @package
     */
    setAudioBuffer(audioBuffer) {
        this.audioBuffer = audioBuffer;
    }

    /**
     * @package
     */
    getVideoBuffer() {
        return this.videoBuffer;
    }

    /**
     * @package
     */
    setVideoBuffer(videoBuffer) {
        this.videoBuffer = videoBuffer;
    }

    /**
     * @package
     */
    getStream() {
        return this.stream;
    }

    /**
     * @package
     */
    setStream(stream) {
        this.stream = stream;
    }

}
