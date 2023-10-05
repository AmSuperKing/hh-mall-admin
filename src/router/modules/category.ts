import Home from '@/layout/index.vue'

const categoryRouter = {
  path: '/category',
  name: 'Category',
  component: Home,
  redirect: '/category/category',
  meta: { title: '类别管理', icon: 'PieChart' },
  hidden: false,
  children: [
    {
      path: 'series',
      name: 'series',
      meta: { title: '系列分类', icon: 'Menu' },
      hidden: false,
      component: () => import (/* webpackChunkName: "series" */ '@/views/series/series.vue')
    },
    {
      path: 'category',
      name: 'category',
      meta: { title: '类别管理', icon: 'Grid' },
      hidden: false,
      component: () => import (/* webpackChunkName: "category" */ '@/views/category/category.vue')
    }
  ]
}

export default categoryRouter
