module.exports = {
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
  format (date, fmt) {
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
  }
}
