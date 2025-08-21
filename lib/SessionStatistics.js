/**
 * SessionStatistics class is used for representing statistics of a {@link Session participation session}. The
 * statistics consists of instant measures of the underlying network connection of the session. The values of all
 * measures are updated about once a second. You can always get the latest statistics with a help of
 * {@link Session#getStatistics getStatistics} method of {@link Session} class:
 *
 * ```
 * let conferenceURI = "https://api.mind.com/<APPLICATION_ID>/<CONFERENCE_ID>";
 * let participantToken = "<PARTICIPANT_TOKEN>";
 * let options = new MindSDK.SessionOptions();
 * MindSDK.join(conferenceURI, participantToken, options).then(function(session) {
 *     let sessionStatistics = session.getStatistics();
 * });
 * ```
 */
export class SessionStatistics {

    /**
     * @package
     */
    constructor(protocol, localAddress, localPort, remoteAddress, remotePort) {
        this.timestamp = Date.now();
        this.protocol = protocol;
        this.localAddress = localAddress;
        this.localPort = localPort;
        this.remoteAddress = remoteAddress;
        this.remotePort = remotePort;
    }

    /**
     * Returns the creation timestamp of the statistics. The creation timestamp of the statistics is the number of
     * milliseconds that have elapsed between 1 January 1970 00:00:00 UTC and the time at which the statistics was
     * created.
     *
     * @returns {Number} The creation timestamp of the statistics.
     */
    getTimestamp() {
        return this.timestamp;
    }

    /**
     * Returns the protocol of the session. The protocol of the session is a protocol which currently is used for
     * transmitting data of the session over the network. There are two possible values for the protocol: "udp" and
     * "tcp".
     *
     * @returns {String} The protocol of the session.
     */
    getProtocol() {
        return this.protocol;
    }

    /**
     * Returns the local address of the session. The local address of the session is an IP address or a FQDN of the
     * client (Mind Web SDK) which currently is used for transmitting data of the session over the network.
     *
     * @returns {String} The local address of the session.
     */
    getLocalAddress() {
        return this.localAddress;
    }

    /**
     * Returns the local port of the session. The local port of the session is a port number on the client (Mind Web
     * SDK) which currently is used for transmitting data of the session over the network.
     *
     * @returns {Number} The local port of the session.
     */
    getLocalPort() {
        return this.localPort;
    }

    /**
     * Returns the remote address of the session. The remote address of the session is an IP address or a FQDN of the
     * server (Mind API) which currently is used for transmitting data of the session over the network.
     *
     * @returns {String} The remote address of the session.
     */
    getRemoteAddress() {
        return this.remoteAddress;
    }

    /**
     * Returns the remote port of the session. The remote port of the session is a port number on the server (Mind API)
     * which currently is used for transmitting data of the session over the network.
     *
     * @returns {Number} The remote port of the session.
     */
    getRemotePort() {
        return this.remotePort;
    }

    toString() {
        return "{\n" +
            "  timestamp: " + this.timestamp + ",\n" +
            "  protocol: " + this.protocol + ",\n" +
            "  localAddress: " + this.localAddress + ",\n" +
            "  localPort: " + this.localPort + ",\n" +
            "  remoteAddress: " + this.remoteAddress + ",\n" +
            "  remotePort: " + this.remotePort + ",\n" +
            "}";
    }

}