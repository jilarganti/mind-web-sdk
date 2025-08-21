# `interface` MediaStreamAudioConsumer


Any audio consumer of [MediaStream](MediaStream.md) is required to implement MediaStreamAudioConsumer interface. The
interface defines only one method: [onAudioBuffer](#onaudiobufferaudiobuffer-supplier). [MediaStream](MediaStream.md)
uses it to supply a new audio to the consumer or cancel the previously supplied one. The consumer should use
`addAudioConsumer` and `removeAudioConsumer` methods of [MediaStream](MediaStream.md) class to register and unregister
itself as a consumer of audio from the [MediaStream](MediaStream.md), respectively.

## onAudioBuffer(audioBuffer, supplier)

Supplies a new audio to the consumer or cancels the previously supplied one in which case `null` is passed as a value
for `audioBuffer` argument. It is guaranteed that during unregistration this method is always called with `null` as a
value for `audioBuffer` argument regardless whether audio has been supplied to the consumer or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;audioBuffer – The new audio buffer or `null` if the previously supplied audio buffer should be
                                      canceled.  
&nbsp;&nbsp;&nbsp;&nbsp;supplier – The media stream which supplies or cancels the audio buffer.
