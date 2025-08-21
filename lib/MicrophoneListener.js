import {Microphone} from "./Microphone";

/**
 * MicrophoneListener {@link Microphone#setListener can be used} for getting notifications of all events related to the
 * {@link Microphone}. For example, if the microphone has been acquired and the user unplugged it or revoked permission
 * to "Use the Microphone" in Firefox, then
 * {@link MicrophoneListener#onMicrophoneReleasedForcibly onMicrophoneReleasedForcibly} method of the listener would be
 * called.
 *
 * @interface
 */
export class MicrophoneListener {

    /**
     * This method is called when the acquired microphone is released forcibly. For example, this would happen if the
     * user unplugged the microphone or revoked permission to "Use the Microphone" in Firefox.
     *
     * @param {Microphone} microphone The microphone which was released forcibly.
     */
    onMicrophoneReleasedForcibly(microphone) {}

}