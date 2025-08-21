# `class` MediaStreamVideoStatistics

MediaStreamVideoStatistics class is used for representing video statistics of a [media stream](MediaStream.md). The
statistics consists of instant measures of the network connection which is currently used for transmitting the video.
If no video is transmitted at the moment or if the media stream does not have a video at all or yet, the values of all
measures are reset to zeros, otherwise the values of all measures are updated about once a second. You can always get
the latest video statistics for any media stream with a help of [getVideoStatistics](MediaStream.md#getvideostatistics)
method:

```javascript
// We assume that microphone and camera have been already acquired
let myStream = MindSDK.createMediaStream(microphone, camera);
me.setMediaStream(myStream);
let myStreamVideoStatistics = myStream.getVideoStatistics();

...

let participantVideo = document.getElementById("participantVideo");
let participant = conference.getParticipantById("<PARTICIPANT_ID>");
if (participant != null) {
    let participantStream = participant.getMediaStream();
    participantVideo.setMediaStream(participantStream);
    let participantStreamVideoStatistics = participantStream.getVideoStatistics();
}

...

let conferenceVideo = document.getElementById("conferenceVideo");
let conferenceStream = conference.getMediaStream();
conferenceVideo.setMediaStream(conferenceStream);
let conferenceStreamVideoStatistics = conferenceStream.getVideoStatistics();
```

## getTimestamp()

Returns the creation timestamp of the statistics. The creation timestamp of the statistics is the number of
milliseconds that have elapsed between 1 January 1970 00:00:00 UTC and the time at which the statistics was created.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The creation timestamp of the statistics.

## getRtt()

Returns the instant round-trip time of the video transmission. The instant round-trip time of the video transmission is
an average sum of transmission delays (in milliseconds) of the network connection in both directions (from the browser
to Mind API and vice versa) during the latest observed second.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant round-trip time of the video transmission.

## getBitrate()

Returns the instant bitrate of the video transmission. The instant bitrate of the video transmission is a size (in
bits) of all video packets that have been transmitted over the network connection during the latest observed second.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant bitrate of the video transmission.

## getDelay()

Returns the instant delay of the video transmission. The instant delay of the video transmission is an average number
of milliseconds that video frames have spent buffered locally (on the browser) during the latest observed second before
(in case of sending a local media stream) or after (in case of receiving a remote media stream) being transmitted over
the network connection.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant delay of the video transmission.

## getLosses()

Returns the instant loss rate of the video transmission. The instant loss rate of the video transmission is a
percentage (i.e. an integer between 0 and 100 inclusively) of video packets that have been sent over the network
connection during the latest observed second but have not been received (i.e. have been lost).

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant loss rate of the video transmission.

## getWidth()

Returns the instant frame width of the video transmission. The instant frame width of the video transmission is a width
(in pixels) of the last frame that have been successfully transmitted over the network connection during the latest
observed second.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant frame width of the video transmission.

## getHeight()

Returns the instant frame height of the video transmission. The instant frame height of the video transmission is a
height (in pixels) of the last frame that have been successfully transmitted over the network connection during the
latest observed second.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant frame height of the video transmission.

## getRate()

Returns the instant frame rate of the video transmission. The instant frame rate of the video transmission is a number
of video frames that have been successfully transmitted over the network connection during the latest observed second.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant frame rate of the video transmission.
