<template>
  <div
    class="upload-container"
    v-loading="loading"
    element-loading-text="请稍后，正在上传文件..."
  >
    <el-upload
      :action="action"
      :headers="headers"
      :multiple="multiple"
      :limit="multiple ? 15 : 1"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :file-list="props.fileList"
      :on-exceed="onExceed"
      :disabled="props.disabled"
      :accept="accept"
      :show-file-list="showFileList"
      drag
      auto-upload
      name="multipart"
    >
      <slot>
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      </slot>
      <div v-if="props.tips" class="el-upload__text">
        将文件拖入或 <em>点击上传</em>
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
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getToken } from '@/utils/auth'

interface ParamProps {
  type?: string,
  url?: string,
  params?: anyObj | any,
  fileList?: any[],
  disabled?: boolean,
  tips?: string,
  multiple?: boolean,
  showFileList?: boolean
}

const props = withDefaults(defineProps<ParamProps>(), {
  type: 'image',
  url: '/api/admin/upload2MinIO/file',
  params: () => {},
  fileList: () => [],
  disabled: false,
  multiple: false,
  showFileList: true
})

const emits = defineEmits<{
  (e: 'beforeUpload', value: any): void
  (e: 'onSuccess', value: string): void
  (e: 'onError', value: any): void
  (e: 'onRemove'): void
}>()

const accept = computed(() => {
  if (props.type === 'image') return 'image/png,image/jpg,image/jpeg'
  if (props.type === 'video') return '.mp4'
  if (props.type === 'pdf') return '.pdf'
})
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

const loading = ref(false)

const typeControll = (fileName: string) => {
  if (!fileName) return false
  const suffixMsg = fileName.substring(fileName.lastIndexOf('.') + 1)
  let extension = true
  if (props.type === 'pdf') extension = suffixMsg === 'pdf'
  if (props.type === 'video') extension = suffixMsg === 'mp4'
  if (props.type === 'image') {
    const match1 = suffixMsg === 'jpg'
    const match2 = suffixMsg === 'png'
    const match3 = suffixMsg === 'jpeg'
    extension = match1 || match2 || match3
  }

  return extension
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  loading.value = true
  emits('beforeUpload', file)
  const checkRes = typeControll(file.name) || false
  if (!checkRes) {
    const flag = props.type === 'pdf' ? 'pdf' : props.type === 'video' ? 'mp4' : props.type === 'image' ? 'jpg/jpeg/png' : '限定'
    ElMessage.warning(`上传文件不是${flag}格式!`)
    return false
  }
}

const onSuccess: UploadProps['onSuccess'] = (response, file) => {
  loading.value = false
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
  loading.value = false
  emits('onError', err.message || err + '' || '上传失败')
}

const onRemove: UploadProps['onRemove'] = () => {
  loading.value = false
  emits('onRemove')
}

const onExceed: UploadProps['onExceed'] = () => {
  loading.value = false
  ElMessage.warning('上传超出限制数量')
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
