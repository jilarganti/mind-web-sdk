# `class` MindSDK

MindSDK class is the entry point of Mind Web SDK. It contains static methods for
[joining](#static-joinuri-token-options) and [leaving](#static-exit2session) conferences, for getting
[device registry](#static-getdeviceregistry), and for
[creating local media streams](#static-createmediastreamaudiosupplier-videosupplier). But before you can do all this,
the SDK should be initialized:

```javascript
let options = new MindSDKOptions();
MindSDK.initialize(options).then(function() {
   // Initialization of Mind SDK is completed, now you can participate in conferences.
});
```

## `static` initialize(options)

Initializes Mind Web SDK with the specified [configuration options](MindSDKOptions.md). The initialization is an
asynchronous operation, that's why this method returns a `Promise` that either resolves with no value when the
initialization is completed. The initialization should be completed only once before calling any other method of the
MindSDK class.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;options – The configuration options for Mind Web SDK.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that resolves with no value when the initialization is completed.

## `static` getDeviceRegistry()

Returns the [device registry](DeviceRegistry) which provides access to all audio and video peripherals of the user's
computer.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The device registry.

## `static` createMediaStream(audioSupplier, videoSupplier)

Creates [local media stream](MediaStream.md) with audio and video from the specified suppliers. The `null` value can be
passed instead of one of the suppliers to create audio-only or video-only media stream. Even if audio/video supplier
wasn't `null` it doesn't mean that the result media stream would automatically contain audio/video, e.g.
[Microphone](Microphone.md) (as a supplier of audio) and [Camera](Camera.md) (as a supplier of video) supply no audio
and no video, respectively, till they are acquired, and after they were released.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;audioSupplier – The audio supplier or `null` to create video-only media stream.  
&nbsp;&nbsp;&nbsp;&nbsp;videoSupplier – The video supplier or `null` to create audio-only media stream.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The created media stream.

## `static` join(uri, token, options)

Establishes a participation session (aka joins the conference) on behalf of the participant with the specified
token. The establishment is an asynchronous operation, that's why this method returns a `Promise` that either
resolves with a [participation session](Session.md) (if the operation succeeded) or rejects with an `Error`
(if the operation failed).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;uri – The URI of the conference.  
&nbsp;&nbsp;&nbsp;&nbsp;token – The token of the participant on behalf of whom we are joining the conference.  
&nbsp;&nbsp;&nbsp;&nbsp;options – The configuration options for the participation session.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with a participation session or rejects with an `Error`.

## `static` exit2(session)

Terminates an [established participation session](#static-joinuri-token-options) (aka leaves the conference). The
termination is an idempotent synchronous operation. The session object itself and all other objects related to the
session are not functional after the leaving.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;session – The participation session which should be terminated.
