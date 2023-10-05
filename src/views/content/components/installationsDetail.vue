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
        <el-col :span="6">
          <el-form-item label="说明书名称" prop="installExplainName">
            <el-input v-model.trim="detailForm.installExplainName" type="textarea" autosize />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="所属分类" prop="cid">
            <el-select
              v-model="detailForm.cid"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item of typeList"
                :key="item.cid"
                :label="item.name"
                :value="item.cid"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
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
        <el-col :span="4">
          <el-form-item label="不公开" prop="vip">
            <el-switch v-model="detailForm.vip" />
          </el-form-item>
        </el-col>
        <el-col :span="4">
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
      
      <el-form-item label="说明示意图" prop="images"></el-form-item>
      <div class="grid-list">
        <div v-for="(img, index) of detailForm.images" :key="index" class="img-box">
          <div class="tools-box">
            <span class="icon-btn">
              <el-icon @click="imgMoveToLeft(index)"><Back /></el-icon>
            </span>
            <span class="icon-btn">
              <el-icon @click="imgMoveToRight(index)"><Right /></el-icon>
            </span>
            <span class="icon-btn">
              <el-icon @click="delCurrImg(img.imageLink, index)"><Delete /></el-icon>
            </span>
          </div>
          <el-image
            class="img-item"
            fit="cover"
            :src="img.imageLink"
            :preview-src-list="img.imageLink ? [img.imageLink] : []"
          >
            <template #error>
              <div class="image-slot">
                <el-icon><PictureFilled /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
        <UploadFile
          type="image"
          :multiple="true"
          :show-file-list="false"
          @on-success="handleImgUploadSuccess2"
          @on-error="handleImgUploadError"
        >
          <div>
            <el-icon class="el-icon--upload"><Plus /></el-icon>
            <div style="font-size: 14px; color: #666;">上传图片</div>
          </div>
        </UploadFile>
      </div>

      <el-form-item label="安装说明视频" prop="videos"></el-form-item>
      <div class="video-list">
        <div v-for="(video, index) of detailForm.videos" :key="index" class="video-box">
          <video :src="video" controls width="350" height="200"></video>
          <div class="tools-box">
            <span class="icon-btn">
              <el-icon @click="delCurrVideo(video, index)"><Delete /></el-icon>
            </span>
          </div>
        </div>
        <div class="upload-trigger" @click="showUploadVideoDialog">
          <el-icon><UploadFilled /></el-icon>
          <div style="font-size: 14px; color: #666;">上传视频</div>
        </div>
      </div>

    </el-form>

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
      v-model="uploadVideoVisible"
      title="上传视频"
      destroy-on-close
      width="500px"
      draggable
      append-to-body
    >
      <UploadFile
        type="video"
        :multiple="false"
        :show-file-list="true"
        tips="选择视频上传后请稍等视频上传完成，视频格式仅支持 .mp4 格式"
        @on-success="handleVideoUploadSuccess"
        @on-error="handleVideoUploadError"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onActivated, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { installationsApi } from '@/api/installationsApi'
import { fileApi } from '@/api/fileApi'
import { categoryApi } from '@/api/categoryApi'
import UploadFile from '@/components/UploadFile/uploadFile2.vue'

const loading = ref(false)
const detailFormRef = ref<FormInstance>()
const detailForm = ref<installationsProps>({})

const rules = reactive<FormRules>({
  installExplainName: [{ required: true, message: '请输入名称', trigger: 'blur' }]
})

const uploadImgVisible = ref(false)
const uploadVideoVisible = ref(false)

const typeList = ref<anyObj[]>([])

onMounted(() => {
  getTypeList()
})
onActivated(() => {
  getTypeList()
})

const getTypeList = () => {
  const searchParams = { ids: 1, page: 1, limit: 1000 }
  loading.value = true
  categoryApi.getCategoryListByParent(searchParams).then(res => {
    console.log(res)
    const { data } = res
    if (data) {
      typeList.value = data.list
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const saveInfo = () => {
  detailFormRef.value!.validate((valid, fields) => {
    if (valid) {
      if (detailForm.value.installExplainId) {
        saveDetailForm()
      } else {
        submitAdd()
      }
    }
  })
}

const saveDetailForm = () => {
  loading.value = true
  installationsApi.updateInstallActions(detailForm.value).then(res => {
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
  installationsApi.addInstallActions(detailForm.value).then(res => {
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

const refreshInfo = () => {
  if (!detailForm.value.installExplainId) return
  const searchParams = {
    installExplainId: detailForm.value.installExplainId,
    page: 1,
    limit: 1
  }
  loading.value = true
  installationsApi.getInstallActionsList(searchParams).then(res => {
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

const delFile = (url: string) => {
  if (!url) return
  loading.value = true
  fileApi.delFile(url).then(res => {
    if (res?.code === 200) ElMessage.success(res.message || '删除成功')
    else ElMessage.error(res.message || '删除出错')
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

const handleImgUploadSuccess2 = (data: string) => {
  if (detailForm.value.images) {
    const len = detailForm.value.images.length
    if (data) detailForm.value.images.push({
      imageLink: data,
      sort: len
    })
  } else {
    detailForm.value.images = [{
      imageLink: data,
      sort: 0
    }]
  }
}

const imgMoveToLeft = (index: number) => {
  console.log('-imgMoveToLeft-', index)
  const images = detailForm.value.images
  if (images && images[index]) {
    if (index === 0) return
    images[index].sort = images[index].sort - 1 >= 0 ? images[index].sort - 1 : 0
    images[index - 1].sort += 1
    const temp = images[index - 1]
    images[index - 1] = images[index]
    images[index] = temp
  }
}

const imgMoveToRight = (index: number) => {
  console.log('-imgMoveToRight-', index)
  const images = detailForm.value.images
  if (images && images[index]) {
    const len = images.length
    if (index + 1 === len) return
    images[index].sort += 1
    images[index + 1].sort -= 1
    const temp = images[index]
    images[index] = images[index + 1]
    images[index + 1] = temp
  }
}

const delCurrImg = async (url: string, index: number) => {
  await delFile(url)
  detailForm.value.images?.splice(index, 1)
}

const delCurrVideo = async (url: string, index: number) => {
  await delFile(url)
  detailForm.value.videos?.splice(index, 1)
}

const showUploadVideoDialog = () => {
  uploadVideoVisible.value = true
}

const handleVideoUploadSuccess = (data: string) => {
  if (detailForm.value.videos) detailForm.value.videos.push(data)
  else detailForm.value.videos = [data]
  uploadVideoVisible.value = false
}

const handleVideoUploadError = () => {
  uploadVideoVisible.value = false
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

.img-box {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  overflow: hidden;
  .img-item {
    width: 150px;
    height: 165px;
  }
}

.video-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, 350px);
  grid-gap: 15px;
  align-items: center;
  .video-box {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    overflow: hidden;
    width: 350px;
  }
  .upload-trigger {
    width: 350px;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 42px;
    color: #777;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
  }
}

.tools-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid #ccc;
  .icon-btn {
    flex: 1;
    text-align: center;
    .el-icon {
      cursor: pointer;
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
    font-size: 36px;
  }
}

.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, 150px);
  grid-gap: 15px;
  justify-content: center;
  align-items: center;
}

</style>
