<template>
  <div v-loading="loading">
    <el-form ref="infoFormRef" :model="settingInfo" :rules="rules" label-width="120px">
      <el-form-item label="启用" prop="flag">
        <el-switch v-model="settingInfo.flag" />
      </el-form-item>
      <el-form-item label="首页Banner图" prop="flatPattern">
        <div v-if="settingInfo.flatPattern" class="cover-box">
          <el-image
            id="coverImg"
            class="cover-img"
            fit="cover"
            :src="settingInfo.flatPattern"
            :preview-src-list="settingInfo.flatPattern ? [settingInfo.flatPattern] : []"
          />
          <div class="operate-icon">
            <span @click="handleCoverPreview">
              <el-icon><ZoomIn /></el-icon>
            </span>
            <span @click="delCurrCover('flatPattern')">
              <el-icon><Delete /></el-icon>
            </span>
          </div>
        </div>
        <UploadFile
          v-if="!settingInfo.flatPattern"
          accept=".png,.jpg,.jpeg"
          :showFileList="false"
          class="setting-upload-btn"
          @on-success="handleUploadBanner"
        />
      </el-form-item>
      <el-form-item label="公告" prop="notice">
        <el-input
          v-model="settingInfo.notice"
          type="textarea"
          autosize
          clearable
          placeholder="不起用则置为空，内容不为空则启用显示"
          style="width: 100%"
          :maxlength="250"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="telNum">
        <el-input v-model.trim="settingInfo.telNum" clearable :maxlength="32" />
      </el-form-item>
      <el-form-item label="传真" prop="faxNum">
        <el-input v-model.trim="settingInfo.faxNum" clearable :maxlength="32" />
      </el-form-item>
      <el-form-item label="QQ客服" prop="qqNum">
        <el-input v-model.trim="settingInfo.qqNum" clearable :maxlength="15" />
      </el-form-item>
      <el-form-item label="微信客服" prop="vxNum">
        <el-input v-model.trim="settingInfo.vxNum" clearable :maxlength="36" />
      </el-form-item>
      <el-form-item label="公众号" prop="qrCodeLink">
        <div v-if="settingInfo.qrCodeLink" class="cover-box">
          <el-image
            id="qrCode"
            class="cover-img"
            fit="cover"
            :src="settingInfo.qrCodeLink"
            :preview-src-list="settingInfo.qrCodeLink ? [settingInfo.qrCodeLink] : []"
          />
          <div class="operate-icon">
            <span @click="handleQrCodePreview">
              <el-icon><ZoomIn /></el-icon>
            </span>
            <span @click="delCurrCover('qrCodeLink')">
              <el-icon><Delete /></el-icon>
            </span>
          </div>
        </div>
        <UploadFile
          v-if="!settingInfo.qrCodeLink"
          accept=".png,.jpg,.jpeg"
          :showFileList="false"
          class="setting-upload-btn"
          @on-success="handleUploadWechat"
        />
      </el-form-item>
      <el-row>
        <el-col v-if="settingInfo.createTime" :span="12">
          <el-form-item label="创建时间" prop="createTime">
            <el-input v-model="settingInfo.createTime" disabled />
          </el-form-item>
        </el-col>
        <el-col v-if="settingInfo.createTime" :span="12">
          <el-form-item label="修改时间" prop="createTime">
            <el-input v-model="settingInfo.createTime" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-button style="margin-right: 15px;" @click="closeSetting">取 消</el-button>
        <el-button type="primary" @click="onSubmit">保 存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { appletApi } from '@/api/appletApi'
import UploadFile from '@/components/UploadFile/uploadFile.vue'

const props = defineProps<{
  data?: AppletInfo | anyObj
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const loading = ref(false)
const infoFormRef = ref<FormInstance>()
const settingInfo = ref<anyObj>({})

const rules = reactive<FormRules>({
  flatPattern: [{ required: true, message: '请选择首页Banner图', trigger: 'blur' }]
})

watch(
  () => props.data,
  (newValue, oldValue) => {
    if (newValue) settingInfo.value = newValue
  },
  { deep: true, immediate: true }
)

const closeSetting = () => {
  emits('close')
}

const onSubmit = async () => {
  await infoFormRef.value!.validate((valid, fields) => {
    if (valid) {
      if (settingInfo.value.dataId) {
        updateSetting()
      } else {
        addSetting()
      }
    } else {
      ElMessage.warning('请至少设置首页Banner图')
    }
  })
}

const resetForm = () => {
  if (!infoFormRef.value) return
  infoFormRef.value!.resetFields()
}

const handleUploadBanner = (url: string) => {
  settingInfo.value.flatPattern = url
  console.log('banner url --', url)

}
const handleUploadWechat = (url: string) => {
  settingInfo.value.qrCodeLink = url
  console.log('wechat img url --', url)
}
const handleCoverPreview = () => {
  if (!settingInfo.value.flatPattern) return
  document.getElementById('coverImg')!.click()
}
const handleQrCodePreview = () => {
  if (!settingInfo.value.qrCodeLink) return
  document.getElementById('qrCode')!.click()
}
const delCurrCover = (key: string | any) => {
  if (!key) return
  // if (settingInfo.value[key]) {
  //   fileApi.delFile(settingInfo.value[key]).then(res => {
  //     console.log(res)
  //   }).catch(e => {
  //     console.log(e || '删除失败')
  //   }).finally(() => {
      
  //   })
  // }
  settingInfo.value[key] = ''
}

const updateSetting = () => {
  loading.value = true
  appletApi.updateSetting(settingInfo.value).then(res => {
    console.log('update res', res)
    res.code === 200 ? ElMessage.success('修改成功') : ElMessage.error('操作失败')
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
    resetForm()
    settingInfo.value = {}
    closeSetting()
  })
}

const addSetting = () => {
  loading.value = true
  appletApi.addSetting(settingInfo.value).then(res => {
    console.log('add res', res)
    res.code === 200 ? ElMessage.success('新增成功') : ElMessage.error('操作失败')
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
    resetForm()
    settingInfo.value = {}
    emits('close')
  })
}
</script>

<style>
.setting-upload-btn .el-upload {
  padding: 60px !important;
  border: 1px dashed #999;
  border-radius: 10px;
  background-color: #fbfdff;
  font-size: 28px;
  color: #999;
}
</style>
<style lang="scss" scoped>
.cover-box {
  position: relative;
  border-radius: 10px;
  .cover-img {
    width: 150px;
    height: 150px;
    border: 1px dashed #eee;
  }
  
  .operate-icon {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 150px;
    height: 150px;
    background-color: rgba(0, 0, 0, .3);
    color: #fff;
    border: 1px dashed #333;
    opacity: 0;
    &:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, .6);
    }
    & span {
      font-size: 20px;
      font-weight: 700;
      cursor: pointer;
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

</style>
