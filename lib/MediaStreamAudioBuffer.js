/**
 * @package
 */
export class MediaStreamAudioBuffer {

    /**
     * @package
     */
    constructor(track, remote) {
        this.track = track;
        this.remote = remote;
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

}