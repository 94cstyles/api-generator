const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpackConfig = require('./webpack.base.conf')

/**
 * 获取绝对路径
 * @param dir
 * @returns {string|*}
 */
function resolve (dir) {
  return path.join(process.cwd(), dir)
}

module.exports = Object.assign(webpackConfig, {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: resolve('public'),
    filename: 'js/[name].js',
    publicPath: '/'
  },
  devtool: false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    // 压缩js
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: false
    }),
    // 提取css
    new ExtractTextPlugin({
      filename: 'css/styles.css'
    }),
    // 提取index.html
    new HtmlWebpackPlugin({
      filename: resolve('public/index.html'),
      template: './src/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'dependency'
    })
  ]
})
