<template>
  <div v-loading="loading">
    <el-row :gutter="20">
      <!-- <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <span>基础信息</span>
            </div>
          </template>
          <div class="info">
            <div class="info-image" @click="showDialog">
              <img :src="avatarImg">
              <span class="info-edit">
                <el-icon><CameraFilled /></el-icon>
              </span>
            </div>
            <div class="info-name">{{ name }}</div>
            <div class="info-desc">不可能! 我的代码怎么可能会有bug!</div>
          </div>
        </el-card>
      </el-col> -->
      <el-col :span="12" :offset="6">
        <el-card>
          <template #header>
            <div class="clearfix">
              <span>账户设置</span>
            </div>
          </template>
          <el-form ref="resetFormRef" :model="form" :rules="rules" label-width="110px">
            <el-form-item label="账 号: "> {{ userInfo.userName }} </el-form-item>
            <el-form-item label="用户名: "> {{ userInfo.userNameCn }} </el-form-item>
            <el-form-item label="用户标识: ">{{ level2Text(userInfo.selfInfo.level)  }}</el-form-item>
            <el-form-item label="旧密码: " prop="oldPassword">
              <el-input v-model.trim="form.oldPassword" type="password" maxlength="16" show-password />
            </el-form-item>
            <el-form-item label="新密码: " prop="newPassword">
              <el-input v-model.trim="form.newPassword" type="password" maxlength="16" show-password />
            </el-form-item>
            <el-form-item label="确认新密码: " prop="newPassword2">
              <el-input v-model.trim="form.newPassword2" type="password" maxlength="16" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">修 改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" title="裁剪图片" width="600px">
      <vue-cropper
        ref="cropper"
        style="margin: 0 auto; width: 300px; height: 300px"
        :img="imgSrc"
        @img-load="imgLoad"
        @crop-moving="cropMoving"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button class="crop-demo-btn" type="primary">选择图片
            <input
              class="crop-input"
              type="file"
              name="image"
              accept="image/*"
              @change="setImage($event)"
            />
          </el-button>
          <el-button type="primary" @click="saveAvatar">上传并保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { ElMessage } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import { VueCropper } from 'vue-cropper'
// import { CameraFilled } from '@element-plus/icons-vue'
import avatar from '@/assets/images/avatar.png'
import { userApi } from '@/api/userApi'

const userInfo = useUserInfoStore()

const loading = ref(false)
const resetFormRef = ref<FormInstance>()
const form = reactive({
  oldPassword: '',
  newPassword: '',
  newPassword2: ''
})
const rules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' }
  ],
  newPassword2: [
    { required: true, message: '请确认新密码', trigger: 'blur' }
  ]
})
const avatarImg = ref(avatar)
const imgSrc = ref<string>('')
const dialogVisible = ref(false)
const cropper = ref<InstanceType<typeof VueCropper>>()
const levels = [
  { label: '普通用户', value: 0 },
  { label: '系统管理员', value: 1 },
  { label: '超级管理员', value: 2 }
]

const onSubmit = () => {
  resetFormRef.value!.validate((valid, fields) => {
    if (valid) {
      if (form.newPassword !== form.newPassword2) {
        ElMessage.warning('两次新密码不一致')
        return
      }
      loading.value = true
      userApi.updateAdminPwd(form).then(res => {
        if (res?.code === 200) {
          ElMessage.success('修改成功')
        } else {
          ElMessage.error(res.message || '修改失败')
        }
      }).catch(e => {
        ElMessage.error(e)
      }).finally(() => {
        loading.value = false
        resetForm()
      })
    } else {
      ElMessage.warning('请填写完整信息')
    }
  })
}
const resetForm = () => {
  resetFormRef.value!.resetFields()
}

const level2Text = (level: number) => {
  for (const item of levels) {
    if (item.value === level) return item.label
  }
  return '系统用户'
}


const showDialog = () => {
  dialogVisible.value = true
  imgSrc.value = avatarImg.value
}
const setImage = (e: any) => {
  //上传图片
  const file = e.target.files[0]
  if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
    ElMessage.error('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种')
    return false
  }
  const reader = new FileReader()
  reader.onload = (e: any) => {
    let data = null
    if (typeof e.target.result === 'object') {
      // 把Array Buffer转化为blob 如果是base64不需要
      data = window.URL.createObjectURL(new Blob([e.target.result]))
    } else {
      data = e.target.result
    }
    dialogVisible.value = true
    imgSrc.value = data
  }
  // 转化为base64
  // reader.readAsDataURL(file)
  // 转化为blob
  reader.readAsArrayBuffer(file)
}
const saveAvatar = () => {
  avatarImg.value = imgSrc.value
  dialogVisible.value = false
}
const imgLoad = (msg: any) => {
  // TODO
}
const cropMoving = (data: any) => {
  // handle 截图框当前坐标
}

</script>

<style lang="scss" scoped>
.info {
  text-align: center;
  padding: 35px 0;
}
.info-image {
  position: relative;
  margin: auto;
  width: 100px;
  height: 100px;
  background: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 50px;
  overflow: hidden;
  & img {
    width: 100%;
    height: 100%;
  }
  &:hover .info-edit {
    opacity: 1;
    cursor: pointer;
  }
}
.info-edit {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  & i {
    color: #eee;
    font-size: 25px;
  }
}
.info-name {
  margin: 15px 0 10px;
  font-size: 24px;
  font-weight: 500;
  color: #262626;
}
.crop-demo-btn {
  position: relative;
}
.crop-input {
  position: absolute;
  width: 100px;
  height: 40px;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
}
</style>
