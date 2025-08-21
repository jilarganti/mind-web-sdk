# `class` Camera

Camera class is used for representing cameras plugged in to the computer (each instance represents a single camera).
The list of all available cameras can be got with [getCameras](DeviceRegistry#getcameras) method of
[DeviceRegistry](DeviceRegistry) class. Camera class implements [MediaStreamVideoSupplier](MediaStreamVideoSupplier.md) interface,
so it can be used as a source of video for local [MediaStream](MediaStream.md).

```javascript
let deviceRegistry = MindSDK.getDeviceRegistry();
let camera = deviceRegistry.getCameras()[0];
if (camera) {
    camera.setFacing(CameraFacing.USER);
    camera.setResolution(1280, 720);
    camera.setFps(25);
    camera.setBitrate(2500000);
    camera.setAdaptivity(3);
    let myStream = MindSDK.createMediaStream(null, camera);
    me.setMediaStream(myStream);
    camera.acquire().catch(function(error) {
        alert("Camera can't be acquired: " + error);
    });
} else {
    alert("Camera isn't plugged in");
}
```

## getId()

Returns the ID of the camera. The ID is unique among all cameras and never changes.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The ID of the camera.

## getLabel()

Returns the label of the camera.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The label of the camera.

## setFacing(facing)

Sets the facing of the camera. The facing of the camera is a direction which the camera can be pointed to. Most cameras
can be pointed to only one direction and, therefore, have only one facing. But front and back cameras on smartphones
(and other mobile devices) are usually combined into a single multi-facing camera which is represented with a single
instance of `Camera` class. The facing of any multi-facing camera can be changed at any moment regardless whether the
camera is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;facing – The facing of the camera.

## setResolution(width, height)

Sets the resolution of the camera. The resolution of the camera is a resolution which the camera should capture the
video in. The video from the camera can be transmitted over the network in
[multiple encodings (e.g. resolutions) simultaneously](#setadaptivityadaptivity). The resolution can be changed at any
moment regardless whether the camera is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;width – The horizontal resolution of the camera.  
&nbsp;&nbsp;&nbsp;&nbsp;height – The vertical resolution of the camera.

## setFps(fps)

Sets the frame rate of the camera. The frame rate of the camera is a rate which the camera should capture the video at.
The frame rate can be changed at any moment regardless whether the camera is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;fps – The frame rate of the camera.

## setBitrate(bitrate)

Sets the bitrate of the camera. The bitrate of the camera is a number of bits which each second of video from the
camera should not exceed while being transmitting over the network. The bitrate is shared among all
[encodings](#setadaptivityadaptivity) proportionally and can be changed at any moment regardless whether the camera is
acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;bitrate – The bitrate of the camera.

## setAdaptivity(adaptivity)

Sets the adaptivity of the camera. The adaptivity of the camera is an integer (in range between 1 and 3, inclusively)
which defines a number of encodings in which the video from the camera should be transmitted over the network. The
encodings differ in resolution: the resolution of the first encoding equals the
[resolution of the camera](#setresolutionwidth-height), the resolution of the second encoding is half (in each
dimension) of the resolution of the first one, the resolution of the third encoding is half (in each dimension) of the
resolution of the second one. For example, if the resolution of the camera is 1280x720 and adaptivity is 3, the video
from the camera would be transmitted over the network in 3 encoding: 1280x720, 640x360 and 320x180. The adaptivity can
be changed at any moment regardless whether the camera is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;adaptivity – The adaptivity of the camera.

## setListener(listener)

Sets the listener which should be notified of all events related to the camera. The listener can be changed at any
moment regardless whether the camera is acquired or not.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;listener – The listener which should be notified of all events related to the camera.

## acquire()

Starts camera capturing. This is an asynchronous operation which assumes acquiring the underlying camera device and
distributing camera's video among all [consumers](MediaStream.md). This method returns a `Promise` that resolves with
no value (if the camera capturing starts successfully) or rejects with an `Error` (if there is no permission to access
the camera or if the camera was unplugged). If the camera capturing has been already started, this method returns
already resolved `Promise`.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## release()

Stops camera capturing. This is a synchronous operation which assumes revoking the previously distributed camera's
video and releasing the underlying camera device. The stopping is idempotent: the method does nothing if the camera is
not acquired, but it would fail if it was called in the middle of acquisition.
