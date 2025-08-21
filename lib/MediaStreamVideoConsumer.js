import {MediaStream} from "./MediaStream";

/**
 * Any video consumer of {@link MediaStream} is required to implement MediaStreamVideoConsumer interface. The interface
 * defines only one method: {@link MediaStreamVideoConsumer#onVideoBuffer onVideoBuffer}. {@link MediaStream} uses it
 * to supply a new video to the consumer or cancel the previously supplied one. The consumer should use
 * {@link MediaStream#addVideoConsumer addVideoConsumer} and {@link MediaStream#removeVideoConsumer removeVideoConsumer}
 * methods of {@link MediaStream} class to register and unregister itself as a consumer of video from the
 * {@link MediaStream}, respectively.
 *
 * @interface MediaStreamVideoConsumer
 */

/**
 * Supplies a new video to the consumer or cancels the previously supplied one in which case `null` is passed as a
 * value for `videoBuffer` argument. It is guaranteed that during {@link MediaStream#removeVideoConsumer unregistration}
 * this method is always called with `null` as a value for `videoBuffer` argument regardless whether video has been
 * supplied to the consumer or not.
 *
 * @method
 * @name MediaStreamVideoConsumer#onVideoBuffer
 * @param {MediaStreamVideoBuffer} videoBuffer The new video buffer or `null` if the previously supplied video buffer
 *                                             should be canceled.
 * @param {MediaStream} supplier The media stream which supplies or cancels the audio buffer.
 */