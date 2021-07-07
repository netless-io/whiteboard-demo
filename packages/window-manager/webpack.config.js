const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");


module.exports = {
    entry: path.resolve(__dirname, "src/index.ts"),
    output: {
        filename: "index.js",
        library: "WindowManager",
        libraryTarget: "umd",
        path: path.resolve(__dirname, "dist"),
    },
    externals: {
        "white-web-sdk": {
            root: "WhiteWebSdk",
            commonjs: "white-web-sdk",
            commonjs2: "white-web-sdk",
        },
        react: {
            root: "React",
            commonjs: "react",
            commonjs2: "react",
        },
        "react-dom": {
            root: "ReactDOM",
            commonjs: "react-dom",
            commonjs2: "react-dom",
        },
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
    },

    module: {
        rules: [
            {
                test: /\.(ts)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                },
            },
            {
                test: /\.(png|jp(e*)g|svg|ttf)$/,
                use: [
                    {
                        loader: "url-loader",
                    },
                ],
            },
            {
                test: /\.(less|css)$/,
                use: [
                    {
                        loader: "style-loader", // creates style nodes from JS strings
                    },
                    {
                        loader: "css-loader", // translates CSS into CommonJS
                    },
                    {
                        loader: "less-loader", // compiles Less to CSS
                    },
                ],
            },
        ],
    },
    optimization: {
        minimizer: [new TerserPlugin({ parallel: true })],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
    ],
};
