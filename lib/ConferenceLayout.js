/**
 * ConferenceLayout enumerates all available layouts for arranging videos in
 * {@link Conference#getRecordingURL recording} and {@link Conference#getMediaStream conference media stream}. The
 * arrangement of videos depends not only on layout but also on a conference mode. At any given moment conference can
 * be in one of two modes: conversion or presentation. If none of {@link ParticipantRole.PRESENTER presenters} or
 * {@link ParticipantRole.MODERATOR moderators} is streaming its secondary video, then the conference considered to be
 * in the conversion mode, if at least one of {@link ParticipantRole.PRESENTER presenters} or
 * {@link ParticipantRole.MODERATOR moderators} is streaming its secondary video, then the conference considered to be
 * in the presentation mode. The conference layout is set during conference creation and cannot be changed afterwards.
 *
 * @readonly
 * @enum {ConferenceLayout}
 */
const ConferenceLayout = {

    /**
     * In conversation mode the `MOSAIC` layout assumes displaying all primary videos of all
     * {@link ParticipantRole.SPEAKER speakers}, {@link ParticipantRole.PRESENTER presenters} and
     * {@link ParticipantRole.MODERATOR moderators} at the same time arranged according to their priorities: the area
     * is divided into equal rectangles, each of which is given for primary video of one of the participants — the
     * top-left rectangle is given to the participant with the highest priority, the bottom-right rectangle — to the
     * participant with the lowest priority. In presentation mode `MOSAIC` layout assumes displaying fullscreen only one
     * secondary video of a {@link ParticipantRole.PRESENTER presenter} or a {@link ParticipantRole.MODERATOR moderator}
     * with the highest priority.
     */
    MOSAIC: "mosaic",

    /**
     * In conversation mode the `SELECTOR` layout assumes displaying fullscreen only one primary video of the loudest
     * {@link ParticipantRole.SPEAKER speaker}, {@link ParticipantRole.PRESENTER presenter} or
     * {@link ParticipantRole.MODERATOR moderator}. In presentation mode `SELECTOR` layout assumes displaying
     * fullscreen only one secondary video of a {@link ParticipantRole.PRESENTER presenter} or a
     * {@link ParticipantRole.MODERATOR moderator} with the highest priority.
     */
    SELECTOR: "selector",

    /**
     * In conversation mode the `PRESENTING_MOSAIC` layout assumes displaying all primary videos of all
     * {@link ParticipantRole.SPEAKER speakers}, {@link ParticipantRole.PRESENTER presenters} and
     * {@link ParticipantRole.MODERATOR moderators} at the same time arranged according to their priorities: the area
     * is divided into equal rectangles, each of which is given for primary video of one of the participants — the
     * top-left rectangle is given to the participant with the highest priority, the bottom-right rectangle — to the
     * participant with the lowest priority. In presentation mode `PRESENTING_MOSAIC` layout assumes displaying
     * fullscreen secondary video of a {@link ParticipantRole.PRESENTER presenter} or a
     * {@link ParticipantRole.MODERATOR moderator} with the highest priority and also its primary video in the
     * bottom-right corner (above the secondary video).
     */
    PRESENTING_MOSAIC: "presenting_mosaic",

    /**
     * In conversation mode the `PRESENTING_SELECTOR` layout assumes displaying fullscreen only one primary video of
     * the loudest {@link ParticipantRole.SPEAKER speaker}, {@link ParticipantRole.PRESENTER presenter} or
     * {@link ParticipantRole.MODERATOR moderator}. In presentation mode `PRESENTING_SELECTOR` layout assumes
     * displaying fullscreen secondary video of a {@link ParticipantRole.PRESENTER presenter} or a
     * {@link ParticipantRole.MODERATOR moderator} with the highest priority and also its primary video in the
     * bottom-right corner (above the secondary video).
     */
    PRESENTING_SELECTOR: "presenting_selector",

};

export { ConferenceLayout };