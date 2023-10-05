import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'normalize.css/normalize.css'

import './styles/index.scss' // global css

import { ElMessage } from 'element-plus'
// 自定义element-plus主题，在 element-plus scss 文件之前导入element.scss以避免 sass 混合变量的问题
import './styles/element.scss'
import 'element-plus/theme-chalk/display.css'

import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'

import { registerIcons } from '@/utils/common'

import VueCookies from 'vue-cookies'

import errorHandler from './error'

window.onerror = function(message: any, source: any, line: any, column: any, error: any): void {
  if (message.indexOf(`Failed to execute 'insertBefore' on 'Node'`) > -1 ||
    message.indexOf('insertBefore') > -1 ||
    message.indexOf('Node') > -1
  ) {
    location.reload()
  } else {
    console.log('Error message: \n', message)
    if (message.indexOf('Can not get editor instance') > -1 || message.indexOf('Cannot find textarea instance by editor') > -1) {
      console.log('Editor Error: \n', message)
    } else {
      ElMessage({
        showClose: true,
        message: message,
        type: 'error',
        duration: 4500
      })
    }
  }
}

const app = createApp(App)

errorHandler(app)

app.use(createPinia())
app.use(router)
registerIcons(app)
app.use(VueCropper)
app.provide('$cookies', VueCookies)
app.mount('#app')
