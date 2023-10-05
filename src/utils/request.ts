import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElLoading, ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'

const loadingInstance: anyObj = {
  target: null,
  options: {
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)'
  }
}

const service = axios.create({
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000, // 请求超时的时间限制
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// 开始设置请求 发起的拦截处理
// config 代表发起请求的参数的实体
service.interceptors.request.use((config: AxiosRequestConfig | any) => {
    // loadingInstance.target = ElLoading.service(loadingInstance.options)
    const baseUrl = import.meta.env.VITE_AXIOS_BASE_URL // url = base url + request url
    config.url = `${baseUrl}${config.url}`
    const token = getToken()
    if (token) { // 判断是否存在token，如果存在的话，则每个http header都加上token
      if (config.headers === undefined) config.headers = { 'X-Requested-With': 'XMLHttpRequest' }
      config.headers['Authori-zation'] = token
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// 请求到结果的拦截处理
service.interceptors.response.use((response: AxiosResponse | any) => {
  // loadingInstance.target.close()
  if (response && response.data) {
    const res = response.data
    if (res.code === 401) {
      removeToken()
      setTimeout(() => {
        location.reload()
      }, 3500)
      return Promise.reject('登录身份信息失效，请重新登陆！')
    }
    if (res.code !== 200  && res.code !== 401) {
      return Promise.reject(res.message || 'Error ' + res.code)
    } else {
      return response
    }
  }
}, error => {
  // loadingInstance.target.close()
  let errMsg = ''
  if (error && error.response) {
    errMsg = error.message
  } else {
    errMsg = '连接到服务器失败'
  }
  ElMessage({
    message: errMsg,
    type: 'error',
    duration: 5 * 1000
  })
  return Promise.reject(error)
})

export default service
