# `class` Participant

Participant class is used for representing remote participants (each instance represents a single remote participants).
The participant on behalf of whom web-application is participating in the conference (aka the local participant) is
represented with [Me](Me.md) class. You can get representations of all remote participants and a representation of a
specific remote participant with [getParticipants](Conference.md#getparticipants) and
[getParticipantById](Conference.md#getparticipantbyidparticipantid) methods of [Conference](Conference.md) class,
respectively. Participant class contains methods for getting and setting parameters of the remote participant and for
getting its primary and secondary media streams:

```javascript
let participantVideo = document.getElementById("participantVideo");
let participantSecondaryVideo = document.getElementById("mySecondaryVideo");

let participant = conference.getParticipantById("<PARTICIPANT_ID>");

let participantStream = participant.getMediaStream();
participantVideo.mediaStream = participantStream;

let participantSecondaryStream = participant.getSecondaryMediaStream();
participantSecondaryVideo.mediaStream = participantSecondaryStream;
```

## getId()

Return the ID of the remote participant. The ID is unique and never changes.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The ID of the remote participant.

## getName()

Returns the current name of the remote participant. The name of the remote participant can be shown above his video in
the conference media stream and recording.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current name of the remote participant.

## setName(name)

Changes the name of the remote participant. The name of the remote participant can be shown above his video in the
conference media stream and recording. The name changing is an asynchronous operation, that's why this method returns a
`Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error` (if the operation
fails). The operation can succeed only if the [local participant](Me.md) plays a role of a
[moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;name – The new name for the remote participant.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## getPriority()

Returns the current priority of the remote participant. The priority defines a place which remote participant takes in
conference media stream and recording.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current priority of the remote participant.

## setPriority(priority)

Changes the priority of the remote participant. The priority defines a place which remote participant takes in
conference media stream and recording. The priority changing is an asynchronous operation, that's why this method
returns a `Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error (if the
operation fails). The operation can succeed only if the [local participant](Me.md) plays a role of a
[moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;priority – The new priority for the remote participant.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## getLanguage()

Returns the current [preferred language](ParticipantLanguage.md) of the remote participant. The preferred language is
the code of a language that the remote participant speaks and prefers to hear from other participants.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current preferred language of the remote participant.

## setLanguage(language)

Changes the [preferred language](ParticipantLanguage.md) of the remote participant. The preferred language is the code
of a language that the remote participant speaks and prefers to hear from other participants. The preferred language
changing is an asynchronous operation, that's why this method returns a `Promise` that either resolves with no value
(if the operation succeeds) or rejects with an `Error (if the operation fails). The operation can succeed only if the
[local participant](Me.md) plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;language – The new preferred language for the remote participant.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## getRole()

Returns the current [role](ParticipantRole.md) of the remote participant. The role defines a set of permissions which
the remote participant is granted.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current role of the remote participant.

## setRole(role)

Changes the [role](ParticipantRole.md) of the remote participant. The role defines a set of permissions which the
remote participant is granted. The role changing is an asynchronous operation, that's why this method returns a
`Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error (if the operation
fails). The operation can succeed only if the [local participant](Me.md) plays a role of a
[moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;role – The new role for the remote participant.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## isStreamingAudio()

Checks whether the remote participant is streaming primary audio (i.e. audio taken from his microphone). If both this
method and [isStreamingVideo](#isstreamingvideo) return `false` then the participant is not streaming the primary media
stream at all.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The boolean value which indicates if the remote participant is streaming primary audio or not.

## isStreamingVideo()

Checks whether the remote participant is streaming primary video (i.e. video taken from his camera). If both this
method and [isStreamingAudio](#isstreamingaudio) return `false` then the participant is not streaming the primary media
stream at all.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The boolean value which indicates if the remote participant is streaming primary video or not.

## getMediaStream()

Returns the [primary media stream](MediaStream.md) of the remote participant. The primary media stream is intended for
streaming video and audio taken from a camera and a microphone of the participant's computer, respectively. You can get
and play the primary media stream at any moment regardless of whether the participant is streaming its primary
video/audio or not: if the participant started or stopped streaming its primary video or/and audio, the returned media
stream would be updated automatically.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The primary media stream of the remote participant.

## isStreamingSecondaryAudio()

Checks whether the remote participant is streaming secondary audio (i.e. an arbitrary content with audio). If both this
method and [isStreamingSecondaryVideo](#isstreamingsecondaryvideo) return `false` then the participant is not streaming
secondary media stream at all.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The boolean value which indicates if the remote participant is streaming secondary audio or not.

## isStreamingSecondaryVideo()

Checks whether the remote participant is streaming secondary video (i.e. an arbitrary content with video). If both this
method and [isStreamingSecondaryAudio](#isstreamingsecondaryaudio) return `false` then the participant is not streaming
secondary media stream at all.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The boolean value which indicates if the remote participant is streaming secondary video or not.

## getSecondaryMediaStream()

Returns the [secondary media stream](MediaStream.md) of the remote participant. The secondary media stream is intended
for streaming an arbitrary audio/video content, e.g. for sharing a screen of the participant's computer. You can get
and play the secondary media stream at any moment regardless of whether the participant is streaming its secondary
video/audio or not: if the participant started or stopped streaming its secondary video or/and audio, the returned
media stream would be updated automatically.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The secondary media stream of the remote participant.
