import {Distortion} from "./Distortion";

/**
 * @package
 */
export class DistortionRegistry {

    /**
     * @package
     */
    constructor() {
        this.mtids = new Map();
        this.distortions = new Map();
        this.messages = [];
    }

    /**
     * @package
     */
    addMtid(mtid) {
        this.mtids.set(mtid, Date.now());
    }

    /**
     * @package
     */
    removeMtid(mtid) {
        this.mtids.delete(mtid);
    }

    /**
     * @package
     */
    registerDistortion(mtid) {
        if (this.mtids.has(mtid) && Date.now() - this.mtids.get(mtid) > 3000) {
            let distortion = this.distortions.get(mtid);
            if (distortion) {
                if (distortion.prolong()) {
                    return;
                } else {
                    this.messages.push(distortion.toString());
                }
            }
            this.distortions.set(mtid, new Distortion(mtid));
        }
    }

    /**
     * @package
     */
    report(dataChannel) {
        for (let [mtid, distortion] of this.distortions) {
            if (distortion.isEnded()) {
                this.messages.push(distortion.toString());
                this.distortions.delete(mtid);
            }
        }
        for (let message of this.messages) {
            dataChannel.send(message);
        }
        this.messages = [];
    }

}
