const _ = require('koa-route')
const lodash = require('lodash')
const mock = require('../modules/mock')

module.exports = (app, API_CACHE) => {
  // 接口
  function generator (ctx, request) {
    const temp = API_CACHE[ctx.path]

    if (temp) {
      ctx.body = mock(lodash.cloneDeep(temp), request)
    } else {
      ctx.body = {
        code: 0,
        message: '接口不存在'
      }
    }
  }

  app.use(_.get('/api/*', ctx => generator(ctx, ctx.request.query)))
  app.use(_.post('/api/*', ctx => generator(ctx, ctx.request.body)))
}
