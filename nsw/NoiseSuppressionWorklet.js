import { RNNoise } from "./RNNoise";
import createRNNoiseWasmModule from "./RNNoiseWasmModule";

// The size (in samples) of a frame which is passed to `process` method of `NoiseSuppressionWorklet` class at a time.
const PROCESS_FRAME_SIZE = 128;

// The size (in samples) of a frame which `denoise` method of `RNNoise` class processes at a time.
import { RNNOISE_FRAME_SIZE } from "./RNNoise";

// This size (in samples) of the circular buffer where we accumulate incoming frames and process them. The buffer
// should be able to accommodate 128-length and 480-length frames without remainder and should introduce the smallest
// possible delay. That is why we chose 1920 (the least common multiple of 128 and 480) which assumes delay 10.7ms for
// 48kHz audio.
const RNNOISE_BUFFER_SIZE = 1920;

/**
 * NoiseSuppressionWorklet is a filter style (1-to-1) audio worklet which reads the input, suppresses different kinds
 * of background noise in it (aka denoise) and writes the denoised audio to the output. The worklet is based on RNNoise
 * library which is compiled as a synchronously loaded WebAssembly module (RNNoiseWasmModule). The worklet denoises all
 * input channels and for each of them it uses only one circular buffer (which is shared between the worklet and the
 * WebAssembly module), so that denoising performed just in-place without copying samples back and forth. The denoising
 * is performed in real-time, and it adds only 10.7ms delay.
 */
class NoiseSuppressionWorklet extends AudioWorkletProcessor {

    constructor() {
        super();
        this.rnnoiseWasmModule = createRNNoiseWasmModule();
        this.rnnoises = new Map();
        this.writingIndex = 0;
        this.processingIndex = 0;
        this.readingIndex = -(PROCESS_FRAME_SIZE * 4); // The `this.readingIndex` is always 4 frames (i.e. 512 samples) behind the `this.writingIndex`.
        this.unprocessedSamplesCount = 0; // Actually we could calculate it from the `this.writingIndex` and the `this.processingIndex`, but with a separate counter the code is simpler and faster.
    }

    process(inputs, outputs) {
        // We support a single input and single output only.
        let input = inputs[0], output = outputs[0];
        if (input.length > 0) {
            this.unprocessedSamplesCount += PROCESS_FRAME_SIZE;
            for (let channel = 0; channel < input.length; channel++) {
                let rnnoise = this.rnnoises.get(channel);
                if (!rnnoise) {
                    rnnoise = new RNNoise(this.rnnoiseWasmModule, RNNOISE_BUFFER_SIZE);
                    this.rnnoises.set(channel, rnnoise);
                }
                let inputChannel = input[channel];
                let outputChannel = output[channel];
                let buffer = rnnoise.getBuffer();
                buffer.set(inputChannel, this.writingIndex);
                if (this.unprocessedSamplesCount >= RNNOISE_FRAME_SIZE) {
                    rnnoise.denoise(this.processingIndex);
                }
                if (this.readingIndex >= 0) {
                    outputChannel.set(buffer.subarray(this.readingIndex, this.readingIndex + PROCESS_FRAME_SIZE), 0);
                }
            }
            this.writingIndex = (this.writingIndex + PROCESS_FRAME_SIZE) % RNNOISE_BUFFER_SIZE;
            if (this.unprocessedSamplesCount >= RNNOISE_FRAME_SIZE) {
                this.processingIndex = (this.processingIndex + RNNOISE_FRAME_SIZE) % RNNOISE_BUFFER_SIZE;
                this.unprocessedSamplesCount -= RNNOISE_FRAME_SIZE;
            }
            this.readingIndex = (this.readingIndex + PROCESS_FRAME_SIZE) % RNNOISE_BUFFER_SIZE;
            return true;
        } else {
            for (let channel = 0; channel < this.rnnoises.size; channel++) {
                if (this.rnnoises.has(channel)) {
                    this.rnnoises.get(channel).destroy();
                }
            }
            this.rnnoises.clear();
            this.writingIndex = 0;
            this.processingIndex = 0;
            this.readingIndex = -512;
            this.unprocessedSamplesCount = 0;
            return false;
        }
    }

}

registerProcessor("noise-suppression-worklet", NoiseSuppressionWorklet);
