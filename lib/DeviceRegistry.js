import {Camera} from "./Camera";
import {DeviceRegistryListener} from "./DeviceRegistryListener";
import {Microphone} from "./Microphone";
import {Screen} from "./Screen";

/**
 * DeviceRegistry class provides access to all audio and video peripherals of the user's computer. It contains methods
 * for getting the {@link DeviceRegistry#getCameras list of cameras}, the
 * {@link DeviceRegistry#getMicrophones list of microphones}, and the {@link DeviceRegistry#getScreen screen} object
 * (for screen sharing). It also allows {@link DeviceRegistry#setListener registering a listener} that will be notified
 * of all events related to the device registry (e.g. of events related to plugging in and unplugging cameras and
 * microphones).
 */
export class DeviceRegistry {

    /**
     * @package
     */
    constructor() {
        this.cameras = [];
        this.microphones = [];
        this.screen = typeof navigator.mediaDevices.getDisplayMedia === "function" ? new Screen() : null;
        this.listener = null;
        navigator.mediaDevices.addEventListener("devicechange", () => { this.update(); });
    }

    /**
     * Returns the list of cameras which are currently plugged in to the computer. If no cameras are plugged in to the
     * computer, the list will empty. If at least one camera is plugged in to the computer, the contents of the list
     * will depend on whether there is permission to access cameras or not: if the permission has been granted, the
     * list will contain a default camera and all other cameras, otherwise the list will contain the default camera
     * only. The initial list of cameras is discovered during {@link MindSDK.initialize initialization of the SDK}, but
     * since any camera might be plugged in and unplugged at any moment, DeviceRegistry watches for changes and updates
     * the list accordingly.
     *
     * @returns {Camera[]} The list of cameras which are currently plugged in to the computer.
     */
    getCameras() {
        return this.cameras;
    }

    /**
     * Returns the list of microphones which are currently plugged in to the computer. If no microphones are plugged in
     * to the computer, the list will empty. If at least one microphone is plugged in to the computer, the contents of
     * the list will depend on whether there is permission to access microphones or not: if the permission has been
     * granted, the list will contain a default microphone and all other microphones, otherwise the list will contain
     * the default microphone only. The initial list of microphones is discovered during
     * {@link MindSDK.initialize initialization of the SDK}, but since any microphone might be plugged in and unplugged
     * at any moment, DeviceRegistry watches for changes and updates the list accordingly.
     *
     * @returns {Microphone[]} The list of microphones which are currently plugged in to the computer.
     */
    getMicrophones() {
        return this.microphones;
    }

    /**
     * Returns the screen that can be used for capturing the contents of the entire screen or portion thereof (such
     * as a window of an application or a tab of the browser) or `null` value if the browser does not support screen
     * capturing.
     *
     * @returns {Screen|null} The screen or `null` value if the browser doesn't support screen capturing.
     */
    getScreen() {
        return this.screen;
    }

    /**
     * Sets the listener which should be notified of all events related to the device registry. The `null` value can be
     * used to remove the previously set listener.
     *
     * @param {DeviceRegistryListener} listener The device registry listener or `null` value if the previously set
     *                                          listener should be removed.
     */
    setListener(listener) {
        this.listener = listener;
    }

    /**
     * @package
     */
    update() {
        return navigator.mediaDevices.enumerateDevices().then((devices) => {
            let notifyListener = false;
            let releaseDefaultMicrophoneForcibly = false;
            let releaseDefaultCameraForcibly = false;
            // Remove disconnected microphones
            for (let i = this.microphones.length - 1; i >= 0; i--) {
                let microphone = this.microphones[i];
                if (!devices.find((device) => device.kind === "audioinput" && (i === 0 || device.deviceId === microphone.getId()))) {
                    this.microphones.splice(i, 1)[0].destroy(); // We have to have and call `destroy` method because Safari (version 16.2 at least) doesn't call `onended` callback on `MediaStreamTrack` when microphone is unplugged
                    notifyListener = true;
                }
            }
            // Remove disconnected cameras
            for (let i = this.cameras.length - 1; i >= 0; i--) {
                let camera = this.cameras[i];
                if (!devices.find((device) => device.kind === "videoinput" && (i === 0 || device.deviceId === camera.getId()))) {
                    this.cameras.splice(i, 1)[0].destroy(); // We have to have and call `destroy` method because Safari (version 16.2 at least) doesn't call `onended` callback on `MediaStreamTrack` when camera is unplugged
                    notifyListener = true;
                }
            }
            // Add newly connected microphones and cameras
            devices.forEach((device) => {
                switch (device.kind) {
                    case "audioinput":
                        if (this.microphones.length === 0) {
                            this.microphones.push(new Microphone(this, "default", "Default Microphone"));
                        }
                        if (device.label !== "" && device.label !== "default") {
                            let microphone = this.microphones.find((microphone) => microphone.getId() === device.deviceId);
                            if (!microphone) {
                                this.microphones.push(new Microphone(this, device.deviceId, device.label));
                                releaseDefaultMicrophoneForcibly = true;
                                notifyListener = true;
                            }
                        }
                        break;
                    case "videoinput":
                        if (this.cameras.length === 0) {
                            if (devices.find((device) => device.kind === "videoinput")) {
                                this.cameras.push(new Camera(this, "default", "Default Camera"));
                            }
                        }
                        if (device.label !== "" && device.label !== "default") {
                            let camera = this.cameras.find((camera) => camera.getId() === device.deviceId);
                            if (!camera) {
                                this.cameras.push(new Camera(this, device.deviceId, device.label));
                                releaseDefaultCameraForcibly = true;
                                notifyListener = true;
                            }
                        }
                        break;
                }
            });
            if (releaseDefaultMicrophoneForcibly) {
                let defaultMicrophone = this.microphones[0];
                defaultMicrophone.destroy();
            }
            if (releaseDefaultCameraForcibly) {
                let defaultCamera = this.cameras[0];
                defaultCamera.destroy();
            }
            if (this.listener != null && notifyListener) {
                this.listener.onDeviceRegistryChanged();
            }
        });
    }

}
