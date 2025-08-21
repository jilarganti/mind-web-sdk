# `class` MediaStream

MediaStream class is used for representing audio/video content which participants can send and receive. Unlike the
standard [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) it can contain one audio and one
video only. There are two types of media streams: local and remote. The distinction is nominal — still there is only
one class to represent both of them.

Local media streams are created explicitly with a help of
[createMediaStream](MindSDK.md#static-createmediastreamaudiosupplier-videosupplier) method of [MindSDK](MindSDK.md)
class. They can contain audio/video from local suppliers only (such as [Microphone](Microphone), [Camera](Camera)
and [Screen](Screen)). Local media streams are intended to be
[streamed on behalf of the local participant](Me.md#setmediastreamstream) only.

Remote media streams contain audio/video of remote participants or the conference. The primary and the secondary media
streams of any remote participant can be got with help of [getMediaStream](Participant.md#getmediastream) or
[getSecondaryMediaStream](Participant.md#getsecondarymediastream) methods of [Participant](Participant.md) class,
respectively. The media stream of the conference can be got with [getMediaStream](Conference.md#getmediastream) method
 of [Conference](Conference.md) class.

Any media stream can be played with `<video/>` or `<audio/>` HTML elements — just assign the stream to `mediaStream`
property which Mind Web SDK adds to prototypes of HTMLVideoElement and HTMLAudioElement automatically. Keep in mind
that `<video/>` tries to play (tries to consume) audio and video of the media stream, whereas `<audio/>` tries to play
(tries to consume) audio only of the media stream. This means that if you want to play only audio of a remote media
stream, it is better to play it with `<audio/>` instead of playing it with invisible `<video/>` because the latter will
force underlying WebRTC connection to receive and decode both audio and video.

```javascript
let myVideo = document.getElementById("myVideo");
let mySecondaryStream = document.getElementById("mySecondaryVideo");
let participantVideo = document.getElementById("participantVideo");

let me = conference.getMe();

// We assume that microphone and camera have been already acquired or will be acquired later
let myStream = MindSDK.createMediaStream(microphone, camera);
me.setMediaStream(myStream);
myVideo.mediaStream = myStream;

// We assume that screen has been already acquired or will be acquired later
let mySecondaryStream = MindSDK.createMediaStream(null, screen);
me.setSecondaryMediaStream(mySecondaryStream);
mySecondaryVideo.mediaStream = mySecondaryStream;

let participant = conference.getParticipantById("<PARTICIPANT_ID>");
if (participant) {
    participantVideo.mediaStream = participant.getMediaStream();
}

...

let conferenceAudio = document.createElement("audio");
conferenceAudio.mediaStream = conference.getMediaStream();
document.body.append(conferenceAudio);
```

## getMaxVideoFrameArea()

Returns the current maximum video frame area of the media stream. The maximum video frame area of the media stream is a
product of the width and height which the video should not exceed while being transmitting over the network.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current maximum video frame area of the media stream.

## setMaxVideoFrameArea(maxVideoFrameArea)

Sets the maximum video frame area of the media stream. The maximum video frame area of the media stream is a product of
the width and height which the video should not exceed while being transmitting over the network. This method can be
used for limiting the video frame area of any media stream, but the limiting effect depends on the type of the media
stream: setting the maximum video frame area for a local media stream (the video of which usually consist of multiple
encodings) leads to filtering out from the transmission all the encodings with the higher video frame areas; setting
the maximum video frame area for a remote media stream (the video of which always consists of only one encoding) leads
to decreasing the frame area of the transmitted video to make it fit into the limit. Though this method cannot be used
for stopping the transmission of the stream's video completely — if the limit cannot be satisfied, the encoding with
the lowest video frame area will be transmitted anyway. By default, the maximum video frame area of any media stream is
unlimited.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;maxVideoFrameArea – The maximum video frame area of the media stream.

## getMaxVideoFrameRate()

Returns the current maximum video frame rate of the media stream. The maximum video frame rate of the media stream is a
frame rate which the video should not exceed while being transmitting over the network.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current maximum video frame rate of the media stream.

## setMaxVideoFrameRate(maxVideoFrameRate)

Sets the maximum video frame rate of the media stream. The maximum video frame rate of the media stream is a frame rate
which the video should not exceed while being transmitting over the network. This method can be used for limiting the
video frame rate of any media stream, but the limiting effect depends on the type of the media stream: setting the
maximum video frame rate for a local media stream (the video of which usually consist of multiple encodings) leads to
filtering out from the transmission all the encodings with the higher video frame rates; setting the maximum video
frame rate for a remote media stream (the video of which always consists of only one encoding) leads to decreasing the
frame rate of the transmitted video to make it fit into the limit. Though this method cannot be used for stopping the
transmission of the stream's video completely — if the limit cannot be satisfied, the encoding with the lowest video
frame rate will be transmitted anyway. By default, the maximum video frame rate of any media stream is unlimited.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;maxVideoFrameRate – The maximum video frame rate of the media stream.

## getMaxVideoBitrate()

Returns the current maximum video bitrate of the media stream. The maximum video bitrate of the media stream is a
number of bits which each second of stream's video should not exceed while being transmitting over the network.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The current maximum video bitrate of the media stream.

## setMaxVideoBitrate(maxVideoBitrate)

Sets the maximum video bitrate of the media stream. The maximum video bitrate of the media stream is a number of bits
which each second of stream's video should not exceed while being transmitting over the network. This method can be
used for limiting the maximum video bitrate of any media stream, but the limiting effect depends on the type of the
media stream: setting the maximum video bitrate for a local media stream (the video of which usually consist of
multiple encodings) leads to filtering out (from the transmission) all the encodings which do not fit into the limit
(starting from the most voluminous one); setting the maximum video bitrate for a remote media stream (the video of
which always consists of only one encoding) leads to decreasing the maximum quality of the transmitted video to make it
fit into the limit. Though, this method cannot be used for stopping the transmission of the stream's video completely —
if the limit cannot be satisfied, the video in the least voluminous encoding (in case of local stream) or with the
poorest quality (in case of remote stream) will be transmitted anyway. By default, the maximum video bitrate of any
media stream is unlimited.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;maxVideoBitrate – The maximum video bitrate of the media stream.

## getAudioStatistics()

Returns the latest [audio statistics](MediaStreamAudioStatistics.md) of the media stream. The statistics consists of
instant measures of the network connection which is currently used for transmitting the audio of the media stream.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The latest audio statistics of the media stream.

## getVideoStatistics()

Returns the latest [video statistics](MediaStreamVideoStatistics.md) of the media stream. The statistics consists of
instant measures of the network connection which is currently used for transmitting the video of the media stream.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The latest video statistics of the media stream.
