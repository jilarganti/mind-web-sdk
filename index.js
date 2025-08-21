import {CameraFacing} from "./lib/CameraFacing";
import {CameraListener} from "./lib/CameraListener";
import {ConferenceLayout} from "./lib/ConferenceLayout";
import {DeviceRegistryListener} from "./lib/DeviceRegistryListener";
import {MicrophoneListener} from "./lib/MicrophoneListener";
import {MindSDK} from "./lib/MindSDK";
import {MindSDKOptions} from "./lib/MindSDKOptions";
import {ParticipantLanguage} from "./lib/ParticipantLanguage";
import {ParticipantRole} from "./lib/ParticipantRole";
import {ScreenListener} from "./lib/ScreenListener";
import {SessionListener} from "./lib/SessionListener";
import {SessionOptions} from "./lib/SessionOptions";
import {SessionState} from "./lib/SessionState";

import "./lib/Audio";
import "./lib/Video";

export {CameraFacing, CameraListener, ConferenceLayout, DeviceRegistryListener, MicrophoneListener, MindSDK, MindSDKOptions, ParticipantLanguage, ParticipantRole, ScreenListener, SessionListener, SessionOptions, SessionState};

export default {
    initialize: MindSDK.initialize,
    getDeviceRegistry: MindSDK.getDeviceRegistry,
    getMicrophones: MindSDK.getMicrophones,
    getCameras: MindSDK.getCameras,
    getScreen: MindSDK.getScreen,
    createMediaStream: MindSDK.createMediaStream,
    join: MindSDK.join,
    join2: MindSDK.join2,
    exit2: MindSDK.exit2,
    CameraFacing: CameraFacing,
    CameraListener: CameraListener,
    ConferenceLayout: ConferenceLayout,
    DeviceRegistryListener: DeviceRegistryListener,
    MicrophoneListener: MicrophoneListener,
    MindSDKOptions: MindSDKOptions,
    ParticipantLanguage: ParticipantLanguage,
    ParticipantRole: ParticipantRole,
    ScreenListener: ScreenListener,
    SessionListener: SessionListener,
    SessionOptions: SessionOptions,
    SessionState: SessionState
}
