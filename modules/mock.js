const faker = require('faker')
const Mock = require('mockjs')
const {isNumber} = require('lodash')

// mock数据生产模板
const mock = {
  // 获取请求参数
  request: (data, key) => {
    if (key) {
      const keys = key.replace(/^'/, '').replace(/'$/, '').split('.')
      for (const k of keys) {
        try {
          if (!data[k]) {
            return 'undefined'
          } else {
            data = data[k]
          }
        } catch (e) {
          return 'undefined'
        }
      }
      return data
    } else {
      return JSON.stringify(data)
    }
  },
  // 队列索引
  index: (index, start = 0) => Number(index) + (Number(start) || 0),
  // uuid
  id: () => faker.random.uuid(),
  // bool
  bool: () => faker.random.boolean(),
  // 整数
  integer: (min = 0, max = 99999) => faker.random.number({min, max}),
  // 小数
  float: (min = 0, max = 1000, dec = 2) => Number(faker.finance.amount(min, max, dec)),
  // 字符串
  string: (min, max) => Mock.mock(`@csentence(${min}, ${max})`),
  // 从传递队列中返回一值
  random: (...args) => {
    return args.length > 0 ? args[faker.random.number({max: args.length - 1})] : null
  },
  // 名字
  name: () => Mock.mock('@cname'),
  // 年龄
  age: (min = 0, max = 100) => faker.random.number({min, max}),
  // 性别
  gender: (other = false) => ['男', '女', '未知'][faker.random.number({min: 0, max: other ? 2 : 1})],
  // 邮箱
  email: () => faker.internet.email(),
  // 电话
  phone: () => faker.phone.phoneNumber(),
  // 用户名
  username: () => faker.internet.userName(),
  // 密码
  password: () => faker.internet.password(),
  // 地区
  region: () => Mock.mock('@region'),
  // 省份名
  province: () => Mock.mock('@province'),
  // 城市名
  city: () => Mock.mock('@city'),
  // 区县名
  county: () => Mock.mock('@county'),
  // 完整的地址
  address: () => Mock.mock('@county(true)').replace(/( |-)/g, ''),
  // 邮编
  zip: () => Mock.mock('@zip'),
  // 经度
  longitude: () => faker.address.longitude(),
  // 纬度
  latitude: () => faker.address.latitude(),
  // 网址
  url: () => {
    faker.locale = 'en'
    const url = faker.internet.url()
    faker.locale = 'zh_CN'
    return url
  },
  // ua信息
  ua: () => faker.internet.userAgent(),
  // ip
  ip: () => faker.internet.ip(),
  // mac
  mac: () => faker.internet.mac(),
  // 随机头像
  avatar: () => faker.internet.avatar(),
  // 随机图片
  image: (width = 100, height = width) => `http://lorempixel.com/${width}/${height}`,
  // 颜色
  color: () => faker.internet.color(),
  // rgb颜色
  rgb: () => Mock.mock('@rgb'),
  // rgba颜色
  rgba: () => Mock.mock('@rgba'),
  // date
  date: (format = 'yyyy-MM-dd') => Mock.mock(`@date(${format})`),
  // time
  time: (format = 'HH:mm:ss') => Mock.mock(`@time(${format})`),
  // datetime
  datetime: (format = 'yyyy-MM-dd HH:mm:ss') => Mock.mock(`@datetime(${format})`),
  // 标题
  title: (min, max) => Mock.mock(`@ctitle(${min}, ${max})`),
  // 段落
  paragraph: (min, max) => Mock.mock(`@cparagraph(${min}, ${max})`),
  // 句子
  sentence: (min, max) => Mock.mock(`@csentence(${min}, ${max})`)
}

// 匹配所有数据模板
const regAll = /{{(request|index|id|bool|integer|float|string|random|age|gender|email|phone|username|password|longitude|latitude|url|ua|ip|mac|avatar|image|color|rgb|rgba|date|time|datetime|title|paragraph|sentence|name|region|province|city|county|address|zip)\(\S*\)}}/g
// 匹配number类型数据模板
const regNumber = /^{{(index|integer|float|age|longitude|latitude)\(\S*\)}}$/
// 匹配bool类型数据模板
const regBoolean = /^{{(bool)\(\S*\)}}$/

/**
 * 空函数 内部不做任何处理 直接返回参数
 * @param text
 * @returns {*}
 */
function noop (text) {
  return text
}

/**
 * 创建空数组
 * @param min {Number}  列表最小长度
 * @param max {Number} 列表最大长度
 * @returns {Array} 空数组
 */
function repeat (min = 1, max = min) { // eslint-disable-line no-unused-vars
  if (isNumber(min) && isNumber(max)) {
    const len = faker.random.number({
      min: Math.min(min, max),
      max: Math.max(min, max)
    })

    return new Array(len)
  } else {
    return new Array(1)
  }
}

/**
 * 递归处理mock模板
 * @param temp
 * @param data
 * @param index
 * @returns {*}
 */
function clone (temp, data, index) {
  if (Object.prototype.toString.call(temp) === '[object Array]') {
    if (temp.length === 1) {
      const keys = Object.keys(temp[0])
      // 处理repeat(min, max)
      if (keys.length === 1 && /^repeat\(.*\)$/.test(keys[0])) {
        const _ = Object.assign({}, temp[0][keys[0]])
        try {
          temp = eval(keys[0]) // eslint-disable-line no-eval
          for (let i = 0; i < temp.length; i++) {
            temp[i] = Object.assign({}, _)
          }
        } catch (e) {
          temp = [_]
        }
      }
    }

    // 拆分数组进行处理
    for (let [i, o] of temp.entries()) {
      o = clone(o, data, --i + 1)
    }
  } else if (typeof temp === 'object' && temp !== null) {
    // 拆分对象进行处理
    for (const key in temp) {
      temp[key] = clone(temp[key], data, index)
    }
  } else if (typeof temp === 'string' && regAll.test(temp)) {
    const match = temp.match(regAll)

    if (match && match.length > 0) {
      const type = regNumber.test(temp) ? Number : regBoolean.test(temp) ? Boolean : noop

      for (const m of match) {
        if (/{{(index)\(.*\)}}/.test(m)) {
          // 处理 {{index()}}
          temp = temp.replace(m, mock.index(index, m.replace(/^{\{index\(/, '').replace(/\)}}$/, '')))
        } else if (/{{(request)\(.*\)}}/.test(m)) {
          // 处理 {{request(*)}} 获取请求参数
          const ret = mock.request(data, m.replace(/^{\{request\(/, '').replace(/\)}}$/, ''))
          if (/^{{(request)\([)}]*\)}}$/.test(m)) {
            try {
              temp = JSON.parse(ret)
            } catch (e) {
              temp = ret
            }
          } else {
            temp = temp.replace(m, ret)
          }
        } else {
          temp = temp.replace(m, eval(m.replace(/^{{/, 'mock.').replace(/}}$/, ''))) // eslint-disable-line no-eval
        }
      }
      temp = type(temp) // 数据类型转换
    }
  }
  return temp
}

module.exports = clone
