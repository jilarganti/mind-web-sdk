# `interface` MediaStreamVideoConsumer


Any video consumer of [MediaStream](MediaStream.md) is required to implement MediaStreamVideoConsumer interface. The
interface defines only one method: [onVideoBuffer](#onvideobuffervideobuffer-supplier). [MediaStream](MediaStream.md)
uses it to supply a new video to the consumer or cancel the previously supplied one. The consumer should use
`addVideoConsumer` and `removeVideoConsumer` methods of [MediaStream](MediaStream.md) class to register and unregister
itself as a consumer of video from the [MediaStream](MediaStream.md), respectively.

## onVideoBuffer(videoBuffer, supplier)

Supplies a new video to the consumer or cancels the previously supplied one in which case `null` is passed as a value
for `videoBuffer` argument. It is guaranteed that during unregistration this method is always called with `null` as a
value for `videoBuffer` argument regardless whether video has been supplied to the consumer or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;videoBuffer – The new video buffer or `null` if the previously supplied video buffer should be
                                      canceled.  
&nbsp;&nbsp;&nbsp;&nbsp;supplier – The media stream which supplies or cancels the video buffer.
