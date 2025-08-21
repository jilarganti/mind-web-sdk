import {Camera} from "./Camera";

/**
 * CameraListener {@link Camera#setListener can be used} for getting notifications of all events related to the
 * {@link Camera}. For example, if the camera has been acquired and the user unplugged it or revoked permission to "Use
 * the Camera" in Firefox, then {@link CameraListener#onCameraReleasedForcibly onCameraReleasedForcibly} method of the
 * listener would be called.
 *
 * @interface
 */
export class CameraListener {

    /**
     * This method is called when the acquired camera is released forcibly. For example, this would happen if the user
     * unplugged the camera or revoked permission to "Use the Camera" in Firefox.
     *
     * @param {Camera} camera The camera which was released forcibly.
     */
    onCameraReleasedForcibly(camera) {}

}