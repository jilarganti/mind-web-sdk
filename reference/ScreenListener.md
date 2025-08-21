# `interface` ScreenListener

ScreenListener [can be used](Screen.md#setlistenerlistener) for getting notifications of all events related to the
[Screen](Screen.md). For example, if the screen has been acquired and the user clicked "Stop sharing" button in Chrome
or revoked permission to "Share the Screen" in Firefox, then [onScreenReleasedForcibly](#onscreenreleasedforcibly)
method of the listener would be called.

## onScreenReleasedForcibly()

This method is called when the acquired screen is released forcibly. For example, this would happen if the user clicked
"Stop sharing" button in Chrome or revoked permission to "Share the Screen" in Firefox.
