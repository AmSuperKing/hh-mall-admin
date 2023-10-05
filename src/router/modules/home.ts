import Home from '@/layout/index.vue'

const homeRouter = {
  path: '/',
  name: 'Home',
  component: Home,
  redirect: '/dashboard',
  meta: { title: '系统首页', icon: 'HomeFilled' },
  hidden: false,
  children: [
    {
      path: 'dashboard',
      name: 'dashboard',
      meta: { title: '系统首页', icon: 'HomeFilled' },
      hidden: false,
      component: () => import (/* webpackChunkName: "dashboard" */ '@/views/dashboard/index.vue')
    }
  ]
}

export default homeRouter
