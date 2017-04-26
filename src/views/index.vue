<template>
  <div class="m-project">
    <div class="page-container">
      <h2>
        <i class="el-icon-document"></i> 项目列表
      </h2>
      <div class="m-project__wrapper">
        <el-row>
          <el-col v-for="(item, index) in listData" :key="item._id" :span="5" :offset="index % 4 ===  0 ? 0 : 1" :style="{'margin-top': index > 3 ? '12px' : '0px'}">
            <el-card class="m-project__item" :body-style="{padding: '14px'}">
              <div class="m-project__name f-toe">{{item.name}}</div>
              <div class="m-project__foot f-cb">
                <time class="m-project__time">{{item.createTime}}</time>
                <el-dropdown>
                  <span class="el-dropdown-link">操作</span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="$router.push({ name: 'api',  params: { project: item._id }})">编辑</el-dropdown-item>
                    <el-dropdown-item @click.native="remove(item._id)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-card>
          </el-col>
          <el-col :span="5" :offset="listData.length % 4 ===  0 ? 0 : 1" :style="{'margin-top': listData.length > 3 ? '12px' : '0px'}">
            <div class="m-project__add" @click="add">
              <i class="el-icon-plus"></i>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        loading: false,
        listData: []
      }
    },
    methods: {
      /**
       * 加载项目列表
       */
      loadData () {
        this.$http.post('/admin/project/list')
          .then(({data}) => {
            if (data.code === 1) {
              this.listData = data.result
            } else {
              this.$message.error('获取数据失败')
            }
          })
          .catch(() => this.$message.error('获取数据失败'))
      },
      /**
       * 添加项目
       */
      add () {
        this.$prompt('项目名称:', '创建项目', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'u-create-project',
          inputValidator: function (val) {
            return val !== null && !(/^\s*$/.test(val))
          },
          inputErrorMessage: '请输入项目名称'
        }).then(({value}) => {
          this.loading = true
          this.$http.post('/admin/project/add', {
            name: value
          }).then(({data}) => {
            this.loading = false
            if (data.code === 1) {
              this.loadData()
            } else {
              this.$message.error(data.message)
            }
          }).catch(() => {
            this.loading = false
            this.$message.error('创建项目失败')
          })
        })
      },
      /**
       * 删除项目
       * @param {String} id
       */
      remove (id) {
        this.$confirm('此操作将永久删除该项目, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.loading = true
          this.$http.post('/admin/project/remove', {
            _id: id
          }).then(({data}) => {
            if (data.code === 1) {
              this.loadData()
            } else {
              this.$message(data.message)
            }
            this.loading = false
          }).catch(() => {
            this.loading = false
            this.$message.error('删除项目失败')
          })
        })
      }
    },
    created () {
      this.loadData() // 加载数据
    }
  }
</script>
<style lang="scss" rel="stylesheet/scss" type="text/scss">
  .m-project {
    &__wrapper {
      padding: 20px 0;
      line-height: 1;
    }
    &__name {
    }
    &__foot {
      margin-top: 13px;
      font-size: 13px;
    }
    &__time {
      color: #999;
    }
    &__add {
      height: 76px;
      text-align: center;
      line-height: 76px;
      font-size: 32px;
      color: #eaeaea;
      background-color: #fff;
      border: 1px dashed #ddd;
    }
    .el-dropdown {
      padding: 0;
      float: right;
      .el-dropdown-link {
        color: #20a0ff;
        font-size: 12px;
      }
    }
  }

  .u-create-project {
    .el-message-box {
      &__input {
        margin-top: -28px;
        padding-left: 68px;
        padding-top: 0;
      }
      &__content {
        padding-bottom: 0;
      }
    }
  }
</style>
