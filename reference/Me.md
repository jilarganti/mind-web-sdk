# `class` Me

Me class is used for representing participant on behalf of whom web-application is participating in the conference
(aka the local participant). All other participants are considered to be remote and represented with
[Participant](Participant.md) class. You can get a representation of the local participant with
[getMe](Conference.md#getme) method of [Conference](Conference.md) class. Me is a subclass of
[Participant](Participant.md) class, so that it inherits all public methods of the superclass and adds methods for
setting primary and secondary media streams that should be sent on behalf of the local participant, and for sending
messages from the local participant to other participant(s) or to the server part of your application:

```javascript
let deviceRegistry = MindSDK.getDeviceRegistry();
let microphone = deviceRegistry.getMicrophones()[0];
let camera = deviceRegistry.getCameras()[0];
let myStream = MindSDK.createMediaStream(microphone, camera);
let me = conference.getMe();
me.setMediaStream(myStream);
Promise.all([ microphone.acquire(), camera.acquire() ]).catch(function(error) {
    alert("Can't acquire camera or microphone: " + error);
});

....

let screen = deviceRegistry.getScreen();
if (screen) {
    let mySecondaryStream = MindSDK.createMediaStream(screen, screen);
    me.setSecondaryMediaStream(mySecondaryStream);
    screen.acquire().catch(function(error) {
        alert("Can't acquire screen: " + error);
    });
}

...

me.sendMessageToAll("Hello, everybody!");
me.sendMessageToApplication("Hello, the server part of the application!");
let participant = conference.getParticipantById("<PARTICIPANT_ID>");
if (participant) {
    me.sendMessageToParticipant("Hello, " + participant.getName(), participant);
}
```

## getId()

Return the ID of the local participant. The ID is unique and never changes.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The ID of the local participant.

## getName()

Returns the current name of the local participant. The name of the local participant can be shown above his video in
the conference media stream and recording.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current name of the local participant.

## setName(name)

Changes the name of the local participant. The name of the local participant can be shown above his video in the
conference media stream and recording. The name changing is an asynchronous operation, that's why this method returns a
`Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error` (if the operation
fails).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;name – The new name for the local participant.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## getPriority()

Returns the current priority of the local participant. The priority defines a place which local participant takes in
conference media stream and recording.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current priority of the local participant.

## setPriority(priority)

Changes the priority of the local participant. The priority defines a place which local participant takes in conference
media stream and recording. The priority changing is an asynchronous operation, that's why this method returns a
`Promise` that  either resolves with no value (if the operation succeeds) or rejects with an `Error (if the operation
fails). The operation can succeed only if the [local participant](Me.md) plays a role of a
[moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;priority – The new priority for the local participant.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## getLanguage()

Returns the current [preferred language](ParticipantLanguage.md) of the local participant. The preferred language is
the code of a language that the local participant speaks and prefers to hear from other participants.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current preferred language of the local participant.

## setLanguage(language)

Changes the [preferred language](ParticipantLanguage.md) of the local participant. The preferred language is the code
of a language that the local participant speaks and prefers to hear from other participants. The preferred language
changing is an asynchronous operation, that's why this method returns a `Promise` that either resolves with no value
(if the operation succeeds) or rejects with an `Error (if the operation fails). The operation can succeed only if the
[local participant](Me.md) plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;language – The new preferred language for the local participant.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## getRole()

Returns the current [role](ParticipantRole.md) of the local participant. The role defines a set of permissions which
the local participant is granted.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current role of the local participant.

## setRole(role)

Changes the [role](ParticipantRole.md) of the local participant. The role defines a set of permissions which the local
participant is granted. The role changing is an asynchronous operation, that's why this method returns a `Promise` that
either resolves with no value (if the operation succeeds) or rejects with an `Error` (if the operation fails).
The operation can succeed only if the [local participant](Me.md) plays a role of a
[moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;role – The new role for the local participant.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## isStreamingAudio()

Checks whether the local participant is streaming primary audio (i.e. audio taken from his microphone). If both this
method and [isStreamingVideo](#isstreamingvideo) return `false` then the participant is not streaming the primary media
 stream at all.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The boolean value which indicates if the local participant is streaming primary audio or not.

## isStreamingVideo()

Checks whether the local participant is streaming primary video (i.e. video taken from his camera). If both this method
and [isStreamingAudio](#isstreamingaudio) return `false` then the participant is not streaming the primary media stream
 at all.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The boolean value which indicates if the local participant is streaming primary video or not.

## getMediaStream()

Returns [media stream](MediaStream.md) which is being streamed on behalf of the local participant as the primary media
stream or `null` value if the local participant is not streaming the primary media stream at the moment. The primary
media stream is intended for streaming video and audio taken from a camera and a microphone of the computer,
respectively.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current primary media stream of the local participant.

## setMediaStream(stream)

Sets [media stream](MediaStream.md) for streaming on behalf of the local participant as the primary media stream. The
primary media stream is intended for streaming video and audio taken from a camera and a microphone of the computer,
respectively. If the primary media stream is already being streamed, then it will be replaced with the passed one. Set
`null` value to stop streaming the primary media stream on behalf of the local participant.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;stream – The new primary media stream of the local participant.

## isStreamingSecondaryAudio()

Checks whether the local participant is streaming secondary audio (i.e. an arbitrary content with audio). If both this
method and [isStreamingSecondaryVideo](#isstreamingsecondaryvideo) return `false` then the participant is not streaming
secondary media stream at all.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The boolean value which indicates if the local participant is streaming secondary audio or not.

## isStreamingSecondaryVideo()

Checks whether the local participant is streaming secondary video (i.e. an arbitrary content with video). If both this
method and [isStreamingSecondaryAudio](#isstreamingsecondaryaudio) return `false` then the participant is not streaming
secondary media stream at all.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The boolean value which indicates if the local participant is streaming secondary video or not.

## getSecondaryMediaStream()

Returns [media stream](MediaStream.md) which is being streamed on behalf of the local participant as the secondary
media stream or `null` value if the local participant is not streaming the secondary media stream at the moment. The
secondary media stream is intended for streaming an arbitrary audio/video content, e.g. for sharing a screen of the
computer.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current secondary media stream of the local participant.

## setSecondaryMediaStream(stream)

Sets [media stream](MediaStream.md) for streaming on behalf of the local participant as the secondary media stream. The
secondary media stream is intended for streaming an arbitrary audio/video content, e.g. for sharing a screen of the
computer. If the secondary media stream is already being streamed, then it will be replaced with the passed one. Set
`null` value to stop streaming the secondary media stream on behalf of the local participant.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;stream – The new secondary media stream of the local participant.

## sendMessageToApplication(message)

Sends a text message on behalf of the local participant to the server part of your application. The message sending is
an asynchronous operation, that's why this method returns a `Promise` that either resolves with no value (if the
operation succeeds) or rejects with an `Error (if the operation fails).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;message – The text of the message.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## sendMessageToParticipant(message, participant)

Sends a text message on behalf of the local participant to the specified participant. The message sending is an
asynchronous operation, that's why this method returns a `Promise` that either resolves with no value (if the operation
 succeeds) or rejects with an `Error (if the operation fails).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;message – The text of the message.  
&nbsp;&nbsp;&nbsp;&nbsp;participant – The participant which the message should be sent to.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## sendMessageToAll(message)

Sends a text message on behalf of the local participant to all in the conference, i.e. to the server part of your
application and to all participants at once. The message sending is an asynchronous operation, that's why this method
returns a `Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error (if the
operation fails).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;message – The text of the message.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.
