# `class` Screen

Screen class is used for representing the display of the computer. It can be used to capture the contents of the entire
screen or a portion thereof (such as a window of an application or a tab of the browser). It also can be
[configured to capture audio](#setaudiocapturingaudiocapturing) along with the video content. Screen class implements
[MediaStreamAudioSupplier](MediaStreamAudioSupplier.md) and [MediaStreamVideoSupplier](MediaStreamVideoSupplier.md)
interfaces, so it can be used as a source of audio or/and video for the local [MediaStream](MediaStream.md).

```javascript
let deviceRegistry = MindSDK.getDeviceRegistry();
let screen = deviceRegistry.getScreen();
if (screen) {
    screen.setAudioCapturing(true);
    screen.setFps(5);
    screen.setBitrate(500000);
    let mySecondaryStream = MindSDK.createMediaStream(screen, screen);
    me.setSecondaryMediaStream(mySecondaryStream);
    screen.acquire().catch(function(error) {
        alert("Screen can't be acquired: " + error);
    });
} else {
    alert("Screen capturing isn't supported");
}
```

## setAudioCapturing(audioCapturing)

Sets the audio capturing state of the screen. The audio capturing state of screen determines whether the screen should
capture audio along with the video content or not. The source of the audio depends on capabilities of the browser and
video source (selected by the user), it can be a tab of the browser, a window of an application or the entire
computer's audio system. The audio capturing state can be changed only if the screen is not acquired.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;audioCapturing – The audio capturing state of the screen

## setFps(fps)

Sets the frame rate of the screen. The frame rate of the screen is a rate which the screen should capture the video at.
The frame rate can be changed at any moment regardless whether the screen is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;fps – The frame rate of the screen.

## setBitrate(bitrate)

Sets the bitrate of the screen. The bitrate of the screen is a number of bits which each second of video from the
screen should not exceed while being transmitting over the network. The bitrate can be changed at any moment regardless
whether the screen is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;bitrate – The bitrate of the screen.

## setListener(listener)

Sets the listener which should be notified of all events related to the screen. The listener can be changed at any
moment regardless whether the screen is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;listener – The listener which should be notified of all events related to the screen.

## acquire()

Starts screen capturing. This is an asynchronous operation which assumes prompting the user to select and grant
permission to capture the contents of a screen or portion thereof (such as a window) and distributing screen's video
among all [consumers](MediaStream). This method returns a `Promise` that resolves with no value (if the screen
capturing starts successfully) or rejects with an `Error` (if the user didn't grant permission to access the screen or
canceled the operation). If screen capturing has been already started, this method returns already resolved `Promise`.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## release()

Stops screen capturing. This is a synchronous operation which assumes revoking previously distributed screen's video.
The stopping is idempotent: the method does nothing if the screen is not acquired, but it would fail if it was called
in the middle of acquisition.
