# `interface` MediaStreamVideoSupplier

Any video source of [MediaStream](MediaStream.md) is required to implement MediaStreamVideoSupplier interface. The
interface defines two methods: [addVideoConsumer](#addvideoconsumerconsumer) and
[removeVideoConsumer](#removevideoconsumerconsumer). [MediaStream](MediaStream.md) uses them to register and unregister
itself as a consumer of video from the supplier. The supplier should use `onVideoBuffer` method of
[MediaStream](MediaStream.md) class to supply its video to every registered media stream. The supplier is expected to
supply its video or `null` value (if the video isn't available yet) to every newly registering media stream, and the
`null` value to every unregistering media stream.

## addVideoConsumer(consumer)

Registers the specified [MediaStream](MediaStream.md) as a consumer of video from the supplier. It is expected that
during the registration the supplier will use `onVideoBuffer` method of [MediaStream](MediaStream.md) class to supply
its video or `null` value (if the video isn't available yet) to the registering media stream.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;consumer – The media stream which should be registered as a consumer of video from the supplier.

## removeVideoConsumer(consumer)

Unregisters the specified [MediaStream](MediaStream.md) as a consumer of video from the supplier. It is expected that
during the unregistration the supplier will use `onVideoBuffer` method of [MediaStream](MediaStream.md) class to supply
the `null` value to the unregistering media stream.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;consumer – The media stream which should be unregistered as a consumer of video from the
                                   supplier.
