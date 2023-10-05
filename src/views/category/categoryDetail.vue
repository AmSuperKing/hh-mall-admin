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
          <el-form-item label="分类名称" prop="name">
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
          <el-form-item label="所属类型" prop="parentId">
            <el-select v-model="detailForm.parentId" style="width: 100%"  :disabled="!isAdd && !isEdit">
              <el-option
                v-for="item of mainTypeList"
                :key="item.cid"
                :label="item.name"
                :value="item.cid"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="排序优先值" prop="sort">
            <el-input-number v-model="detailForm.sort" step-strictly :min="0" :max="999999" :disabled="!isAdd && !isEdit" />
          </el-form-item>
        </el-col>
        <el-col v-if="!isAdd" :span="6">
          <el-form-item label="创建时间" prop="createTime">
            <el-input v-model.trim="detailForm.createTime" disabled />
          </el-form-item>
        </el-col>
        <el-col v-if="!isAdd" :span="6">
          <el-form-item label="修改时间" prop="updateTime">
            <el-input v-model.trim="detailForm.updateTime" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-divider />
    <div v-if="!isAdd" class="mgb10">
      <el-button type="primary" plain @click="showAddSubtypeDialog">新增下属分类</el-button>
    </div>
    <CusTable
      v-if="!isAdd"
      :data="tableData"
      :config="tableConfig"
      :cols="tableCols"
      :pageData="pageData"
      @operatesClick="handleOperateClick"
    />

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
      v-model="subTypeInfoVisible"
      :title="editTitle"
      destroy-on-close
      width="75%"
      draggable
      append-to-body
    >
      <TypeInfoForm
        v-if="subTypeInfoVisible"
        :is-add="addSubType"
        :params="detailForm"
        :data="currRow"
        @close="handleCloseForm"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onActivated, onMounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { categoryApi } from '@/api/categoryApi'
import { fileApi } from '@/api/fileApi'
import UploadImgSingle from '@/components/UploadImgSingle/index.vue'
import TypeInfoForm from './typeInfoForm.vue'

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
const mainTypeList = ref<anyObj[]>([])
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择分类名称', trigger: 'change' }]
})

const tableData = ref<anyObj[]>([])
  const tableConfig = {
  border: true,
  showIndex: true,
  showOperate: true,
  operates: [
    { text: '编辑', type: 'primary' },
    { text: '删除', type: 'danger' }
  ],
  showPager: true
}
const tableCols = [
  { key: 'name', label: '分类名称' },
  { key: 'status', label: '状态', formatter: (row: anyObj) => row.status ? '正常' : '失效' },
  { key: 'imageLink', label: '封面', type: 'image' },
  { key: 'parentName', label: '所属类型', type: 'tag', size: 'large' },
  { key: 'createTime', label: '创建时间', sortable: true },
  { key: 'updateTime', label: '修改时间', sortable: true }
]
const pageData = reactive({
  currPage: 1,
  pageSize: 15,
  pageSizes: [30, 50, 100, 150, 300],
  small: false,
  disabled: false,
  background: true,
  total: 0
})
const uploadImgVisible = ref(false)
const subTypeInfoVisible = ref(false)
const editTitle = ref('类别新增')
const addSubType = ref(true)
const currRow = ref<anyObj>({})

onMounted(() => {
  getMainTypeList()
})
onActivated(() => {
  getMainTypeList()
})

const getMainTypeList = () => {
  const searchParams = { ids: 0, page: 1, limit: 1000 }
  categoryApi.getCategoryListByParent(searchParams).then(res => {
    const { data } = res
    if (data) {
      mainTypeList.value = data.list
    }
  }).catch(e => {
    ElMessage.error(e)
  })
}

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
      loading.value = true
      categoryApi.addCategory(detailForm.value).then(res => {
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

const getDetailList = () => {
  const searchParams = {
    ids: detailForm.value.cid,
    page: pageData.currPage,
    limit: pageData.pageSize
  }
  loading.value = true
  categoryApi.getCategoryListByParent(searchParams).then(res => {
    const { data } = res
    if (data?.list) {
      const resData = data.list
      resData.forEach((item: anyObj) => item.parentName = detailForm.value.name)
      tableData.value = resData
      pageData.total = data.total
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const handleOperateClick = (type: string, row: anyObj) => {
  if (type === '编辑') {
    editTitle.value = '类别编辑'
    addSubType.value = false
    currRow.value = row
    subTypeInfoVisible.value = true
  }
  if (type === '删除') delCurrRow(row)
}

const delCurrRow = (row: anyObj) => {
  ElMessageBox.confirm('确认删除该类别吗?', '确认',
    {
      confirmButtonText: '删 除',
      cancelButtonText: '取 消',
      type: 'error',
      autofocus: false,
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    loading.value = true
    categoryApi.delCategory(row.cid).then(res => {
      if (res?.code === 200) ElMessage.success('删除成功')
      else ElMessage.error('删除失败')
    }).catch(e => {
      ElMessage.error(e)
    }).finally(() => {
      loading.value = false
      getDetailList()
    })
  }).catch(() => {})
}

const showAddSubtypeDialog = () => {
  editTitle.value = '类别新增'
  addSubType.value = true
  subTypeInfoVisible.value = true
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
  const searchParams = {
    cid: detailForm.value.cid
  }
  loading.value = true
  categoryApi.getSubCategoryList(searchParams).then(res => {
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
    getDetailList()
  })
}

const handleCloseForm = () => {
  subTypeInfoVisible.value = false
  refreshInfo()
}

defineExpose({
  isAdd,
  isEdit,
  rawData,
  detailForm,
  resetForm,
  getDetailList
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
