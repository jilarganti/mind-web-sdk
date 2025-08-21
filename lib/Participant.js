import {MediaStream} from "./MediaStream";
import {ParticipantLanguage} from "./ParticipantLanguage";
import {ParticipantRole} from "./ParticipantRole";

/**
 * Participant class is used for representing remote participants (each instance represents a single remote
 * participants). The participant on behalf of whom web-application is participating in the conference (aka the local
 * participant) is represented with {@link Me} class. You can get representations of all remote participants and a
 * representation of a specific remote participant with {@link Conference#getParticipants getParticipants} and
 * {@link Conference#getParticipantById getParticipantById} methods of {@link Conference} class, respectively.
 * Participant class contains methods for getting and setting parameters of the remote participant and for getting its
 * primary and secondary media streams:
 *
 * ```
 * let participantVideo = document.getElementById("participantVideo");
 * let participantSecondaryVideo = document.getElementById("mySecondaryVideo");
 *
 * let participant = conference.getParticipantById("<PARTICIPANT_ID>");
 *
 * let participantStream = participant.getMediaStream();
 * participantVideo.mediaStream = participantStream;
 *
 * let participantSecondaryStream = participant.getSecondaryMediaStream();
 * participantSecondaryVideo.mediaStream = participantSecondaryStream;
 * ```
 */
export class Participant {

    /**
     * @package
     */
    static fromDTO(session, dto) {
        return new Participant(session, dto.id, dto.name, dto.priority, dto.language, dto.role, dto.media.audio, dto.media.video, dto.secondaryMedia.audio, dto.secondaryMedia.video);
    }

    /**
     * @package
     */
    constructor(session, id, name, priority, language, role, audio, video, secondaryAudio, secondaryVideo) {
        this.session = session;
        this.id = id;
        this.name = name;
        this.priority = priority;
        this.language = language;
        this.role = role;
        this.mediaStream = new MediaStream(id + "#primary", audio ? session.getWebRtcConnection() : null, video ? session.getWebRtcConnection() : null);
        this.secondaryMediaStream = new MediaStream(id + "#secondary", secondaryAudio ? session.getWebRtcConnection() : null, secondaryVideo ? session.getWebRtcConnection() : null);
    }

    /**
     * Return the ID of the remote participant. The ID is unique and never changes.
     *
     * @returns {String} The ID of the remote participant.
     */
    getId() {
        return this.id;
    }

    /**
     * Returns the current name of the remote participant. The name of the remote participant can be shown above his
     * video in the conference media stream and recording.
     *
     * @returns {String} The current name of the remote participant.
     */
    getName() {
        return this.name;
    }

    /**
     * Changes the name of the remote participant. The name of the remote participant can be shown above his video in
     * the conference media stream and recording. The name changing is an asynchronous operation, that's why this
     * method returns a `Promise` that either resolves with no value (if the operation succeeds) or rejects with an
     * `Error` (if the operation fails). The operation can succeed only if the {@link Me local participant} plays a
     * role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {String} name The new name for the remote participant.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    setName(name) {
        let requestDTO = { name: name };
        return this.session.newHttpPatch("/participants/" + this.id, requestDTO).then((responseDTO) => {
            this.name = responseDTO.name;
        });
    }

    /**
     * Returns the current priority of the remote participant. The priority defines a place which remote participant
     * takes in conference media stream and recording.
     *
     * @returns {Number} The current priority of the remote participant.
     */
    getPriority() {
        return this.priority;
    }

    /**
     * Changes the priority of the remote participant. The priority defines a place which remote participant takes in
     * conference media stream and recording. The priority changing is an asynchronous operation, that's why this
     * method returns a `Promise` that either resolves with no value (if the operation succeeds) or rejects with an
     * `Error (if the operation fails). The operation can succeed only if the {@link Me local participant} plays a
     * role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Number} priority The new priority for the remote participant.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    setPriority(priority) {
        let requestDTO = { priority: priority };
        return this.session.newHttpPatch("/participants/" + this.id, requestDTO).then((responseDTO) => {
            this.priority = responseDTO.priority;
        });
    }

    /**
     * Returns the current {@link ParticipantLanguage preferred language} of the remote participant. The preferred
     * language is the code of a language that the remote participant speaks and prefers to hear from other participants.
     *
     * @returns {ParticipantLanguage} The current preferred language of the remote participant.
     */
    getLanguage() {
        return this.language;
    }

    /**
     * Changes the {@link ParticipantLanguage preferred language} of the remote participant. The preferred language is
     * the code of a language that the remote participant speaks and prefers to hear from other participants. The
     * preferred language changing is an asynchronous operation, that's why this method returns a `Promise` that either
     * resolves with no value (if the operation succeeds) or rejects with an `Error (if the operation fails). The
     * operation can succeed only if the {@link Me local participant} plays a role of a
     * {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {ParticipantLanguage} language The new preferred language for the remote participant.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    setLanguage(language) {
        let requestDTO = { language: language };
        return this.session.newHttpPatch("/participants/" + this.id, requestDTO).then((responseDTO) => {
            this.language = responseDTO.language;
        });
    }

    /**
     * Returns the current {@link ParticipantRole role} of the remote participant. The role defines a set of
     * permissions which the remote participant is granted.
     *
     * @returns {ParticipantRole} The current role of the remote participant.
     */
    getRole() {
        return this.role;
    }

    /**
     * Changes the {@link ParticipantRole role} of the remote participant. The role defines a set of permissions which
     * the remote participant is granted. The role changing is an asynchronous operation, that's why this method
     * returns a `Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error
     * (if the operation fails). The operation can succeed only if the {@link Me local participant} plays a role of a
     * {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {ParticipantRole} role The new role for the remote participant.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    setRole(role) {
        let requestDTO = { role: role };
        return this.session.newHttpPatch("/participants/" + this.id, requestDTO).then((responseDTO) => {
            this.role = responseDTO.role;
        });
    }

    /**
     * Checks whether the remote participant is streaming primary audio (i.e. audio taken from his microphone). If both
     * this method and {@link Participant#isStreamingVideo isStreamingVideo} return `false` then the participant is not
     * streaming the primary media stream at all.
     *
     * @returns {Boolean} The boolean value which indicates if the remote participant is streaming primary audio or not.
     */
    isStreamingAudio() {
        return this.mediaStream.hasAudioSupplier();
    }

    /**
     * Checks whether the remote participant is streaming primary video (i.e. video taken from his camera). If both
     * this method and {@link Participant#isStreamingAudio isStreamingAudio} return `false` then the participant is not
     * streaming the primary media stream at all.
     *
     * @returns {Boolean} The boolean value which indicates if the remote participant is streaming primary video or not.
     */
    isStreamingVideo() {
        return this.mediaStream.hasVideoSupplier();
    }

    /**
     * Returns the {@link MediaStream primary media stream} of the remote participant. The primary media stream is
     * intended for streaming video and audio taken from a camera and a microphone of the participant's computer,
     * respectively. You can get and play the primary media stream at any moment regardless of whether the participant
     * is streaming its primary video/audio or not: if the participant started or stopped streaming its primary video
     * or/and audio, the returned media stream would be updated automatically.
     *
     * @returns {MediaStream} The primary media stream of the remote participant.
     */
    getMediaStream() {
        return this.mediaStream;
    }

    /**
     * Checks whether the remote participant is streaming secondary audio (i.e. an arbitrary content with audio). If
     * both this method and {@link Participant#isStreamingSecondaryVideo isStreamingSecondaryVideo} return `false` then
     * the participant is not streaming secondary media stream at all.
     *
     * @returns {Boolean} The boolean value which indicates if the remote participant is streaming secondary audio or not.
     */
    isStreamingSecondaryAudio() {
        return this.secondaryMediaStream.hasAudioSupplier();
    }

    /**
     * Checks whether the remote participant is streaming secondary video (i.e. an arbitrary content with video). If
     * both this method and {@link Participant#isStreamingSecondaryAudio isStreamingSecondaryAudio} return `false` then
     * the participant is not streaming secondary media stream at all.
     *
     * @returns {Boolean} The boolean value which indicates if the remote participant is streaming secondary video or not.
     */
    isStreamingSecondaryVideo() {
        return this.secondaryMediaStream.hasVideoSupplier();
    }

    /**
     * Returns the {@link MediaStream secondary media stream} of the remote participant. The secondary media stream is
     * intended for streaming an arbitrary audio/video content, e.g. for sharing a screen of the participant's computer.
     * You can get and play the secondary media stream at any moment regardless of whether the participant is streaming
     * its secondary video/audio or not: if the participant started or stopped streaming its secondary video or/and
     * audio, the returned media stream would be updated automatically.
     *
     * @returns {MediaStream} The secondary media stream of the remote participant.
     */
    getSecondaryMediaStream() {
        return this.secondaryMediaStream;
    }

    /**
     * @package
     */
    update(dto) {
        if (this.name !== dto.name) {
            this.name = dto.name;
            this.session.fireOnParticipantNameChanged(this);
        }
        if (this.priority !== dto.priority) {
            this.priority = dto.priority;
            this.session.fireOnParticipantPriorityChanged(this);
        }
        if (this.language !== dto.language) {
            this.language = dto.language;
            this.session.fireOnParticipantLanguageChanged(this);
        }
        if (this.role !== dto.role) {
            this.role = dto.role;
            this.session.fireOnParticipantRoleChanged(this);
        }
        if (this.mediaStream.hasAudioSupplier() !== dto.media.audio || this.mediaStream.hasVideoSupplier() !== dto.media.video) {
            this.mediaStream.setAudioSupplier(dto.media.audio ? this.session.getWebRtcConnection() : null);
            this.mediaStream.setVideoSupplier(dto.media.video ? this.session.getWebRtcConnection() : null);
            this.session.fireOnParticipantMediaChanged(this);
        }
        if (this.secondaryMediaStream.hasAudioSupplier() !== dto.secondaryMedia.audio || this.secondaryMediaStream.hasVideoSupplier() !== dto.secondaryMedia.video) {
            this.secondaryMediaStream.setAudioSupplier(dto.secondaryMedia.audio ? this.session.getWebRtcConnection() : null);
            this.secondaryMediaStream.setVideoSupplier(dto.secondaryMedia.video ? this.session.getWebRtcConnection() : null);
            this.session.fireOnParticipantSecondaryMediaChanged(this);
        }
    }

    /**
     * @package
     */
    destroy() {
        this.mediaStream.setAudioSupplier(null);
        this.mediaStream.setVideoSupplier(null);
        this.secondaryMediaStream.setAudioSupplier(null);
        this.secondaryMediaStream.setVideoSupplier(null);
    }

}
