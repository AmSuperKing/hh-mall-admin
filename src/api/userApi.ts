import request from '@/utils/request'

export const userApi = {
  /**
   * 登陆
   * @param {object} userinfo 用户账号密码登陆
   * @returns 
   */
  login(userinfo: LoginInfo) {
    return request.post('/api/admin/login', userinfo).then(res => Promise.resolve(res.data))
  },
  /**
   * 获取当前用户信息
   * @returns
   */
  getUserInfo() {
    return request.get('/api/admin/getAdminInfoByToken').then(res => Promise.resolve(res.data))
  },
  getOpertionLogs(params: OpertionLog | anyObj) {
    return request.get('/api/admin/heheAdminOpertionLog/list', { params }).then(res => Promise.resolve(res.data))
  },
  getAppletUserList(params: UserProps | PageData | anyObj) {
    return request.get('/api/admin/heheUser/list', { params }).then(res => Promise.resolve(res.data))
  },
  resetAppletUserPwd(userId: string) {
    return request.put(`/api/admin/heheUser/updateKey/${userId}`).then(res => Promise.resolve(res.data))
  },
  changeUserStatus(userId: string) {
    return request.put(`/api/admin/heheUser/updateStatus/${userId}`).then(res => Promise.resolve(res.data))
  },
  changeUserVip(userId: string) {
    return request.put(`/api/admin/heheUser/updateVip/${userId}`).then(res => Promise.resolve(res.data))
  },
  getAdminUserList(params: UserProps | PageData | anyObj) {
    return request.get('/api/admin/heheSystemAdmin/list', { params }).then(res => Promise.resolve(res.data))
  },
  addAdminUser(userInfo: UserProps) {
    return request.post('/api/admin/heheSystemAdmin/save', userInfo).then(res => Promise.resolve(res.data))
  },
  updateAdminInfo(params: UserProps | anyObj) {
    return request.put('/api/admin/heheSystemAdmin/update', params).then(res => Promise.resolve(res.data))
  },
  updateAdminPwd(params: anyObj) {
    return request.put('/api/admin/heheSystemAdmin/update/key', params).then(res => Promise.resolve(res.data))
  },
  delAdminUser(userId: string) {
    return request.delete(`/api/admin/heheSystemAdmin/delete/${userId}`).then(res => Promise.resolve(res.data))
  }
}
