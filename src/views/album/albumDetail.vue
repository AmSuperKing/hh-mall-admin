<template>
  <div v-loading="loading">
    <div class="mgb10">
      <el-button type="primary" plain @click="saveInfo">保存</el-button>
    </div>
    <el-form
      ref="detailFormRef"
      :model="detailForm"
      :rules="rules"
      label-width="100px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="画册名称" prop="albumName">
            <el-input v-model.trim="detailForm.albumName" type="textarea" autosize />
          </el-form-item>
      </el-col>
        <el-col :span="6">
          <el-form-item label="封面" prop="flatPattern">
            <div class="cover-box">
              <el-image
                id="coverImg"
                class="cover-img"
                fit="cover"
                :src="detailForm.flatPattern"
                :preview-src-list="detailForm.flatPattern ? [detailForm.flatPattern] : []"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><PictureFilled /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="replace-icon">
                <span @click="handleCoverPreview">
                  <el-icon><ZoomIn /></el-icon>
                </span>
                <span @click="showUploadImgDialog">
                  <el-icon><Switch /></el-icon>
                </span>
                <span @click="delCurrCover">
                  <el-icon><Delete /></el-icon>
                </span>
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row>
        <el-col :span="12">
          <el-form-item label="画册链接" prop="pdfLink">
            <el-input v-model.trim="detailForm.pdfLink" disabled>
              <template #append>
                <el-button :icon="Connection" @click="showUploadDialog">点击上传画册</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="不公开" prop="vip">
            <el-switch v-model="detailForm.vip" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="排序优先值" prop="sort">
            <el-input-number v-model="detailForm.sort" step-strictly :min="0" :max="999999" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col v-if="detailForm.createTime" :span="6">
          <el-form-item label="创建时间" prop="createTime">
            <el-input v-model.trim="detailForm.createTime" disabled />
          </el-form-item>
        </el-col>
        <el-col v-if="detailForm.updateTime" :span="6">
          <el-form-item label="修改时间" prop="updateTime">
            <el-input v-model.trim="detailForm.updateTime" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <PdfViewer v-if="detailForm.pdfLink" :pdfSource="detailForm.pdfLink"></PdfViewer>

    <el-dialog
      v-model="uploadImgVisible"
      title="上传封面"
      destroy-on-close
      width="500px"
      draggable
      append-to-body
    >
      <UploadFile
        type="image"
        @on-success="handleImgUploadSuccess"
        @on-error="handleImgUploadError"
      />
    </el-dialog>

    <el-dialog
      v-model="uploadVisible"
      title="上传画册"
      destroy-on-close
      width="500px"
      draggable
      append-to-body
    >
      <UploadFile
        type="pdf"
        @on-success="handleUploadSuccess"
        @on-error="handleUploadError"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Connection } from '@element-plus/icons-vue'
import { albumApi } from '@/api/albumApi'
import { fileApi } from '@/api/fileApi'
import UploadFile from '@/components/UploadFile/uploadFile2.vue'
import PdfViewer from '@/components/PdfViewer/pdfViewer.vue'

const loading = ref(false)
const detailFormRef = ref<FormInstance>()
const detailForm = ref<AlbumProps>({})

const rules = reactive<FormRules>({
  albumName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  pdfLink: [{ required: true, message: '请选择画册文件', trigger: 'blur' }]
})

const uploadVisible = ref(false)
const uploadImgVisible = ref(false)


const saveInfo = () => {
  detailFormRef.value!.validate((valid, fields) => {
    if (valid) {
      if (detailForm.value.albumId) {
        saveDetailForm()
      } else {
        submitAdd()
      }
    }
  })
}

const saveDetailForm = () => {
  loading.value = true
  albumApi.updateAlbum(detailForm.value).then(res => {
    if (res?.code === 200) {
      ElMessage.success('修改成功')
    } else {
      ElMessage.error('修改出错')
    }
  }).catch(e => {
    ElMessage.error(e.message || e + '' || '更新失败')
  }).finally(() => {
    loading.value = false
    refreshInfo()
  })
}

const submitAdd = () => {
  loading.value = true
  albumApi.addAlbum(detailForm.value).then(res => {
    if (res?.code === 200) {
      ElMessage.success(res.message || '新增成功')
      resetForm(detailFormRef.value)
      detailForm.value = res.data || {}
      refreshInfo()
    } else {
      ElMessage.error('新增出错')
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}


const showUploadDialog = () => {
  uploadVisible.value = true
}

const handleUploadSuccess = (data: string) => {
  if (detailForm.value.pdfLink) {
    fileApi.delFile(detailForm.value.pdfLink).then(res => {
      if (res?.code === 200) {
        if (data) detailForm.value.pdfLink = data
        else detailForm.value.pdfLink = ''
      }
      else ElMessage.error('删除旧文件出错')
    }).catch(e => {
      ElMessage.error(e || '删除失败')
    })
  }
  if (data) detailForm.value.pdfLink = data
  uploadVisible.value = false
}

const handleUploadError = (err: any) => {
  uploadVisible.value = false
}

const refreshInfo = () => {
  if (!detailForm.value.albumId) return
  const searchParams = {
    albumId: detailForm.value.albumId,
    page: 1,
    limit: 1
  }
  loading.value = true
  albumApi.getAlbumList(searchParams).then(res => {
    const { data } = res
    if (data?.length === 1) {
      detailForm.value = data.list[0]
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const handleCoverPreview = () => {
  if (!detailForm.value.flatPattern) return
  document.getElementById('coverImg')!.click()
}

const showUploadImgDialog = () => {
  uploadImgVisible.value = true
}

const delCurrCover = () => {
  if (!detailForm.value.flatPattern) return
  loading.value = true
  fileApi.delFile(detailForm.value.flatPattern).then(res => {
    if (res?.code === 200) detailForm.value.flatPattern = ''
    else ElMessage.error(res.message || '删除图片出错')
  }).catch(e => {
    ElMessage.error(e || '删除失败')
  }).finally(() => {
    loading.value = false
  })
}

const handleImgUploadSuccess = (data: string) => {
  if (detailForm.value.flatPattern) {
    fileApi.delFile(detailForm.value.flatPattern).then(res => {
      if (res?.code === 200) {
        if (data) detailForm.value.flatPattern = data
        else detailForm.value.flatPattern = ''
      }
      else ElMessage.error('删除旧文件出错')
    }).catch(e => {
      ElMessage.error(e || '删除失败')
    })
  }
  if (data) detailForm.value.flatPattern = data
  uploadImgVisible.value = false
}

const handleImgUploadError = (err: any) => {
  uploadImgVisible.value = false
}


defineExpose({
  detailForm,
  resetForm
})

</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 15px !important;
}

.cover-box {
  position: relative;
  .cover-img {
    width: 150px;
    height: 90px;
  }
  
  .replace-icon {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 150px;
    height: 90px;
    background-color: rgba(0, 0, 0, .3);
    color: #fff;
    &:hover {
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
