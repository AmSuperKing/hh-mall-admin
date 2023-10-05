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
      <el-form-item label="文章标题" prop="title">
        <el-input v-model.trim="detailForm.title" type="textarea" autosize clearable :max="120" />
      </el-form-item>
      <el-form-item label="摘要" prop="synopsis">
        <el-input v-model.trim="detailForm.synopsis" type="textarea" autosize clearable :max="300" />
      </el-form-item>
      <el-row>
        <el-col :span="6">
          <el-form-item label="作者" prop="author">
            <el-input v-model.trim="detailForm.author" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="6">
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
        <el-col :span="4">
          <el-form-item label="排序优先值" prop="sort">
            <el-input-number v-model="detailForm.sort" step-strictly :min="0" :max="999999" />
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

      <el-form-item label="原文链接" prop="originalUrl">
        <el-input
          v-model.trim="detailForm.originalUrl"
          type="textarea"
          autosize
          clearable
          placeholder="原文链接只支持微信公众号文章"
          :max="300"
        />
      </el-form-item>

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

      <el-form-item label="文章内容" prop="content"></el-form-item>
      <div class="editor-wrapper">
        <UEditor
          v-if="toggleEditor"
          :key="detailForm.articleId || new Date().getTime()"
          :html="detailForm.content || '<p></p>'"
          @change="handleDetailHtmlChange"
        />
        <UEditor
          v-if="!toggleEditor"
          :key="detailForm.articleId || new Date().getTime()"
          :html="detailForm.content || '<p></p>'"
          @change="handleDetailHtmlChange"
        />
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
        tips="请选择图片进行上传"
        @on-success="handleImgUploadSuccess"
        @on-error="handleImgUploadError"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onActivated, onMounted, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { articleApi } from '@/api/articleApi'
import { fileApi } from '@/api/fileApi'
import { categoryApi } from '@/api/categoryApi'
import UploadFile from '@/components/UploadFile/uploadFile2.vue'
import UEditor from '@/components/UEditor/UEditor.vue'

const loading = ref(false)
const detailFormRef = ref<FormInstance>()
const detailForm = ref<ArticleProps>({})

const rules = reactive<FormRules>({
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }]
})

const uploadImgVisible = ref(false)
const toggleEditor = ref(false)

const typesList = ref<anyObj[]>([])
const cascaderProps = {
  label: 'name',
  value: 'cid',
  children: "child",
  emitPath: false
}
const detailHtmlValue = ref('')

watch(
  () => detailForm.value.articleId,
  (newVal, oldVal) => {
    toggleEditor.value = !toggleEditor.value
  },
  { deep: true, immediate: true }
)

onMounted(() => {
  getTypeTree()
})
onActivated(() => {
  getTypeTree()
})

const getTypeTree = () => {
  categoryApi.getCategoryListTree().then(res => {
    console.log('getCategoryListTree', res)
    typesList.value = res.data || []
    
  }).catch(e => {
    ElMessage.error(e)
  })
}

const saveInfo = () => {
  detailForm.value.content = detailHtmlValue.value
  detailFormRef.value!.validate((valid, fields) => {
    if (valid) {
      if (!detailForm.value.originalUrl && !detailForm.value.content) {
        ElMessage.error('原文链接和文章内容不能同时为空')
        return
      }
      if (!detailForm.value.originalUrl && detailForm.value.content == '<p><br></p>') {
        ElMessage.error('文章内容不能为空')
        return
      }
      // 文章类型 0富文本 1转发文链接
      if (detailForm.value.originalUrl) detailForm.value.type = 1
      if (detailForm.value.content) detailForm.value.type = 0
      if (detailForm.value.articleId) {
        saveDetailForm()
      } else {
        submitAdd()
      }
    }
  })
}

const saveDetailForm = () => {
  loading.value = true
  articleApi.updateArticle(detailForm.value).then(res => {
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
  articleApi.addArticle(detailForm.value).then(res => {
    if (res?.code === 200) {
      ElMessage.success('新增成功')
      // resetForm(detailFormRef.value)
      detailForm.value.articleId = res.message
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
  if (!detailForm.value.articleId) return
  const searchParams = {
    articleId: detailForm.value.articleId,
    page: 1,
    limit: 1
  }
  loading.value = true
  articleApi.getArticleList(searchParams).then(res => {
    const { data } = res
    if (data?.length === 1) {
      detailForm.value = data.list[0]
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
    getDetail()
  })
}

const getDetail = () => {
  if (!detailForm.value.articleId) return
  loading.value = true
  articleApi.getArticleDetail(detailForm.value.articleId).then(res => {
    detailForm.value.content = res.data.content || ''
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

const handleDetailHtmlChange = (val: string) => {
  detailHtmlValue.value = val
}

defineExpose({
  detailForm,
  resetForm,
  refreshInfo
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

.editor-wrapper {
  width: 720px;
  margin-left: 100px;
}
</style>
