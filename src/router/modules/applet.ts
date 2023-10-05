import Home from '@/layout/index.vue'

const appletRouter = {
  path: '/applet',
  name: 'Applet',
  component: Home,
  redirect: '/applet/settings',
  meta: { title: '小程序设置', icon: 'applet' },
  hidden: false,
  children: [
    {
      path: 'settings',
      name: 'settings',
      meta: { title: '小程序设置', icon: 'Setting' },
      hidden: false,
      component: () => import (/* webpackChunkName: "settings" */ '@/views/applet/settings.vue')
    }
  ]
}

export default appletRouter
