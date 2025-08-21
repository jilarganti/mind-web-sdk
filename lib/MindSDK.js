import {Camera} from "./Camera";
import {DeviceRegistry} from "./DeviceRegistry";
import {MediaStream} from "./MediaStream";
import {Microphone} from "./Microphone";
import {MindSDKOptions} from "./MindSDKOptions";
import {Session} from "./Session";
import {SessionOptions} from "./SessionOptions";
import "webrtc-adapter";

/**
 * MindSDK class is the entry point of Mind Web SDK. It contains static methods for {@link MindSDK.join joining} and
 * {@link MindSDK.exit2 leaving} conferences, for getting {@link MindSDK.getDeviceRegistry device registry}, and for
 * {@link MindSDK.createMediaStream creating local media streams}. But before you can do all this, the SDK should be
 * initialized:
 *
 * ```
 * let options = new MindSDKOptions();
 * MindSDK.initialize(options).then(function() {
 *    // Initialization of Mind SDK is completed, now you can participate in conferences.
 * });
 * ```
 */
export class MindSDK {

    /**
     * Initializes Mind Web SDK with the specified {@link MindSDKOptions configuration options}. The initialization is
     * an asynchronous operation, that's why this method returns a `Promise` that either resolves with no value when
     * the initialization is completed. The initialization should be completed only once before calling any other
     * method of the MindSDK class.
     *
     * @param {MindSDKOptions} options The configuration options for Mind Web SDK.
     *
     * @returns {Promise} The promise that resolves with no value when the initialization is completed.
     */
    static initialize(options) {
        if (!options) {
            console.warn("MindSDK: You should pass `options` argument into MindSDK.initialize(options) method");
            options = new MindSDKOptions();
        }
        MindSDK.options = new MindSDKOptions(options);
        if (!MindSDK.deviceRegistry) {
            MindSDK.deviceRegistry = new DeviceRegistry();
        }
        return MindSDK.deviceRegistry.update();
    }

    /**
     * Returns the {@link DeviceRegistry device registry} which provides access to all audio and video peripherals of
     * the user's computer.
     *
     * @return {DeviceRegistry} The device registry.
     */
    static getDeviceRegistry() {
        return MindSDK.deviceRegistry;
    }

    /**
     * @deprecated Use {@link DeviceRegistry#getMicrophones} instead.
     */
    static getMicrophones() {
        console.warn("MindSDK: MindSDK.getMicrophones() is deprecated and will be removed in the Mind Web SDK 6.0.0");
        return MindSDK.deviceRegistry.getMicrophones();
    }

    /**
     * @deprecated Use {@link DeviceRegistry#getCameras} instead.
     */
    static getCameras() {
        console.warn("MindSDK: MindSDK.getCameras() is deprecated and will be removed in the Mind Web SDK 6.0.0");
        return MindSDK.deviceRegistry.getCameras();
    }

    /**
     * @deprecated Use {@link DeviceRegistry#getScreen} instead.
     */
    static getScreen() {
        console.warn("MindSDK: MindSDK.getScreen() is deprecated and will be removed in the Mind Web SDK 6.0.0");
        return MindSDK.deviceRegistry.getScreen();
    }

    /**
     * Creates {@link MediaStream local media stream} with audio and video from the specified suppliers. The `null`
     * value can be passed instead of one of the suppliers to create audio-only or video-only media stream. Even if
     * audio/video supplier wasn't `null` it doesn't mean that the result media stream would automatically contain
     * audio/video, e.g. {@link Microphone} (as a supplier of audio) and {@link Camera} (as a supplier of video) supply
     * no audio and no video, respectively, till they are acquired, and after they were released.
     *
     * @param {MediaStreamAudioSupplier|null} audioSupplier The audio supplier or `null` to create video-only media
     *                                        stream.
     * @param {MediaStreamVideoSupplier|null} videoSupplier The video supplier or `null` to create audio-only media
     *                                        stream.
     *
     * @returns {MediaStream} The created media stream.
     */
    static createMediaStream(audioSupplier, videoSupplier) {
        if (!audioSupplier && !videoSupplier) {
            throw new Error("Can't create MediaStream of `" + audioSupplier + "` audio supplier and `" + videoSupplier + "` video supplier");
        }
        return new MediaStream("local", audioSupplier || null, videoSupplier || null);
    }

    /**
     * Establishes a participation session (aka joins the conference) on behalf of the participant with the specified
     * token. The establishment is an asynchronous operation, that's why this method returns a `Promise` that either
     * resolves with a {@link Session participation session} (if the operation succeeded) or rejects with an `Error`
     * (if the operation failed).
     *
     * @param {String} uri The URI of the conference.
     * @param {String} token The token of the participant on behalf of whom we are joining the conference.
     * @param {SessionOptions} options The configuration options for the participation session.
     *
     * @returns {Promise<Session>} The promise that either resolves with a participation session or rejects with an
     *                             `Error`.
     */
    static join(uri, token, options) {
        if (!uri || !uri.match(/^https?:\/\/[^/]+\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/)) {
            throw new Error("Conference URI is malformed");
        }
        return new Session(uri, token, null, options).open();
    }

    /**
     * @deprecated Use {@link MindSDK.join} instead.
     */
    static join2(uri, token, listener) {
        console.warn("MindSDK: MindSDK.join2(uri, token, listener) is deprecated and will be removed in the Mind Web SDK 6.0.0");
        if (!uri || !uri.match(/^https?:\/\/[^/]+\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/)) {
            throw new Error("Conference URI is malformed");
        }
        let options = new SessionOptions();
        options.setUseVp9ForSendingVideo(null);
        return new Session(uri, token, listener, options).open();
    }

    /**
     * Terminates an {@link MindSDK.join established participation session} (aka leaves the conference). The
     * termination is an idempotent synchronous operation. The session object itself and all other objects related to
     * the session are not functional after the leaving.
     *
     * @param {Session} session The participation session which should be terminated.
     */
    static exit2(session) {
        if (session) {
            session.close();
        }
    }

    /**
     * @package
     */
    static getOptions() {
        return MindSDK.options;
    }

}
