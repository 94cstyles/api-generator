<template>
    <div class="m-editor" v-loading.fullscreen.lock="loading">
        <div class="m-editor__nav">
            <el-button type="text" icon="caret-left" @click="$router.go(-1)">返回</el-button>
            <el-button type="text" icon="upload" @click="preview()">预览</el-button>
        </div>
        <textarea id="js_editor"></textarea>
        <el-dialog title="随机数据" v-model="visible" size="full" custom-class="u-preview">
            <pre>{{mock}}</pre>
            <div slot="footer" class="dialog-footer">
                <el-button @click="visible = false">取 消</el-button>
                <el-button type="primary" @click="submit()">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
  import jsonlint from 'jsonlint-mod'
  import minify from 'jsonminify'
  import autocomplete from '../utils/autocomplete'
  import placeholder from '../utils/placeholder'

  export default {
    data () {
      return {
        loading: false,
        editor: null,
        temp: '',
        mock: '',
        visible: false
      }
    },
    methods: {
      /**
       * 初始化
       */
      init () {
        this.loading = true
        this.$http.post('/admin/api/get', {
          _id: this.$route.params.id
        }).then(({data}) => {
          this.loading = false
          if (data.code === 1) {
            this.temp = data.result.mock
            if (JSON.stringify(data.result.mock) === '{}') this.temp = placeholder
            // 初始化json编辑器
            const extraKeys = /Mac OS X/.test(navigator.userAgent) ? {'Cmd-Space': 'autocomplete'} : {'Ctrl-Space': 'autocomplete'}
            this.editor = CodeMirror.fromTextArea(document.getElementById('js_editor'), {
              mode: 'application/json',
              indentUnit: 2,
              indentWithTabs: true,
              lineWrapping: true,
              lineNumbers: true,
              matchBrackets: true,
              theme: 'dracula',
              extraKeys: extraKeys,
              hintOptions: {
                hint: autocomplete
              }
            })
            this.editor.on('change', () => this.highlightErrorLine(null))
            this.editor.setValue(JSON.stringify(this.temp, null, 2)) // 设置默认值
          } else {
            this.$message.error(data.message)
            this.$router.push({name: 'api', params: {id: this.$route.query.id}})
          }
        }).catch(() => {
          this.loading = false
          this.$message.error('获取数据失败')
          this.$router.push({name: 'api', params: {id: this.$route.query.id}})
        })
      },
      /**
       * 显示json错误
       **/
      highlightErrorLine (line) {
        if (typeof line === 'number') {
          this.errorLine = this.editor.addLineClass(line, 'background', 'm-editor__line--error')
          this.editor.setCursor(line)
        } else if (this.errorLine) {
          this.editor.removeLineClass(this.errorLine, 'background', 'm-editor__line--error')
          this.errorLine = null
        }
      },
      /**
       * 预览
       */
      preview () {
        try {
          jsonlint.parse(this.editor.getValue())
          this.loading = true
          this.$http.post('/admin/preview', {data: minify(this.editor.getValue())})
            .then((res) => {
              this.mock = JSON.stringify(res.data, null, 4)
              this.loading = false
              this.visible = true
            })
            .catch(() => {
              this.loading = false
              this.$message({
                message: '生成模拟数据失败！',
                type: 'warning',
                duration: 1500
              })
            })
        } catch (e) {
          const lineMatches = e.message.match(/line ([0-9]*)/)
          if (lineMatches && lineMatches.length > 1) this.highlightErrorLine(+lineMatches[1] - 1)
          console.error(e) // 控制台打印json格式错误信息
        }
      },
      /**
       * 提交mock数据模板
       */
      submit () {
        this.loading = true
        this.$http.post(`/admin/api/update`, {
          _id: this.$route.params.id,
          mock: JSON.parse(this.editor.getValue())
        }).then(({data}) => {
          if (data.code === 1) {
            this.$message({
              message: '修改mock数据成功',
              type: 'success'
            })
            this.$router.push({name: 'api', params: {id: this.$route.query.id}})
          } else {
            this.$message.error(data.message)
          }
          this.loading = false
        }).catch(() => {
          this.loading = false
          this.$message.error(`修改mock数据失败`)
        })
      }
    },
    created () {
      this.init()
    }
  }
</script>
<style lang="scss" rel="stylesheet/scss" type="text/scss">
    .m-editor {
        position: relative;
        padding-top: 40px;
        height: 100%;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        &__nav {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 10;
            width: 100%;
            height: 40px;
            border-bottom: 1px solid #1a1b1e;
            background-color: #3b3e41;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            button {
                height: 100%;
                padding: 13px 20px;
                color: #fff;
                -webkit-box-sizing: border-box;
                box-sizing: border-box;;
                & + button {
                    margin-left: 0 !important;
                }
            }
        }
        &__line--error {
            background-color: rgba(255, 255, 255, .2);
        }
        .CodeMirror {
            height: 100%;
        }
    }

    .u-preview {
        padding: 42px 0 51px;
        overflow: hidden;
        .el-dialog__header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
        }
        .el-dialog__body {
            height: 100%;
            padding: 0 20px;
            white-space: normal;
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-all;
            overflow: auto;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;;
        }
        .el-dialog__footer {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
        }
    }
</style>
