import Vue from 'vue'
import VueRouter from 'vue-router'
import Element from 'element-ui'
import axios from 'axios'
import cloneDeep from 'lodash-es/cloneDeep'
import extend from 'lodash-es/extend'
import App from './App'
import indexView from './views/index.vue'
import apiView from './views/api.vue'
import generatorView from './views/generator.vue'

Vue.config.productionTip = false
Vue.prototype.$cloneDeep = cloneDeep
Vue.prototype.$extend = extend
Vue.prototype.$http = axios
Vue.use(VueRouter)
Vue.use(Element)

const router = new VueRouter({
  routes: [{
    name: 'index',
    path: '/',
    component: indexView
  }, {
    name: 'api',
    path: '/api/:project',
    component: apiView
  }, {
    name: 'generator',
    path: '/generator/:project/:id',
    component: generatorView
  }]
})

new Vue({
  router,
  template: '<App/>',
  components: {App}
}).$mount('#app')
