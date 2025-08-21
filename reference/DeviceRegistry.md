# `class` DeviceRegistry

DeviceRegistry class provides access to all audio and video peripherals of the user's computer. It contains methods for
getting the [list of cameras](#getcameras), the [list of microphones](#getmicrophones), and the [screen](#getscreen)
object (for screen sharing). It also allows [registering a listener](#setlistenerlistener) that will be notified of all
events related to the device registry (e.g. of events related to plugging in and unplugging cameras and microphones).

## getMicrophones()

Returns the list of microphones which are currently plugged in to the computer. If no microphones are plugged in to the
computer, the list will empty. If at least one microphone is plugged in to the computer, the contents of the list will
depend on whether there is permission to access microphones or not: if the permission has been granted, the list will
contain a default microphone and all other microphones, otherwise the list will contain the default microphone only.
The initial list of microphones is discovered during [initialization of the SDK](MindSDK.md#static-initializeoptions),
but since any microphone might be plugged in and unplugged at any moment, DeviceRegistry watches for changes and
updates the list accordingly.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The list of microphones which are currently plugged in to the computer.

## getCameras()

Returns the list of cameras which are currently plugged in to the computer. If no cameras are plugged in to the
computer, the list will empty. If at least one camera is plugged in to the computer, the contents of the list will
depend on whether there is permission to access cameras or not: if the permission has been granted, the list will
contain a default camera and all other cameras, otherwise the list will contain the default camera only. The initial
list of cameras is discovered during [initialization of the SDK](MindSDK.md#static-initializeoptions), but since any
camera might be plugged in and unplugged at any moment, DeviceRegistry watches for changes and updates the list
accordingly.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The list of cameras which are currently plugged in to the computer.

## getScreen()

Returns the screen that can be used for capturing the contents of the entire screen or portion thereof (such as a
window of an application or a tab of the browser) or `null` value if the browser does not support screen capturing.

**Returns:**

&nbsp;&nbsp;&nbsp;&nbsp;The screen or `null` value if the browser doesn't support screen capturing.

## setListener(listener)

Sets the listener which should be notified of all events related to the device registry. The `null` value can be used
to remove the previously set listener.

**Parameters:**

&nbsp;&nbsp;&nbsp;&nbsp;consumer – The device registry listener or `null` value if the previously set listener should
                                   be removed.
