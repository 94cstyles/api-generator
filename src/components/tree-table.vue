<template>
  <div class="u-treeTable">
    <div class="u-treeTable__table">
      <div class="u-treeTable__tr">
        <div class="u-treeTable__th s-column-key" :class="{'s-column-small': type === 'request'}">参数名</div>
        <div class="u-treeTable__th s-column-type" v-if="type === 'request'">必填</div>
        <div class="u-treeTable__th s-column-type">类型</div>
        <div class="u-treeTable__th s-column-note" :style="{'marginRight': disable ? 0 : '-100px'}">
          <div class="wrap" :style="{'marginRight': disable ? 0 : '100px'}">备注</div>
        </div>
        <div class="u-treeTable__th s-column-btn" v-show="!disable">操作</div>
      </div>
      <div class="u-treeTable__null" v-show="currentValue.length === 0">没有参数</div>
      <tree v-model="currentValue" :disable="disable" :type="type"></tree>
    </div>
    <div class="u-treeTable__foot" v-show="!disable">
      <el-button size="small" @click="add()">添加参数</el-button>
    </div>
  </div>
</template>
<script>
  import tree from './tree.vue'

  export default {
    name: 'tree-table',
    props: {
      type: {
        type: String,
        default: 'response'
      },
      value: {
        type: Array,
        default: []
      },
      disable: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        currentValue: this.value
      }
    },
    watch: {
      currentValue: {
        handler (val) {
          this.$emit('input', val)
        },
        deep: true
      },
      value (val) {
        this.currentValue = val
      }
    },
    methods: {
      add () {
        this.currentValue.push({
          key: '',
          required: '是',
          type: '',
          note: ''
        })
      }
    },
    components: {
      tree
    }
  }
</script>
<style lang="scss" rel="stylesheet/scss" type="text/scss">
  .u-treeTable {
    &__table {
      width: 100%;
      background-color: #fff;
      color: #5e6d82;
      font-size: 14px;
    }
    &__tr {
      position: relative;
      overflow: hidden;
      border-bottom: 1px solid #eaeefb;
      > * {
        line-height: 20px;
        border-bottom: 1px solid #eaeefb;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        &.s-column-key {
          position: relative;
          float: left;
          width: 324px;
          &.s-column-small {
            width: 204px;
          }
        }

        &.s-column-type {
          position: relative;
          float: left;
          width: 120px;
          text-align: center;
        }

        &.s-column-note {
          float: left;
          width: 100%;
          margin-left: -444px;
          margin-right: -100px;
          > .wrap {
            margin-left: 444px;
            margin-right: 100px;
          }
        }

        &.s-column-btn {
          position: relative;
          float: left;
          width: 90px;
          padding-right: 10px;
          text-align: right;
        }
      }
    }
    &__th {
      padding: 10px;
      text-align: left;
      background-color: #eff2f7;
      white-space: nowrap
    }
    &__td {
      padding-bottom: 500px;
      margin-bottom: -500px;
    }
    &__text {
      line-height: 30px;
      padding: 3px 10px;
      white-space: normal;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-all;
    }
    &__null {
      height: 38px;
      text-align: center;
      line-height: 38px;
      color: #5e6d82;
    }
    &__foot {
      margin-top: 12px;
    }
    .el-button {
      margin-top: 4px;
    }
    .el-icon-arrow-down {
      position: absolute;
      top: 14px;
      left: 10px;
      z-index: 10;
      font-size: 12px;
    }
    .el-input .el-input__inner,
    .el-textarea .el-textarea__inner {
      padding: 3px 10px;
      line-height: 30px;
      color: #5e6d82;
      border: 0 none;
    }
    .el-textarea .el-textarea__inner {
      white-space: normal;
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-all;
    }
    .el-input .el-input__inner {
      padding-left: 20px;
    }
    .el-select {
      &.z-active .el-input__inner {
        &::-webkit-input-placeholder {
          color: #5e6d82;
        }
        &:-ms-input-placeholder {
          color: #5e6d82;
        }
        &::-moz-placeholder {
          color: #5e6d82;
          opacity: 1;
        }
        &::placeholder {
          color: #5e6d82;
          opacity: 1;
        }
      }
      .el-input__inner {
        padding: 0;
        text-align: center;
        border: 0 none;
        color: #5e6d82;
      }
      .el-input__icon {
        display: none;
      }
    }
  }
</style>
