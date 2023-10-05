import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth'
import { useUserInfoStore } from '@/stores/userInfo'
import HomeRouter from './modules/home'
import userRouter from './modules/user'
import categoryRouter from './modules/category'
import productRouter from './modules/product'
import contentRouter from './modules/content'
import appletRouter from './modules/applet'

import settings from '@/settings'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

export const routes = [
  {
    path: '/login',
    name: 'login',
    meta: { title: '登录' },
    hidden: true,
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue')
  },
  HomeRouter,
  userRouter,
  categoryRouter,
  productRouter,
  contentRouter,
  appletRouter,
  {
    path: '/403',
    name: '403',
    meta: { title: '没有权限' },
    hidden: true,
    component: () => import (/* webpackChunkName: "403" */ '@/views/errorPages/403.vue')
  },
  {
    path: '/404',
    name: '404',
    meta: { title: '找不到页面' },
    hidden: true,
    component: () => import (/* webpackChunkName: "404" */ '@/views/errorPages/404.vue')
  },
  // Catch all / 404 Not found Route must be placed at the end !!!
  { path: '/:pathMatch(.*)*', name: 'notFound', redirect: '/404', hidden: true }
]

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  routes
})

export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHashHistory(),
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { top: 0 }
      }
    },
    routes: []
  })
  router.resolve = newRouter.resolve // reset router
}

const whiteList = ['/login', '/403', '/404']

router.beforeEach(async(to, from, next) => {
  const userInfo = useUserInfoStore()
  // start progress bar
  NProgress.start()
  document.title = `${to?.meta?.title || '未知页面路径'} - ${settings.title}`
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      const nextPath: string | any = to?.query?.redirect || '/'
      next({ path: nextPath })
      NProgress.done()
    } else {
      const hasGetUserInfo = userInfo.userName
      if (hasGetUserInfo) {
        next()
        NProgress.done()
      } else {
        try {
          // get user info
          await userInfo.getUserInfo()
          next()
        } catch (error) {
          console.log('%c catch err in router =>', 'color: #ff0000', error) // debug
          // remove token and go to login page to re-login
          await userInfo.resetInfo()
          ElMessage.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    userInfo.resetInfo()
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

export default router
