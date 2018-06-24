import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import LineStack from './components/LineStack'
import BarBrush from './components/BarBrush'
import Pie from './components/Pie'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/line-stack',
      name: 'lineStack',
      component: LineStack
    },
    {
      path: '/bar-brush',
      name: 'barBrush',
      component: BarBrush
    },
    {
      path: '/pie',
      name: 'pie',
      component: Pie
    }
  ]
})
