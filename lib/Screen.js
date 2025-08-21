import {MediaStream} from "./MediaStream";
import {MediaStreamAudioBuffer} from "./MediaStreamAudioBuffer";
import {MediaStreamVideoBuffer} from "./MediaStreamVideoBuffer";
import {ScreenListener} from "./ScreenListener";

/**
 * Screen class is used for representing the display of the computer. It can be used to capture the contents of the
 * entire screen or a portion thereof (such as a window of an application or a tab of the browser). It also can be
 * {@link Screen#setAudioCapturing configured to capture audio} along with the video content. Screen class implements
 * {@link MediaStreamAudioSupplier} and {@link MediaStreamVideoSupplier} interfaces, so it can be used as a source of
 * audio or/and video for the local {@link MediaStream}.
 *
 * ```
 * let deviceRegistry = MindSDK.getDeviceRegistry();
 * let screen = deviceRegistry.getScreen();
 * if (screen) {
 *     screen.setAudioCapturing(true);
 *     screen.setFps(5);
 *     screen.setBitrate(500000);
 *     let mySecondaryStream = MindSDK.createMediaStream(screen, screen);
 *     me.setSecondaryMediaStream(mySecondaryStream);
 *     screen.acquire().catch(function(error) {
 *         alert("Screen can't be acquired: " + error);
 *     });
 * } else {
 *     alert("Screen capturing isn't supported");
 * }
 * ```
 *
 * @implements {MediaStreamAudioSupplier}
 * @implements {MediaStreamVideoSupplier}
 */
export class Screen {

    /**
     * @package
     */
    constructor() {
        this.audioConsumers = new Set();
        this.videoConsumers = new Set();
        this.audioCapturing = false;
        this.fps = 30;
        this.bitrate = 1000000;
        this.adaptivity = 1;
        this.scale = 1.0;
        this.listener = null;
        this.acquiringPromise = null;
        this.audioTrack = null;
        this.videoTrack = null;
    }

    /**
     * Sets the audio capturing state of the screen. The audio capturing state of screen determines whether the screen
     * should capture audio along with the video content or not. The source of the audio depends on capabilities of the
     * browser and video source (selected by the user), it can be a tab of the browser, a window of an application or
     * the entire computer's audio system. The audio capturing state can be changed only if the screen is not acquired.
     *
     * @param {Boolean} audioCapturing The audio capturing state of the screen
     */
    setAudioCapturing(audioCapturing) {
        if (this.audioTrack != null || this.videoTrack != null) {
            throw new Error("Can't enable/disable audio on the fly");
        }
        if (this.audioCapturing !== audioCapturing) {
            this.audioCapturing = audioCapturing;
        }
    }

    /**
     * Sets the frame rate of the screen. The frame rate of the screen is a rate which the screen should capture the
     * video at. The frame rate can be changed at any moment regardless whether the screen is acquired or not.
     *
     * @param {Number} fps The frame rate of the screen.
     */
    setFps(fps) {
        if (fps <= 0) {
            throw new Error("Can't change FPS to `" + fps + "`");
        }
        if (this.fps !== fps) {
            this.fps = fps;
            if (this.videoTrack) {
                this.videoTrack.applyConstraints({ frameRate: this.fps });
            }
        }
    }

    /**
     * Sets the bitrate of the screen. The bitrate of the screen is a number of bits which each second of video from
     * the screen should not exceed while being transmitting over the network. The bitrate can be changed at any moment
     * regardless whether the screen is acquired or not.
     *
     * @param {Number} bitrate The bitrate of the screen.
     */
    setBitrate(bitrate) {
        if (bitrate <= 100000) {
            throw new Error("Can't change bitrate to `" + bitrate + "`");
        }
        if (this.bitrate !== bitrate) {
            this.bitrate = bitrate;
            if (this.videoTrack) {
                this.fireVideoBuffer();
            }
        }
    }

    /**
     * Sets the listener which should be notified of all events related to the screen. The listener can be changed at
     * any moment regardless whether the screen is acquired or not.
     *
     * @param {ScreenListener} listener The listener which should be notified of all events related to the screen.
     */
    setListener(listener) {
        this.listener = listener;
    }

    /**
     * Starts screen capturing. This is an asynchronous operation which assumes prompting the user to select and grant
     * permission to capture the contents of a screen or portion thereof (such as a window) and distributing screen's
     * video among all {@link MediaStream consumers}. This method returns a `Promise` that resolves with no value (if
     * the screen capturing starts successfully) or rejects with an `Error` (if the user didn't grant permission to
     * access the screen or canceled the operation). If screen capturing has been already started, this method returns
     * already resolved `Promise`.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    acquire() {
        if (this.acquiringPromise == null) {
            this.acquiringPromise = new Promise((resolve, reject) => {
                navigator.mediaDevices.getDisplayMedia({ audio: this.audioCapturing, video: { frameRate: this.fps, width: { max: screen.width }, height: { max: screen.height } } }).then((stream) => {
                    HTMLAudioElement.mindEnsureMutedState();
                    HTMLVideoElement.mindEnsureMutedState();
                    this.audioTrack = stream.getAudioTracks()[0] || null;
                    if (this.audioTrack != null) {
                        this.audioTrack.onended = () => {
                            this.release();
                            if (this.listener != null) {
                                this.listener.onScreenReleasedForcibly();
                            }
                        };
                        this.fireAudioBuffer();
                    }
                    this.videoTrack = stream.getVideoTracks()[0];
                    this.videoTrack.contentHint = "text";
                    this.videoTrack.onended = () => {
                        this.release();
                        if (this.listener != null) {
                            this.listener.onScreenReleasedForcibly();
                        }
                    };
                    this.fireVideoBuffer();
                    resolve();
                }).catch((error) => {
                    this.acquiringPromise = null;
                    reject(error);
                });
            });
        }
        return this.acquiringPromise;
    }

    /**
     * Stops screen capturing. This is a synchronous operation which assumes revoking previously distributed screen's
     * video. The stopping is idempotent: the method does nothing if the screen is not acquired, but it would fail if
     * it was called in the middle of acquisition.
     */
    release() {
        if (this.acquiringPromise != null && this.videoTrack == null) {
            throw new Error("Can't release screen in the middle of acquisition");
        }
        if (this.audioTrack != null) {
            for (let consumer of this.audioConsumers) {
                consumer.onAudioBuffer(null);
            }
            this.audioTrack.stop();
            this.audioTrack = null;
        }
        if (this.videoTrack != null) {
            for (let consumer of this.videoConsumers) {
                consumer.onVideoBuffer(null);
            }
            this.videoTrack.stop();
            this.videoTrack = null;
        }
        this.acquiringPromise = null;
    }

    /**
     * @package
     */
    addAudioConsumer(consumer) {
        this.audioConsumers.add(consumer);
        if (this.audioTrack != null) {
            consumer.onAudioBuffer(new MediaStreamAudioBuffer(this.audioTrack, false));
        } else {
            consumer.onAudioBuffer(null);
        }
    }

    /**
     * @package
     */
    removeAudioConsumer(consumer) {
        if (this.audioConsumers.delete(consumer)) {
            consumer.onAudioBuffer(null);
        }
    }

    /**
     * @package
     */
    addVideoConsumer(consumer) {
        this.videoConsumers.add(consumer);
        if (this.videoTrack != null) {
            consumer.onVideoBuffer(new MediaStreamVideoBuffer(this.videoTrack, false, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, this.bitrate, this.adaptivity, this.scale));
        } else {
            consumer.onVideoBuffer(null);
        }
    }

    /**
     * @package
     */
    removeVideoConsumer(consumer) {
        if (this.videoConsumers.delete(consumer)) {
            consumer.onVideoBuffer(null);
        }
    }

    /**
     * @private
     */
    fireAudioBuffer() {
        for (let consumer of this.audioConsumers) {
            consumer.onAudioBuffer(new MediaStreamAudioBuffer(this.audioTrack));
        }
    }

    /**
     * @private
     */
    fireVideoBuffer() {
        for (let consumer of this.videoConsumers) {
            consumer.onVideoBuffer(new MediaStreamVideoBuffer(this.videoTrack, false, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, this.bitrate, this.adaptivity, this.scale));
        }
    }

}
