const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
    entry: {
        popup: path.join(srcDir, 'popup.ts'),
        options: path.join(srcDir, 'options.ts'),
        background: path.join(srcDir, 'background.ts'),
        repoView: path.join(srcDir, 'github', 'repoView.ts'),
        profileView: path.join(srcDir, 'github', 'profileView.ts'),
        searchView: path.join(srcDir, 'github', 'searchView.ts'),
    },
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            name: "vendor",
            chunks: "initial",
        },
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
