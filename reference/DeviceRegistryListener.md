# `interface` DeviceRegistryListener

DeviceRegistryListener [can be used](DeviceRegistry#setlistenerlistener) for getting notifications
of all events related to the [DeviceRegistry](DeviceRegistry). For example, if a camera or a microphone is plugged in
to or unplugged from the user's computer, then [onDeviceRegistryChanged](#ondeviceregistrychanged) method of the
listener would be called.

## onDeviceRegistryChanged()

This method is called when the [list of plugged in microphones](DeviceRegistry#getmicrophones) or the
[list of plugged in cameras](DeviceRegistry#getcameras) is changed, i.e. it is called when a camera or a
microphone is plugged in to or unplugged from the user's computer.