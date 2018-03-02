import Vue from 'vue'
import router from 'vue-router'
import Home from '../pages/Home'
import Doc from '../pages/Doc'
import Err404 from '../pages/404'

Vue.use(router)

export default new router({
  mode: 'history',
  routes: [
    {
      path: '/docs',
      name: 'Home',
      component: Home
    },
    {
      path: '/docs/doc?:name',
      name: 'Doc',
      component: Doc
    },
    {
      path: '/docs1*',
      component: Err404
    }
  ]
})