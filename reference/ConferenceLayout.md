# `enumeration` ConferenceLayout

ConferenceLayout enumerates all available layouts for arranging videos in
[recording](Conference.md#getrecordingurl) and [conference media stream](Conference.md#getmediastream). The arrangement
of videos depends not only on layout but also on a conference mode. At any given moment conference can be in one of two
modes: conversion or presentation. If none of [presenters](ParticipantRole.md#presenter) or
[moderators](ParticipantRole.md#moderator) is streaming its secondary video, then the conference considered to be in
the conversion mode, if at least one of [presenters](ParticipantRole.md#presenter) or
[moderators](ParticipantRole.md#moderator) is streaming its secondary video, then the conference considered to be in
the presentation mode. The conference layout is set during conference creation and cannot be changed afterwards.

## MOSAIC

In conversation mode the `MOSAIC` layout assumes displaying all primary videos of all
[speakers](ParticipantRole.md#speaker), [presenters](ParticipantRole.md#presenter) and
[moderators](ParticipantRole.md#moderator) at the same time arranged according to their priorities: the area is divided
into equal rectangles, each of which is given for primary video of one of the participants — the top-left rectangle is
given to the participant with the highest priority, the bottom-right rectangle — to the participant with the lowest
priority. In presentation mode `MOSAIC` layout assumes displaying fullscreen only one secondary video of a
[presenter](ParticipantRole.md#presenter) or a [moderator](ParticipantRole.md#moderator) with the highest priority.

## SELECTOR

In conversation mode the `SELECTOR` layout assumes displaying fullscreen only one primary video of the loudest
[speaker](ParticipantRole.md#speaker), [presenter](ParticipantRole.md#presenter) or
[moderator](ParticipantRole.md#moderator). In presentation mode `SELECTOR` layout assumes displaying
fullscreen only one secondary video of a [presenter](ParticipantRole.md#presenter) or a
[moderator](ParticipantRole.md#moderator) with the highest priority.

## PRESENTING_MOSAIC

In conversation mode the `PRESENTING_MOSAIC` layout assumes displaying all primary videos of all
[speakers](ParticipantRole.md#speaker), [presenters](ParticipantRole.md#presenter) and
[moderators](ParticipantRole.md#moderator) at the same time arranged according to their priorities: the area is divided
into equal rectangles, each of which is given for primary video of one of the participants — the top-left rectangle is
given to the participant with the highest priority, the bottom-right rectangle — to the participant with the lowest
priority. In presentation mode `PRESENTING_MOSAIC` layout assumes displaying fullscreen secondary video of a
[presenter](ParticipantRole.md#presenter) or a [moderator](ParticipantRole.md#moderator) with the highest priority and
also its primary video in the bottom-right corner (above the secondary video).

## PRESENTING_SELECTOR

In conversation mode the `PRESENTING_SELECTOR` layout assumes displaying fullscreen only one primary video of the
loudest [speaker](ParticipantRole.md#speaker), [presenter](ParticipantRole.md#presenter) or
[moderator](ParticipantRole.md#moderator). In presentation mode `PRESENTING_SELECTOR` layout assumes displaying
fullscreen secondary video of a [presenter](ParticipantRole.md#presenter) or a
[moderator](ParticipantRole.md#moderator) with the highest priority and also its primary video in the bottom-right
corner (above the secondary video).
