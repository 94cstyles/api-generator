<template>
  <router-view></router-view>
</template>
<script>
  export default {
    data () {
      return {}
    }
  }
</script>
<style lang="scss" rel="stylesheet/scss" type="text/scss">
  * {
    margin: 0;
    padding: 0;
    outline: 0
  }

  #app, body, html {
    height: 100%
  }

  textarea {
    resize: none !important
  }

  ol, ul {
    list-style: none
  }

  body, button, input, textarea {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif
  }

  .f-cb::after {
    clear: both;
    content: "";
    display: table
  }

  .f-toe {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: normal
  }

  .page-container {
    width: 1140px;
    padding: 30px;
    margin: 0 auto;
    > h2 {
      font-weight: 400;
      color: #1f2f3d
    }
  }
</style>
