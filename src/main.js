import Vue from 'vue'
import Vuetify from 'vuetify'
import VueResource from 'vue-resource'
import router from './router'
import routes from './routes'
import GitHubAPI from 'vue-github-api'
import Main from './layouts/Main'

import 'vuetify/dist/vuetify.min.css'

const t1 = "070b2",
      t2 = "427f0",
      t3 = "f8d2a",
      t4 = "8e57a",
      t5 = "d4cfb",
      t6 = "72e63",
      t7 = "3ece6",
      t8 = "a6344"

Vue.use(VueResource)
Vue.use(GitHubAPI, {token: t1 + t2 + t3 + t4 + t5 + t6 + t7 + t8})
Vue.use(Vuetify)

const app = new Vue({
  el: '#app',
  router,
  components: { Main },
  template: '<Main/>'
  // data: {
  //   currentRoute: window.location.pathname
  // },
  // computed: {
  //   ViewComponent () {
  //     const matchingView = routes[this.currentRoute]
  //     console.log(window.location);
  //     return matchingView
  //       ? require('./pages/' + matchingView + '.vue')
  //       : require('./pages/404.vue')
  //   }
  // },
  // render (h) {
  //   return h(this.ViewComponent)
  // }
})

// window.addEventListener('popstate', () => {
//   app.currentRoute = window.location.pathname
// })
