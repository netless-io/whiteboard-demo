/**
 * @type {import('webpack').Configuration}
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CracoLessPlugin = require('craco-less');

config = {
  entry: './src/index',
  output: {
    path: path.join(__dirname, '/build'),
    filename: '[name].[contenthash:8].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  optimization: {
    minimizer: [new TerserJSPlugin({extractComments: false}), new OptimizeCSSAssetsPlugin({})],
    moduleIds: 'hashed',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        white : {
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
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].[contenthash:8].css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#1DA57A' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  module: {
    rules: [
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
          loader: 'less-loader' // compiles Less to CSS
        }]
      },
      {
        test: /\.css$/,
        use: [{loader: MiniCssExtractPlugin.loader}, 'css-loader']
      },
      {
        test: /\.(svg|png)/,
        use: ['file-loader']
      }
    ]
  }
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.output.filename = '[name].[hash].js';
  }
  return config;
}