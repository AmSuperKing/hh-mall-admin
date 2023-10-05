import Home from '@/layout/index.vue'

const contentRouter = {
  path: '/content',
  name: 'Content',
  component: Home,
  redirect: '/content/article',
  meta: { title: '内容管理', icon: 'List' },
  hidden: false,
  children: [
    {
      path: 'installations',
      name: 'installations',
      meta: { title: '安装说明', icon: 'Reading' },
      hidden: false,
      component: () => import (/* webpackChunkName: "installations" */ '@/views/content/installations.vue')
    },
    {
      path: 'album',
      name: 'album',
      meta: { title: '企业图册', icon: 'Files' },
      hidden: false,
      component: () => import (/* webpackChunkName: "album" */ '@/views/album/album.vue')
    },
    {
      path: 'video',
      name: 'video',
      meta: { title: '视频管理', icon: 'Film' },
      hidden: false,
      component: () => import (/* webpackChunkName: "video" */ '@/views/content/video.vue')
    },
    {
      path: 'article',
      name: 'article',
      meta: { title: '文章管理', icon: 'EditPen' },
      hidden: false,
      component: () => import (/* webpackChunkName: "article" */ '@/views/content/article.vue')
    }
  ]
}

export default contentRouter
