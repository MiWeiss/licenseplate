const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    entry: {
        options: path.join(srcDir, 'options.ts'),
        background: path.join(srcDir, 'background.ts'),
        repoView: path.join(srcDir, 'github', 'repoView.ts'),
        profileView: path.join(srcDir, 'github', 'profileView.ts'),
    },
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: ".", to: "../dist", context: "public"},
                {from: "./src/background-wrapper.js", to: "../dist"}
            ],
            options: {},
        }),
    ],
};
