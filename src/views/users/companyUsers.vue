<template>
  <div v-loading="loading">
    <div>
      <FilterPane :fields="searchFields" @search="onSearch">
        <el-button type="primary" plain @click="showAddAdminUserForm">新增用户</el-button>
      </FilterPane>
    </div>
    <CusTable
      :data="tableData"
      :config="tableConfig"
      :cols="tableCols"
      :pageData="pageData"
      @operatesClick="handleOperateClick"
      @currPageChange="handleCurrPageChange"
      @sizeChange="handleSizeChange"
    />

    <el-dialog
      v-model="userInfoDialogVisible"
      title="用户信息"
      width="70%"
      draggable
      destroy-on-close
    >
      <div>
        <el-form
          ref="infoFormRef"
          :model="infoForm"
          :rules="rules"
          label-width="100px"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="账号" prop="account">
                <el-input v-model="infoForm.account" size="small" :maxlength="30" :disabled="Boolean(infoForm.id)" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="名称" prop="realName">
                <el-input v-model="infoForm.realName" :maxlength="32" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="infoForm.phone" :maxlength="30" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户类型" prop="level">
                <el-select v-model="infoForm.level" style="width: 100%">
                  <el-option
                    v-for="item of levelList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-select v-model="infoForm.status" style="width: 100%">
                  <el-option label="正常" :value="true" />
                  <el-option label="禁用" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="infoForm.createTime" :span="12">
              <el-form-item label="创建时间" prop="createTime">
                <el-input v-model="infoForm.createTime" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col v-if="infoForm.updateTime" :span="12">
              <el-form-item label="修改时间" prop="updateTime">
                <el-input v-model="infoForm.updateTime" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <div v-if="!infoForm.id" class="add-tips">
            新增用户密码默认 <span style="font-weight: 700;">123456</span>  ，后续需要更改则账号本人登陆进行修改
         </div>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeInfoFormDialog">取 消</el-button>
          <el-button type="primary" @click="submitForm(infoFormRef)">提 交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onActivated, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { userApi } from '@/api/userApi'
import CusTable from '@/components/CusTable/cusTable.vue'
import FilterPane from '@/components/FilterPane/filterPane.vue'

const loading = ref(false)
const search = ref<UserProps>({})
const tableData = ref<UserProps[]>([])

const levelList = ref([
  { label: '普通用户', value: 0 },
  { label: '系统管理员', value: 1 },
  { label: '超级管理员', value: 2 }
])

const searchFields = computed(() => [
  { key: 'account', label: '账号' },
  { key: 'realName', label: '名称' },
  {
    key: 'level',
    label: '性别',
    type: 'select',
    options: levelList.value,
    labelKey: 'label',
    valueKey: 'value'
  },
  { key: 'phone', label: '手机号' },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '正常', value: 1 },
      { label: '禁用', value: 0 }
    ],
    labelKey: 'label',
    valueKey: 'value'
  },
  { key: 'createTime', label: '创建时间', type: 'date' }
])

const tableConfig = {
  border: true,
  showIndex: true,
  showOperate: true,
  showPager: true,
  operates: [
    { text: '重置密码', type: 'warning' },
    { text: '修改', type: 'primary' },
    { text: '删除', type: 'danger' }
  ],
  operateWidth: 180
}
const tableCols = computed(() => [
  { key: 'account', label: '账号' },
  { key: 'realName', label: '名称' },
  {
    key: 'level',
    label: '用户类型',
    formatter: (row: UserProps) => {
      for (const item of levelList.value) {
        if (row.level === item.value) return item.label
      }
    }
  },
  { key: 'phone', label: '手机号' },
  { key: 'status', label: '状态', colWidth: 80, formatter: (row: UserProps) => row.status ? '正常' : '禁用' },
  { key: 'createTime', label: '创建时间', sortable: true, minWidth: 250 },
  { key: 'updateTime', label: '修改时间', sortable: true, minWidth: 250 }
])

const pageData = reactive({
  currPage: 1,
  pageSize: 30,
  pageSizes: [30, 50, 100, 150, 300],
  background: true,
  total: 0
})

const userInfoDialogVisible = ref(false)
const infoFormRef = ref<FormInstance>()
const infoForm = ref<UserProps | anyObj>({})

const rules = reactive<FormRules>({
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
})

onMounted(() => {
  getDataList()
})
onActivated(() => {
  getDataList()
})


const getDataList = () => {
  const searchParams = {
    ...search.value,
    page: pageData.currPage,
    limit: pageData.pageSize
  }
  loading.value = true
  userApi.getAdminUserList(searchParams).then(res => {
    console.log('-User List-', res)
    if (res?.data?.list) {
      tableData.value = res.data.list
      pageData.total = res.data.total
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const onSearch = (searchParams: anyObj) => {
  search.value = searchParams
  getDataList()
}


const handleOperateClick = (type: string, row: UserProps | anyObj) => {
  switch (type) {
    case '重置密码':
      resetUserPwd(row)
      break
    case '修改':
      updateUserInfo(row)
      break
    case '删除':
      delCurrUser(row)
      break
    default:
      break
  }
}

const resetUserPwd = (row: UserProps | anyObj) => {
  if (!row.id) {
    ElMessage.error('获取参数出错')
    return
  }
  ElMessageBox.confirm('密码将重置为 123456 ，是否确认继续?', '确认',
    {
      confirmButtonText: '重 置',
      cancelButtonText: '取 消',
      type: 'warning',
      autofocus: false,
      confirmButtonClass: 'el-button--warning'
    }
  ).then(() => {
    const params = {
      ...row,
      resetPwd: true
    }
    loading.value = true
    userApi.updateAdminInfo(params).then(res => {
      console.log('update pwd res', res)
      if (res?.code === 200) {
        ElMessage.success(res.message || '操作成功')
      } else {
        ElMessage.error('操作失败')
      }
    }).catch(e => {
      ElMessage.error(e)
    }).finally(() => {
      loading.value = false
      getDataList()
    })
  }).catch(() => {})
}

const updateUserInfo = (row: UserProps | anyObj) => {
  if (!row.id) {
    ElMessage.error('获取参数出错')
    return
  }
  infoForm.value = row
  userInfoDialogVisible.value = true
}

const handleCurrPageChange = (val: number) => {
  pageData.currPage = val
  getDataList()
}

const handleSizeChange = (val: number) => {
  pageData.pageSize = val
  getDataList()
}

const delCurrUser = (row: UserProps | anyObj) => {
  ElMessageBox.confirm('删除后将不可恢复，确认删除吗?', '确认',
    {
      confirmButtonText: '删 除',
      cancelButtonText: '取 消',
      type: 'error',
      autofocus: false,
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    loading.value = true
    userApi.delAdminUser(row.id).then(res => {
      if (res?.code === 200) {
        ElMessage.success('删除成功')
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    }).catch(e => {
      ElMessage.error(e)
    }).finally(() => {
      loading.value = false
      getDataList()
    })
  }).catch(() => {})
}

const showAddAdminUserForm = () => {
  infoForm.value = {
    status: true
  }
  userInfoDialogVisible.value = true
}

const closeInfoFormDialog = () => {
  userInfoDialogVisible.value = false
  infoForm.value = {}
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      if (!infoForm.value.id) {
        addAdmin()
      } else {
        updateAdmin()
      }
    } else {
      ElMessage.warning('请填写完整表单')
    }
  })
}

const addAdmin = () => {
  loading.value = true
  userApi.addAdminUser(infoForm.value).then(res => {
    console.log('add res', res)
    if (res.code === 200) {
      ElMessage.success('新增成功')
    } else {
      ElMessage.error(res.message || '新增出错')
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
    closeInfoFormDialog()
    getDataList()
  })
}

const updateAdmin = () => {
  loading.value = true
  userApi.updateAdminInfo(infoForm.value).then(res => {
    console.log('update res', res)
    if (res.code === 200) {
      ElMessage.success('修改成功')
    } else {
      ElMessage.error(res.message || '修改出错')
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
    closeInfoFormDialog()
    getDataList()
  })
}

defineExpose({
  search,
  getDataList
})

</script>

<style lang="scss" scoped>

</style>
