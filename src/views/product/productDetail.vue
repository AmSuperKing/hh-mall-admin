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
          <el-form-item label="产品名称" prop="prodName">
            <el-input v-model.trim="detailForm.prodName" type="textarea" autosize :disabled="!isAdd && !isEdit" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="产品编码" prop="prodCode">
            <el-input v-model.trim="detailForm.prodCode" :disabled="!isAdd && !isEdit" />
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
            <el-select v-model="detailForm.flag" style="width: 100%" :disabled="!isAdd && !isEdit">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="所属分类" prop="cid">
            <el-cascader
              v-model="detailForm.cid"
              :props="cascaderProps"
              :options="typesList"
              :show-all-levels="false"
              :disabled="!isAdd && !isEdit"
              clearable
              filterable
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="排序优先值" prop="sort">
            <el-input-number v-model="detailForm.sort" step-strictly :min="0" :max="999999" :disabled="!isAdd && !isEdit" />
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

      <template v-if="!isAdd">
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品描述" prop="prodInfo">
              <el-input v-model.trim="detailInfo.prodInfo" type="textarea" autosize :disabled="!isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model.trim="detailInfo.unit" :disabled="!isEdit" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="颜色" prop="colors">
          <div class="color-tags">
            <el-tag
              v-for="(color, index) in detailInfo.colors"
              :key="index"
              :closable="isEdit"
              :disable-transitions="false"
              size="large"
              style="margin: 0 5px;"
              @close="handleClose(color)"
            >{{ color }}</el-tag>
            <el-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model.trim="tagInputValue"
              style="display: inline-block; margin: 5px;"
              @keyup.enter="handleTagInputConfirm"
              @blur="handleTagInputConfirm"
            />
            <el-button v-else :disabled="!isEdit" @click="showTagInput">+ 添加颜色</el-button>
          </div>
        </el-form-item>
        <el-form-item label="视频" prop="videoLink">
          <video v-if="detailInfo.videoLink" width="320" height="240" :src="detailInfo.videoLink" controls>
            您的浏览器不支持Video标签。
          </video>
          <span v-if="!detailInfo.videoLink" style="margin-right: 15px;">暂无视频</span>
          <el-button
            v-if="!detailInfo.videoLink"
            type="primary"
            :icon="Upload"
            :disabled="!isEdit"
            circle
            plain
            @click="showUploadVideoDialog"
          />
          <el-button
            v-if="detailInfo.videoLink"
            type="danger"
            :icon="Delete"
            circle
            plain
            style="margin-left: 10px;"
            @click="delVideoLink"
          />
        </el-form-item>

        <el-form-item label="产品详情" prop="detailText"></el-form-item>
        <div class="editor-wrapper">
          <UEditor
            v-if="toggleEditor"
            :key="detailForm.prodCode || new Date().getTime()"
            :pid="detailForm.prodId"
            :html="detailInfo.detailText || '<p></p>'"
            @change="handleDetailHtmlChange"
          />
          <UEditor
            v-if="!toggleEditor"
            :key="detailForm.prodCode || new Date().getTime()"
            :pid="detailForm.prodId"
            :html="detailInfo.detailText || '<p></p>'"
            @change="handleDetailHtmlChange"
          />
        </div>
      </template>
      
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

    <el-dialog
      v-model="uploadVideoVisible"
      title="上传视频"
      destroy-on-close
      width="500px"
      draggable
      append-to-body
    >
      <UploadVideo
        ref="UploadVideoRef"
        tips="视频大小请小于 50M "
        @on-success="handleVideoUploadSuccess"
        @on-error="handleVideoUploadError"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onActivated, onMounted, reactive, ref, watch } from 'vue'
import { ElInput, ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, Upload } from '@element-plus/icons-vue'
import { categoryApi } from '@/api/categoryApi'
import { fileApi } from '@/api/fileApi'
import { productApi } from '@/api/productApi'
import UploadImgSingle from '@/components/UploadImgSingle/index.vue'
import UploadVideo from '@/components/UploadVideo/uploadVideo.vue'
import UEditor from '@/components/UEditor/UEditor.vue'

const loading = ref(false)
const detailFormRef = ref<FormInstance>()
const isAdd = ref(true)
const isEdit = ref(false)
const rawData = ref<anyObj>({})
const detailForm = ref<anyObj>({})
const rules = reactive<FormRules>({
  prodName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  cid: [{ required: true, message: '请选择产品类别', trigger: 'change' }],
  flatPattern: [{ required: true, message: '封面不能为空', trigger: 'blur' }],
  detailText: [{ required: true, message: '详情不能为空', trigger: 'blur' }]
})
const typesList = ref<anyObj[]>([])
const cascaderProps = {
  label: 'name',
  value: 'cid',
  children: "child",
  emitPath: false
}
const uploadImgVisible = ref(false)
const uploadVideoVisible = ref(false)

const detailInfo = ref<anyObj>({})

const tagInputValue = ref('')
const tagInputVisible = ref(false)
const tagInputRef = ref<InstanceType<typeof ElInput>>()

const detailHtmlValue = ref('')
const toggleEditor = ref(false)

watch(
  () => detailInfo.value.prodCode,
  (newVal, oldVal) => {
    toggleEditor.value = !toggleEditor.value
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  getTypeTree()
})
onActivated(() => {
  getTypeTree()
})

const toggleEdit = () => {
  isEdit.value = !isEdit.value
}
const onEditCancel = () => {
  isEdit.value = false
  detailForm.value = rawData.value
}
const saveDetailForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  detailForm.value.detailText = detailHtmlValue.value
  detailInfo.value.detailText = detailHtmlValue.value
  if (!detailInfo.value.prodId) detailInfo.value.prodId = detailForm.value.prodId
  if (!detailInfo.value.prodName) detailInfo.value.prodName = detailForm.value.prodName
  if (!detailInfo.value.prodCode) detailInfo.value.prodCode = detailForm.value.prodCode
  await formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      productApi.updateProduct(detailForm.value).then(res => {
        if (res?.code === 200) {
          ElMessage.success('修改产品信息成功')
          if (!detailInfo.value.detailId) {
            submitAddDetail()
          } else {
            saveDetailInfo()
          }
          
        } else {
          ElMessage.error('修改产品信息出错')
        }
      }).catch(e => {
        ElMessage.error(e.message || e + '' || '更新产品信息失败')
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

const submitAdd = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      productApi.addProduct(detailForm.value).then(res => {
        console.log(res)
        if (res?.code === 200) {
          ElMessage.success('新增产品信息成功')
          // resetForm(detailFormRef.value)
          detailForm.value = res.data || {}
          isAdd.value = false
          refreshInfo()
        } else {
          ElMessage.error('新增产品信息出错')
        }
      }).catch(e => {
        ElMessage.error(e)
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

const submitAddDetail = () => {
  productApi.addProductDetail(detailInfo.value).then(res => {
    if (res?.code === 200) {
      ElMessage.success('新增明细成功')
    } else {
      ElMessage.error('新增明细出错')
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    refreshInfo()
  })
}

const saveDetailInfo = () => {
  productApi.updateProductDetail(detailInfo.value).then(res => {
    if (res?.code === 200) {
      ElMessage.success('修改明细成功')
    } else {
      ElMessage.error('修改明细出错')
    }
  }).catch(e => {
    ElMessage.error(e.message || e + '' || '更新明细失败')
  }).finally(() => {
    refreshInfo()
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const refreshInfo = () => {
  if (!detailForm.value.prodId) return
  const searchParams = {
    prodId: detailForm.value.prodId
  }
  loading.value = true
  productApi.getProductList(searchParams).then(res => {
    const { data } = res
    if (data?.list.length) {
      detailForm.value = data.list[0]
      rawData.value = data.list[0]
    }
  }).catch(e => {
    console.log(e)
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
    getDetailInfo()
  })
}

const handleCoverPreview = () => {
  if (!detailForm.value.flatPattern) return
  document.getElementById('coverImg')!.click()
}

const showUploadImgDialog = () => {
  uploadImgVisible.value = true
}

const showUploadVideoDialog = () => {
  uploadVideoVisible.value = true
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

const getTypeTree = () => {
  categoryApi.getCategoryListTree().then(res => {
    console.log(res)
    const ProductID = 2 // 产品系列的ID
    if (res?.data) {
      for (const item of res.data) {
        if (item.cid == ProductID) typesList.value = item.child || []
      }
    }
    
  }).catch(e => {
    ElMessage.error(e)
  })
}

const handleUploadSuccess = (data: string) => {
  if (detailForm.value.flatPattern) {
    fileApi.delFile(detailForm.value.flatPattern).then(res => {
      if (res?.code === 200) {
        if (data) detailForm.value.flatPattern = data
        else detailForm.value.flatPattern = ''
      }
      else ElMessage.error('删除旧图片出错')
    }).catch(e => {
      ElMessage.error(e || '删除失败')
    })
  }
  if (data) detailForm.value.flatPattern = data
  uploadImgVisible.value = false
}

const handleUploadError = (err: any) => {
  uploadImgVisible.value = false
}

const handleVideoUploadSuccess = (data: string) => {
  if (detailInfo.value.videoLink) {
    fileApi.delFile(detailInfo.value.videoLink).then(res => {
      if (res?.code === 200) {
        if (data) detailInfo.value.videoLink = data
        else detailInfo.value.videoLink = ''
      }
      else ElMessage.error('删除旧视频出错')
    }).catch(e => {
      ElMessage.error(e || '删除失败')
    })
  }
  if (data) detailInfo.value.videoLink = data
  uploadVideoVisible.value = false
}

const handleVideoUploadError = (err: any) => {
  uploadVideoVisible.value = false
}

const delVideoLink = () => {
  detailForm.value.videoLink = ''
}

const getDetailInfo = () => {
  if (!detailForm.value.prodId) return
  detailInfo.value = {}
  loading.value = true
  productApi.getProductDetail(detailForm.value.prodId).then(res => {
    console.log('detail info :', res)
    detailInfo.value = res.data || {}
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const handleClose = (color: string) => {
  const index = detailInfo.value.colors.indexOf(color)
  if (index > -1) detailInfo.value.colors.splice(index, 1)
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value!.input!.focus()
  })
}

const handleTagInputConfirm = () => {
  if (tagInputValue.value) {
    if (detailInfo.value.colors) detailInfo.value.colors.push(tagInputValue.value)
    else detailInfo.value.colors = [tagInputValue.value]
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const handleDetailHtmlChange = (val: string) => {
  detailHtmlValue.value = val
}

defineExpose({
  isAdd,
  isEdit,
  rawData,
  detailForm,
  detailInfo,
  resetForm,
  getDetailInfo
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
    border: 1px dashed #eee;
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
    border: 1px dashed #eee;
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

.color-tags {
  display: flex;
  align-items: center;
}

.editor-wrapper {
  width: 720px;
  margin-left: 100px;
}
</style>
