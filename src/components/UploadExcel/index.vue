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
      accept=".xls,.xlsx"
      class="image-upload"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽Excel到此处 或 <em>点击导入</em>
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
import { getToken } from '@/utils/auth'

interface Props {
  url: string,
  fileList?: any[],
  disabled?: boolean,
  tips?: string
}

const props = withDefaults(defineProps<Props>(), {
  url: '',
  fileList: () => [],
  disabled: false,
  tips: '导入Excel'
})
const emits = defineEmits<{
  (e: 'beforeUpload', value: any): void
  (e: 'onSuccess', value: boolean): void
  (e: 'onError', value: any): void
  (e: 'onRemove'): void
}>()

const action = computed(() => `${import.meta.env.VITE_AXIOS_BASE_URL}` + props.url + '?')
const headers = computed(() => {
  return {
    Authorization: `${getToken()}`
  }
})

const typeControll = (fileName: string) => {
  const suffixMsg = fileName.substring(fileName.lastIndexOf('.') + 1)
  const extension = suffixMsg === 'xls'
  const extension2 = suffixMsg === 'xlsx'
  if (extension || extension2) {
    return extension || extension2
  }
  return false
}

const beforeUpload: UploadProps['beforeUpload'] = (file: any) => {
  emits('beforeUpload', file)
  const checkRes = typeControll(file.name)
  if (!checkRes) {
    ElMessage.warning('上传文件只能是 xls, xlsx格式!')
    return false
  }
}

const onSuccess: UploadProps['onSuccess'] = (response, file) => {
  // console.log('upload excel success', response)
  const checkRes = typeControll(file.name)
  if (checkRes) {
    ElMessage.success('导入成功，' + response)
    emits('onSuccess', true)
  } else {
    ElMessage.error(response)
    emits('onError', file)
  }
}

const onError: UploadProps['onError'] = (err) => {
  var messageErr = err.toString().replace('UploadAjaxError: ', '')
  ElMessage.error(messageErr)
  emits('onError', err)
}

const onRemove: UploadProps['onRemove'] = () => {
  emits('onRemove')
}

const onExceed = () => {
  ElMessage.warning('只能上传一条文件')
}


</script>

<style lang="scss" scoped>
.upload-container {
  width: 100%;
  .el-upload {
    width: 100%;
    .el-upload-dragger {
      width: 100%;
      min-height: 20px;
    }
  }
}
</style>
