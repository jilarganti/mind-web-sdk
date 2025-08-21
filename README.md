Mind Web SDK is a JavaScript library that includes everything you need to add [Mind API-powered](https://api.mind.com)
real-time voice, video and text communication to your web-applications.

* [Introduction](#introduction)
* [Supported Browsers](#supported-browsers)
* [Example](#example)
* [Getting the SDK](#getting-the-sdk)
* [API Reference](#api-reference)

# Introduction

[Mind API](https://api.mind.com) is a cloud media platform (aka PaaS) which allows you to create applications for
conducting online meeting where participants can communicate to each other in real-time. A meeting in Mind API is
called a conference. Anyone who is participating in a conference using participant token is called a participant.
Usually, it is either a client part of your application (based on Mind Web/Android/iOS SDK) or SIP/H.323-enabled phone.
The responsibility for arranging/ending conferences and inviting/expelling participants into/from them lies with a
server part of your application which interacts with Mind API using application token. Also, the application token
allows the server part of your application to join any conference it created and stay informed of all actions of the
participants.

To communicate to each other participants use text, audio and video. Text is transmitted as messages each of which is
just a string, while audio and video are transmitted as media streams, each of which can contain one audio and one
video. Any participant (if permitted) can send two independent media streams simultaneously: primary and secondary. The
primary media stream is intended for sending video and audio taken from a camera and a microphone, respectively,
whereas the secondary media stream can be used for sending an additional audio/video content (e.g. screen sharing).
Depending on their capabilities and desires participants can receive video/audio which are sent by other participants
in SFU or MCU mode. The SFU mode assumes that primary and secondary media streams of all participant are received as is
— each media stream separately, while in MCU mode audio and video of all participants are mixed inside Mind API
(according to the desired layout) and received as a single media stream.

Mind Web SDK allows web-applications to [join](../5.18.0/reference/MindSDK.md#static-join2uri-token-listener)
conferences on behalf of participants only. A successful joining attempt results in getting an object of
[Session](../5.18.0/reference/Session.md) class, which represents a participation session. The conference (which
web-application is participating in) is represented with an object of [Conference](../5.18.0/reference/Conference.md)
class, whereas participants can be represented as objects of either [Participant](../5.18.0/reference/Participant.md)
or [Me](../5.18.0/reference/Me.md) class. The latter is used for representing the participant on behalf of whom
web-application is participating in the conference (aka the local participant), the former — for all other participants
(aka the remote participants). Messages are represented with standard
[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) objects, whereas
media streams are represented with instances of custom [MediaStream](../5.18.0/reference/MediaStream.md) class.

# Supported Browsers

Our SDK is always compatible with the latest stable versions of all major web-browsers, but since a degree of support
of web technologies among the browsers is quite different, not all features of SDK work in all browsers. Use table
below to find out how well each feature is supported across the browsers:

| Feature                     | Chromium* | Mozilla Firefox |  Apple Safari  | Chrome for Android | Safari for iOS |
|-----------------------------|:---------:|:---------------:|:--------------:|:------------------:|:--------------:|
| Video and voice             |    yes    |       yes       |      yes       |        yes         |      yes       |
| Camera/microphone selection |    yes    |       yes       |      yes       |        yes         |      yes       |
| Screen/window/tab sharing   |    yes    |       yes       |     yes**      |     view-only      |   view-only    |
| Sharing with audio          |    yes    | listening-only  | listening-only |   listening-only   | listening-only |
| Text Messaging              |    yes    |       yes       |      yes       |        yes         |      yes       |
| Watching recordings         |    yes    |       yes       |      yes       |        yes         |      yes       |

\* This sections also concerns other Chromium based browsers: Google Chrome, Microsoft Edge, Opera, Yandex Browser, etc  
\** Currently only entire screen can be shared in Apple Safari

# Example

To demonstrate what you can do with Mind Web SDK we created a simple open-source web-application for video conferencing
named [Confy](https://gitlab.com/mindlabs/api/demo/web). Here is a snippet from it which shows how to participate in
conference in MCU mode:

```javascript
let mindSdkOptions = new MindSDK.MindSDKOptions();
MindSDK.initialize(mindSdkOptions).then(function() {
    let deviceRegistry = MindSDK.getDeviceRegistry();
    let microphone = deviceRegistry.getMicrophones()[0];
    let camera = deviceRegistry.getCameras()[0];
    let options = new MindSDK.SessionOptions();
    MindSDK.join("<CONFERENCE_URI>", "<PARTICIPANT_TOKEN>", options).then(function(session) {
        let listener = new MindSDK.SessionListener();
        session.setListener(listener);
        let conference = session.getConference();
        let conferenceVideo = document.getElementById("video");
        let conferenceStream = conference.getMediaStream();
        conferenceVideo.mediaStream = conferenceStream;
        let me = conference.getMe();
        let myStream = MindSDK.createMediaStream(microphone, camera);
        me.setMediaStream(myStream);
        Promise.all([ microphone.acquire(), camera.acquire() ]).catch(function(error) {
            alert("Can't acquire camera or microphone: " + error);
        });
    });
});
```

The summary above is missing two mandatory identifiers: `<CONFERENCE_URI>` and `<PARTICIPANT_TOKEN>`. The former has to
be replaced with an URI of an existent conference, the later with a token of an existent participant. Both of them
should be created on behalf of server part of your application using application token.

# Getting the SDK

The preferred way to install Mind Web SDK is with Node Package Manager directly from the GitLab repository:

```shell
npm install -D gitlab:mindlabs/api/sdk/web#5.18.0
```

Alternatively, the prebuilt version of the SDK can be loaded using a `script` tag from our CDN:

```html
<script src="https://api.mind.com/sdk-5.18.0.js"></script>
```

If you decided to use the `script` tag, then all static methods of [MindSDK](../5.18.0/reference/MindSDK.md) class and
[all other components of Mind Web SDK](#api-reference) would be available on the `MindSDK` global. If you used `npm`,
you could import only necessary components of the SDK under names you like, but we strongly encourage you to stick with
the default names unless there is a name conflict:

```javascript
import {MindSDK, SessionListener, ParticipantRole} from "mind-sdk-web";
```

# API Reference

This is an index of all components (classes, interfaces and enumerations) of Mind Web SDK. If you use `npm`, you can
import each of them separately with standard `import` syntax. If you loaded Mind Web SDK with a `script` tag, then all
static methods of [MindSDK](../5.18.0/reference/MindSDK.md) class and all other components of the SDK would be
available on the `MindSDK` global.

  * [Camera](../5.18.0/reference/Camera.md)
  * [CameraFacing](../5.18.0/reference/CameraFacing.md)
  * [CameraListener](../5.18.0/reference/CameraListener.md)
  * [Conference](../5.18.0/reference/Conference.md)
  * [ConferenceLayout](../5.18.0/reference/ConferenceLayout.md)
  * [Me](../5.18.0/reference/Me.md)
  * [DeviceRegistry](../5.18.0/reference/DeviceRegistry.md)
  * [DeviceRegistryListener](../5.18.0/reference/DeviceRegistryListener.md)
  * [MediaStream](../5.18.0/reference/MediaStream.md)
  * [MediaStreamAudioConsumer](../5.18.0/reference/MediaStreamAudioConsumer.md)
  * [MediaStreamAudioStatistics](../5.18.0/reference/MediaStreamAudioStatistics.md)
  * [MediaStreamAudioSupplier](../5.18.0/reference/MediaStreamAudioSupplier.md)
  * [MediaStreamVideoConsumer](../5.18.0/reference/MediaStreamVideoConsumer.md)
  * [MediaStreamVideoStatistics](../5.18.0/reference/MediaStreamVideoStatistics.md)
  * [MediaStreamVideoSupplier](../5.18.0/reference/MediaStreamVideoSupplier.md)
  * [Microphone](../5.18.0/reference/Microphone.md)
  * [MicrophoneListener](../5.18.0/reference/MicrophoneListener.md)
  * [MindSDK](../5.18.0/reference/MindSDK.md)
  * [MindSDKOptions](../5.18.0/reference/MindSDKOptions.md)
  * [Participant](../5.18.0/reference/Participant.md)
  * [ParticipantLanguage](../5.18.0/reference/ParticipantLanguage.md)
  * [ParticipantRole](../5.18.0/reference/ParticipantRole.md)
  * [Screen](../5.18.0/reference/Screen.md)
  * [ScreenListener](../5.18.0/reference/ScreenListener.md)
  * [Session](../5.18.0/reference/Session.md)
  * [SessionListener](../5.18.0/reference/SessionListener.md)
  * [SessionOptions](../5.18.0/reference/SessionOptions.md)
  * [SessionState](../5.18.0/reference/SessionState.md)
  * [SessionStatistics](../5.18.0/reference/SessionStatistics.md)
