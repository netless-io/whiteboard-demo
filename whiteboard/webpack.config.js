/**
 * @type {import('webpack').Configuration}
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

config = {
    entry: './src/index',
    output: {
        path: path.join(__dirname, '/build'),
        filename: '[name].[contenthash:8].js',
        publicPath: "/"
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.mjs']
    },
    optimization: {
        minimizer: [new TerserJSPlugin({extractComments: false}), new OptimizeCSSAssetsPlugin({})],
        moduleIds: 'hashed',
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                white: {
                    test: /[\\/]node_modules[\\/](white-web-sdk)[\\/]/,
                    name: 'web-sdk',
                    chunks: 'all',
                    priority: 10,
                    reuseExistingChunk: true
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                    priority: 1,
                    reuseExistingChunk: true
                }
            }
        }
    },
    plugins: [
        new Dotenv({
            path: "./.env.local",
            safe: true,
            systemvars: true,
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].[contenthash:8].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
    ],
    module: {
        rules: [
            {
                test: /slide-prefetch\/dist\/index\.mjs$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-logical-assignment-operators']
                    }
                }
            },
            {
                test: /@zip\.js\/zip\.js\/lib\/core\/codecs\/codec-pool-worker\.js$/,
                use: {
                    loader: '@open-wc/webpack-import-meta-loader'
                }
            },
            {
                test: /\.(ts)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader'
                },
            },
            {
                test: /\.less$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader
                }, {
                    loader: 'css-loader' // translates CSS into CommonJS
                }, {
                    loader: 'less-loader', // compiles Less to CSS
                    options: {
                        lessOptions: {
                            modifyVars: {
                                'primary-color': '#3381FF',
                                'link-color': '#3381FF',
                            },
                            javascriptEnabled: true
                        }
                    },
                }]
            },
            {
                test: /\.css$/,
                use: [{loader: MiniCssExtractPlugin.loader}, 'css-loader']
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: {
                    loader: 'url-loader'
                }
            }
        ]
    }
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.output.filename = '[name].[hash].js';
        config.devServer = { stats: 'minimal' };
    }
    return config;
}
