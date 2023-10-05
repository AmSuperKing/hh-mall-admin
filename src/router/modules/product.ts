import Home from '@/layout/index.vue'

const productRouter = {
  path: '/product',
  name: 'Product',
  component: Home,
  redirect: '/product/product',
  meta: { title: '产品管理', icon: 'GoodsFilled' },
  hidden: false,
  children: [
    {
      path: 'product',
      name: 'product',
      meta: { title: '产品管理', icon: 'Goods' },
      hidden: false,
      component: () => import (/* webpackChunkName: "product" */ '@/views/product/product.vue')
    }
  ]
}

export default productRouter
