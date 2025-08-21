import {DeviceRegistry} from "./DeviceRegistry";
import {MicrophoneListener} from "./MicrophoneListener";
import {MediaStream} from "./MediaStream";
import {MediaStreamAudioBuffer} from "./MediaStreamAudioBuffer";

/**
 * Microphone class is used for representing microphones plugged in to the computer (each instance represents a single
 * microphone). The list of all available microphones can be got with
 * {@link DeviceRegistry#getMicrophones getMicrophones} method of {@link DeviceRegistry} class. Microphone
 * class implements {@link MediaStreamAudioSupplier} interface, so it can be used as a source of audio for local
 * {@link MediaStream}.
 *
 * ```
 * let deviceRegistry = MindSDK.getDeviceRegistry();
 * let microphone = deviceRegistry.getMicrophones()[0];
 * if (microphone) {
 *     microphone.setNoiseSuppression(true);
 *     let myStream = MindSDK.createMediaStream(microphone, null);
 *     me.setMediaStream(myStream);
 *     microphone.acquire().catch(function(error) {
 *         alert("Microphone can't be acquired: " + error);
 *     });
 * } else {
 *     alert("Microphone isn't plugged in");
 * }
 * ```
 *
 * @implements {MediaStreamAudioSupplier}
 */
export class Microphone {

    static noiseSuppressionWorkletUrl = new URL("NoiseSuppressionWorklet.js", import.meta.url);

    /**
     * @package
     */
    constructor(deviceRegistry, id, label) {
        this.consumers = new Set();
        this.deviceRegistry = deviceRegistry;
        this.id = id;
        this.label = label;
        this.noiseSuppression = false;
        this.muted = false;
        this.listener = null;
        this.acquiringPromise = null;
        this.audioTrack = null;
        this.audioContext = null;
        this.mediaStreamSource = null;
        this.noiseSuppressionNode = null;
        this.mediaStreamDestination = null;
    }

    /**
     * Returns the ID of the microphone. The ID is unique among all microphones and never changes.
     *
     * @returns {String} The ID of the microphone.
     */
    getId() {
        return this.id;
    }

    /**
     * Returns the label of the microphone.
     *
     * @returns {String} The label of the microphone.
     */
    getLabel() {
        return this.label;
    }

    /**
     * Sets the noise suppression state of the microphone. The noise suppression state of the microphone determines
     * whether the microphone should use a neural network to suppress different kinds of background noise or not. The
     * noise suppression state can be changed only if the microphone is not acquired.
     *
     * @param {Boolean} noiseSuppression The noise suppression state of the microphone.
     */
    setNoiseSuppression(noiseSuppression) {
        if (this.noiseSuppression !== noiseSuppression) {
            this.noiseSuppression = noiseSuppression;
        }
    }

    /**
     * Sets the muted state of the microphone. The muted state of the microphone determines whether the microphone
     * produces an actual audio (if it is unmuted) or silence (if it is muted). The muted state can be changed at any
     * moment regardless whether the microphone is acquired or not.
     *
     * @param {Boolean} muted The muted state of the microphone.
     */
    setMuted(muted) {
        if (this.muted !== muted) {
            this.muted = muted;
            if (this.audioTrack != null) {
                this.audioTrack.enabled = !muted;
                if (this.mediaStreamDestination != null) {
                    this.mediaStreamDestination.stream.getAudioTracks()[0].enabled = !muted;
                }
            }
        }
    }

    /**
     * Sets the listener which should be notified of all events related to the microphone. The listener can be changed
     * at any moment regardless whether the microphone is acquired or not.
     *
     * @param {MicrophoneListener} listener The listener which should be notified of all events related to the
     *                                      microphone.
     */
    setListener(listener) {
        this.listener = listener;
    }

    /**
     * Starts microphone recording. This is an asynchronous operation which assumes acquiring the underlying microphone
     * device and distributing microphone's audio among all {@link MediaStream consumers}. This method returns a
     * `Promise` that resolves with no value (if the microphone recording starts successfully) or rejects with an
     * `Error` (if there is no permission to access the microphone or if the microphone was unplugged). If the
     * microphone recording has been already started, this method returns already resolved `Promise`.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    acquire() {
        if (this.acquiringPromise == null) {
            this.acquiringPromise = new Promise((resolve, reject) => {
                let constraints = {
                    audio: {
                        autoGainControl: true,
                        echoCancellation: true,
                        noiseSuppression: true,
                    },
                    video: false
                };
                if (this.id !== "default" || window.chrome) {
                    constraints.audio.deviceId = {
                        exact: this.id
                    }
                }
                navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                    HTMLAudioElement.mindEnsureMutedState();
                    HTMLVideoElement.mindEnsureMutedState();
                    if (this.deviceRegistry.getMicrophones().length === 1) {
                        this.deviceRegistry.update();
                    }
                    this.audioTrack = stream.getAudioTracks()[0];
                    this.audioTrack.onended = () => {
                        this.release();
                        if (this.listener != null) {
                            this.listener.onMicrophoneReleasedForcibly(this);
                        }
                    };
                    if (this.noiseSuppression) {
                        this.audioContext = new AudioContext();
                        return this.audioContext.audioWorklet.addModule(Microphone.noiseSuppressionWorkletUrl).then(() => {
                            this.noiseSuppressionNode = new AudioWorkletNode(this.audioContext, "noise-suppression-worklet");
                            this.mediaStreamSource = this.audioContext.createMediaStreamSource(new window.MediaStream([this.audioTrack]));
                            this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();
                            this.mediaStreamSource.connect(this.noiseSuppressionNode).connect(this.mediaStreamDestination);
                            this.mediaStreamDestination.stream.getAudioTracks()[0].enabled = !this.muted;
                        }).catch((error) => {
                            console.warn("MindSDK: Noise suppression can't be enabled:", error);
                            this.audioContext.close();
                            this.audioContext = null;
                        });
                    }
                }).then(() => {
                    this.fireAudioBuffer();
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
     * Stops microphone recording. This is a synchronous operation which assumes revoking the previously distributed
     * microphone's audio and releasing the underlying microphone device. The stopping is idempotent: the method does
     * nothing if the microphone is not acquired, but it would fail if it was called in the middle of acquisition.
     */
    release() {
        if (this.acquiringPromise != null && this.audioTrack == null) {
            throw new Error("Can't release microphone in the middle of acquisition");
        }
        if (this.mediaStreamDestination != null) {
            this.mediaStreamDestination.disconnect();
            this.mediaStreamDestination = null;
        }
        if (this.noiseSuppressionNode != null) {
            this.noiseSuppressionNode.disconnect();
            this.noiseSuppressionNode = null;
        }
        if (this.mediaStreamSource != null) {
            this.mediaStreamSource.disconnect();
            this.mediaStreamSource = null;
        }
        if (this.audioContext != null) {
            this.audioContext.close();
            this.audioContext = null;
        }
        if (this.audioTrack != null) {
            for (let consumer of this.consumers) {
                consumer.onAudioBuffer(null);
            }
            this.audioTrack.stop();
            this.audioTrack = null;
        }
        this.acquiringPromise = null;
    }

    /**
     * @package
     */
    addAudioConsumer(consumer) {
        this.consumers.add(consumer);
        if (this.audioTrack != null) {
            consumer.onAudioBuffer(new MediaStreamAudioBuffer(this.mediaStreamDestination != null ? this.mediaStreamDestination.stream.getAudioTracks()[0] : this.audioTrack, false));
        } else {
            consumer.onAudioBuffer(null);
        }
    }

    /**
     * @package
     */
    removeAudioConsumer(consumer) {
        if (this.consumers.delete(consumer)) {
            consumer.onAudioBuffer(null);
        }
    }

    /**
     * @package
     */
    destroy() {
        if (this.audioTrack != null) {
            this.audioTrack.onended();
        }
    }

    /**
     * @private
     */
    fireAudioBuffer() {
        for (let consumer of this.consumers) {
            consumer.onAudioBuffer(new MediaStreamAudioBuffer(this.mediaStreamDestination != null ? this.mediaStreamDestination.stream.getAudioTracks()[0] : this.audioTrack, false));
        }
    }

}
