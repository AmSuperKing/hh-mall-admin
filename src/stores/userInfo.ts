import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import { userApi } from '@/api/userApi'

export const useUserInfoStore = defineStore('userInfo', {
  state: () => {
    return {
      token: getToken(),
      userName: '',
      userNameCn: '',
      selfInfo: <anyObj>{}
    }
  },
  getters: {},
  actions: {
    setUserInfo(userInfo: anyObj) {
      this.userName = userInfo.account
      this.userNameCn = userInfo.realName
      this.selfInfo = userInfo
    },
    setUserName(userInfo: anyObj) {
      this.userName = userInfo.account
      this.userNameCn = userInfo.realName
    },
    resetInfo() {
      removeToken()
      this.token = ''
      this.userName = ''
      this.userNameCn = ''
    },
    async getUserInfo() {
      const res = await userApi.getUserInfo()
      if (res?.data) {
        this.setUserInfo(res.data)
        return Promise.resolve(res.data)
      }
    }
  }
})
