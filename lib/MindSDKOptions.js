import {MindSDK} from "./MindSDK";

/**
 * MindSDKOptions class represents all available configuration options for Mind Web SDK. The default constructor
 * creates an instance of MindSDKOptions class with the default values for all configuration options. If necessary, you
 * can change any default value before passing the instance to the static {@link MindSDK#initialize initialize} method
 * of {@link MindSDK} class:
 *
 * ```
 * let options = new MindSDKOptions();
 * options.setUseVp9ForSendingVideo(true);
 * MindSDK.initialize(options).then(function() {
 *    ...
 * });
 * ```
 * </pre>
 */
export class MindSDKOptions {

    constructor() {
        this.useVp9ForSendingVideo = false;
        if (arguments.length > 0) {
            this.useVp9ForSendingVideo = arguments[0].isUseVp9ForSendingVideo();
        }
    }

    /**
     * @package
     */
    isUseVp9ForSendingVideo() {
        return this.useVp9ForSendingVideo;
    }

    /**
     * Sets whether VP9 codec should be used for sending video or not. If `true` and if the browser supports VP9 in SVC
     * mode (i.e. if we are running in a browser which is based on Chromium of version >= 111) then any outgoing video
     * will be encoded with VP9 in SVC mode, otherwise — with VP8/H.264 in simulcast mode. The default value is `false`.
     *
     * @param {Boolean} useVp9ForSendingVideo Whether VP9 codec should be used for sending video or not.
     */
    setUseVp9ForSendingVideo(useVp9ForSendingVideo) {
        this.useVp9ForSendingVideo = useVp9ForSendingVideo;
    }

}