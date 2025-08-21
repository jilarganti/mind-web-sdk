# `class` Session

Session class is used for representing a participation session of the [local participant](Me.md). You can get a
representation of the participation session only as a result of [joining](MindSDK.md#static-joinuri-token-options) a
conference on behalf of one of the participants. It stays valid till you leave the conference in one of three ways:
[exit the conference at your own will](MindSDK.md#static-exit2session), [being expelled from the
conference](SessionListener.md#onmeexpelledme) or [witness the end of the
conference](SessionListener.md#onconferenceendedconference). Session class contains methods for getting
[state](#getstate) and [statistics](#getstatistics) of the participation session, and a method for getting the
[conference](#getconference) which the [local participant](Me.md) is participating in:

```javascript
let conferenceURI = "https://api.mind.com/<APPLICATION_ID>/<CONFERENCE_ID>";
let participantToken = "<PARTICIPANT_TOKEN>";
let options = new MindSDK.SessionOptions();
MindSDK.join(conferenceURI, participantToken, options).then(function(session) {
    let sessionListener = new MindSDK.SessionListener();
    session.setListener(sessionListener);
    let conference = session.getConference();
...
});
```

## getId()

Returns the ID of the session. The ID is unique and never changes.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The ID of the session.

## getState()

Returns the current [state](SessionState.md) of the session.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current state of the session.

## getStatistics()

Returns the latest [statistics](SessionStatistics.md) of the session. The statistics consists of instant measures of
the underlying network connection of the session.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The latest statistics of the session

## getConference()

Returns the [conference](Conference.md).

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The conference.

## setListener(listener)

Sets the listener which should be notified of all events related to the conference session. The listener can be
set at any moment.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;listener – The listener which should be notified of all events related to the conference
                                   session.
