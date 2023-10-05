<template>
  <div
    v-loading="loading"
    element-loading-text="登录中..."
    element-loading-background="rgba(0, 0, 0, 0.6)"
    class="login-wrap"
  >
    <img :src="logoImg" alt="logo" class="login-logo">
    <div class="ms-login">
      <div class="ms-title">{{ settings.title }}</div>
      <el-form
        ref="loginFormRef"
        label-width="0px"
        class="ms-content"
        :model="loginForm"
        :rules="rules"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" size="large" placeholder="账号" tabindex="1">
            <template #prepend>
              <el-button class="prepend-btn" :icon="User" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            size="large"
            type="password"
            placeholder="密码"
            show-password
            tabindex="2"
            @keyup.enter="submitForm(loginFormRef)"
          >
            <template #prepend>
              <el-button class="prepend-btn" :icon="Lock" />
            </template>
          </el-input>
        </el-form-item>
        <div class="pwd-about">
          <el-checkbox v-model="isRemember" style="color: #fff;">记住账号密码</el-checkbox>
          <el-link style="color: #fff;" @click="forgetPwd">忘记密码</el-link>
        </div>
        <div class="login-btn">
          <el-button type="primary" size="large" @click="submitForm(loginFormRef)">登录</el-button>
        </div>
        <p class="login-tips">Tips : 填写用户名和密码登录。</p>
      </el-form>
    </div>
    <div class="ms-copyright">
      <span>Copyright &copy; 2023 {{ currYear > 2023 ? '- ' + currYear : '' }} 广东合和建筑五金制品有限公司</span>
    </div>
  </div>
</template>

<script lang="ts" setup name="login">
import { ref, reactive, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import VueCookies from 'vue-cookies'
import CryptoJS from 'crypto-js'
import { userApi } from '@/api/userApi'
import { setToken } from '@/utils/auth'
import * as CryptoUtils from '@/utils/cryptoUtils'
import { useTagsListStore } from '@/stores/tagsList'
import settings from '@/settings'
import logoImg from '@/assets/images/logo-white.png'

const route = useRoute()
const router = useRouter()
const Cookies: any = VueCookies

const loading = ref(false)
const loginForm = reactive({
  username: '',
  password: ''
})
const loginFormRef = ref<FormInstance>()
const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度 6 到 16 位', trigger: 'blur' }
  ]
})

const isRemember = ref(false)

const currYear = ref()

onMounted(() => {
  currYear.value = new Date().getFullYear()
  ElNotification({
    title: '请进行登录操作!',
    type: 'info'
  })
  checkLoginInfo()
})

const redirectPath = (route: any) => {
  if (route.query && route.query.redirect) {
    return route.query.redirect
  } else {
    return ''
  }
}
watchEffect(() => redirectPath(route))

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      const enPwd = CryptoUtils.encryptByRSA(settings.PUBLIC_KEY, loginForm.password)
      if (!enPwd) return ElMessage.error('数据加密出错')

      const loginParams = {
        account: loginForm.username,
        pwd: enPwd
      }
      loading.value = true
      userApi.login(loginParams).then((response: any) => {
        console.log(response)
        const token = response.data.token
        if (token) {
          setToken(token)
          Cookies.remove(settings.reloadTagsKey)
          ElNotification({
            title: '登录成功!',
            type: 'success'
          })
          if (isRemember.value) saveUserInfoToCookie()
          else removeUserInfoFromCookie()
          // router.push({ path: redirectPath(route) || '/', replace: true })
          // router.replace(redirectPath(route) + '?redirect=' + redirectPath(route) || '/')
          router.go(0)
        }
      }).catch(e => {
        ElMessage.error(e)
        removeUserInfoFromCookie()
      }).finally(() => {
        loading.value = false
      })
    } else {
      ElMessage.error('请填写完整登录信息')
    }
  })
}

// const resetForm = (formEl: FormInstance | undefined) => {
//   if (!formEl) return
//   formEl.resetFields()
// }

const tags = useTagsListStore()
tags.clearTags()

const forgetPwd = () => {
  ElMessageBox.alert('暂不支持在线找回密码，请联系系统管理员重置密码！', '忘记密码', {
    autofocus: false,
    confirmButtonText: '确定',
    callback: (action: any) => {}
  })
}

const ENCRYPT_CODE = 'HEHE_MALL_2022'
const LOGIN_INFO_KEY = 'user_access_key'
const checkLoginInfo = () => {
  const certificationInfo = Cookies.get(LOGIN_INFO_KEY) ? Cookies.get(LOGIN_INFO_KEY) : ''
  let decryptedData
  if (certificationInfo) {
    // 进行解密
    const bytes  = CryptoJS.AES.decrypt(certificationInfo, ENCRYPT_CODE);
    decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  }
  if (decryptedData) {
    isRemember.value = true
    loginForm.username = decryptedData?.username
    loginForm.password = decryptedData?.password
  } else { removeUserInfoFromCookie() }
}
const saveUserInfoToCookie = async () => {
  const ciphertext = await CryptoJS.AES.encrypt(JSON.stringify(loginForm), ENCRYPT_CODE).toString()
  await Cookies.set(LOGIN_INFO_KEY, ciphertext, '14d')
}
const removeUserInfoFromCookie = async () => {
  await Cookies.remove(LOGIN_INFO_KEY)
  loginForm.username = ''
  loginForm.password = ''
  isRemember.value = false
}

</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.login-wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100vh;
  min-width: 450px;
  min-height: 640px;
  background-color: $loginBg;
  background-image: url('../../assets/images/login-bg.jpg');
  background-position: center center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.login-logo {
  width: 160px;
  height: auto;
  margin: 10px;
}
.ms-login {
  width: 400px;
  margin: 0 auto;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, .3);;
  overflow: hidden;
}
.ms-title {
  width: 100%;
  line-height: 80px;
  text-align: center;
  font-size: 28px;
  color: #fff;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}
.ms-content {
  padding: 30px 30px;
}
.prepend-btn {
  height: 40px;
  font-size: 16px !important;
}
.pwd-about {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  color: #fff;
}
.login-btn {
  text-align: center;
  & button {
    width: 100%;
    height: 42px;
    margin-bottom: 10px;
  }
}
.login-tips {
  font-size: 12px;
  line-height: 30px;
  color: #fff;
}
.ms-copyright {
  padding: 10px 0;
  font-size: 14px;
  color: #fff;
  text-align: center;
  background-color: rgba(255, 255, 255, .3);
}
</style>
