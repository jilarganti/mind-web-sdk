/**
 * @package
 */
export class Distortion {

    /**
     * @package
     */
    constructor(mtid) {
        this.mtid = mtid;
        this.timestamp = Date.now() - 1000; // A distortion is always reported with one-second delay
        this.duration = 1000;
    }

    /**
     * @package
     */
    isEnded() {
        return Date.now() - (this.timestamp + this.duration) > 1500;
    }

    /**
     * @package
     */
    prolong() {
        if (!this.isEnded()) {
            this.duration = Date.now() - this.timestamp;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @package
     */
    toString() {
        return "1:" + this.mtid + ":" + this.timestamp + ":" + Math.round(this.duration / 1000);
    }

}
