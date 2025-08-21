import {Me} from "./Me";
import {MediaStream} from "./MediaStream";
import {Participant} from "./Participant";
import {Session} from "./Session";

/**
 * Conference class is used for representing a conferences from point of view of the {@link Me local participant}. You
 * can get a representation of the conference with {@link Session#getConference getConference} method of {@link Session}
 * class. Conference class contains methods for getting and setting parameters of the conference, for
 * {@link Conference#startRecording starting} and {@link Conference#stopRecording stopping} conference recording, for
 * getting {@link Conference#getMe local} and {@link Conference#getParticipants remote} participants, and for getting
 * {@link Conference#getMediaStream conference media stream}:
 *
 * ```
 * let conference = session.getConference();
 * let conferenceStream = conference.getMediaStream();
 * let conferenceVideo = document.getElementById("conferenceVideo");
 * conferenceVideo.mediaStream = conferenceStream;
 * ```
 */
export class Conference {

    /**
     * @package
     */
    static fromDTO(session, dto) {
        let participantDTOs = dto.participants;
        let me = Me.fromDTO(session, participantDTOs[0]);
        let participants = [];
        for (let i = 1; i < participantDTOs.length; i++) {
            let participantDTO = participantDTOs[i];
            if (participantDTO.online) {
                let participant = Participant.fromDTO(session, participantDTO);
                participants.push(participant);
            }
        }
        return new Conference(session, dto.id, dto.name, dto.layout, dto.recording.started, me, participants);
    }

    /**
     * @private
     */
    constructor(session, id, name, layout, recordingStarted, me, participants) {
        this.session = session;
        this.id = id;
        this.name = name;
        this.layout = layout;
        this.recordingStarted = recordingStarted;
        this.me = me;
        this.participants = participants;
        this.mediaStream = new MediaStream("conference", session.getWebRtcConnection(), session.getWebRtcConnection());
        this.index = new Map();
        this.index.set(me.getId(), me);
        for (let participant of participants) {
            this.index.set(participant.getId(), participant);
        }
    }

    /**
     * Returns the ID of the conference. The ID is unique and never changes.
     *
     * @returns {String} The ID of the conference.
     */
    getId() {
        return this.id;
    }

    /**
     * Returns the current name of the conference. The name of the conference can be shown above the video in the
     * conference media stream and recording.
     *
     * @returns {String} The current name of the conference.
     */
    getName() {
        return this.name;
    }

    /**
     * Changes the name of the conference. The name of the conference can be shown above the video in the conference
     * media stream and recording. The name changing is an asynchronous operation, that's why this method returns a
     * `Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error` (if the
     * operation fails). The operation can succeed only if the {@link Me local participant} plays a role of a
     * {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {String} name The new name for the conference.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    setName(name) {
        let requestDTO = { name: name };
        return this.session.newHttpPatch("/", requestDTO).then((responseDTO) => {
            this.name = responseDTO.name;
        });
    }

    /**
     * Returns the current {@link ConferenceLayout layout} of the conference. The layout determines arrangement of
     * videos in {@link Conference#getMediaStream conference media stream} which the participants receive, and
     * {@link Conference#getRecordingURL recording}.
     *
     * @returns {ConferenceLayout} The current layout of the conference.
     */
    getLayout() {
        return this.layout;
    }

    /**
     * Returns the {@link Me local participant}.
     *
     * @returns {Me} The local participant.
     */
    getMe() {
        return this.me;
    }

    /**
     * Returns the list of all online {@link Participant remote participants}.
     *
     * @returns {Participant[]} The list of all online remote participants.
     */
    getParticipants() {
        return this.participants;
    }

    /**
     * Returns {@link Participant remote participant} with the specified ID or `null` value, if it doesn't exist or
     * if it is offline.
     *
     * @returns {Participant|null} The remote participant or `null` value, if it doesn't exist or if it is offline.
     */
    getParticipantById(id) {
        return this.index.get(id);
    }

    /**
     * Checks whether the conference is being recorded or not.
     *
     * @returns {Boolean} The boolean value which indicates if the conference is being recorded or not.
     */
    isRecording() {
        return this.recordingStarted;
    }

    /**
     * Starts recording of the conference. This is an asynchronous operation, that's why this method returns a
     * `Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error` (if the
     * operation fails). The operation can succeed only if the {@link Me local participant} plays a role of a
     * {@link ParticipantRole.MODERATOR moderator}.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    startRecording() {
        let requestDTO = {};
        return this.session.newHttpPost("/recording/start", requestDTO).then((responseDTO) => {
            this.recordingStarted = true;
        });
    }

    /**
     * Stops recording of the conference. This is an asynchronous operation, that's why this method returns a
     * `Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error` (if the
     * operation fails). The operation can succeed only if the {@link Me local participant} plays a role of a
     * {@link ParticipantRole.MODERATOR moderator}.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    stopRecording() {
        let requestDTO = {};
        return this.session.newHttpPost("/recording/stop", requestDTO).then((responseDTO) => {
            this.recordingStarted = false;
        });
    }

    /**
     * Returns a URL for downloading the recording of the conference. The returned URL can be used for downloading only
     * if the {@link Me local participant} plays a role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @returns {String} The URL for downloading the recording of the conference.
     */
    getRecordingURL() {
        return this.session.getRecordingURL();
    }

    /**
     * Returns the {@link MediaStream media stream} of the conference. The returned media stream is a mix of all audios
     * and videos (excluding only audio of the local participant) that participants are streaming at the moment. The
     * videos in the media stream are arranged using {@link Conference#getLayout current layout} of the conference. You
     * can get and play the media stream of the conference at any time.
     *
     * @returns {MediaStream} The media steam of the conference.
     */
    getMediaStream() {
        return this.mediaStream;
    }

    /**
     * @package
     */
    addParticipant(participant) {
        if (!this.index.has(participant.getId()) && this.index.set(participant.getId(), participant)) {
            this.participants.push(participant);
            this.session.fireOnParticipantJoined(participant);
        }
    }

    /**
     * @package
     */
    removeParticipant(participant) {
        if (this.index.delete(participant.getId())) {
            this.participants.splice(this.participants.indexOf(participant), 1);
            this.session.fireOnParticipantExited(participant);
        }
    }

    /**
     * @package
     */
    update(dto) {
        if (this.name !== dto.name) {
            this.name = dto.name;
            this.session.fireOnConferenceNameChanged(this);
        }
        if (this.recordingStarted !== dto.recording.started) {
            this.recordingStarted = dto.recording.started;
            if (this.recordingStarted) {
                this.session.fireOnConferenceRecordingStarted(this);
            } else {
                this.session.fireOnConferenceRecordingStopped(this);
            }
        }
    }

    /**
     * @package
     */
    destroy() {
        this.me.destroy();
        for (let participant of this.participants) {
            participant.destroy();
        }
        this.mediaStream.setAudioSupplier(null);
        this.mediaStream.setVideoSupplier(null);
    }

}
