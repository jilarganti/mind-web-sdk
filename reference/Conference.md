# `class` Conference

Conference class is used for representing a conferences from point of view of the [local participant](Me.md). You can
get a representation of the conference with [getConference](Session.md#getconference) method of [Session](Session.md)
class. Conference class contains methods for getting and setting parameters of the conference, for
[starting](#startrecording) and [stopping](#stoprecording) conference recording, for getting [local](#getme) and
[remote](#getparticipants) participants, and for getting [conference media stream](#getmediastream):

```javascript
let conference = session.getConference();
let conferenceStream = conference.getMediaStream();
let conferenceVideo = document.getElementById("conferenceVideo");
conferenceVideo.mediaStream = conferenceStream;
```

## getId()

Returns the ID of the conference. The ID is unique and never changes.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The ID of the conference.

## getName()

Returns the current name of the conference. The name of the conference can be shown above the video in the conference
media stream and recording.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current name of the conference.

## setName(name)

Changes the name of the conference. The name of the conference can be shown above the video in the conference media
stream and recording. The name changing is an asynchronous operation, that's why this method returns a `Promise` that
either resolves with no value (if the operation succeeds) or rejects with an `Error` (if the operation fails). The
operation can succeed only if the [local participant](Me.md) plays a role of a
[moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;name – The new name for the conference.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## getLayout()

Returns the current [layout](ConferenceLayout.md) of the conference. The layout determines arrangement of videos in
[conference media stream](#getmediastream) which the participants receive, and [recording](#getrecordingurl).

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current layout of the conference.

## getMe()

Returns the [local participant](Me.md).

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The local participant.

## getParticipants()

Returns the list of all online [remote participants](Participant.md).

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The list of all online remote participants.

## getParticipantById(participantId)

Returns [remote participant](Participant.md) with the specified ID or `null` value, if it doesn't exist or if it is
offline.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The remote participant or `null` value, if it doesn't exist or if it is offline.

## isRecording()

Checks whether the conference is being recorded or not.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The boolean value which indicates if the conference is being recorded or not.

## startRecording()

Starts recording of the conference. This is an asynchronous operation, that's why this method returns a `Promise` that
either resolves with no value (if the operation succeeds) or rejects with an `Error` (if the operation fails). The
operation can succeed only if the [local participant](Me.md) plays a role of a [moderator](ParticipantRole.md#moderator).

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## stopRecording()

Stops recording of the conference. This is an asynchronous operation, that's why this method returns a `Promise` that
either resolves with no value (if the operation succeeds) or rejects with an `Error` (if the operation fails). The
operation can succeed only if the [local participant](Me.md) plays a role of a [moderator](ParticipantRole.md#moderator).

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The promise that either resolves with no value or rejects with an `Error`.

## getRecordingURL()

Returns a URL for downloading the recording of the conference. The returned URL can be used for downloading only if the
[local participant](Me.md) plays a role of a [moderator](ParticipantRole.md#moderator).

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The URL for downloading the recording of the conference.

## getMediaStream()

Returns the [media stream](MediaStream.md) of the conference. The returned media stream is a mix of all audios and
videos (excluding only audio of the local participant) that participants are streaming at the moment. The videos in the
media stream are arranged using [current layout](#getlayout) of the conference. You can get and play the media stream
of the conference at any time.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The media steam of the conference.
