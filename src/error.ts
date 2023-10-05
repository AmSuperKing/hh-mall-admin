import type { App } from 'vue'
import { ElMessage } from 'element-plus'

// 只执行一次
const executeOnce = <T extends (...args: any) => any>(fn: T) =>
  (
    (ran = false) =>
      (): ReturnType<T> =>
        ran ? fn : ((ran = !ran), (fn = fn()))
  )()


function errorHandler(app: App) {
  if (import.meta.env.MODE !== 'development') {
    app.config.errorHandler = (err: any, instance: any, info: any) => {
      if (err == 'cancel' || !err) {
        return
      }
      ElMessage({
        showClose: true,
        message: err,
        type: 'error',
        duration: 4500
      })
    }
  }
  window.onerror = function(message: any, source: any, line: any, column: any, error: any): void {
    // console.log('------ window get error info start ------')
    // console.log('%c message:\n', 'color: #409eff', message)
    // console.log('%c source:\n', 'color: #00aadf', source)
    // console.log('%c line-column:\n', 'color: #e6a23c', line + '-' + column)
    // console.log('%c error:\n', 'color: #f56c6c', error)
    // console.log('------ window get error info end ------\n')
    if (message.indexOf(`Failed to execute 'insertBefore' on 'Node'`) > -1 ||
      message.indexOf('insertBefore') > -1 ||
      message.indexOf('Node') > -1
    ) {
      location.reload()
    } else {
      if (message.indexOf('Can not get editor instance') > -1) {
        console.log('Editor error: \n', message)
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
}

export default errorHandler
