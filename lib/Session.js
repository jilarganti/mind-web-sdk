import {Conference} from "./Conference";
import {MindSDK} from "./MindSDK";
import {Participant} from "./Participant";
import {SessionListener} from "./SessionListener";
import {SessionOptions} from "./SessionOptions";
import {SessionState} from "./SessionState";
import {SessionStatistics} from "./SessionStatistics";
import {WebRtcConnection} from "./WebRtcConnection";
import packageJson from "../package.json";

const HTTP_CONNECTION_TIMEOUT_SECONDS = 10;

/**
 * Session class is used for representing a participation session of the {@link Me local participant}. You can get a
 * representation of the participation session only as a result of {@link MindSDK.join joining} a conference on behalf
 * of one of the participants. It stays valid till you leave the conference in one of three ways:
 * {@link MindSDK.exit2 exit the conference at your own will},
 * {@link SessionListener#onMeExpelled being expelled from the conference} or
 * {@link SessionListener#onConferenceEnded witness the end of the conference}. Session class contains methods for
 * getting {@link #getState() state} and {@link #getStatistics() statistics} of the participation session, and a method
 * for getting the {@link #getConference() conference} which the {@link Me local participant} is participating in:
 *
 * ```
 * let conferenceURI = "https://api.mind.com/<APPLICATION_ID>/<CONFERENCE_ID>";
 * let participantToken = "<PARTICIPANT_TOKEN>";
 * let options = new MindSDK.SessionOptions();
 * MindSDK.join(conferenceURI, participantToken, options).then(function(session) {
 *     let sessionListener = new MindSDK.SessionListener();
 *     session.setListener(sessionListener);
 *     let conference = session.getConference();
 *     ...
 * });
 * ```
 */
export class Session {

    static LAST_SESSION_ID = 0;

    /**
     * @package
     */
    constructor(uri, token, listener, options) {
        Session.LAST_SESSION_ID += 1;
        this.id = Session.LAST_SESSION_ID;
        this.uri = uri.replace(/\/+$/, "");
        this.token = token;
        this.listener = listener;
        this.options = new SessionOptions(options);
        this.state = SessionState.NORMAL;
        this.wrc = null;
        this.recoveryDelay = 0;
        this.recoveryTimeoutId = null;
        this.conference = null;
        this.notifications = [];
        this.statistics = new SessionStatistics("none", "none", 0, "none", 0);
    }

    /**
     * Returns the ID of the session. The ID is unique and never changes.
     *
     * @returns {Number} The ID of the session.
     */
    getId() {
        return this.id;
    }

    /**
     * Returns the current {@link SessionState state} of the session.
     *
     * @returns {SessionState} The current state of the session.
     */
    getState() {
        return this.state;
    }

    /**
     * Returns the latest {@link SessionStatistics statistics} of the session. The statistics consists of instant
     * measures of the underlying network connection of the session.
     *
     * @returns {SessionStatistics} The latest statistics of the session.
     */
    getStatistics() {
        return this.statistics;
    }

    /**
     * Returns the {@link Conference conference}.
     *
     * @returns {Conference} The conference.
     */
    getConference() {
        return this.conference;
    }

    /**
     * Sets the listener which should be notified of all events related to the conference session. The listener can be
     * set at any moment.
     *
     * @param {SessionListener} listener The listener which should be notified of all events related to the conference
     *                                   session.
     */
    setListener(listener) {
        this.listener = listener;
    }

    /**
     * @package
     */
    getApplicationId() {
        return this.uri.split("/")[3];
    }

    /**
     * @package
     */
    getConferenceId() {
        return this.uri.split("/")[4];
    }

    /**
     * @package
     */
    getRecordingURL() {
        return this.uri + "/recording?access_token=" + this.token;
    }

    /**
     * @package
     */
    getOptions() {
        return this.options;
    }

    /**
     * @package
     */
    getWebRtcConnection() {
        return this.wrc;
    }

    /**
     * @package
     */
    open() {
        return new Promise((resolve, reject) => {
            let recover = (error) => {
                this.setState(SessionState.FAILED);
                if (this.conference != null) {
                    console.warn("Conference session will be reopened in " + this.recoveryDelay + " seconds after a failure:", error);
                    this.notifications = [];
                    this.recoveryTimeoutId = setTimeout(() => this.wrc.open(), this.recoveryDelay * 1000);
                    this.recoveryDelay = Math.min(this.recoveryDelay + 1, 10);
                } else {
                    reject(error);
                }
            };
            this.wrc = new WebRtcConnection(this);
            this.wrc.onOpened = () => {
                this.newHttpGet("/?detailed=true").then((responseDTO) => {
                    if (this.conference == null) {
                        this.conference = Conference.fromDTO(this, responseDTO);
                        resolve(this);
                    } else {
                        this.updateEntireModel(responseDTO);
                    }
                    this.processNotifications();
                    this.recoveryDelay = 0;
                    this.setState(SessionState.NORMAL);
                }).catch((error) => {
                    recover(error);
                });
            };
            this.wrc.onStartedLagging = () => {
                this.setState(SessionState.LAGGING);
            };
            this.wrc.onStoppedLagging = () => {
                this.setState(SessionState.NORMAL);
            };
            this.wrc.onMessageReceived = (notification) => {
                this.notifications.push(notification);
                if (this.conference != null) {
                    this.processNotifications();
                }
            };
            this.wrc.onFailed = (error) => {
                recover(error);
            };
            this.wrc.onClosed = (code) => {
                switch (code) {
                    case 4000:
                        this.notifications.push("{\"type\":\"deleted\",\"location\":\"/\"}");
                        if (this.conference != null) {
                            this.processNotifications();
                        }
                        break;
                    case 4001:
                        this.notifications.push("{\"type\":\"deleted\",\"location\":\"/participants/me\"}"); // FIXME: We have to use `me` alias here because we can be expelled from the conference before joining is completed (i.e. before the actual ID of `me` is known)
                        if (this.conference != null) {
                            this.processNotifications();
                        }
                        break;
                    default:
                        recover(new Error("WebRTC connection closed: " + code));
                }
            };
            this.wrc.open();
        });
    }

    /**
     * @package
     */
    close() {
        this.statistics = new SessionStatistics("none", "none", 0, "none", 0);
        if (this.recoveryTimeoutId) {
            clearTimeout(this.recoveryTimeoutId);
            this.recoveryTimeoutId = null;
        }
        if (this.conference) {
            this.conference.destroy();
            this.conference = null;
        }
        if (this.wrc) {
            this.wrc.close();
            this.wrc = null;
        }
    }

    /**
     * @package
     */
    newHttpGet(relativeURI, cancellation) {
        return this.newHttpRequest("GET", this.uri + relativeURI, null, cancellation);
    }

    /**
     * @package
     */
    newHttpPost(relativeURI, dto, cancellation) {
        return this.newHttpRequest("POST", this.uri + relativeURI, dto, cancellation);
    }

    /**
     * @package
     */
    newHttpPatch(relativeURI, dto, cancellation) {
        return this.newHttpRequest("PATCH", this.uri + relativeURI, dto, cancellation);
    }

    /**
     * @private
     */
    newHttpRequest(method, url, dto, cancellation) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.setRequestHeader("Mind-SDK", "Mind Web SDK " + packageJson.version)
            xhr.timeout = HTTP_CONNECTION_TIMEOUT_SECONDS * 1000
            xhr.ontimeout = () => {
                reject(new Error("HTTP request timed out"));
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (xhr.responseText.length > 0) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        resolve({});
                    }
                } else {
                    if (xhr.status === 404 && this.conference != null) {
                        this.notifications.push("{\"type\":\"deleted\",\"location\":\"/participants/me\"}"); // FIXME: We have to use `me` alias here because we can be expelled from the conference before joining is completed (i.e. before the actual ID of `me` is known)
                        this.processNotifications();
                    } else {
                        reject(new Error("HTTP response status code: " + xhr.status));
                    }
                }
            };
            xhr.onerror = (error) => {
                reject(error);
            };
            if (dto) {
                xhr.send(JSON.stringify(dto));
            } else {
                xhr.send(dto);
            }
            if (cancellation) {
                cancellation(xhr);
            }
        });
    }

    /**
     * @package
     */
    fireOnConferenceNameChanged(conference) {
        if (this.listener != null) {
            if (typeof this.listener.onConferenceNameChanged === "function") {
                this.listener.onConferenceNameChanged(conference);
            } else {
                SessionListener.prototype.onConferenceNameChanged(conference);
            }
        }
    }

    /**
     * @package
     */
    fireOnConferenceRecordingStarted(conference) {
        if (this.listener != null) {
            if (typeof this.listener.onConferenceRecordingStarted === "function") {
                this.listener.onConferenceRecordingStarted(conference);
            } else {
                SessionListener.prototype.onConferenceRecordingStarted(conference);
            }
        }
    }

    /**
     * @package
     */
    fireOnConferenceRecordingStopped(conference) {
        if (this.listener != null) {
            if (typeof this.listener.onConferenceRecordingStopped === "function") {
                this.listener.onConferenceRecordingStopped(conference);
            } else {
                SessionListener.prototype.onConferenceRecordingStopped(conference);
            }
        }
    }

    /**
     * @package
     */
    fireOnConferenceEnded(conference) {
        if (this.listener != null) {
            if (typeof this.listener.onConferenceEnded === "function") {
                this.listener.onConferenceEnded(conference);
            } else {
                SessionListener.prototype.onConferenceEnded(conference);
            }
        }
    }

    /**
     * @package
     */
    fireOnParticipantJoined(participant) {
        if (this.listener != null) {
            if (typeof this.listener.onParticipantJoined === "function") {
                this.listener.onParticipantJoined(participant);
            } else {
                SessionListener.prototype.onParticipantJoined(participant);
            }
        }
    }

    /**
     * @package
     */
    fireOnParticipantExited(participant) {
        if (this.listener != null) {
            if (typeof this.listener.onParticipantExited === "function") {
                this.listener.onParticipantExited(participant);
            } else {
                SessionListener.prototype.onParticipantExited(participant);
            }
        }
    }

    /**
     * @package
     */
    fireOnParticipantNameChanged(participant) {
        if (this.listener != null) {
            if (typeof this.listener.onParticipantNameChanged === "function") {
                this.listener.onParticipantNameChanged(participant);
            } else {
                SessionListener.prototype.onParticipantNameChanged(participant);
            }
        }
    }

    /**
     * @package
     */
    fireOnParticipantPriorityChanged(participant) {
        if (this.listener != null) {
            if (typeof this.listener.onParticipantPriorityChanged === "function") {
                this.listener.onParticipantPriorityChanged(participant);
            } else {
                SessionListener.prototype.onParticipantPriorityChanged(participant);
            }
        }
    }

    /**
     * @package
     */
    fireOnParticipantLanguageChanged(participant) {
        if (this.listener != null) {
            if (typeof this.listener.onParticipantLanguageChanged === "function") {
                this.listener.onParticipantLanguageChanged(participant);
            } else {
                SessionListener.prototype.onParticipantLanguageChanged(participant);
            }
        }
    }

    /**
     * @package
     */
    fireOnParticipantRoleChanged(participant) {
        if (this.listener != null) {
            if (typeof this.listener.onParticipantRoleChanged === "function") {
                this.listener.onParticipantRoleChanged(participant);
            } else {
                SessionListener.prototype.onParticipantRoleChanged(participant);
            }
        }
    }

    /**
     * @package
     */
    fireOnParticipantMediaChanged(participant) {
        if (this.listener != null) {
            if (typeof this.listener.onParticipantMediaChanged === "function") {
                this.listener.onParticipantMediaChanged(participant);
            } else {
                SessionListener.prototype.onParticipantMediaChanged(participant);
            }
        }
    }

    /**
     * @package
     */
    fireOnParticipantSecondaryMediaChanged(participant) {
        if (this.listener != null) {
            if (typeof this.listener.onParticipantSecondaryMediaChanged === "function") {
                this.listener.onParticipantSecondaryMediaChanged(participant);
            } else {
                SessionListener.prototype.onParticipantSecondaryMediaChanged(participant);
            }
        }
    }

    /**
     * @package
     */
    fireOnMeExpelled(me) {
        if (this.listener != null) {
            if (typeof this.listener.onMeExpelled === "function") {
                this.listener.onMeExpelled(me);
            } else {
                SessionListener.prototype.onMeExpelled(me);
            }
        }
    }

    /**
     * @package
     */
    fireOnMeNameChanged(me) {
        if (this.listener != null) {
            if (typeof this.listener.onMeNameChanged === "function") {
                this.listener.onMeNameChanged(me);
            } else {
                SessionListener.prototype.onMeNameChanged(me);
            }
        }
    }

    /**
     * @package
     */
    fireOnMePriorityChanged(me) {
        if (this.listener != null) {
            if (typeof this.listener.onMePriorityChanged === "function") {
                this.listener.onMePriorityChanged(me);
            } else {
                SessionListener.prototype.onMePriorityChanged(me);
            }
        }
    }

    /**
     * @package
     */
    fireOnMeLanguageChanged(me) {
        if (this.listener != null) {
            if (typeof this.listener.onMeLanguageChanged === "function") {
                this.listener.onMeLanguageChanged(me);
            } else {
                SessionListener.prototype.onMeLanguageChanged(me);
            }
        }
    }

    /**
     * @package
     */
    fireOnMeRoleChanged(me) {
        if (this.listener != null) {
            if (typeof this.listener.onMeRoleChanged === "function") {
                this.listener.onMeRoleChanged(me);
            } else {
                SessionListener.prototype.onMeRoleChanged(me);
            }
        }
    }

    /**
     * @package
     */
    fireOnMeReceivedMessageFromApplication(me, message) {
        if (this.listener != null) {
            if (typeof this.listener.onMeReceivedMessageFromApplication === "function") {
                this.listener.onMeReceivedMessageFromApplication(me, message);
            } else {
                SessionListener.prototype.onMeReceivedMessageFromApplication(me, message);
            }
        }
    }

    /**
     * @package
     */
    fireOnMeReceivedMessageFromParticipant(me, message, participant) {
        if (this.listener != null) {
            if (typeof this.listener.onMeReceivedMessageFromParticipant === "function") {
                this.listener.onMeReceivedMessageFromParticipant(me, message, participant);
            } else {
                SessionListener.prototype.onMeReceivedMessageFromParticipant(me, message, participant);
            }
        }
    }

    /**
     * @package
     */
    updateStatistics(report) {
        if (report != null) {
            let selectedCandidatePair = null;
            let localCandidate = null;
            let remoteCandidate = null;
            for (let stats of report) {
                switch (stats.type) {
                    case "candidate-pair":
                        selectedCandidatePair = stats;
                        break;
                    case "local-candidate":
                        localCandidate = stats;
                        break;
                    case "remote-candidate":
                        remoteCandidate = stats;
                        break;
                }
            }
            if (selectedCandidatePair != null && localCandidate != null && remoteCandidate != null) {
                this.statistics = new SessionStatistics(localCandidate.protocol,
                                                        (localCandidate.address || localCandidate.ip),
                                                        localCandidate.port,
                                                        (remoteCandidate.address || remoteCandidate.ip),
                                                        remoteCandidate.port);
            }
        }
    }

    /**
     * @private
     */
    updateEntireModel(dto) {
        this.updateModelItem("/", dto);
        let participantDTOs = dto.participants;
        // Build a set of IDs of online participants
        let onlineParticipantIDs = new Set();
        for (let i = 0; i < participantDTOs.length; i++) {
            let participantDTO = participantDTOs[i];
            if (participantDTO.online) {
                onlineParticipantIDs.add(participantDTO.id);
            }
        }
        // Remove missing and offline participants
        let participants = this.conference.getParticipants();
        for (let i = participants.length - 1; i >= 0 ; i--) {
            if (!onlineParticipantIDs.has(participants[i].id)) {
                this.deleteModelItem("/participants/" + participants[i].id);
            }
        }
        // Update existent participants and add new participants
        for (let i = 0; i < participantDTOs.length; i++) {
            let participantDTO = participantDTOs[i];
            if (participantDTO.online) {
                let participant = this.conference.getParticipantById(participantDTO.id);
                if (participant) {
                    this.updateModelItem("/participants/" + participantDTO.id, participantDTO);
                } else {
                    this.createModelItem("/participants/" + participantDTO.id, participantDTO);
                }
            }
        }
    }

    /**
     * @private
     */
    createModelItem(location, dto) {
        if (location.startsWith("/participants/")) {
            if (dto.online) {
                let participant = Participant.fromDTO(this, dto);
                this.conference.addParticipant(participant);
            }
        } else if (location.startsWith("/messages/")) {
            if (dto.sentBy === this.getApplicationId()) {
                this.fireOnMeReceivedMessageFromApplication(this.conference.getMe(), dto.text);
            } else {
                this.fireOnMeReceivedMessageFromParticipant(this.conference.getMe(), dto.text, this.conference.getParticipantById(dto.sentBy));
            }
        }
    }

    /**
     * @private
     */
    updateModelItem(location, dto) {
        if (location === "/") {
            this.conference.update(dto);
        } else if (location.startsWith("/participants/")) {
            if (dto.online) {
                let participant = this.conference.getParticipantById(location.substring("/participants/".length));
                if (participant) {
                    participant.update(dto);
                } else {
                    this.createModelItem(location, dto);
                }
            } else {
                this.deleteModelItem(location);
            }
        }
    }

    /**
     * @private
     */
    deleteModelItem(location) {
        if (location === "/") {
            let conference = this.conference;
            MindSDK.exit2(this);
            this.fireOnConferenceEnded(conference);
        } else if (location === "/participants/me") { // FIXME: We have to use `me` alias here because we can be expelled from the conference before joining is completed (i.e. before the actual ID of `me` is known)
            let conference = this.conference;
            MindSDK.exit2(this);
            this.fireOnMeExpelled(conference.getMe());
        } else if (location.startsWith("/participants/")) {
            let participant = this.conference.getParticipantById(location.substring("/participants/".length));
            if (participant) {
                this.conference.removeParticipant(participant);
                participant.destroy();
            }
        }
    }

    /**
     * @private
     */
    processNotifications() {
        for (let notification of this.notifications) {
            try {
                let json = JSON.parse(notification);
                switch (json.type) {
                    case "created":
                        this.createModelItem(json.location, json.resource);
                        break;
                    case "updated":
                        this.updateModelItem(json.location, json.resource);
                        break;
                    case "deleted":
                        this.deleteModelItem(json.location);
                        break;
                }
            } catch (error) {
                console.warn("Can't parse notification `" + notification + "`:", error);
            }
        }
        this.notifications = [];
    }

    /**
     * @private
     */
    setState(state) {
        if (this.state !== state) {
            this.state = state;
            if (this.listener != null) {
                if (typeof this.listener.onSessionStateChanged === "function") {
                    this.listener.onSessionStateChanged(this);
                } else {
                    SessionListener.prototype.onSessionStateChanged(this);
                }
            }
        }
    }

}
