import {Screen} from "./Screen";

/**
 * ScreenListener {@link Screen#setListener can be used} for getting notifications of all events related to the
 * {@link Screen}. For example, if the screen has been acquired and the user clicked "Stop sharing" button in Chrome or
 * revoked permission to "Share the Screen" in Firefox, then
 * {@link ScreenListener#onScreenReleasedForcibly onScreenReleasedForcibly} method of the listener would be called.
 *
 * @interface
 */
export class ScreenListener {

    /**
     * This method is called when the acquired screen is released forcibly. For example, this would happen if the user
     * clicked "Stop sharing" button in Chrome or revoked permission to "Share the Screen" in Firefox.
     */
    onScreenReleasedForcibly() {}

}
