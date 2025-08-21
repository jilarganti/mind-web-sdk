# `interface` CameraListener

CameraListener [can be used](Camera.md#setlistenerlistener) for getting notifications of all events related to the
[Camera](Camera.md). For example, if the camera has been acquired and the user unplugged it or revoked permission to
"Use the Camera" in Firefox, then [onCameraReleasedForcibly](#oncamerareleasedforciblycamera) method of the listener
would be called.

## onCameraReleasedForcibly(camera)

This method is called when the acquired camera is released forcibly. For example, this would happen if the user
unplugged the camera or revoked permission to "Use the Camera" in Firefox.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;camera – The camera which was released forcibly.
