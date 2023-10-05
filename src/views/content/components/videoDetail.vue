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
        <el-col :span="8">
          <el-form-item label="视频标题" prop="headline">
            <el-input v-model.trim="detailForm.headline" type="textarea" autosize />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属分类" prop="cid">
            <el-cascader
              v-model="detailForm.cid"
              :props="cascaderProps"
              :options="typesList"
              :show-all-levels="false"
              clearable
              filterable
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="首页展示" prop="flag">
            <el-select v-model="detailForm.flag" style="width: 100%">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row>
        <el-col :span="18">
          <el-form-item label="视频链接" prop="videoLink">
            <el-input v-model.trim="detailForm.videoLink" disabled>
              <template #append>
                <el-button :icon="Connection" @click="showUploadDialog">点击上传视频</el-button>
              </template>
            </el-input>
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

    <div v-if="detailForm.videoLink" class="video-box">
      <video :src="detailForm.videoLink" width="800" height="450" controls></video>
    </div>

    <el-dialog
      v-model="uploadVisible"
      title="上传视频"
      destroy-on-close
      width="500px"
      draggable
      append-to-body
    >
      <UploadFile
        type="video"
        tips="选择 .mp4 视频进行上传"
        @on-success="handleUploadSuccess"
        @on-error="handleUploadError"
      />
    </el-dialog>

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
        tips="选择封面图片进行上传"
        @on-success="handleImgUploadSuccess"
        @on-error="handleImgUploadError"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onActivated, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Connection } from '@element-plus/icons-vue'
import { videoApi } from '@/api/videoApi'
import { fileApi } from '@/api/fileApi'
import { categoryApi } from '@/api/categoryApi'
import UploadFile from '@/components/UploadFile/uploadFile2.vue'

const loading = ref(false)
const detailFormRef = ref<FormInstance>()
const detailForm = ref<VideoProps>({})

const rules = reactive<FormRules>({
  headline: [{ required: true, message: '请输入视频标题', trigger: 'blur' }],
  videoLink: [{ required: true, message: '请选择视频文件', trigger: 'blur' }]
})

const uploadVisible = ref(false)
const uploadImgVisible = ref(false)

const typesList = ref<anyObj[]>([])
const cascaderProps = {
  label: 'name',
  value: 'cid',
  children: "child",
  emitPath: false
}

onMounted(() => {
  getTypeTree()
})
onActivated(() => {
  getTypeTree()
})

const getTypeTree = () => {
  categoryApi.getCategoryListTree().then(res => {
    console.log(res)
    typesList.value = res.data || []
    
  }).catch(e => {
    ElMessage.error(e)
  })
}

const saveInfo = () => {
  detailFormRef.value!.validate((valid, fields) => {
    if (valid) {
      if (detailForm.value.videoId) {
        saveDetailForm()
      } else {
        submitAdd()
      }
    }
  })
}

const saveDetailForm = () => {
  loading.value = true
  videoApi.updateVideo(detailForm.value).then(res => {
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
  videoApi.addVideo(detailForm.value).then(res => {
    console.log(res)
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
  if (detailForm.value.videoLink) {
    fileApi.delFile(detailForm.value.videoLink).then(res => {
      if (res?.code === 200) {
        if (data) detailForm.value.videoLink = data
        else detailForm.value.videoLink = ''
      }
      else ElMessage.error('删除旧文件出错')
    }).catch(e => {
      ElMessage.error(e || '删除失败')
    })
  }
  if (data) detailForm.value.videoLink = data
  uploadVisible.value = false
}

const handleUploadError = (err: any) => {
  uploadVisible.value = false
}

const refreshInfo = () => {
  if (!detailForm.value.videoId) return
  const searchParams = {
    videoId: detailForm.value.videoId,
    page: 1,
    limit: 1
  }
  loading.value = true
  videoApi.getVideoList(searchParams).then(res => {
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
    width: 90px;
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
    width: 90px;
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

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  .el-icon {
    font-size: 30px;
  }
}

</style>
