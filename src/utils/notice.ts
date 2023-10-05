/**
 * 发送桌面通知
 * @param {String} title 消息标题
 * @param {String} body 消息body内容
 * @param {String} callback 回调函数
 * @returns 
 */
export function sendNotification(title: string | any = '消息通知', body?: string | any, callback?: Function) {
  // 参考：https://developer.mozilla.org/zh-CN/docs/Web/API/notification
  // 先检查浏览器是否支持
  if (!('Notification' in window)) {
    // 浏览器不支持发送Notification通知!
    alert('此浏览器不支持桌面通知')
    return
  }

  // Notification 不支持http协议会自动拒绝，需要在https协议
  // if (Notification.permission === 'denied') {
  //   // 如果用户已拒绝显示通知
  //   alert('拒绝浏览器发送通知，将无法正常及时接收通知')
  //   return
  // }

  if (Notification.permission === 'granted') {
    //用户已授权，直接发送通知
    notify()
  } else if (Notification.permission !== 'denied') {
    // 默认，先向用户询问是否允许显示通知
    Notification.requestPermission(function (permission) {
      // 如果用户同意，就可以直接发送通知
      if (permission === 'granted') {
        notify()
      }
    })
  }

  function notify() {
    let notification = new Notification(title, {
      body: body
    })
    notification.onclick = function () {
      callback && callback()
      // console.log('单击通知框')
    }
    notification.onclose = function () {
      // console.log('关闭通知框')
    }
  }
}
