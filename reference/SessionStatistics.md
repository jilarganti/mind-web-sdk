# `class` SessionStatistics

SessionStatistics class is used for representing statistics of a [participation session](Session.md). The statistics
consists of instant measures of the underlying network connection of the session. The values of all measures are
updated about once a second. You can always get the latest statistics with a help of
[getStatistics](Session.md#getstatistics) method of [Session](Session.md) class:

```javascript
let conferenceURI = "https://api.mind.com/<APPLICATION_ID>/<CONFERENCE_ID>";
let participantToken = "<PARTICIPANT_TOKEN>";
let options = new MindSDK.SessionOptions();
MindSDK.join(conferenceURI, participantToken, options).then(function(session) {
    let sessionStatistics = session.getStatistics();
});
```

## getTimestamp()

Returns the creation timestamp of the statistics. The creation timestamp of the statistics is the number of
milliseconds that have elapsed between 1 January 1970 00:00:00 UTC and the time at which the statistics was created.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The creation timestamp of the statistics.

## getProtocol()

Returns the protocol of the session. The protocol of the session is a protocol which currently is used for transmitting
data of the session over the network. There are two possible values for the protocol: "udp" and "tcp".

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The protocol of the session.

## getLocalAddress()

Returns the local address of the session. The local address of the session is an IP address or a FQDN of the client
(Mind Web SDK) which currently is used for transmitting data of the session over the network.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The local address of the session.

## getLocalPort()

Returns the local port of the session. The local port of the session is a port number on the client (Mind Web SDK)
which currently is used for transmitting data of the session over the network.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The local port of the session.

## getRemoteAddress()

Returns the remote address of the session. The remote address of the session is an IP address or a FQDN of the server
(Mind API) which currently is used for transmitting data of the session over the network.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The remote address of the session.

## getRemotePort()

Returns the remote port of the session. The remote port of the session is a port number on the server (Mind API) which
currently is used for transmitting data of the session over the network.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The remote port of the session.
