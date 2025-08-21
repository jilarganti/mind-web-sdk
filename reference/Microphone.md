# `class` Microphone

Microphone class is used for representing microphones plugged in to the computer (each instance represents a single
microphone). The list of all available microphones can be got with [getMicrophones](DeviceRegistry#getmicrophones)
method of [DeviceRegistry](DeviceRegistry) class. Microphone class implements
[MediaStreamAudioSupplier](MediaStreamAudioSupplier.md) interface, so it can be used as a source of audio for local
[MediaStream](MediaStream.md).

```javascript
let deviceRegistry = MindSDK.getDeviceRegistry();
let microphone = deviceRegistry.getMicrophones()[0];
if (microphone) {
    microphone.setNoiseSuppression(true);
    let myStream = MindSDK.createMediaStream(microphone, null);
    me.setMediaStream(myStream);
    microphone.acquire().catch(function(error) {
        alert("Microphone can't be acquired: " + error);
    });
} else {
    alert("Microphone isn't plugged in");
}
```

## getId()

Returns the ID of the microphone. The ID is unique among all microphones and never changes.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The ID of the microphone.

## getLabel()

Returns the label of the microphone.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The label of the microphone.

## setNoiseSuppression(noiseSuppression)

Sets the noise suppression state of the microphone. The noise suppression state of the microphone determines whether
the microphone should use a neural network to suppress different kinds of background noise or not. The noise suppression
state can be changed only if the microphone is not acquired.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;noiseSuppression – The noise suppression state of the microphone.

## setMuted(muted)

Sets the muted state of the microphone. The muted state of the microphone determines whether the microphone produces an
actual audio (if it is unmuted) or silence (if it is muted). The muted state can be changed at any moment regardless
whether the microphone is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;muted – The muted state of the microphone.

## setListener(listener)

Sets the listener which should be notified of all events related to the microphone. The listener can be changed at any
moment regardless whether the microphone is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;listener – The listener which should be notified of all events related to the microphone.

## acquire()

Starts microphone recording. This is an asynchronous operation which assumes acquiring the underlying microphone device
and distributing microphone's audio among all [consumers](MediaStream.md). This method returns a `Promise` that
resolves with no value (if the microphone recording starts successfully) or rejects with an `Error` (if there is no
permission to access the microphone or if the microphone was unplugged). If the microphone recording has been already
started, this method returns already resolved `Promise`.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## release()

Stops microphone recording. This is a synchronous operation which assumes revoking the previously distributed
microphone's audio and releasing the underlying microphone device. The stopping is idempotent: the method does nothing
if the microphone is not acquired, but it would fail if it was called in the middle of acquisition.
