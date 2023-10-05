import Home from '@/layout/index.vue'

const userRouter = {
  path: '/user',
  name: 'user',
  component: Home,
  redirect: '/user/userCenter',
  meta: { title: '用户管理', icon: 'UserFilled' },
  hidden: false,
  children: [
    {
      path: 'userList',
      name: 'userList',
      meta: { title: '用户列表', icon: 'User' },
      hidden: false,
      component: () => import (/* webpackChunkName: "userList" */ '@/views/users/userList.vue')
    },
    {
      path: 'userCenter',
      name: 'userCenter',
      meta: { title: '我的设置', icon: 'Postcard' },
      hidden: false,
      component: () => import (/* webpackChunkName: "usercenter" */ '@/views/userCenter/userCenter.vue')
    }
  ]
}

export default userRouter
