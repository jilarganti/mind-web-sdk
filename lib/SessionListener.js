import {Conference} from "./Conference";
import {MindSDK} from "./MindSDK";
import {Participant} from "./Participant";
import {ParticipantRole} from "./ParticipantRole";
import {Session} from "./Session";

/**
 * SessionListener {@link Session#setListener can be used} for getting notifications of all events related to the
 * {@link Session}. These include all changes in the {@link Conference conference}, {@link Participant participants}
 * and {@link Me me} made by the server part of your application and remote participants. For example, if one of the
 * remote participants who played a role of a {@link ParticipantRole.MODERATOR moderator} changed the name of the
 * conference, then {@link SessionListener#onConferenceNameChanged onConferenceNameChanged} method of the listener
 * would be called.
 *
 * @interface
 */
export class SessionListener {

    /**
     * This method is called when the state of the session is changed.
     *
     * @param {Session} session The session whose state was changed.
     */
    onSessionStateChanged(session) {
        console.info("Session " + session.getId() + " state changed: " + session.getState());
    }

    /**
     * This method is called when the name of the conference is changed by either the server part of your application
     * or one of the remote participants who plays a role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Conference} conference The conference which name was changed.
     */
    onConferenceNameChanged(conference) {
        console.info("Conference " + conference.getId() + " name changed: " + conference.getName());
    }

    /**
     * This method is called when the recording of the conference is started/resumed by either the server part of your
     * application or one of the remote participants who plays a role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Conference} conference The conference the recording of which was started or resumed.
     */
    onConferenceRecordingStarted(conference) {
        console.info("Conference " + conference.getId() + " recording started");
    }

    /**
     * This method is called when the recording of the conference is paused/stopped by either the server part of your
     * application or one of the remote participants who plays a role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Conference} conference The conference the recording of which was paused or stopped.
     */
    onConferenceRecordingStopped(conference) {
        console.info("Conference " + conference.getId() + " recording stopped");
    }

    /**
     * This method is called when the conference is ended by the server part of your application. By the time of
     * calling the conference object itself and all other objects related to the conference aren't functional (like
     * after a call of {@link MindSDK#exit2 exit} method of {@link MindSDK} class).
     *
     * @param {Conference} conference The conference that was ended.
     */
    onConferenceEnded(conference) {
        console.info("Conference " + conference.getId() + " ended");
    }

    /**
     * This method is called when a remote participant joins the conference.
     *
     * @param {Participant} participant The remote participant who joined the conference.
     */
    onParticipantJoined(participant) {
        console.info("Participant " + participant.getId() + " joined");
    }

    /**
     * This method is called when a remote participant leaves the conference because of his own will or because the
     * server part of your application expelled him.
     *
     * @param {Participant} participant The remote participant who left the conference.
     */
    onParticipantExited(participant) {
        console.info("Participant " + participant.getId() + " exited");
    }

    /**
     * This method is called when the name of a remote participant is changed by the server part of your application or
     * by one of the remote participants who plays a role of a {@link ParticipantRole.MODERATOR moderator} or by the
     * participant himself.
     *
     * @param {Participant} participant The remote participant whose name was changed.
     */
    onParticipantNameChanged(participant) {
        console.info("Participant " + participant.getId() + " name changed: " + participant.getName());
    }

    /**
     * This method is called when the priority of a remote participant is changed by either the server part of your
     * application or one of the remote participants who plays a role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Participant} participant The remote participant whose priority was changed.
     */
    onParticipantPriorityChanged(participant) {
        console.info("Participant " + participant.getId() + " priority changed: " + participant.getPriority());
    }

    /**
     * This method is called when the preferred language of a remote participant is changed by either the server part
     * of your application or one of the remote participants who plays a role of a
     * {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Participant} participant The remote participant whose preferred language was changed.
     */
    onParticipantLanguageChanged(participant) {
        console.info("Participant " + participant.getId() + " language changed: " + participant.getLanguage());
    }

    /**
     * This method is called when the role of a remote participant is changed by either the server part of your
     * application or one of the remote participants who plays a role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Participant} participant The remote participant whose role was changed.
     */
    onParticipantRoleChanged(participant) {
        console.info("Participant " + participant.getId() + " role changed: " + participant.getRole());
    }

    /**
     * This method is called when a remote participant starts or stops streaming his primary audio or/and video.
     *
     * @param {Participant} participant The remote participant who started or stopped streaming his primary audio
     *                                  or/and video.
     */
    onParticipantMediaChanged(participant) {
        console.info("Participant " + participant.getId() + " media changed: " + participant.isStreamingAudio() + ", " + participant.isStreamingVideo());
    }

    /**
     * This method is called when a remote participant starts or stops streaming his secondary audio or/and video.
     *
     * @param {Participant} participant The remote participant who started or stopped streaming his secondary audio
     *                                  or/and video.
     */
    onParticipantSecondaryMediaChanged(participant) {
        console.info("Participant " + participant.getId() + " secondary media changed: " + participant.isStreamingSecondaryAudio() + ", " + participant.isStreamingSecondaryVideo());
    }

    /**
     * This method is called when the local participant is expelled from the conference by the server part of your
     * application. By the time of calling the conference object itself and all other objects related to the conference
     * aren't functional (like after a call of {@link MindSDK#exit2 exit} method of {@link MindSDK} class).
     *
     * @param {Me} me The local participant who was expelled from the conference.
     */
    onMeExpelled(me) {
        console.info("Me " + me.getId() + " expelled");
    }

    /**
     * This method is called when the name of the local participant is changed by either the server part of your
     * application or one of the remote participants who plays a role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Me} me The local participant whose name was changed.
     */
    onMeNameChanged(me) {
        console.info("Me " + me.getId() + " name changed: " + me.getName());
    }

    /**
     * This method is called when the priority of the local participant is changed by either the server part of your
     * application or one of the remote participants who plays a role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Me} me The local participant whose priority was changed.
     */
    onMePriorityChanged(me) {
        console.info("Me " + me.getId() + " priority changed: " + me.getPriority());
    }

    /**
     * This method is called when the preferred language of the local participant is changed by either the server part
     * of your application or one of the remote participants who plays a role of a
     * {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Me} me The local participant whose preferred language was changed.
     */
    onMeLanguageChanged(me) {
        console.info("Me " + me.getId() + " language changed: " + me.getLanguage());
    }

    /**
     * This method is called when the role of the local participant is changed by either the server part of your
     * application or one of the remote participants who plays a role of a {@link ParticipantRole.MODERATOR moderator}.
     *
     * @param {Me} me The local participant whose role was changed.
     */
    onMeRoleChanged(me) {
        console.info("Me " + me.getId() + " role changed: " + me.getRole());
    }

    /**
     * This method is called when the local participant receives a message from the server part of your application.
     *
     * @param {Me} me The local participant whose received the message.
     * @param {String} message The text of the message.
     */
    onMeReceivedMessageFromApplication(me, message) {
        console.info("Me " + me.getId() + " received message from the application: " + message);
    }

    /**
     * This method is called when the local participant receives a message from a remote participant.
     *
     * @param {Me} me The local participant whose received the message.
     * @param {String} message The text of the message.
     * @param {Participant} participant The remote participant who sent the message.
     */
    onMeReceivedMessageFromParticipant(me, message, participant) {
        console.info("Me " + me.getId() + " received message from participant " + participant.getId() + ": " + message);
    }

}