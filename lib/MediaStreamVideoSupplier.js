import {MediaStream} from "./MediaStream";

/**
 * Any video source of {@link MediaStream} is required to implement MediaStreamVideoSupplier interface. The interface
 * defines two methods: {@link MediaStreamVideoSupplier#addVideoConsumer addVideoConsumer} and
 * {@link MediaStreamVideoSupplier#removeVideoConsumer removeVideoConsumer}. {@link MediaStream} uses them to register
 * and unregister itself as a consumer of video from the supplier. The supplier should use
 * {@link MediaStream#onVideoBuffer onVideoBuffer} method of {@link MediaStream} class to supply its video to every
 * registered media stream. The supplier is expected to supply its video or `null` value (if the video isn't available
 * yet) to every newly registering media stream, and the `null` value to every unregistering media stream.
 *
 * @interface MediaStreamVideoSupplier
 */

/**
 * Registers the specified {@link MediaStream} as a consumer of video from the supplier. It is expected that during the
 * registration the supplier will use {@link MediaStream#onVideoBuffer onVideoBuffer} method of {@link MediaStream}
 * class to supply its video or `null` value (if the video isn't available yet) to the registering media stream.
 *
 * @method
 * @name MediaStreamVideoSupplier#addVideoConsumer
 * @param {MediaStream} consumer The media stream which should be registered as a consumer of video from the supplier.
 */

/**
 * Unregisters the specified {@link MediaStream} as a consumer of video from the supplier. It is expected that during
 * the unregistration the supplier will use {@link MediaStream#onVideoBuffer onVideoBuffer} method of
 * {@link MediaStream} class to supply the `null` value to the unregistering media stream.
 *
 * @method
 * @name MediaStreamVideoSupplier#removeVideoConsumer
 * @param {MediaStream} consumer The media stream which should be unregistered as a consumer of video from the supplier.
 */