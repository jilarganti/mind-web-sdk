# `interface` SessionListener

SessionListener [can be used](Session.md#setlistenerlistener) for getting notifications of all events related to the
[Session](Session.md). These include all changes in the [conference](Conference.md), [participants](Participant.md) and
[me](Me.md) made by the server part of your application and remote participants. For example, if one of the remote
participants who played a  role of a [moderator](ParticipantRole.md#moderator) changed the name of the conference, then
[onConferenceNameChanged](#onconferencenamechangedconference) method of the listener would be called.

## onSessionStateChanged(session)

This method is called when the state of the session is changed.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;session – The session whose state was changed.

## onConferenceNameChanged(conference)

This method is called when the name of the conference is changed by either the server part of your application or one
of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;conference – The conference which name was changed.

## onConferenceRecordingStarted(conference)

This method is called when the recording of the conference is started/resumed by either the server part of your
application or one of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;conference – The conference the recording of which was started or resumed.

## onConferenceRecordingStopped(conference)

This method is called when the recording of the conference is paused/stopped by either the server part of your
application or one of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;conference – The conference the recording of which was paused or stopped.

## onConferenceEnded(conference)

This method is called when the conference is ended by the server part of your application. By the time of calling the
conference object itself and all other objects related to the conference aren't functional (like after a call of
[exit](MindSDK.md#static-exit2session) method of [MindSDK](MindSDK.md) class).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;conference – The conference that was ended.

## onParticipantJoined(participant)

This method is called when a remote participant joins the conference.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;participant – The remote participant who joined the conference.

## onParticipantExited(participant)

This method is called when a remote participant leaves the conference because of his own will or because the server
part of your application expelled him.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;participant – The remote participant who left the conference.

## onParticipantNameChanged(participant)

This method is called when the name of a remote participant is changed by the server part of your application or by one
of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator) or by the participant
himself.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;participant – The remote participant whose name was changed.

## onParticipantPriorityChanged(participant)

This method is called when the priority of a remote participant is changed by either the server part of your
application or one of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;participant – The remote participant whose priority was changed.

## onParticipantLanguageChanged(participant)

This method is called when the preferred language of a remote participant is changed by either the server part of your
application or one of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;participant – The remote participant whose preferred language was changed.

## onParticipantRoleChanged(participant)

This method is called when the role of a remote participant is changed by either the server part of your application or
one of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;participant – The remote participant whose role was changed.

## onParticipantMediaChanged(participant)

This method is called when a remote participant starts or stops streaming his primary audio or/and video.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;participant – The remote participant who started or stopped streaming his primary audio or/and
                                      video.

## onParticipantSecondaryMediaChanged(participant)

This method is called when a remote participant starts or stops streaming his secondary audio or/and video.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;participant – The remote participant who started or stopped streaming his secondary audio
                                      or/and video.

## onMeExpelled(me)

This method is called when the local participant is expelled from the conference by the server part of your
application. By the time of calling the conference object itself and all other objects related to the conference aren't
functional (like after a call of [exit](MindSDK.md#static-exit2session) method of [MindSDK](MindSDK.md) class).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;me – The local participant who was expelled from the conference.

## onMeNameChanged(me)

This method is called when the name of the local participant is changed by either the server part of your application
or one of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;me – The local participant whose name was changed.

## onMePriorityChanged(me)

This method is called when the priority of the local participant is changed by either the server part of your
application or one of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;me – The local participant whose priority was changed.

## onMeLanguageChanged(me)

This method is called when the preferred language of the local participant is changed by either the server part of your
application or one of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;me – The local participant whose preferred language was changed.

## onMeRoleChanged(me)

This method is called when the role of the local participant is changed by either the server part of your application
or one of the remote participants who plays a role of a [moderator](ParticipantRole.md#moderator).

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;me – The local participant whose role was changed.

## onMeReceivedMessageFromApplication(me, message)

This method is called when the local participant receives a message from the server part of your application.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;me – The local participant whose received the message.  
&nbsp;&nbsp;&nbsp;&nbsp;message – The text of the message.

## onMeReceivedMessageFromParticipant(me, message, participant)

This method is called when the local participant receives a message from a remote participant.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;me – The local participant whose received the message.  
&nbsp;&nbsp;&nbsp;&nbsp;message – The text of the message.  
&nbsp;&nbsp;&nbsp;&nbsp;participant – The remote participant who sent the message.
