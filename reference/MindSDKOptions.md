# `class` MindSDKOptions

MindSDKOptions class represents all available configuration options for Mind Web SDK. The default constructor creates
an instance of MindSDKOptions class with the default values for all configuration options. If necessary, you can change
any default value before passing the instance to the static [initialize](MindSDK.md#static-initializeoptions)
method of [MindSDK](MindSDK.md) class:

```javascript
let options = new MindSDKOptions();
options.setUseVp9ForSendingVideo(true);
MindSDK.initialize(options).then(function() {
   ...
});
```

## setUseVp9ForSendingVideo(useVp9ForSendingVideo)

Sets whether VP9 codec should be used for sending video or not. If `true` and if the browser supports VP9 in SVC mode
(i.e. if we are running in a browser which is based on Chromium of version >= 111) then any outgoing video will be
encoded with VP9 in SVC mode, otherwise — with VP8/H.264 in simulcast mode. The default value is `false`.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;useVp9ForSendingVideo – Whether VP9 codec should be used for sending video or not.
