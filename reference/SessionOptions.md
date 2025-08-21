# `class` SessionOptions

SessionOptions class represents a set of configuration options for a [participation session](Session.md). The default
constructor creates an instance of SessionOptions class with the default values for all configuration options. If
necessary, you can change any default value before passing the instance to the static
[join](MindSDK.md#static-joinuri-token-options) method of [MindSDK](MindSDK.md) class:

```javascript
let conferenceURI = "https://api.mind.com/<APPLICATION_ID>/<CONFERENCE_ID>";
let participantToken = "<PARTICIPANT_TOKEN>";
let options = new MindSDK.SessionOptions();
options.setStunServer("stun:stun.l.google.com:19302");
MindSDK.join(conferenceURI, participantToken, options).then(function(session) {
    ...
});
```

## setUseVp9ForSendingVideo(useVp9ForSendingVideo)

Sets whether VP9 codec should be used for sending video or not. If `true` and if the browser supports VP9 in SVC mode
(i.e. if we are running in a browser which is based on Chromium of version >= 111) then any outgoing video will be
encoded with VP9 in SVC mode, otherwise — with VP8/H.264 in simulcast mode. The default value is `false`.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;useVp9ForSendingVideo – Whether VP9 codec should be used for sending video or not.

## setStunServer(stunServerURL)

Sets a STUN server which should be used for establishing a participation session. If it is set and if it is not `null`,
then Mind Web SDK will try to gather and use a reflexive Ice candidates for establishing the participant session.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;stunServerURL – The URL for connecting to the STUN server.

## setTurnServer(turnServerURL, turnServerUsername, turnServerPassword)

Sets a TURN server which should be used for establishing a participation session. If it is set and if it is not `null`,
then Mind Web SDK will try to gather and use a relay Ice candidates for establishing the participant session.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;turnServerURL – The URL for connecting to the TURN server.  
&nbsp;&nbsp;&nbsp;&nbsp;turnServerUsername – The username for connecting to the TURN server.  
&nbsp;&nbsp;&nbsp;&nbsp;turnServerPassword – The password for connecting to the TURN server.
