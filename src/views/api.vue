<template>
  <div class="m-api" v-loading.fullscreen.lock="loading">
    <div class="page-container">
      <h2>
        <i class="el-icon-edit"></i> 接口列表<span v-show="projectName">({{projectName}})</span>
      </h2>
      <div class="m-api__wrapper">
        <div class="m-api__head">
          <el-button-group>
            <el-button @click="$router.push({ name: 'index' })">返回主页</el-button>
            <el-button @click="showEditDialog('add')">添加接口</el-button>
          </el-button-group>
        </div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column type="expand">
            <template scope="props">
              <div v-loading.body="props.row._edit.loading">
                <div style="text-align: right">
                  <el-button v-show="!props.row._edit.disable" @click="props.row._edit.disable = true">编辑</el-button>
                  <el-button-group v-show="props.row._edit.disable">
                    <el-button @click="cancel(props.row, props.$index)">取消</el-button>
                    <el-button @click="save(props.row, props.$index)">保存</el-button>
                  </el-button-group>
                </div>
                <template v-if="props.row.explain">
                  <h3 class="m-api__tit">说明</h3>
                  <div class="m-api__des">{{props.row.explain}}</div>
                </template>
                <h3 class="m-api__tit">请求参数列表</h3>
                <treeTable v-model="props.row._edit.request" type="request" :disable="!props.row._edit.disable"></treeTable>
                <h3 class="m-api__tit">响应参数列表</h3>
                <treeTable v-model="props.row._edit.response" :disable="!props.row._edit.disable"></treeTable>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="name"></el-table-column>
          <el-table-column label="请求类型" prop="method" width="94" align="center"></el-table-column>
          <el-table-column label="请求链接" prop="url"></el-table-column>
          <el-table-column label="操作" width="255" align="center">
            <template scope="scope">
              <el-button size="small" icon="edit" title="修改" @click="showEditDialog('update', scope.row)"></el-button>
              <el-button size="small" icon="document" title="复制" @click="showCopyDialog(scope.row._id)"></el-button>
              <el-button size="small" type="danger" icon="delete" title="删除" @click="remove(scope.row._id)"></el-button>
              <el-button size="small" type="primary" icon="setting" title="设置" @click="mock(scope.row._id)"></el-button>
              <el-button size="small" type="primary" icon="share" title="分享" @click="link(scope.row.uri)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 编辑接口弹出窗 -->
    <el-dialog :title="formData.type === 'add' ? '添加接口' : '编辑接口'" v-model="fromDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form ref="editForm" :model="formData" :rules="formRules" label-width="94px">
        <el-form-item label="名称" required prop="name">
          <el-input v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="请求类型" required prop="method">
          <el-radio-group v-model="formData.method">
            <el-radio label="GET"></el-radio>
            <el-radio label="POST"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="请求链接" required prop="url">
          <el-input v-model="formData.url" placeholder="/api/user">
          </el-input>
        </el-form-item>
        <el-form-item label="说明" prop="explain">
          <el-input type="textarea" v-model="formData.explain" :autosize="{ minRows: 1, maxRows: 4 }"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 复制接口弹出窗 -->
    <el-dialog title="复制接口" v-model="copyDialogVisible" size="tiny">
      <el-select v-model="copyDest" :style="{width:'100%'}" clearable filterable placeholder="请选择项目">
        <el-option v-for="item in copyOptions" :key="item._id" :label="item.name" :value="item._id" :disabled="item._id === $route.params.project"></el-option>
      </el-select>
      <div slot="footer" class="dialog-footer">
        <el-button @click="copyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="copy()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import treeTable from '../components/tree-table.vue'

  // 接口默认参数
  const DEFAULT_DATA = {
    name: '',
    method: 'POST',
    url: '',
    explain: ''
  }

  export default {
    data () {
      return {
        loading: false,
        projectName: '',
        tableData: [],
        fromDialogVisible: false,
        formData: this.$extend({type: 'add'}, DEFAULT_DATA),
        formRules: {
          name: {required: true, message: '请输入接口名称', trigger: 'blur'},
          url: [
            {required: true, message: '请输入请求链接', trigger: 'blur'},
            {pattern: /^(\/\w+)+/, message: '请输入正确的请求链接', trigger: 'blur'}
          ]
        },
        copyDialogVisible: false,
        copyTarget: '',
        copyDest: '',
        copyOptions: []
      }
    },
    methods: {
      /**
       * 获取项目信息和接口列表
       */
      loadData () {
        this.$http.post('/admin/api/list', {
          project_id: this.$route.params.project
        }).then(({data}) => {
          if (data.status === 1) {
            this.projectName = data.result.project.name
            data.result.api.forEach((o, i) => {
              data.result.api[i]._edit = {
                disable: false,
                loading: false,
                request: this.$cloneDeep(o.request),
                response: this.$cloneDeep(o.response)
              }
            })
            this.tableData = data.result.api
          } else {
            this.$message.error('获取数据失败')
          }
        }).catch(() => {
          this.$message.error('获取数据失败')
        })
      },
      /**
       * 删除接口
       * @param id
       */
      remove (id) {
        this.$confirm('此操作将永久删除该接口, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.loading = true
          this.$http.post('/admin/api/remove', {
            _id: id
          }).then(({data}) => {
            if (data.status === 1) {
              this.loadData()
            } else {
              this.$message.error(data.message)
            }
            this.loading = false
          }).catch(() => {
            this.loading = false
            this.$message.error('删除接口失败')
          })
        })
      },
      /**
       * 编辑接口
       */
      edit () {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.loading = true
            this.$http.post(`/admin/api/${this.formData.type}`, this.$extend({
              project_id: this.$route.params.project
            }, this.formData)).then(({data}) => {
              if (data.status === 1) {
                this.loadData()
                this.fromDialogVisible = false
              } else {
                this.$message.error(data.message)
              }
              this.loading = false
            }).catch(() => {
              this.loading = false
              this.$message.error(`${this.formData.type === 'add' ? '创建' : '修改'}接口失败`)
            })
          }
        })
      },
      /**
       * 复制接口
       */
      copy () {
        if (this.copyDest) {
          this.loading = true
          this.$http.post('/admin/api/copy', {
            _id: this.copyTarget,
            project_id: this.copyDest
          }).then(({data}) => {
            if (data.status === 1) {
              this.copyDialogVisible = false
              this.$message({
                message: data.message,
                type: 'success'
              })
            } else {
              this.$message.error(data.message)
            }
            this.loading = false
          }).catch(() => {
            this.loading = false
            this.$message.error('复制接口失败')
          })
        } else {
          this.$message('请选择目标项目')
        }
      },
      /**
       * 展示接口编辑对话框
       * @param type
       * @param item
       */
      showEditDialog (type, item) {
        this.formData = this.$extend({type: type}, type === 'add' ? DEFAULT_DATA : item)
        this.fromDialogVisible = true
      },
      /**
       * 展示接口复制对话框
       * @param id
       */
      showCopyDialog (id) {
        this.loading = true
        this.$http.post('/admin/project/list')
          .then(({data}) => {
            if (data.status === 1) {
              this.copyOptions = data.result
              this.copyTarget = id
              this.copyDest = ''
              this.copyDialogVisible = true
            } else {
              this.$message.error('获取数据失败')
            }
            this.loading = false
          })
          .catch(() => {
            this.loading = false
            this.$message.error('获取数据失败')
          })
      },
      /**
       * 模拟数据设置
       * @param id
       */
      mock (id) {
        this.$router.push({
          name: 'generator',
          params: {
            id: id,
            project: this.$route.params.project
          }
        })
      },
      /**
       * 模拟数据查看
       * @param uri
       */
      link (uri) {
        window.open(location.origin + uri)
      },
      /**
       * 参数格式化
       * @param parameter
       */
      format (parameter) {
        for (let i = parameter.length - 1; i >= 0; i--) {
          if (parameter[i].key.trim() === '') {
            parameter.splice(i, 1)
          } else if (parameter[i].children) {
            parameter[i].children = this.format(parameter[i].children)
          }
        }
        return parameter
      },
      /**
       * 取消参数设定
       * @param row
       * @param index
       */
      cancel (row, index) {
        this.$set(this.tableData[index], '_edit', {
          disable: false,
          loading: false,
          request: this.$cloneDeep(row.request),
          response: this.$cloneDeep(row.response)
        })
      },
      /**
       * 保存参数设定
       * @param row
       * @param index
       */
      save (row, index) {
        this.$set(this.tableData[index]._edit, 'loading', true)

        this.$http.post(`/admin/api/update`, {
          _id: row._id,
          request: this.format(row._edit.request),
          response: this.format(row._edit.response)
        }).then(({data}) => {
          if (data.status === 1) {
            this.$set(this.tableData[index]._edit, 'loading', false)
            this.$set(this.tableData[index]._edit, 'disable', false)
            this.$message({
              message: '设置参数信息成功！',
              type: 'success'
            })
          } else {
            this.cancel(row, index)
            this.$message.error(data.message)
          }
        }).catch(() => {
          this.cancel(row, index)
          this.$message.error('设置参数信息失败！')
        })
      }
    },
    created () {
      this.loadData()
    },
    components: {
      treeTable
    }
  }
</script>
<style lang="scss" rel="stylesheet/scss" type="text/scss">
  .m-api {
    &__wrapper {
      padding: 20px 0;
    }
    &__head {
      padding-bottom: 20px;
      margin-top: -54px;
      text-align: right
    }
    &__tit {
      margin-bottom: 12px;
    }
    &__des {
      margin: -12px 0 24px;
      line-height: 36px;
      font-size: 14px;
      color: #1f2d3d;
    }
    .u-treeTable + &__tit {
      margin-top: 24px;
    }
  }
</style>
