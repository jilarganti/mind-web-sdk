/**
 * ParticipantLanguage enumerates all available preferred languages for remote and local participants. The preferred
 * language of a participant is the code of a language that the participant speaks and prefers to hear from other
 * participants. If the local participant is a {@link ParticipantRole.MODERATOR moderator} than you can change the
 * preferred language of the local participant with {@link Me#setLanguage setLanguage} and the preferred language of
 * any remote participants with {@link Participant#setLanguage setLanguage} method of {@link Participant} class.
 *
 * ```
 * var me = conference.getMe();
 * // Change the preferred language of the local participant to Spanish if we are permitted to do so
 * if (me.getRole() === MindSDK.ParticipantRole.MODERATOR) {
 *     me.setLanguage(MindSDK.ParticipantLanguage.ES);
 * }
 * ```
 *
 * @readonly
 * @enum {ParticipantLanguage}
 */
const ParticipantLanguage = {

    /**
     *  Arabic language.
     */
    AR: "ar",

    /**
     * Czech language.
     */
    CS: "cs",

    /**
     * German language.
     */
    DE: "de",

    /**
     * English language.
     */
    EN: "en",

    /**
     * Spanish language.
     */
    ES: "es",

    /**
     * French language.
     */
    FR: "fr",

    /**
     * Hindi language.
     */
    HI: "hi",

    /**
     * Hungarian language.
     */
    HU: "hu",

    /**
     * Italian language.
     */
    IT: "it",

    /**
     * Japanese language.
     */
    JA: "ja",

    /**
     * Korean language.
     */
    KO: "ko",

    /**
     * Dutch language.
     */
    NL: "nl",

    /**
     * Polish language.
     */
    PL: "pl",

    /**
     * Portuguese language.
     */
    PT: "pt",

    /**
     * Russian language.
     */
    RU: "ru",

    /**
     * Turkish language.
     */
    TR: "tr",

    /**
     * Chinese languge.
     */
    ZH: "zh"

};

export { ParticipantLanguage };