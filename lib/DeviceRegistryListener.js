import {DeviceRegistry} from "./DeviceRegistry";

/**
 * DeviceRegistryListener {@link DeviceRegistry#setListener can be used} for getting notifications of all events
 * related to the {@link DeviceRegistry}. For example, if a camera or a microphone is plugged in to or unplugged from
 * the user's computer, then {@link DeviceRegistryListener#onDeviceRegistryChanged onDeviceRegistryChanged} method of
 * the listener would be called.
 *
 * @interface
 */
export class DeviceRegistryListener {

    /**
     * This method is called when the {@link DeviceRegistry#getMicrophones list of plugged in microphones} or the
     * {@link DeviceRegistry#getCameras list of plugged in cameras} is changed, i.e. it is called when a camera or a
     * microphone is plugged in to or unplugged from the user's computer.
     */
    onDeviceRegistryChanged() {}

}