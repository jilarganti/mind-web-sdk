# `class` MediaStreamAudioStatistics

MediaStreamAudioStatistics class is used for representing audio statistics of a [media stream](MediaStream.md). The
statistics consists of instant measures of the network connection which is currently used for transmitting the audio.
If no audio is transmitted at the moment or if the media stream does not have an audio at all or yet, the values of all
measures are reset to zeros, otherwise the values of all measures are updated about once a second. You can always get
the latest audio statistics for any media stream with a help of [getAudioStatistics](MediaStream.md#getaudiostatistics)
method:

```javascript
// We assume that microphone and camera have been already acquired
let myStream = MindSDK.createMediaStream(microphone, camera);
me.setMediaStream(myStream);
let myStreamAudioStatistics = myStream.getAudioStatistics();

...

let participantVideo = document.getElementById("participantVideo");
let participant = conference.getParticipantById("<PARTICIPANT_ID>");
if (participant != null) {
    let participantStream = participant.getMediaStream();
    participantVideo.setMediaStream(participantStream);
    let participantStreamAudioStatistics = participantStream.getAudioStatistics();
}

...

let conferenceVideo = document.getElementById("conferenceVideo");
let conferenceStream = conference.getMediaStream();
conferenceVideo.setMediaStream(conferenceStream);
let conferenceStreamAudioStatistics = conferenceStream.getAudioStatistics();
```

## getTimestamp()

Returns the creation timestamp of the statistics. The creation timestamp of the statistics is the number of
milliseconds that have elapsed between 1 January 1970 00:00:00 UTC and the time at which the statistics was created.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The creation timestamp of the statistics.

## getRtt()

Returns the instant round-trip time of the audio transmission. The instant round-trip time of the audio transmission is
an average sum of transmission delays (in milliseconds) of the network connection in both directions (from the browser
to Mind API and vice versa) during the latest observed second.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant round-trip time of the audio transmission.

## getBitrate()

Returns the instant bitrate of the audio transmission. The instant bitrate of the audio transmission is a size (in
bits) of all audio packets that have been transmitted over the network connection during the latest observed second.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant bitrate of the audio transmission.

## getDelay()

Returns the instant delay of the audio transmission. The instant delay of the audio transmission is an average number
of milliseconds that audio samples have spent buffered locally (on the browser) during the latest observed second
before (in case of sending a local media stream) or after (in case of receiving a remote media stream) being
transmitted over the network connection.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant delay of the audio transmission.

## getLosses()

Returns the instant loss rate of the audio transmission. The instant loss rate of the audio transmission is a
percentage (i.e. an integer between 0 and 100 inclusively) of audio packets that have been sent over the network
connection during the latest observed second but have not been received (i.e. have been lost).

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant loss rate of the audio transmission.

## getLevel()

Returns the instant volume level of the audio transmission. The instant volume level of the audio transmission is an
average volume of samples that have been transmitted over the network connection during the latest observed second. The
volume is an integer between 0 and 100 inclusively, where 0 represents silence, 100 represents 0 dBov (maximum volume),
and 50 represents approximately 6 dB of sound pressure level change in the sound pressure level from 0 dBov.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant volume level of the audio transmission.

## getRate()

Returns the instant sample rate of the audio transmission. The instant sample rate of the audio transmission is a
number of audio samples that have been successfully transmitted over the network connection during the latest observed
second.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The instant sample rate of the audio transmission.
