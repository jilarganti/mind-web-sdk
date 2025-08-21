export const RNNOISE_FRAME_SIZE = 480;

export class RNNoise {

    constructor(wasm, bufferSize) {
        this.wasm = wasm;
        this.wasmBuffer = this.wasm._malloc(bufferSize * 4);
        if (!this.wasmBuffer) {
            throw Error("RNNoise can't allocate a buffer");
        }
        this.jsBuffer = this.wasm.HEAPF32.subarray(this.wasmBuffer / 4, this.wasmBuffer / 4 + 1920);
        this.context = this.wasm._rnnoise_create();
    }

    getBuffer() {
        return this.jsBuffer;
    }

    denoise(offset) {
        // RNNoise expects the samples in the frame to be in the range of signed 16 bit (between -32768.0 to +32767.0),
        // that's why we have to scale up the samples (which are in range between -1.0 to +1.0) before processing them.
        for (let i = 0; i < RNNOISE_FRAME_SIZE; i++) {
            this.jsBuffer[offset + i] *= 32768;
        }
        // Denoise 480 samples in the buffer starting from the specified offset.
        this.wasm._rnnoise_process_frame(this.context, this.wasmBuffer + offset * 4, this.wasmBuffer + offset * 4);
        // Scale down the previously scaled up samples to range between -1.0 to +1.0.
        for (let i = 0; i < RNNOISE_FRAME_SIZE; i++) {
            this.jsBuffer[offset + i] /= 32768;
        }
    }

    destroy() {
        if (this.wasmBuffer) {
            this.wasm._free(this.wasmBuffer);
            this.wasmBuffer = 0;
        }
        if (this.context) {
            this.wasm._rnnoise_destroy(this.context);
            this.context = null;
        }
    }

}
