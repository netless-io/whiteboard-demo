const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const PeerDepsExternalsPlugin = require('peer-deps-externals-webpack-plugin');
module.exports = {
    entry: path.resolve(__dirname, 'src/index.tsx'),

    output: {
        filename: 'index.js',
        libraryTarget: "umd",
        path: path.resolve(__dirname, 'dist'),
    },
    externals: {
      'white-web-sdk': 'white-web-sdk'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ya?ml$/,
                use: [
                    { loader: 'json-loader' },
                    { loader: 'yaml-loader' },
                    { loader: 'yaml-lint-loader' },
                ],
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: [{
                    loader: 'url-loader'
                }]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader', // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                    },
                    {
                        loader: 'less-loader', // compiles Less to CSS
                    },
                ],
            },],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessorOptions: {
                    safe: true,
                    autoprefixer: { disable: true },
                    mergeLonghand: false,
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: true
            })
        ]
    },
    plugins: [
        new PeerDepsExternalsPlugin(),
        new ForkTsCheckerWebpackPlugin(),
        new webpack.ContextReplacementPlugin(
            /moment[/\\]locale$/,
            /zh-cn/,
        ),
        new LodashModuleReplacementPlugin,
    ]
};
