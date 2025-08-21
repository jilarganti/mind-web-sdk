module.exports = {

    entry: "./index.js",

    output: {
        filename: "sdk.js",
        library: "MindAPI",
        libraryExport: "default"
    },

    mode: "development",

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [ "babel-loader" ]
        },{
            test: /NoiseSuppressionWorklet\.js$/,
            type: "asset/resource",
            generator: {
                filename: "noise-suppression-worklet.js"
            }
        }]
    },

    stats: {
        modulesSpace: 1000
    }

};
