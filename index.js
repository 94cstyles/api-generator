const http = require('http')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const compress = require('koa-compress')
const mongo = require('koa-mongo')
const serve = require('koa-static')
const routes = require('./routes')

// 设置参数
process.env.PORT = Number(process.env.PORT || 9527) + Number(process.env.NODE_APP_INSTANCE || 0)
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const app = new Koa()

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = {
      message: err.message
    }
  }
})

// cors
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  await next()
})

// 中间件
app.use(bodyParser())
app.use(mongo({
  host: 'localhost',
  port: 27017,
  db: 'mock'
}))
app.use(compress({
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))

app.use(serve('public'))
// 路由
routes(app)

// 创建http服务
const server = http.createServer(app.callback())
server.listen(process.env.PORT)
