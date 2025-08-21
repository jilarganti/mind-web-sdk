# `interface` MediaStreamAudioSupplier

Any audio source of [MediaStream](MediaStream.md) is required to implement MediaStreamAudioSupplier interface. The
interface defines two methods: [addAudioConsumer](#addaudioconsumerconsumer) and
[removeAudioConsumer](#removeaudioconsumerconsumer). [MediaStream](MediaStream.md) uses them to register and unregister
itself as a consumer of audio from the supplier. The supplier should use `onAudioBuffer` method of
[MediaStream](MediaStream.md) class to supply its audio to every registered media stream. The supplier is expected to
supply its audio or `null` value (if the audio isn't available yet) to every newly registering media stream, and the
`null` value to every unregistering media stream.

## addAudioConsumer(consumer)

Registers the specified [MediaStream](MediaStream.md) as a consumer of audio from the supplier. It is expected that
during the registration the supplier will use `onAudioBuffer` method of [MediaStream](MediaStream.md) class to supply
its audio or `null` value (if the audio isn't available yet) to the registering media stream.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;consumer – The media stream which should be registered as a consumer of audio from the supplier.

## removeAudioConsumer(consumer)

Unregisters the specified [MediaStream](MediaStream.md) as a consumer of audio from the supplier. It is expected that
during the unregistration the supplier will use `onAudioBuffer` method of [MediaStream](MediaStream.md) class to supply
the `null` value to the unregistering media stream.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;consumer – The media stream which should be unregistered as a consumer of audio from the
                                   supplier.
