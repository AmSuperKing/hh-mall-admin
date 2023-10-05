<template>
  <div>
    <el-form
      ref="typeInfoRef"
      :model="typeInfo"
      :rules="rules"
      label-width="100px"
    >
      <el-row>
        <el-col :span="8">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model.trim="typeInfo.name" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="封面" prop="imageLink">
            <div class="cover-box">
              <el-image
                id="coverImg"
                class="cover-img"
                fit="cover"
                :src="typeInfo.imageLink"
                :preview-src-list="typeInfo.imageLink ? [typeInfo.imageLink] : []"
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
                <span @click="showUploadImgDialog" :disabled="!typeInfo.imageLink">
                  <el-icon><Switch /></el-icon>
                </span>
                <span @click="delCurrCover" :disabled="!typeInfo.imageLink">
                  <el-icon><Delete /></el-icon>
                </span>
              </div>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="首页展示" prop="flag">
            <el-select v-model="typeInfo.flag" style="width: 100%">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
            <el-select v-model="typeInfo.status" style="width: 100%">
              <el-option
                v-for="(item, index) of statusList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属类型" prop="parentId">
            <el-input v-model.trim="params.name" disabled />
          </el-form-item>
        </el-col>
        <el-col v-if="typeInfo.createTime" :span="8">
          <el-form-item label="创建时间" prop="createTime">
            <el-input v-model.trim="typeInfo.createTime" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col v-if="typeInfo.updateTime" :span="8">
          <el-form-item label="修改时间" prop="updateTime">
            <el-input v-model.trim="typeInfo.updateTime" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="operate-btns">
      <el-button @click="closeForm">取消</el-button>
      <template v-if="!addStatus">
        <el-button type="primary" plain @click="savetypeInfo(typeInfoRef)">保存</el-button>
      </template>
      <template v-else>
        <el-button type="primary" plain @click="submitAdd(typeInfoRef)">新增</el-button>
      </template>
    </div>

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
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { categoryApi } from '@/api/categoryApi'
import { fileApi } from '@/api/fileApi'
import UploadImgSingle from '@/components/UploadImgSingle/index.vue'

interface UploadImgProps {
  isAdd?: boolean
  params?: anyObj | any
  data?: anyObj | any
}

const props = withDefaults(defineProps<UploadImgProps>(), {
  isAdd: true,
  params: () => {},
  data: () => {}
})

const emits = defineEmits<{
  (e: 'close'): void
}>()

const addStatus = computed(() => props.isAdd)

const loading = ref(false)
const typeInfoRef = ref<FormInstance>()
const typeInfo = ref<CategoryProps | anyObj>({
  status: true
})
const statusList = ref([
  { label: '正常', value: true },
  { label: '失效', value: false }
])
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
})
const uploadImgVisible = ref(false)

watch(
  () => props.isAdd,
  (newValue, oldValue) => {
    if (!newValue) {
      typeInfo.value = props.data
    }
  },
  { immediate: true }
)

const savetypeInfo = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      categoryApi.updateCategory(typeInfo.value).then(res => {
        if (res?.code === 200) {
          ElMessage.success('修改成功')
        } else {
          ElMessage.error('修改出错')
        }
      }).catch(e => {
        ElMessage.error(e.message || e + '' || '更新失败')
      }).finally(() => {
        loading.value = false
        closeForm()
      })
    }
  })
}

const submitAdd = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      typeInfo.value.parentId = props.params.cid
      loading.value = true
      categoryApi.addCategory(typeInfo.value).then(res => {
        if (res?.code === 200) {
          ElMessage.success(res.message || '新增成功')
          resetForm(typeInfoRef.value)
        } else {
          ElMessage.error('新增出错')
        }
      }).catch(e => {
        ElMessage.error(e)
      }).finally(() => {
        loading.value = false
        closeForm()
      })
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const handleCoverPreview = () => {
  if (!typeInfo.value.imageLink) return
  document.getElementById('coverImg')!.click()
}

const showUploadImgDialog = () => {
  uploadImgVisible.value = true
}

const delCurrCover = () => {
  if (!typeInfo.value.imageLink) return
  loading.value = true
  fileApi.delFile(typeInfo.value.imageLink).then(res => {
    if (res?.code === 200) typeInfo.value.imageLink = ''
    else ElMessage.error(res.message || '删除图片出错')
  }).catch(e => {
    ElMessage.error(e || '删除失败')
  }).finally(() => {
    loading.value = false
  })
}

const handleUploadSuccess = (data: string) => {
  if (typeInfo.value.imageLink) {
    fileApi.delFile(typeInfo.value.imageLink).then(res => {
      if (res?.code === 200) {
        if (data) typeInfo.value.imageLink = data
        else typeInfo.value.imageLink = ''
      }
      else ElMessage.error('删除旧图片出错')
    }).catch(e => {
      ElMessage.error(e || '删除失败')
    })
  }
  if (data) typeInfo.value.imageLink = data
  uploadImgVisible.value = false
}

const handleUploadError = (err: any) => {
  uploadImgVisible.value = false
}

const closeForm = () => {
  emits('close')
}
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

.operate-btns {
  text-align: right;
}
</style>
