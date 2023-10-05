<template>
  <div class="upload-container">
    <el-upload
      :action="action"
      :headers="headers"
      :multiple="false"
      :limit="1"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :file-list="props.fileList"
      :on-exceed="onExceed"
      :disabled="props.disabled"
      drag
      show-file-list
      auto-upload
      name="multipart"
      accept=".mp4"
      list-type="picture"
      class="image-upload"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将视频拖入或 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ props.tips }}
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'

interface ParamProps {
  url?: string,
  params?: anyObj | any,
  fileList?: any[],
  disabled?: boolean,
  tips?: string
}

const props = withDefaults(defineProps<ParamProps>(), {
  url: '/api/admin/upload2MinIO/video',
  params: () => {},
  fileList: () => [],
  disabled: false
})

const emits = defineEmits<{
  (e: 'beforeUpload', value: any): void
  (e: 'onSuccess', value: string): void
  (e: 'onError', value: any): void
  (e: 'onRemove'): void
}>()

const paramsObj = computed(() => props.params)
const paramsData = computed(() => {
  const paramsList: string[] = []
  if (!paramsObj.value || !Object.keys(paramsObj.value).length) return ''
  Object.keys(paramsObj.value).forEach((key) => {
    if (paramsObj.value[key] !== undefined && paramsObj.value[key] !== null) {
      paramsList.push(key + '=' + paramsObj.value[key])
    }
  })
  console.log(
    '%c upload params: =>',
    'color: #00aadf',
    paramsList.length ? paramsList.join('&') : ''
  )
  return paramsList.length ? paramsList.join('&') : ''
})

const action = computed(() => `${import.meta.env.VITE_AXIOS_BASE_URL}` + props.url + '?' + paramsData.value)
const headers = computed(() => {
  return {
    'Authori-zation': `${getToken()}`
  }
})

const typeControll = (fileName: string) => {
  if (!fileName) return false
  const suffixMsg = fileName.substring(fileName.lastIndexOf('.') + 1)
  const extension = suffixMsg === 'mp4'
  if (!extension) return false
  return extension
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  emits('beforeUpload', file)
  const checkRes = typeControll(file.name) || false
  if (!checkRes) {
    ElMessage.warning('上传文件只能是 mp4 格式!')
    return false
  }
}

const onSuccess: UploadProps['onSuccess'] = (response, file) => {
  if (response?.code == 200) {
    ElMessage.success('上传成功')
    emits('onSuccess', response.message)
  } else {
    ElMessage.error('上传失败')
    emits('onError', response.message || '上传失败')
  }
}

const onError: UploadProps['onError'] = (err) => {
  ElMessage.error('上传失败')
  emits('onError', err.message || err + '' || '上传失败')
}

const onRemove: UploadProps['onRemove'] = () => {
  emits('onRemove')
}

const onExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning('只能上传一个')
}


</script>

<style lang="scss" scoped>
.upload-container {
  width: 100%;
  .el-upload {
    width: 100%;
    .el-upload-dragger {
      width: 100%;
      min-height: 150px;
    }
  }
}
</style>
