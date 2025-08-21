/**
 * @package
 */
export class WebRtcSubscription {

    /**
     * @package
     */
    constructor() {
        this.audioTransceiver = null;
        this.videoTransceiver = null;
        this.audioConsumer = null;
        this.videoConsumer = null;
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
    getAudioConsumer() {
        return this.audioConsumer;
    }

    /**
     * @package
     */
    setAudioConsumer(audioConsumer) {
        this.audioConsumer = audioConsumer;
    }

    /**
     * @package
     */
    getVideoConsumer() {
        return this.videoConsumer;
    }

    /**
     * @package
     */
    setVideoConsumer(videoConsumer) {
        this.videoConsumer = videoConsumer;
    }

}
