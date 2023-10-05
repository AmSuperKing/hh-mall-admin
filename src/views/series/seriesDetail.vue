<template>
  <div v-loading="loading">
    <div class="mgb10">
      <template v-if="!isAdd">
        <el-button v-if="!isEdit" type="warning" plain @click="toggleEdit">编辑</el-button>
        <el-button v-if="isEdit" @click="onEditCancel">关闭编辑</el-button>
        <el-button type="primary" plain @click="saveDetailForm(detailFormRef)">保存</el-button>
      </template>
      <template v-else>
        <el-button type="primary" plain @click="submitAdd(detailFormRef)">新增</el-button>
      </template>
    </div>
    <el-form
      ref="detailFormRef"
      :model="detailForm"
      :rules="rules"
      label-width="100px"
    >
      <el-row>
        <el-col :span="6">
          <el-form-item label="系列名称" prop="name">
            <el-input v-model.trim="detailForm.name" :disabled="!isAdd && !isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="封面" prop="imageLink">
            <div class="cover-box">
              <el-image
                id="coverImg"
                class="cover-img"
                fit="cover"
                :src="detailForm.imageLink"
                :preview-src-list="detailForm.imageLink ? [detailForm.imageLink] : []"
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
                <span @click="showUploadImgDialog" :disabled="!isAdd && !isEdit">
                  <el-icon><Switch /></el-icon>
                </span>
                <span @click="delCurrCover" :disabled="!isAdd && !isEdit">
                  <el-icon><Delete /></el-icon>
                </span>
              </div>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="首页展示" prop="flag">
            <el-select v-model="detailForm.flag" style="width: 100%"  :disabled="!isAdd && !isEdit">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态" prop="status">
            <el-select v-model="detailForm.status" style="width: 100%"  :disabled="isAdd || !isEdit">
              <el-option
                v-for="(item, index) of statusList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="排序优先值" prop="sort">
            <el-input-number v-model="detailForm.sort" step-strictly :min="0" :max="999999" :disabled="!isAdd && !isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="小程序路劲" prop="appPath">
            <el-select v-model="detailForm.appPath" style="width: 100%" clearable :disabled="!isAdd && !isEdit">
              <el-option
                v-for="(item, index) of settings.appPaths"
                :key="index"
                :label="item.title"
                :value="item.path"
              />
            </el-select>
          </el-form-item>
        </el-col>
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

    <el-dialog
      v-model="uploadImgVisible"
      title="上传封面"
      destroy-on-close
      width="500px"
      draggable
      append-to-body
    >
      <UploadImgSingle
        ref="uploadImgSingleRef"
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
import { categoryApi } from '@/api/categoryApi'
import { fileApi } from '@/api/fileApi'
import UploadImgSingle from '@/components/UploadImgSingle/index.vue'
import settings from '@/settings'

const loading = ref(false)
const detailFormRef = ref<FormInstance>()
const isAdd = ref(true)
const isEdit = ref(false)
const rawData = ref<anyObj>({})
const detailForm = ref<CategoryProps | anyObj>({
  status: true
})
const statusList = ref([
  { label: '正常', value: true },
  { label: '失效', value: false }
])

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
})

const uploadImgVisible = ref(false)


const toggleEdit = () => {
  isEdit.value = !isEdit.value
}
const onEditCancel = () => {
  isEdit.value = false
  detailForm.value = rawData.value
}
const saveDetailForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      categoryApi.updateCategory(detailForm.value).then(res => {
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
  })
}

const submitAdd = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      detailForm.value.parentId = 0
      loading.value = true
      categoryApi.addCategory(detailForm.value).then(res => {
        console.log(res)
        if (res?.code === 200) {
          ElMessage.success(res.message || '新增成功')
          resetForm(detailFormRef.value)
          detailForm.value = res.data || {}
          isAdd.value = false
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
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const handleCoverPreview = () => {
  if (!detailForm.value.imageLink) return
  document.getElementById('coverImg')!.click()
}

const showUploadImgDialog = () => {
  uploadImgVisible.value = true
}

const delCurrCover = () => {
  if (!detailForm.value.imageLink) return
  loading.value = true
  fileApi.delFile(detailForm.value.imageLink).then(res => {
    if (res?.code === 200) detailForm.value.imageLink = ''
    else ElMessage.error(res.message || '删除图片出错')
  }).catch(e => {
    ElMessage.error(e || '删除失败')
  }).finally(() => {
    loading.value = false
  })
}


const handleUploadSuccess = (data: string) => {
  if (detailForm.value.imageLink) {
    fileApi.delFile(detailForm.value.imageLink).then(res => {
      if (res?.code === 200) {
        if (data) detailForm.value.imageLink = data
        else detailForm.value.imageLink = ''
      }
      else ElMessage.error('删除旧图片出错')
    }).catch(e => {
      ElMessage.error(e || '删除失败')
    })
  }
  if (data) detailForm.value.imageLink = data
  uploadImgVisible.value = false
}

const handleUploadError = (err: any) => {
  uploadImgVisible.value = false
}

const refreshInfo = () => {
  if (!detailForm.value.cid) return
  loading.value = true
  categoryApi.getCategoryInfo(detailForm.value.cid).then(res => {
    const { data } = res
    if (data) {
      detailForm.value = data
      rawData.value = data
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}


defineExpose({
  isAdd,
  isEdit,
  rawData,
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
