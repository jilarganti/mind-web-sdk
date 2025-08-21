import {MindSDK} from "./MindSDK";

/**
 * SessionOptions class represents a set of configuration options for a {@link Session participation session}. The
 * default constructor creates an instance of SessionOptions class with the default values for all configuration
 * options. If necessary, you can change any default value before passing the instance to the static
 * {@link MindSDK#join join} method of {@link MindSDK} class:
 *
 * ```
 * let conferenceURI = "https://api.mind.com/<APPLICATION_ID>/<CONFERENCE_ID>";
 * let participantToken = "<PARTICIPANT_TOKEN>";
 * let options = new MindSDK.SessionOptions();
 * options.setStunServer("stun:stun.l.google.com:19302");
 * MindSDK.join(conferenceURI, participantToken, options).then(function(session) {
 *     ...
 * });
 * ```
 */
export class SessionOptions {

    #useVp9ForSendingVideo;
    #stunServerURL;
    #turnServerURL;
    #turnServerUsername;
    #turnServerPassword;

    constructor() {
        this.#useVp9ForSendingVideo = false;
        this.#stunServerURL = null;
        this.#turnServerURL = null;
        this.#turnServerUsername = null;
        this.#turnServerPassword = null;
        if (arguments.length > 0) {
            this.#useVp9ForSendingVideo = arguments[0].isUseVp9ForSendingVideo();
            this.#stunServerURL = arguments[0].getStunServerURL();
            this.#turnServerURL = arguments[0].getTurnServerURL();
            this.#turnServerUsername = arguments[0].getTurnServerUsername();
            this.#turnServerPassword = arguments[0].getTurnServerPassword();
        }
    }

    /**
     * Sets whether VP9 codec should be used for sending video or not. If `true` and if the browser supports VP9 in SVC
     * mode (i.e. if we are running in a browser which is based on Chromium of version >= 111) then any outgoing video
     * will be encoded with VP9 in SVC mode, otherwise — with VP8/H.264 in simulcast mode. The default value is `false`.
     *
     * @param {Boolean} useVp9ForSendingVideo Whether VP9 codec should be used for sending video or not.
     */
    setUseVp9ForSendingVideo(useVp9ForSendingVideo) {
        this.#useVp9ForSendingVideo = useVp9ForSendingVideo;
    }

    /**
     * Sets a STUN server which should be used for establishing a participation session. If it is set and if it is not
     * `null`, then Mind Web SDK will try to gather and use a reflexive Ice candidates for establishing the participant
     * session.
     *
     * @param {String} stunServerURL The URL for connecting to the STUN server.
     */
    setStunServer(stunServerURL) {
        this.#stunServerURL = stunServerURL;
    }

    /**
     * Sets a TURN server which should be used for establishing a participation session. If it is set and if it is not
     * `null`, then Mind Web SDK will try to gather and use a relay Ice candidates for establishing the participant
     * session.
     *
     * @param {String} turnServerURL The URL for connecting to the TURN server.
     * @param {String} turnServerUsername The username for connecting to the TURN server.
     * @param {String} turnServerPassword The password for connecting to the TURN server.
     */
    setTurnServer(turnServerURL, turnServerUsername, turnServerPassword) {
        this.#turnServerURL = turnServerURL;
        this.#turnServerUsername = turnServerUsername;
        this.#turnServerPassword = turnServerPassword;
    }

    /**
     * @protected
     */
    isUseVp9ForSendingVideo() {
        return this.#useVp9ForSendingVideo;
    }

    /**
     * @protected
     */
    getStunServerURL() {
        return this.#stunServerURL;
    }

    /**
     * @protected
     */
    getTurnServerURL() {
        return this.#turnServerURL;
    }

    /**
     * @protected
     */
    getTurnServerUsername() {
        return this.#turnServerUsername;
    }

    /**
     * @protected
     */
    getTurnServerPassword() {
        return this.#turnServerPassword;
    }

}