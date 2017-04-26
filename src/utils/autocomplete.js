const completions = [{
  text: '{{request()}}',
  displayText: 'request(key?): 获取请求参数'
}, {
  text: '{{index()}}',
  displayText: 'index(start?): 队列索引'
}, {
  text: '{{id()}}',
  displayText: 'id(): 唯一标示'
}, {
  text: '{{bool()}}',
  displayText: 'bool(): 布尔值'
}, {
  text: '{{integer()}}',
  displayText: 'integer(min?, max?): 整数'
}, {
  text: '{{float()}}',
  displayText: 'float(min?, max?, dec?): 小数'
}, {
  text: '{{string()}}',
  displayText: 'string(min?, max?): 中文字符串'
}, {
  text: '{{random()}}',
  displayText: 'random(...): 从传递的参数列表返回随机项'
}, {
  text: '{{name()}}',
  displayText: 'name(): 中文名'
}, {
  text: '{{age()}}',
  displayText: 'age(start?, end?): 年龄'
}, {
  text: '{{gender()}}',
  displayText: 'gender(other?): 性别'
}, {
  text: '{{email()}}',
  displayText: 'email(): 邮箱'
}, {
  text: '{{phone()}}',
  displayText: 'phone(): 电话'
}, {
  text: '{{username()}}',
  displayText: 'username(): 昵称'
}, {
  text: '{{password()}}',
  displayText: 'password(): 密码'
}, {
  text: '{{region()}}',
  displayText: 'region(): 地区'
}, {
  text: '{{province()}}',
  displayText: 'province(): 省份'
}, {
  text: '{{city()}}',
  displayText: 'city(): 城市'
}, {
  text: '{{address()}}',
  displayText: 'address(): 地址'
}, {
  text: '{{zip()}}',
  displayText: 'zip(): 邮编'
}, {
  text: '{{longitude()}}',
  displayText: 'longitude(): 经度'
}, {
  text: '{{latitude()}}',
  displayText: 'latitude(): 纬度'
}, {
  text: '{{url()}}',
  displayText: 'url(): 网址'
}, {
  text: '{{ua()}}',
  displayText: 'ua(): HTTP请求的用户代理头'
}, {
  text: '{{ip()}}',
  displayText: 'ip(): ip地址'
}, {
  text: '{{mac()}}',
  displayText: 'mac(): mac地址'
}, {
  text: '{{avatar()}}',
  displayText: 'avatar(): 头像'
}, {
  text: '{{image(width?, height?)}}',
  displayText: 'image(): 图片'
}, {
  text: '{{color()}}',
  displayText: 'color(): 颜色'
}, {
  text: '{{rgb()}}',
  displayText: 'rgb(): rgb颜色'
}, {
  text: '{{rgba()}}',
  displayText: 'rgba(): rgba颜色'
}, {
  text: '{{date()}}',
  displayText: 'date(format?): 日期'
}, {
  text: '{{time()}}',
  displayText: 'time(format?): 时间'
}, {
  text: '{{datetime()}}',
  displayText: 'datetime(format?): 具体时间'
}, {
  text: '{{title()}}',
  displayText: 'title(): 标题'
}, {
  text: '{{paragraph()}}',
  displayText: 'paragraph(): 段落'
}, {
  text: '{{sentence(min?, max?)}}',
  displayText: 'sentence(min?, max?): 句子'
}]

export default function (cm, option) {
  const cursor = cm.getCursor()
  const line = cm.getLine(cursor.line)

  let start = cursor.ch
  let end = cursor.ch
  let _ = []

  while (start && /[\w{}()]/.test(line.charAt(start - 1))) --start
  while (end < line.length && /[\w{}()]/.test(line.charAt(end))) ++end
  let word = line.slice(start, end)
  word = /^{{}}$/.test(word) ? '{{' : word

  if (/^rep/.test(word)) {
    _ = 'repeat()'
  } else if (/^{{/.test(word) || word === '') {
    _ = completions.filter((o) => {
      return o.text.indexOf(word) === 0
    })
  }

  return {
    list: _,
    from: CodeMirror.Pos(cursor.line, start),
    to: CodeMirror.Pos(cursor.line, end)
  }
}
