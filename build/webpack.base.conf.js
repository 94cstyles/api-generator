const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

/**
 * 获取绝对路径
 * @param dir
 * @returns {string|*}
 */
function resolve (dir) {
  return path.join(process.cwd(), dir)
}
/**
 * vue css加载器
 * @returns {{css: *, scss: *}}
 */
function cssLoaders () {
  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: false
    }
  }

  function generateLoaders (loader, loaderOptions) {
    const loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: false
        })
      })
    }

    if (process.env.NODE_ENV === 'production') {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  return {
    css: generateLoaders(),
    scss: generateLoaders('sass')
  }
}

module.exports = {
  resolve: {
    extensions: ['.vue', '.js'],
    alias: {
      '@': resolve('public/src'),
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: cssLoaders()
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')]
      }
    ]
  },
  devtool: '#cheap-module-eval-source-map'
}
