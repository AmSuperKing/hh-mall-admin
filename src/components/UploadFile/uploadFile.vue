<template>
  <div class="upload-container">
    <el-upload
      ref="uploadRef"
      name="multipart"
      :action="action"
      :headers="headers"
      :multiple="false"
      :limit="1"
      :show-file-list="props.showFileList"
      :file-list="props.fileList"
      :list-type="props.listType"
      :on-change="onChange"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :on-exceed="onExceed"
      :on-preview="onPreview"
      :disabled="props.disabled"
      :auto-upload="props.autoUpload"
      :accept="props.accept"
    >
      <template #trigger>
        <el-icon><Plus /></el-icon>
      </template>
    </el-upload>
    <el-dialog v-model="imgPreviewVisible">
      <div style="text-align: center;">
        <el-image w-full :src="imgPreviewUrl" alt="Preview Image" />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { ElMessage, genFileId } from 'element-plus'
import type { UploadProps, UploadInstance, UploadRawFile } from 'element-plus'
import { getToken } from '@/utils/auth'
import { fileApi } from '@/api/fileApi'

interface UploadFileProps {
  url?: string,
  params?: anyObj | any,
  fileList?: any[],
  disabled?: boolean,
  accept?: string,
  autoUpload?: boolean,
  showFileList?: boolean,
  listType?: string | any
}

const props = withDefaults(defineProps<UploadFileProps>(), {
  url: '/api/admin/upload2MinIO/file',
  params: () => {},
  fileList: () => [],
  disabled: false,
  autoUpload: true,
  showFileList: true,
  listType: 'text',
  accept: '.png,.jpg,.jpeg,.mp4,.pdf'
})

const emits = defineEmits<{
  (e: 'beforeUpload', value: any): void
  (e: 'onSuccess', value: string): void
  (e: 'onError', value: any): void
  (e: 'onRemove'): void
  (e: 'preview'): void
}>()

const uploadRef = ref<UploadInstance>()

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
    '%c upload params(Upload Tips): =>',
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

const hasFile = ref(false)
const imgPreviewVisible = ref(false)
const imgPreviewUrl = ref('')
const fileUrl = ref('')

watch(
  () => props.fileList,
  (newValue, oldValue) => {
    if (newValue.length) {
      hasFile.value = true
    }
  },
  { immediate: true, deep: true }
)

const onChange: UploadProps['onChange'] = (file) => {
  if (file.name && file.size) hasFile.value = true
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  emits('beforeUpload', file)
}

const onSuccess: UploadProps['onSuccess'] = (response, file) => {
  if (response?.code == 200) {
    ElMessage.success('上传成功')
    hasFile.value = true
    fileUrl.value = response.message
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

const onRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  if (uploadFile.status === 'success' && fileUrl.value) {
    fileApi.delFile(fileUrl.value).then(res => {
      if (res?.code !== 200) ElMessage.error(res.message || '删除图片出错')
    }).catch(e => {
      ElMessage.error(e || '删除失败')
    })
  }
  hasFile.value = false
  emits('onRemove')
}

const onExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

const onPreview: UploadProps['onPreview'] = (file) => {
  if (file.status === 'success') {
    if (file.url) {
      const url = file.url
      const imgFlag = url.lastIndexOf('.jpg') > -1 || url.lastIndexOf('.jpeg') || url.lastIndexOf('.png')
      if (imgFlag) {
        imgPreviewVisible.value = true
        imgPreviewUrl.value = url
      } else {
        emits('preview')
      }
    }
  }
}


const submitUpload = () => {
  uploadRef.value!.submit()
}

defineExpose({
  submitUpload
})

</script>

<style lang="scss" scoped>
.upload-container {
  width: 100%;
}

.operate-cover {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 25px 35px;
  font-size: 22px;
  color: #fff;
  border: 1px dashed #999;
  border-radius: 7px;
  background-color: rgba(0, 0, 0, .25);
  & span {
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
