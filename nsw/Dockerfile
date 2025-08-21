# syntax=docker/dockerfile:1.4
FROM debian:bullseye
WORKDIR /tmp
RUN apt-get update
RUN apt-get install -y git autoconf automake make libtool emscripten
COPY <<EOF /tmp/build.sh
#!/bin/bash

set -e

rm -rf rnnoise
git clone https://github.com/xiph/rnnoise.git
cd rnnoise
git checkout 1cbdbcf1283499bbb2230a6b0f126eb9b236defd
./autogen.sh

emcc -v # This is required because the first run of any of emscripten binaries will end up with just a welcome messsage.
emconfigure ./configure CFLAGS="-Os" --enable-static=no --disable-examples --disable-doc
emmake make

emcc -Os \\
     -g2 \\
     -s ALLOW_MEMORY_GROWTH=1 \\
     -s MALLOC=emmalloc \\
     -s MODULARIZE=1 \\
     -s ENVIRONMENT="web,worker" \\
     -s EXPORT_ES6=1 \\
     -s USE_ES6_IMPORT_META=0 \\
     -s WASM_ASYNC_COMPILATION=0 \\
     -s SINGLE_FILE=1 \\
     -s EXPORT_NAME=createRNNoiseWasmModule \\
     -s EXPORTED_FUNCTIONS="['_rnnoise_process_frame', '_rnnoise_destroy', '_rnnoise_create', '_malloc', '_free']" \\
     .libs/librnnoise.so \\
     -o /nsw/RNNoiseWasmModule.js
EOF
RUN chmod +x /tmp/build.sh
CMD ./build.sh
