import {MediaStream} from "./MediaStream";

/**
 * Any audio source of {@link MediaStream} is required to implement MediaStreamAudioSupplier interface. The interface
 * defines two methods: {@link MediaStreamAudioSupplier#addAudioConsumer addAudioConsumer} and
 * {@link MediaStreamAudioSupplier#removeAudioConsumer removeAudioConsumer}. {@link MediaStream} uses them to register
 * and unregister itself as a consumer of audio from the supplier. The supplier should use
 * {@link MediaStream#onAudioBuffer onAudioBuffer} method of {@link MediaStream} class to supply its audio to every
 * registered media stream. The supplier is expected to supply its audio or `null` value (if the audio isn't available
 * yet) to every newly registering media stream, and the `null` value to every unregistering media stream.
 *
 * @interface MediaStreamAudioSupplier
 */

/**
 * Registers the specified {@link MediaStream} as a consumer of audio from the supplier. It is expected that during the
 * registration the supplier will use {@link MediaStream#onAudioBuffer onAudioBuffer} method of {@link MediaStream}
 * class to supply its audio or `null` value (if the audio isn't available yet) to the registering media stream.
 *
 * @method
 * @name MediaStreamAudioSupplier#addAudioConsumer
 * @param {MediaStream} consumer The media stream which should be registered as a consumer of audio from the supplier.
 */

/**
 * Unregisters the specified {@link MediaStream} as a consumer of audio from the supplier. It is expected that during
 * the unregistration the supplier will use {@link MediaStream#onAudioBuffer onAudioBuffer} method of
 * {@link MediaStream} class to supply the `null` value to the unregistering media stream.
 *
 * @method
 * @name MediaStreamAudioSupplier#removeAudioConsumer
 * @param {MediaStream} consumer The media stream which should be unregistered as a consumer of audio from the supplier.
 */