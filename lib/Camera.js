import {CameraFacing} from "./CameraFacing";
import {CameraListener} from "./CameraListener";
import {DeviceRegistry} from "./DeviceRegistry";
import {MediaStream} from "./MediaStream";
import {MediaStreamVideoBuffer} from "./MediaStreamVideoBuffer"

/**
 * Camera class is used for representing cameras plugged in to the computer (each instance represents a single camera).
 * The list of all available cameras can be got with {@link DeviceRegistry#getCameras getCameras} method of
 * {@link DeviceRegistry} class. Camera class implements {@link MediaStreamVideoSupplier} interface, so it can be
 * used as a source of video for local {@link MediaStream}.
 *
 * ```
 * let deviceRegistry = MindSDK.getDeviceRegistry();
 * let camera = deviceRegistry.getCameras()[0];
 * if (camera) {
 *     camera.setFacing(CameraFacing.USER);
 *     camera.setResolution(1280, 720);
 *     camera.setFps(25);
 *     camera.setBitrate(2500000);
 *     camera.setAdaptivity(3);
 *     let myStream = MindSDK.createMediaStream(null, camera);
 *     me.setMediaStream(myStream);
 *     camera.acquire().catch(function(error) {
 *         alert("Camera can't be acquired: " + error);
 *     });
 * } else {
 *     alert("Camera isn't plugged in");
 * }
 * ```
 *
 * @implements {MediaStreamVideoSupplier}
 */
export class Camera {

    /**
     * @package
     */
    constructor(deviceRegistry, id, label) {
        this.consumers = new Set();
        this.deviceRegistry = deviceRegistry;
        this.id = id;
        this.label = label;
        this.facing = CameraFacing.USER;
        this.width = 640;
        this.height = 360;
        this.fps = 30;
        this.bitrate = 1000000;
        this.adaptivity = 2;
        this.scale = 1.0;
        this.listener = null;
        this.acquiringPromise = null;
        this.videoTrack = null;
    }

    /**
     * Returns the ID of the camera. The ID is unique among all cameras and never changes.
     *
     * @returns {String} The ID of the camera.
     */
    getId() {
        return this.id;
    }

    /**
     * Returns the label of the camera.
     *
     * @returns {String} The label of the camera.
     */
    getLabel() {
        return this.label;
    }

    /**
     * Sets the facing of the camera. The facing of the camera is a direction which the camera can be pointed to. Most
     * cameras can be pointed to only one direction and, therefore, have only one facing. But front and back cameras on
     * smartphones (and other mobile devices) are usually combined into a single multi-facing camera which is
     * represented with a single instance of `Camera` class. The facing of any multi-facing camera can be changed at
     * any moment regardless whether the camera is acquired or not.
     *
     * @param facing {CameraFacing} The facing of the camera.
     */
    setFacing(facing) {
        if (facing !== CameraFacing.USER && facing !== CameraFacing.ENVIRONMENT) {
            throw new Error("Invalid facing value: " + facing);
        }
        if (this.facing !== facing) {
            let oldFacing = this.facing;
            this.facing = facing;
            if (this.videoTrack) {
                // FIXME: Unfortunately facing can't be changed on the fly with `applyConstraints` at least in Safari 16.1 for iOS and Chrome 107 for Android
                this.videoTrack.stop();
                this.videoTrack = null;
                this.acquiringPromise = null;
                this.acquire().catch(() => {
                    this.facing = oldFacing;
                    this.acquire();
                });
            }
        }
    }

    /**
     * Sets the resolution of the camera. The resolution of the camera is a resolution which the camera should capture
     * the video in. The video from the camera can be transmitted over the network in
     * {@link Camera#setAdaptivity multiple encodings (e.g. resolutions) simultaneously}. The resolution can be changed
     * at any moment regardless whether the camera is acquired or not.
     *
     * @param {Number} width The horizontal resolution of the camera.
     * @param {Number} height The vertical resolution of the camera.
     */
    setResolution(width, height) {
        if (width <= 0 || height <= 0) {
            throw new Error("Can't change resolution to `" + width + "x" + height + "`");
        }
        if (this.width !== width || this.height !== height) {
            this.width = width;
            this.height = height;
            if (this.videoTrack) {
                this.videoTrack.applyConstraints({ width: this.width, height: !navigator.mediaDevices.getSupportedConstraints().aspectRatio ? this.height : undefined, advanced: [{ aspectRatio: (this.width / this.height) }] });
            }
        }
    }

    /**
     * Sets the frame rate of the camera. The frame rate of the camera is a rate which the camera should capture the
     * video at. The frame rate can be changed at any moment regardless whether the camera is acquired or not.
     *
     * @param {Number} fps The frame rate of the camera.
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
     * Sets the bitrate of the camera. The bitrate of the camera is a number of bits which each second of video from
     * the camera should not exceed while being transmitting over the network. The bitrate is shared among all
     * {@link Camera#setAdaptivity encodings} proportionally and can be changed at any moment regardless whether the
     * camera is acquired or not.
     *
     * @param {Number} bitrate The bitrate of the camera.
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
     * Sets the adaptivity of the camera. The adaptivity of the camera is an integer (in range between 1 and 3,
     * inclusively) which defines a number of encodings in which the video from the camera should be transmitted over
     * the network. The encodings differ in resolution: the resolution of the first encoding equals the
     * {@link Camera#setResolution resolution of the camera}, the resolution of the second encoding is half (in each
     * dimension) of the resolution of the first one, the resolution of the third encoding is half (in each dimension)
     * of the resolution of the second one. For example, if the resolution of the camera is 1280x720 and adaptivity is
     * 3, the video from the camera would be transmitted over the network in 3 encoding: 1280x720, 640x360 and 320x180.
     * The adaptivity can be changed at any moment regardless whether the camera is acquired or not.
     *
     * @param {Number} adaptivity The adaptivity of the camera.
     */
    setAdaptivity(adaptivity) {
        if (adaptivity !== 1 && adaptivity !== 2 && adaptivity !== 3) {
            throw new Error("Can't change adaptivity to `" + adaptivity + "`");
        }
        if (this.adaptivity !== adaptivity) {
            this.adaptivity = adaptivity;
            if (this.videoTrack) {
                this.fireVideoBuffer();
            }
        }
    }

    /**
     * Sets the listener which should be notified of all events related to the camera. The listener can be changed at
     * any moment regardless whether the camera is acquired or not.
     *
     * @param {CameraListener} listener The listener which should be notified of all events related to the camera.
     */
    setListener(listener) {
        this.listener = listener;
    }

    /**
     * Starts camera capturing. This is an asynchronous operation which assumes acquiring the underlying camera device
     * and distributing camera's video among all {@link MediaStream consumers}. This method returns a `Promise` that
     * resolves with no value (if the camera capturing starts successfully) or rejects with an `Error` (if there is no
     * permission to access the camera or if the camera was unplugged). If the camera capturing has been already
     * started, this method returns already resolved `Promise`.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    acquire() {
        if (this.acquiringPromise == null) {
            this.acquiringPromise = new Promise((resolve, reject) => {
                let constraints = {
                    video: {
                        facingMode: this.facing,
                        resizeMode: "crop-and-scale",
                        width: this.width,
                        height: !navigator.mediaDevices.getSupportedConstraints().aspectRatio ? this.height : undefined,
                        frameRate: this.fps,
                        advanced: [{ aspectRatio: (this.width / this.height) }],
                    },
                    audio: false
                };
                if (this.id !== "default") {
                    constraints.video.deviceId = {
                        exact: this.id
                    }
                }
                navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                    HTMLAudioElement.mindEnsureMutedState();
                    HTMLVideoElement.mindEnsureMutedState();
                    if (this.deviceRegistry.getCameras().length === 1) {
                        this.deviceRegistry.update();
                    }
                    this.videoTrack = stream.getVideoTracks()[0];
                    this.videoTrack.onended = () => {
                        this.release();
                        if (this.listener != null) {
                            this.listener.onCameraReleasedForcibly(this);
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
     * Stops camera capturing. This is a synchronous operation which assumes revoking the previously distributed
     * camera's video and releasing the underlying camera device. The stopping is idempotent: the method does nothing
     * if the camera is not acquired, but it would fail if it was called in the middle of acquisition.
     */
    release() {
        if (this.acquiringPromise != null && this.videoTrack == null) {
            throw new Error("Can't release camera in the middle of acquisition");
        }
        if (this.videoTrack != null) {
            for (let consumer of this.consumers) {
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
    addVideoConsumer(consumer) {
        this.consumers.add(consumer);
        if (this.videoTrack != null) {
            consumer.onVideoBuffer(new MediaStreamVideoBuffer(this.videoTrack, false, this.width, this.height, this.bitrate, this.adaptivity, this.scale));
        } else {
            consumer.onVideoBuffer(null);
        }
    }

    /**
     * @package
     */
    removeVideoConsumer(consumer) {
        if (this.consumers.delete(consumer)) {
            consumer.onVideoBuffer(null);
        }
    }

    /**
     * @package
     */
    destroy() {
        if (this.videoTrack != null) {
            this.videoTrack.onended();
        }
    }

    /**
     * @private
     */
    fireVideoBuffer() {
        for (let consumer of this.consumers) {
            consumer.onVideoBuffer(new MediaStreamVideoBuffer(this.videoTrack, false, this.width, this.height, this.bitrate, this.adaptivity, this.scale));
        }
    }

}
