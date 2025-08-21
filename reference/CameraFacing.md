# `enumeration` CameraFacing

CameraFacing enumerates all available facings for [cameras](Camera.md). The facing is a direction which a camera can be
pointed to. Most cameras can be pointed to only one direction and, therefore, have only one facing. But front and back
cameras on smartphones (and other mobile devices) are usually combined into a single multi-facing camera which is
represented with a single instance of [Camera](Camera.md) class. The facing of any multi-facing camera can be
switched with [setFacing](Camera.md#setfacingfacing) method of [Camera](Camera.md) class.

## USER

The `USER` facing is used for [pointing](Camera.md#setfacingfacing) a multi-facing camera to the user (i.e. for
switching to the front camera on a smartphone or other mobile device).

## ENVIRONMENT

The `ENVIRONMENT` facing is used for [pointing](Camera.md#setfacingfacing) a multi-facing camera to the environment
(i.e. for switching to the back camera on a smartphone or other mobile device).
