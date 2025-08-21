import {Session} from "./Session";

/**
 * SessionState enumerates all available states that a {@link Session participation session} can be in. At any given
 * moment the participation session can be in one of three states: {@link #NORMAL NORMAL}, {@link #LAGGING LAGGING} or
 * {@link #FAILED FAILED}. The current state of the participation session can be got with
 * {@link Session#getState() getState} method of {@link Session} class. The
 * {@link SessionListener#onSessionStateChanged(Session) onSessionStateChanged} method of the
 * {@link SessionListener session listener} is called whenever the state of the participation session changes.
 *
 * @readonly
 * @enum {SessionState}
 */
const SessionState = {

    /**
     * The `NORMAL` state means that the communication channel with Mind API is established, and it is operating
     * normally: all video and audio which should have been transmitted over the channel are actually transmitted.
     */
    NORMAL: "normal",

    /**
     * The `LAGGING` state means that the communication channel with Mind API is established, but it is lagging behind:
     * not all video and audio which should have been transmitted over the channel, are actually transmitted. Any
     * {@link Session participation session} which has gone into the `LAGGING` state, immediately starts automatic
     * recovering in order to return to the `NORMAL` state as soon as possible.
     */
    LAGGING: "lagging",

    /**
     * The `FAILED` state means that the communication channel with Mind API has failed: none of the video and audio
     * which should have been transmitted over the channel, are actually transmitted. Any {@link Session participation
     * session} which has gone into the `FAILED` state, immediately starts automatic recovering in order to return to
     * the `NORMAL` state as soon as possible, but for the time of the recovering the participant may become "offline"
     * for the server part of your application and other participants.
     */
    FAILED: "failed"

};

export { SessionState };