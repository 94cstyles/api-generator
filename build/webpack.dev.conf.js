const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const webpackConfig = require('./webpack.base.conf')

module.exports = Object.assign(webpackConfig, {
  entry: [
    './build/dev-client',
    './src/main.js'
  ],
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    // 热刷新
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // 将 index.html 作为入口
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: true
    }),
    // 错误提示
    new FriendlyErrorsPlugin()
  ]
})
