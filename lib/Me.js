import {MediaStream} from "./MediaStream";
import {Participant} from "./Participant";
import {ParticipantLanguage} from "./ParticipantLanguage";
import {ParticipantRole} from "./ParticipantRole";

/**
 * Me class is used for representing participant on behalf of whom web-application is participating in the conference
 * (aka the local participant). All other participants are considered to be remote and represented with
 * {@link Participant} class. You can get a representation of the local participant with {@link Conference#getMe getMe}
 * method of {@link Conference} class. Me is a subclass of {@link Participant} class, so that it inherits all public
 * methods of the superclass and adds methods for setting primary and secondary media streams that should be sent on
 * behalf of the local participant, and for sending messages from the local participant to other participant(s) or to
 * the server part of your application:
 *
 * ```
 * let deviceRegistry = MindSDK.getDeviceRegistry();
 * let microphone = deviceRegistry.getMicrophones()[0];
 * let camera = deviceRegistry.getCameras()[0];
 * let myStream = MindSDK.createMediaStream(microphone, camera);
 * let me = conference.getMe();
 * me.setMediaStream(myStream);
 * Promise.all([ microphone.acquire(), camera.acquire() ]).catch(function(error) {
 *     alert("Can't acquire camera or microphone: " + error);
 * });
 *
 * ....
 *
 * let screen = deviceRegistry.getScreen();
 * if (screen) {
 *     let mySecondaryStream = MindSDK.createMediaStream(screen, screen);
 *     me.setSecondaryMediaStream(mySecondaryStream);
 *     screen.acquire().catch(function(error) {
 *         alert("Can't acquire screen: " + error);
 *     });
 * }
 *
 * ...
 *
 * me.sendMessageToAll("Hello, everybody!");
 * me.sendMessageToApplication("Hello, the server part of the application!");
 * let participant = conference.getParticipantById("<PARTICIPANT_ID>");
 * if (participant) {
 *     me.sendMessageToParticipant("Hello, " + participant.getName(), participant);
 * }
 * ```
 */
export class Me extends Participant {

    /**
     * @package
     */
    static fromDTO(session, dto) {
        return new Me(session, dto.id, dto.name, dto.priority, dto.language, dto.role);
    }

    /**
     * @private
     */
    constructor(session, id, name, priority, language, role) {
        super(session, id, name, priority, language, role, false, false, false, false);
    }

    /**
     * Return the ID of the local participant. The ID is unique and never changes.
     *
     * @returns {String} The ID of the local participant.
     */
    getId() {
        return super.getId();
    }

    /**
     * Returns the current name of the local participant. The name of the local participant can be shown above his
     * video in the conference media stream and recording.
     *
     * @returns {String} The current name of the local participant.
     */
    getName() {
        return super.getName();
    }

    /**
     * Changes the name of the local participant. The name of the local participant can be shown above his video in the
     * conference media stream and recording. The name changing is an asynchronous operation, that's why this method
     * returns a `Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error`
     * (if the operation fails).
     *
     * @param {String} name The new name for the local participant.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    setName(name) {
        return super.setName(name);
    }

    /**
     * Returns the current priority of the local participant. The priority defines a place which local participant
     * takes in conference media stream and recording.
     *
     * @returns {Number} The current priority of the local participant.
     */
    getPriority() {
        return super.getPriority();
    }

    /**
     * Changes the priority of the local participant. The priority defines a place which local participant takes in
     * conference media stream and recording. The priority changing is an asynchronous operation, that's why this
     * method returns a `Promise` that either resolves with no value (if the operation succeeds) or rejects with an
     * `Error (if the operation fails). The operation can succeed only if the {@link Me local participant} plays a
     * role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Number} priority The new priority for the local participant.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    setPriority(priority) {
        return super.setPriority(priority);
    }

    /**
     * Returns the current {@link ParticipantLanguage preferred language} of the local participant. The preferred
     * language is the code of a language that the local participant speaks and prefers to hear from other participants.
     *
     * @returns {ParticipantLanguage} The current preferred language of the local participant.
     */
    getLanguage() {
        return super.getLanguage();
    }

    /**
     * Changes the {@link ParticipantLanguage preferred language} of the local participant. The preferred language is
     * the code of a language that the local participant speaks and prefers to hear from other participants. The
     * preferred language changing is an asynchronous operation, that's why this method returns a `Promise` that either
     * resolves with no value (if the operation succeeds) or rejects with an `Error (if the operation fails). The
     * operation can succeed only if the {@link Me local participant} plays a role of a
     * {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {ParticipantLanguage} language The new preferred language for the local participant.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    setLanguage(language) {
        return super.setLanguage(language);
    }

    /**
     * Returns the current {@link ParticipantRole role} of the local participant. The role defines a set of permissions
     * which the local participant is granted.
     *
     * @returns {ParticipantRole} The current role of the local participant.
     */
    getRole() {
        return super.getRole();
    }

    /**
     * Changes the {@link ParticipantRole role} of the local participant. The role defines a set of permissions which
     * the local participant is granted. The role changing is an asynchronous operation, that's why this method
     * returns a `Promise` that either resolves with no value (if the operation succeeds) or rejects with an `Error (if
     * the operation fails). The operation can succeed only if the {@link Me local participant} plays a role of a
     * {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {ParticipantRole} role The new role for the local participant.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    setRole(role) {
        return super.setRole(role);
    }

    /**
     * Checks whether the local participant is streaming primary audio (i.e. audio taken from his microphone). If both
     * this method and {@link Me#isStreamingVideo isStreamingVideo} return `false` then the participant is not
     * streaming the primary media stream at all.
     *
     * @returns {Boolean} The boolean value which indicates if the local participant is streaming primary audio or not.
     */
    isStreamingAudio() {
        return this.session.getWebRtcConnection().isSendingPrimaryAudio();
    }

    /**
     * Checks whether the local participant is streaming primary video (i.e. video taken from his camera). If both
     * this method and {@link Me#isStreamingAudio isStreamingAudio} return `false` then the participant is not
     * streaming the primary media stream at all.
     *
     * @returns {Boolean} The boolean value which indicates if the local participant is streaming primary video or not.
     */
    isStreamingVideo() {
        return this.session.getWebRtcConnection().isSendingPrimaryVideo();
    }

    /**
     * Returns {@link MediaStream media stream} which is being streamed on behalf of the local participant as the
     * primary media stream or `null` value if the local participant is not streaming the primary media stream at the
     * moment. The primary media stream is intended for streaming video and audio taken from a camera and a microphone
     * of the computer, respectively.
     *
     * @returns {MediaStream|null} The current primary media stream of the local participant.
     */
    getMediaStream() {
        return this.session.getWebRtcConnection().getPrimaryMediaStream();
    }

    /**
     * Sets {@link MediaStream media stream} for streaming on behalf of the local participant as the primary media
     * stream. The primary media stream is intended for streaming video and audio taken from a camera and a microphone
     * of the computer, respectively. If the primary media stream is already being streamed, then it will be replaced
     * with the passed one. Set `null` value to stop streaming the primary media stream on behalf of the local
     * participant.
     *
     * @param {MediaStream|null} stream The new primary media stream of the local participant.
     */
    setMediaStream(stream) {
        this.session.getWebRtcConnection().setPrimaryMediaStream(stream);
    }

    /**
     * Checks whether the local participant is streaming secondary audio (i.e. an arbitrary content with audio). If
     * both this method and {@link Me#isStreamingSecondaryVideo isStreamingSecondaryVideo} return `false` then the
     * participant is not streaming secondary media stream at all.
     *
     * @returns {Boolean} The boolean value which indicates if the local participant is streaming secondary audio or not.
     */
    isStreamingSecondaryAudio() {
        return this.session.getWebRtcConnection().isSendingSecondaryAudio();
    }

    /**
     * Checks whether the local participant is streaming secondary video (i.e. an arbitrary content with video). If
     * both this method and {@link Me#isStreamingSecondaryAudio isStreamingSecondaryAudio} return `false` then the
     * participant is not streaming secondary media stream at all.
     *
     * @returns {Boolean} The boolean value which indicates if the local participant is streaming secondary video or not.
     */
    isStreamingSecondaryVideo() {
        return this.session.getWebRtcConnection().isSendingSecondaryVideo();
    }

    /**
     * Returns {@link MediaStream media stream} which is being streamed on behalf of the local participant as the
     * secondary media stream or `null` value if the local participant is not streaming the secondary media stream at
     * the moment. The secondary media stream is intended for streaming an arbitrary audio/video content, e.g. for
     * sharing a screen of the computer.
     *
     * @returns {MediaStream|null} The current secondary media stream of the local participant.
     */
    getSecondaryMediaStream() {
        return this.session.getWebRtcConnection().getSecondaryMediaStream();
    }

    /**
     * Sets {@link MediaStream media stream} for streaming on behalf of the local participant as the secondary media
     * stream. The secondary media stream is intended for streaming an arbitrary audio/video content, e.g. for sharing
     * a screen of the computer. If the secondary media stream is already being streamed, then it will be replaced with
     * the passed one. Set `null` value to stop streaming the secondary media stream on behalf of the local participant.
     *
     * @param {MediaStream|null} stream The new secondary media stream of the local participant.
     */
    setSecondaryMediaStream(stream) {
        this.session.getWebRtcConnection().setSecondaryMediaStream(stream);
    }

    /**
     * Sends a text message on behalf of the local participant to the server part of your application. The message
     * sending is an asynchronous operation, that's why this method returns a `Promise` that either resolves with no
     * value (if the operation succeeds) or rejects with an `Error (if the operation fails).
     *
     * @param {String} message The text of the message.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    sendMessageToApplication(message) {
        let requestDTO = { sendTo: this.session.getApplicationId(), text: message, persistent: false };
        return this.session.newHttpPost("/messages", requestDTO);
    }

    /**
     * Sends a text message on behalf of the local participant to the specified participant. The message sending is an
     * asynchronous operation, that's why this method returns a `Promise` that either resolves with no value (if the
     * operation succeeds) or rejects with an `Error (if the operation fails).
     *
     * @param {String} message The text of the message.
     * @param {Participant} participant The participant which the message should be sent to.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    sendMessageToParticipant(message, participant) {
        let requestDTO = { sendTo: participant.getId(), text: message, persistent: false };
        return this.session.newHttpPost("/messages", requestDTO);
    }

    /**
     * Sends a text message on behalf of the local participant to all in the conference, i.e. to the server part of
     * your application and to all participants at once. The message sending is an asynchronous operation, that's why
     * this method returns a `Promise` that either resolves with no value (if the operation succeeds) or rejects with
     * an `Error (if the operation fails).
     *
     * @param {String} message The text of the message.
     *
     * @returns {Promise} The promise that either resolves with no value or rejects with an `Error`.
     */
    sendMessageToAll(message) {
        let requestDTO = { sendTo: this.session.getConferenceId(), text: message, persistent: false };
        return this.session.newHttpPost("/messages", requestDTO);
    }

    /**
     * @package
     */
    update(dto) {
        if (this.name !== dto.name) {
            this.name = dto.name;
            this.session.fireOnMeNameChanged(this);
        }
        if (this.priority !== dto.priority) {
            this.priority = dto.priority;
            this.session.fireOnMePriorityChanged(this);
        }
        if (this.language !== dto.language) {
            this.language = dto.language;
            this.session.fireOnMeLanguageChanged(this);
        }
        if (this.role !== dto.role) {
            this.role = dto.role;
            this.session.fireOnMeRoleChanged(this);
        }
    }

    /**
     * @package
     */
    destroy() {
        super.destroy();
    }

}
