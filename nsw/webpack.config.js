const path = require("path");

module.exports = [{

    entry: "./nsw/NoiseSuppressionWorklet.js",

    target: "webworker",

    output: {
        filename: "NoiseSuppressionWorklet.js",
        path: path.resolve(__dirname, "../lib")
    },

    mode: "production"

}];
