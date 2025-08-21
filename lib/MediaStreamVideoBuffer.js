/**
 * @package
 */
export class MediaStreamVideoBuffer {

    /**
     * @package
     */
    constructor(track, remote, width, height, bitrate, adaptivity, scale) {
        this.track = track;
        this.remote = remote;
        this.width = width;
        this.height = height;
        this.bitrate = bitrate;
        this.adaptivity = adaptivity;
        this.scale = scale;
    }

    /**
     * @package
     */
    getTrack() {
        return this.track;
    }

    /**
     * @package
     */
    isRemote() {
        return this.remote;
    }

    /**
     * @package
     */
    getWidth() {
        return this.width;
    }

    /**
     * @package
     */
    getHeight() {
        return this.height;
    }

    /**
     * @package
     */
    getBitrate() {
        return this.bitrate;
    }

    /**
     * @package
     */
    getAdaptivity() {
        return this.adaptivity;
    }

    /**
     * @package
     */
    getScale() {
        return this.scale;
    }

}