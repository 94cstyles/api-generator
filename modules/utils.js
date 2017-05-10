module.exports = {
  isNumber (num) {
    return Object.prototype.toString.call(num) === '[object Number]'
  },
  isString (str) {
    return Object.prototype.toString.call(str) === '[object String]'
  },
  isArray (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
  },
  isObject (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
  },
  /**
   * 获取数据的md5字符串
   * @param data {String|Object} 数据
   * @param len {Number} 字符长度 默认:7
   * @returns {String} md5字符串
   */
  md5 (data, len = 7) {
    const md5sum = require('crypto').createHash('md5')
    const encoding = typeof data === 'string' ? 'utf8' : 'binary'
    md5sum.update(data, encoding)
    return md5sum.digest('hex').substring(0, len)
  },
  /**
   * 时间格式化
   * @param date {Date} 时间
   * @param fmt {String} 格式化类型
   * @returns {String} 时间字符串
   */
  formatDate (date, fmt) {
    const o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      'S': date.getMilliseconds()
    }

    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear().toString()).substring(4 - RegExp.$1.length))

    for (const k in o) {
      if ((new RegExp(`(${k})`)).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substring((o[k].toString()).length)))
    }

    return fmt
  },
  /**
   * 根据修改的response参数生成最新的mock数据模板
   * @param response {Object}
   * @returns {Object}
   */
  formatMock (response) {
    const temp = {}
    for (const item of response) {
      if (item.type === 'object') {
        temp[item.key] = item.children.length > 0 ? this.formatMock(item.children) : {}
      } else if (/array/.test(item.type)) {
        temp[item.key] = [{
          'repeat(1)': /array<object>/.test(item.type) ? (item.children.length > 0 ? this.formatMock(item.children) : {}) : ''
        }]
      } else {
        temp[item.key] = ''
      }
    }
    return temp
  },
  /**
   * 数据模板合并
   * @param newMock
   * @param oldMock
   * @returns {*}
   */
  assignMock (newMock, oldMock) {
    for (const key in newMock) {
      if (typeof oldMock[key] !== 'undefined') {  // 旧模板也包含该节点
        if (this.isString(newMock[key]) && !(this.isArray(oldMock[key]) || this.isObject(oldMock[key]))) {
          newMock[key] = oldMock[key] // 如果新模板和旧模板节点值都非array和object 直接赋值
        } else if (this.isObject(newMock[key]) && this.isObject(oldMock[key])) {
          newMock[key] = this.assignMock(newMock[key], oldMock[key]) // 如果都是object递归获取值
        } else if (this.isArray(newMock[key]) && this.isArray(oldMock[key])) {
          const newRepeat = Object.keys(newMock[key][0])[0]
          const newValue = newMock[key][0][newRepeat]
          const oldRepeat = Object.keys(oldMock[key][0])[0]
          const oldValue = oldMock[key][0][oldRepeat]

          console.log(newValue, oldValue)
          if (/^repeat\(.*\)$/.test(oldRepeat)) {
            let value = newValue
            if (this.isObject(newValue) && this.isObject(oldValue)) {
              value = this.assignMock(newValue, oldValue)
            } else if (this.isString(newValue) && !(this.isArray(oldValue) || this.isObject(oldValue))) {
              value = oldValue
            }
            newMock[key] = [{
              [oldRepeat]: value
            }]
          }
        }
      }
    }

    return newMock
  }
}
