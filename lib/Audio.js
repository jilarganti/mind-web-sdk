let consumers = new WeakMap();

function getConsumer(object) {
    if (!consumers.has(object)) {
        consumers.set(object, { stream: null, onAudioBuffer: () => {} });
    }
    return consumers.get(object);
}

// FIXME: Due to a bug in Safari 15.4 (at least) any attempt to acquire `Screen` object or an attempt to acquire
// `Microphone` object if the `Camera` object has been already acquired also causes unmuting of all muted <video/> and
// <audio/> elements. Interesting that in such case the `muted` property of the elements doesn't change its value -
// it's still `true`. As a workaround we added a code which unmutes and mutes back again all <video/> and <audio/>
// elements that play local media streams whenever we acquire `Microphone` or `Screen` object in Safari.
let activeAudioElements = new Set();
let isSafari = navigator.userAgent.indexOf("Safari") >= 0 && navigator.userAgent.indexOf("Chrome") < 0;
if (isSafari) {
    HTMLAudioElement.mindEnsureMutedState = function () {
        for (let activeAudioElement of activeAudioElements) {
            activeAudioElement.muted = !activeAudioElement.muted;
            activeAudioElement.muted = !activeAudioElement.muted;
        }
    }
} else {
    HTMLAudioElement.mindEnsureMutedState = function () {}
}

Object.defineProperties(HTMLAudioElement.prototype, {
    mediaStream: {
        get() {
            return getConsumer(this).stream;
        },
        set(stream) {
            let consumer = getConsumer(this);
            if (consumer.stream !== stream) {
                if (consumer.stream != null) {
                    consumer.stream.removeAudioConsumer(consumer);
                }
                if (stream == null) {
                    activeAudioElements.delete(this);
                    if (consumer.stream != null) {
                        this.srcObject = null;
                        consumer.onAudioBuffer = function() {};
                        consumer.stream = null
                    }
                } else {
                    activeAudioElements.add(this);
                    if (consumer.stream == null) {
                        consumer.onAudioBuffer = (audioBuffer, supplier) => {
                            if (!this.srcObject || this.srcObject.getAudioTracks()[0] !== (audioBuffer ? audioBuffer.getTrack() : null)) {
                                if (this.srcObject && this.srcObject.getAudioTracks()[0]) {
                                    this.srcObject.removeTrack(this.srcObject.getAudioTracks()[0]);
                                }
                                if (audioBuffer != null) {
                                    if (this.srcObject) {
                                        this.srcObject.addTrack(audioBuffer.getTrack());
                                        // There is a bug <https://issues.chromium.org/issues/381770616> in Chromium
                                        // (of version M131 at least), due to which the browser can play audio through
                                        // the default audio output device (instead of the one that was specified with
                                        // `setSinkId` method) whenever the audio track is replaced. As a temporal
                                        // workaround, we re-set the desired speaker after replacing the audio track.
                                        if (window.chrome && typeof this.setSinkId !== "undefined" && this.sinkId !== '') {
                                            let sinkId = this.sinkId;
                                            this.setSinkId('').finally(() => { if (this.sinkId === '') this.setSinkId(sinkId); });
                                        }
                                    } else {
                                        let stream = new MediaStream();
                                        stream.addTrack(audioBuffer.getTrack());
                                        this.srcObject = stream;
                                    }
                                }
                                if (this.srcObject && this.srcObject.getAudioTracks().length === 0) {
                                    this.srcObject = null;
                                } else {
                                    // FIXME: Otherwise Safari (of version 13.1.1 at least) wouldn't process the
                                    // replacement of audio track properly.
                                    this.srcObject = this.srcObject;
                                }
                            }
                        };
                    }
                    consumer.stream = stream;
                    stream.addAudioConsumer(consumer);
                }
            }
        }
    }
});