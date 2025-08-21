import {MediaStream} from "./MediaStream";

/**
 * Any audio consumer of {@link MediaStream} is required to implement MediaStreamAudioConsumer interface. The interface
 * defines only one method: {@link MediaStreamAudioConsumer#onAudioBuffer onAudioBuffer}. {@link MediaStream} uses it
 * to supply a new audio to the consumer or cancel the previously supplied one. The consumer should use
 * {@link MediaStream#addAudioConsumer addAudioConsumer} and {@link MediaStream#removeAudioConsumer removeAudioConsumer}
 * methods of {@link MediaStream} class to register and unregister itself as a consumer of audio from the
 * {@link MediaStream}, respectively.
 *
 * @interface MediaStreamAudioConsumer
 */

/**
 * Supplies a new audio to the consumer or cancels the previously supplied one in which case `null` is passed as a
 * value for `audioBuffer` argument. It is guaranteed that during {@link MediaStream#removeAudioConsumer unregistration}
 * this method is always called with `null` as a value for `audioBuffer` argument regardless whether audio has been
 * supplied to the consumer or not.
 *
 * @method
 * @name MediaStreamAudioConsumer#onAudioBuffer
 * @param {MediaStreamAudioBuffer} audioBuffer The new audio buffer or `null` if the previously supplied audio buffer
 *                                             should be canceled.
 * @param {MediaStream} supplier The media stream which supplies or cancels the audio buffer.
 */