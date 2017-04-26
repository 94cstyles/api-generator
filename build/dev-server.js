const os = require('os')
const {PassThrough} = require('stream')
const http = require('http')
const Koa = require('koa')
const proxy = require('koa-proxy')
const opn = require('opn')
const webpack = require('webpack')
const webpackConfig = require('./webpack.dev.conf')

// 设置参数
process.env.PORT = process.env.PORT || 9526

// 启动 webpack 进行编译
const compiler = webpack(webpackConfig)
const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: '/',
  quiet: true
})
const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})

// 模板发生变化重新加载
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({action: 'reload'})
    cb()
  })
})

// 改造 webpack-dev-middleware 和 webpack-hot-middleware 支持koa
function webpackDevMiddleware () {
  return async (ctx, next) => {
    await devMiddleware(ctx.req, {
      end: (content) => {
        ctx.body = content.toString()
      },
      setHeader: (name, value) => {
        ctx.headers[name] = value
      }
    }, next)
  }
}
function webpackHotMiddleware () {
  return async (ctx, next) => {
    const stream = new PassThrough()
    ctx.body = stream
    await hotMiddleware(ctx.req, {
      write: stream.write.bind(stream),
      writeHead: (state, headers) => {
        ctx.state = state
        ctx.set(headers)
      }
    }, next)
  }
}

// 获取本地局域网ip
function ip () {
  const iptable = {}
  const ifaces = os.networkInterfaces()
  for (const dev in ifaces) {
    ifaces[dev].forEach(function (details, alias) {
      if (details.family === 'IPv4') {
        iptable[dev + (alias ? ':' + alias : '')] = details.address
      }
    })
  }
  return iptable['en0:1'] || '127.0.0.1'
}

const app = new Koa()

// 请求代理
app.use(proxy({
  host: `http://${ip()}:9527`,
  match: /^\/(js|css|api|admin)\//
}))
// 启动 webpack-dev-middleware, 将 编译后的文件 暂存到内存中并挂到 koa 服务上
app.use(webpackDevMiddleware())
// 启动 webpack-hot-middleware, 将 Hot-reload 挂在到 koa 服务上
app.use(webpackHotMiddleware())

http.createServer(app.callback()).listen(process.env.PORT, function () {
  opn(`http://${ip()}:${process.env.PORT}`) // 打开网页进行预览
})
