/**
 * ParticipantRole enumerates all available roles that can be assigned to participants. The role defines a set of
 * permissions which the assignee is granted. If the local participant is a {@link ParticipantRole.MODERATOR moderator}
 * than you can change the role of the local participant with {@link Me#setRole setRole} and the role of any remote
 * participants with {@link Participant#setRole setRole} method of {@link Participant} class.
 *
 * ```
 * var me = conference.getMe();
 * // Turn all remote participants into SPEAKERs if we are permitted to do so
 * if (me.getRole() === MindSDK.ParticipantRole.MODERATOR) {
 *     for (let participant of conference.getParticipants()) {
 *         participant.setRole(MindSDK.ParticipantRole.SPEAKER);
 *     }
 * }
 * ```
 *
 * @readonly
 * @enum {ParticipantRole}
 */
const ParticipantRole = {

    /**
     * The `ATTENDEE` can join and leave the conference, can change his own name, can send and receive messages, can
     * receive media streams (of the conference and other participants), finally it can stream primary and secondary
     * media streams, but neither of them is mixed into conference media stream and recording.
     */
    ATTENDEE: "attendee",

    /**
     * The `SPEAKER` can do everything the `ATTENDEE` can, and also its primary media stream is mixed into conference
     * media stream and recording.
     */
    SPEAKER: "speaker",

    /**
     * The `PRESENTER` can do everything the `SPEAKER` can, and also its secondary media stream is mixed into
     * conference media stream and recording.
     */
    PRESENTER: "presenter",

    /**
     * The `MODERATOR` can do everything the `PRESENTER` can, and also it can change the name of the conference, can
     * change name and role of any participant, and finally it can start/stop and download recording of the conference.
     */
    MODERATOR: "moderator"

};

export { ParticipantRole };