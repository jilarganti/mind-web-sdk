# `enumeration` SessionState

SessionState enumerates all available states that a [participation session](Session.md) can be in. At any given
moment the participation session can be in one of three states: [NORMAL](#normal), [LAGGING](#LAGGING) or
[FAILED](#FAILED). The current state of the participation session can be got with [getState](Session.md#getstate)
method of [Session](Session.md) class. The [onSessionStateChanged](SessionListener.md#onsessionstatechangedsession)
method of the [session listener](SessionListener.md) is called whenever the state of the participation session changes.

## NORMAL

The `NORMAL` state means that the communication channel with Mind API is established, and it is operating normally: all
video and audio which should have been transmitted over the channel are actually transmitted.

## LAGGING

The `LAGGING` state means that the communication channel with Mind API is established, but it is lagging behind: not
all video and audio which should have been transmitted over the channel, are actually transmitted. Any
[participation session](Session.md) which has gone into the `LAGGING` state, immediately starts automatic recovering in
order to return to the `NORMAL` state as soon as possible.

## FAILED

The `FAILED` state means that the communication channel with Mind API has failed: none of the video and audio which
should have been transmitted over the channel, are actually transmitted. Any [participation session](Session.md) which
has gone into the `FAILED` state, immediately starts automatic recovering in order to return to the `NORMAL` state as
soon as possible, but for the time of the recovering the participant may become "offline" for the server part of your
application and other participants.
