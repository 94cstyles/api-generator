const apiRoutes = require('./api')
const adminRoutes = require('./admin')

module.exports = (app) => {
  const API_CACHE = {} // 接口缓存数据
  let API_CACHE_LOAD = false // 是否加载了缓存

  // 获取接口缓存
  app.use(async (ctx, next) => { // eslint-disable-line
    if (!API_CACHE_LOAD) {
      API_CACHE_LOAD = true
      const data = await ctx.mongo.collection('api').find().toArray()
      for (const o of data) {
        API_CACHE[o.uri] = o.mock
      }
    }
    await next()
  })

  // 路由
  apiRoutes(app, API_CACHE)
  adminRoutes(app, API_CACHE)
}
