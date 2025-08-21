# `interface` MicrophoneListener

MicrophoneListener [can be used](Microphone.md#setlistenerlistener) for getting notifications of all events related to
the [Microphone](Microphone.md). For example, if the microphone has been acquired and the user unplugged it or revoked
permission to "Use the Microphone" in Firefox, then
[onMicrophoneReleasedForcibly](#onmicrophonereleasedforciblymicrophone) method of the listener would be called.

## onMicrophoneReleasedForcibly(microphone)

This method is called when the acquired microphone is released forcibly. For example, this would happen if the user
unplugged the microphone or revoked permission to "Use the Microphone" in Firefox.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;camera – The microphone which was released forcibly.
