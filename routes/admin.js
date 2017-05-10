const _ = require('koa-route')
const lodash = require('lodash')
const mongo = require('koa-mongo')
const mock = require('../modules/mock')
const utils = require('../modules/utils')

module.exports = (app, API_CACHE) => {
  // mock数据预览
  app.use(_.post('/admin/preview', (ctx) => {
    try {
      const data = JSON.parse(ctx.request.body.data)
      ctx.body = mock(data, {})
    } catch (e) {
      ctx.body = {}
    }
  }))

  // 获取项目列表
  app.use(_.post('/admin/project/list', async (ctx) => {
    ctx.body = {
      status: 1,
      message: '',
      result: await ctx.mongo.collection('project').find({}, {sort: {_id: -1}}).toArray()
    }
  }))

  // 添加项目
  app.use(_.post('/admin/project/add', async (ctx) => {
    if (ctx.request.body.name) {
      const data = await ctx.mongo.collection('project').findOne({
        name: ctx.request.body.name
      })

      if (!data) {
        const res = await ctx.mongo.collection('project').insert({
          name: ctx.request.body.name,
          createTime: utils.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
        })

        ctx.body = {
          status: res.result.n,
          message: `项目创建${['失败', '成功'][res.result.n]}！`
        }
      } else {
        ctx.body = {
          status: 0,
          message: '项目已经存在'
        }
      }
    } else {
      ctx.body = {
        status: 0,
        message: '请输入项目名称'
      }
    }
  }))

  // 移除项目
  app.use(_.post('/admin/project/remove', async (ctx) => {
    if (ctx.request.body._id) {
      const data = await ctx.mongo.collection('project').findOne({
        _id: mongo.ObjectId(ctx.request.body._id)
      })
      if (data) {
        const res = await ctx.mongo.collection('project').remove({
          _id: mongo.ObjectId(ctx.request.body._id)
        })
        await ctx.mongo.collection('api').remove({
          project_id: mongo.ObjectId(ctx.request.body._id)
        })

        if (res.result.n === 1) {
          // 清理接口
          for (const uri in API_CACHE) {
            if ((new RegExp(`/api/${utils.md5(data.name)}`)).test(uri)) {
              delete API_CACHE[uri]
            }
          }
        }

        ctx.body = {
          status: res.result.n,
          message: `删除项目${['失败', '成功'][res.result.n]}！`
        }
      } else {
        ctx.body = {
          status: 0,
          message: '项目不存在'
        }
      }
    } else {
      ctx.body = {
        status: 0,
        message: '项目ID为空'
      }
    }
  }))

  // 获取接口列表
  app.use(_.post('/admin/api/list', async (ctx) => {
    if (ctx.request.body.project_id) {
      ctx.body = {
        status: 1,
        message: '',
        result: {
          project: await ctx.mongo.collection('project').findOne({
            _id: mongo.ObjectId(ctx.request.body.project_id)
          }),
          api: await ctx.mongo.collection('api').find({
            project_id: mongo.ObjectId(ctx.request.body.project_id)
          }, {
            mock: 0
          }, {sort: {_id: -1}}).toArray()
        }
      }
    } else {
      ctx.body = {
        status: 0,
        message: '项目ID为空'
      }
    }
  }))

  // 根据接口ID获取接口信息
  app.use(_.post('/admin/api/get', async (ctx) => {
    const data = await ctx.mongo.collection('api').findOne({
      _id: mongo.ObjectId(ctx.request.body._id)
    })

    if (data) {
      ctx.body = {
        status: 1,
        message: '',
        result: data
      }
    } else {
      ctx.body = {
        status: 0,
        message: '接口ID错误'
      }
    }
  }))

  // 添加接口
  app.use(_.post('/admin/api/add', async (ctx) => {
    const project = await ctx.mongo.collection('project').findOne({
      _id: mongo.ObjectId(ctx.request.body.project_id)
    })

    if (project) {
      const data = await ctx.mongo.collection('api').findOne({
        project_id: mongo.ObjectId(ctx.request.body.project_id),
        url: ctx.request.body.url
      })

      if (!data) {
        const res = await ctx.mongo.collection('api').insert({
          project_id: mongo.ObjectId(ctx.request.body.project_id),
          name: ctx.request.body.name,
          method: ctx.request.body.method,
          url: ctx.request.body.url,
          uri: `/api/${utils.md5(project.name) + ctx.request.body.url}`,
          explain: ctx.request.body.explain.trim(),
          request: [],
          response: [{
            'key': 'status',
            'type': 'number',
            'note': '请求状态码，1:接口请求成功并正确返回数据，非1:接口请求失败或其他错误原因'
          }, {
            'key': 'message',
            'type': 'string',
            'note': '请求信息或错误信息'
          }, {
            'key': 'result',
            'type': 'object',
            'note': '请求响应内容',
            'children': []
          }],
          mock: {
            'status': 1,
            'message': '',
            'result': {}
          }
        })

        // 添加接口
        if (res.result.n === 1) {
          API_CACHE[`/api/${utils.md5(project.name) + ctx.request.body.url}`] = {
            'status': 1,
            'message': '',
            'result': {}
          }
        }

        ctx.body = {
          status: res.result.n,
          message: `接口创建${['失败', '成功'][res.result.n]}！`
        }
      } else {
        ctx.body = {
          status: 0,
          message: '接口已经存在'
        }
      }
    } else {
      ctx.body = {
        status: 0,
        message: '项目ID错误'
      }
    }
  }))

  // 修改接口
  app.use(_.post('/admin/api/update', async (ctx) => {
    const data = await ctx.mongo.collection('api').findOne({
      _id: mongo.ObjectId(ctx.request.body._id)
    })

    if (data) {
      const project = await ctx.mongo.collection('project').findOne({
        _id: mongo.ObjectId(data.project_id)
      })

      const updateData = lodash.cloneDeep(ctx.request.body)
      if (updateData.explain) updateData.explain = updateData.explain.trim()
      if (updateData.url) {
        updateData.uri = `/api/${utils.md5(project.name) + updateData.url}`
      }
      if (updateData.request && updateData.response && Object.keys(ctx.request.body).length === 3) {
        const mock = utils.formatMock(updateData.response)
        updateData.mock = utils.assignMock(mock, data.mock)
      }
      delete updateData._edit
      delete updateData._id
      delete updateData.project_id
      delete updateData.type
      const res = await ctx.mongo.collection('api').updateOne({_id: mongo.ObjectId(ctx.request.body._id)}, {$set: updateData})

      if (res.result.n === 1) {
        delete API_CACHE[data.uri]
        API_CACHE[updateData.uri || data.uri] = updateData.mock || data.mock
      }

      ctx.body = {
        status: res.result.n,
        message: `修改接口${['失败', '成功'][res.result.n]}！`
      }
    } else {
      ctx.body = {
        status: 0,
        message: '接口不存在'
      }
    }
  }))

  // 移除接口
  app.use(_.post('/admin/api/remove', async (ctx) => {
    const data = await ctx.mongo.collection('api').findOne({
      _id: mongo.ObjectId(ctx.request.body._id)
    })

    if (data) {
      const res = await ctx.mongo.collection('api').remove({
        _id: mongo.ObjectId(ctx.request.body._id)
      })

      if (res.result.n === 1) {
        delete API_CACHE[data.uri]
      }

      ctx.body = {
        status: res.result.n,
        message: `删除接口${['失败', '成功'][res.result.n]}！`
      }
    } else {
      ctx.body = {
        status: 0,
        message: '接口不存在'
      }
    }
  }))

  // 复制接口
  app.use(_.post('/admin/api/copy', async (ctx) => {
    const project = await ctx.mongo.collection('project').findOne({
      _id: mongo.ObjectId(ctx.request.body.project_id)
    })

    if (project) {
      const dataOne = await ctx.mongo.collection('api').findOne({
        _id: mongo.ObjectId(ctx.request.body._id)
      })

      if (dataOne) {
        const dataTwo = await ctx.mongo.collection('api').findOne({
          project_id: mongo.ObjectId(ctx.request.body.project_id),
          url: dataOne.url
        })

        if (!dataTwo) {
          dataOne.project_id = mongo.ObjectId(ctx.request.body.project_id)
          dataOne.uri = `/api/${utils.md5(project.name) + dataOne.url}`
          delete dataOne._id
          const res = await ctx.mongo.collection('api').insert(dataOne)

          if (res.result.n === 1) {
            API_CACHE[dataOne.uri] = dataOne.mock
          }

          ctx.body = {
            status: res.result.n,
            message: `复制接口${['失败', '成功'][res.result.n]}！`
          }
        } else {
          ctx.body = {
            status: 0,
            message: '接口已经存在'
          }
        }
      } else {
        ctx.body = {
          status: 0,
          message: '接口不存在'
        }
      }
    } else {
      ctx.body = {
        status: 0,
        message: '项目不存在'
      }
    }
  }))
}
