# `enumeration` ParticipantLanguage

ParticipantLanguage enumerates all available preferred languages for remote and local participants. The preferred
language of a participant is the code of a language that the participant speaks and prefers to hear from other
participants. If the local participant is a [moderator](ParticipantRole.md#moderator) than you can change the preferred
language of the local participant with [setLanguage](Me.md#setlanguagelanguage) and the preferred language of any
remote participants with [setLanguage](Participant.md#setlanguagelanguage) method of [Participant](Participant.md)
class.

```javascript
var me = conference.getMe();
// Change the preferred language of the local participant to Spanish if we are permitted to do so
if (me.getRole() === MindSDK.ParticipantRole.MODERATOR) {
    me.setLanguage(MindSDK.ParticipantLanguage.ES);
}
```

## AR

Arabic language.

## CS

Czech language.

## DE

German language.

## EN

English language.

## ES

Spanish language.

## FR

French language.

## HI

Hindi language.

## HU

Hungarian language.

## IT

Italian language.

## JA

Japanese language.

## KO

Korean language.

## NL

Dutch language.

## PL

Polish language.

## PT

Portuguese language.

## RU

Russian language.

## TR

Turkish language.

## ZH

Chinese languge.
