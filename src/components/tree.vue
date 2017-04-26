<template>
  <ul>
    <template v-for="(item, index) in currentValue">
      <li class="u-treeTable__tr">
        <div class="u-treeTable__td">
          <i class="el-icon-arrow-down" :style="tdStyle(item)"></i>
          <div class="u-treeTable__text" v-if="disable" :style="{ 'paddingLeft': (currentLevel * 15 + 30) + 'px' }">{{item.key}}</div>
          <el-input v-else v-model="item.key" placeholder="请输入参数名" :style="{ 'paddingLeft': (currentLevel * 15 + 10) + 'px' }"></el-input>
        </div>
        <div class="u-treeTable__td">
          <div class="u-treeTable__text" v-if="disable">{{item.type}}</div>
          <el-select v-else v-model="item.type" placeholder="请选择请求类型" @change="change(item, index)">
            <el-option v-for="text in options" :key="text" :label="text" :value="text"></el-option>
          </el-select>
        </div>
        <div class="u-treeTable__td" :style="{'marginRight': disable ? 0 : '-100px'}">
          <div class="wrap" :style="{'marginRight': disable ? 0 : '100px'}">
            <div class="u-treeTable__text" v-if="disable">{{item.note}}</div>
            <el-input v-else v-model="item.note" type="textarea" :autosize="{ minRows: 1, maxRows: 20}" placeholder="请输入备注"></el-input>
          </div>
        </div>
        <div class="u-treeTable__td" v-show="!disable">
          <el-button size="small" type="success" icon="plus" title="添加" v-if="/object/.test(item.type)" @click="add(index)"></el-button>
          <el-button size="small" type="danger" icon="delete" title="删除" @click="remove(index)"></el-button>
        </div>
      </li>
      <tree v-if="item.children" v-model="item.children" :level="currentLevel + 1" :disable="disable"></tree>
    </template>
  </ul>
</template>
<script>
  export default {
    name: 'tree',
    props: {
      value: {
        type: Array,
        default: []
      },
      level: {
        type: Number,
        default: 0
      },
      disable: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        currentLevel: this.level,
        currentValue: this.value,
        options: ['number', 'string', 'object', 'boolean', 'array', 'array<number>', 'array<string>', 'array<object>', 'array<boolean>']
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
      tdStyle (item) {
        return {
          left: (this.currentLevel * 15 + 10) + 'px',
          visibility: item.children && item.children.length > 0 ? 'visible' : 'hidden'
        }
      },
      change (item, index) {
        if (/object/.test(item.type)) {
          if (!item.children) {
            this.$set(this.currentValue[index], 'children', [])
          }
        } else {
          if (item.children) {
            this.$delete(this.currentValue[index], 'children')
          }
        }
      },
      add (index) {
        this.currentValue[index].children.unshift({
          key: '',
          type: '',
          note: ''
        })
      },
      remove (index) {
        this.$delete(this.currentValue, index)
      }
    }
  }
</script>
<style lang="scss" rel="stylesheet/scss" type="text/scss">
</style>
