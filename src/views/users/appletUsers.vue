<template>
  <div v-loading="loading">
    <div>
      <FilterPane :fields="searchFields" @search="onSearch"></FilterPane>
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
  </div>
</template>

<script lang="ts" setup>
import { computed, onActivated, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api/userApi'
import CusTable from '@/components/CusTable/cusTable.vue'
import FilterPane from '@/components/FilterPane/filterPane.vue'

const loading = ref(false)
const search = ref<UserProps>({})
const tableData = ref<UserProps[]>([])

const sexList = ref([
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 } 
])

const searchFields = computed(() => [
  { key: 'account', label: '账号' },
  { key: 'nickname', label: '名称' },
  {
    key: 'vip',
    label: '资源访问授权',
    type: 'select',
    options: [
      { label: '已授权', value: true },
      { label: '未授权', value: false }
    ],
    labelKey: 'label',
    valueKey: 'value'
  },
  {
    key: 'sex',
    label: '性别',
    type: 'select',
    options: sexList.value,
    labelKey: 'label',
    valueKey: 'value'
  },
  { key: 'email', label: '邮箱' },
  { key: 'createTime', label: '创建时间', type: 'date' },
])

const tableConfig = {
  border: true,
  showIndex: true,
  showOperate: true,
  showPager: true,
  operateWidth: 220,
  operates: [
    { text: '资源授权', type: 'primary', show: (row: anyObj) => !row.vip },
    { text: '回收授权', type: 'danger', show: (row: anyObj) => row.vip },
    { text: '重置密码', type: 'warning' },
    { text: '禁用用户', type: 'danger', show: (row: anyObj) => row.status },
    { text: '启用用户', type: 'success', show: (row: anyObj) => !row.status }
  ]
}
const tableCols = computed(() => [
  { key: 'account', label: '账号', colMinWidth: 120 },
  { key: 'nickname', label: '名称', colMinWidth: 150 },
  { 
    key: 'vip',
    label: '资源访问授权',
    type: 'tag',
    colMinWidth: 120,
    theme: (row: UserProps) => row.vip ? 'success' : 'info',
    formatter: (row: UserProps) => row.vip ? '已授权' : '未授权'
  },
  {
    key: 'sex',
    label: '性别',
    colWidth: 80,
    formatter: (row: UserProps) => {
      for (const item of sexList.value) {
        if (row.sex === item.value) return item.label
      }
    }
  },
  { key: 'email', label: '邮箱', colMinWidth: 150 },
  { key: 'status', label: '状态', colWidth: 80, formatter: (row: UserProps) => row.status ? '正常' : '禁用' },
  { key: 'lastIp', label: '上次登陆IP', colMinWidth: 150 },
  { key: 'createTime', label: '创建时间', sortable: true, colMinWidth: 200 },
  { key: 'updateTime', label: '修改时间', sortable: true, colMinWidth: 200 }
])

const pageData = reactive({
  currPage: 1,
  pageSize: 30,
  pageSizes: [30, 50, 100, 150, 300],
  background: true,
  total: 0
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
  userApi.getAppletUserList(searchParams).then(res => {
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
    case '禁用用户':
      changeUserStatus(row)
      break
    case '启用用户':
      changeUserStatus(row)
      break
    case '资源授权':
      changeUserVip(row)
      break
    case '回收授权':
      changeUserVip(row)
      break
    default:
      break
  }
}

const resetUserPwd = (row: UserProps | anyObj) => {
  if (!row.userId) {
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
    loading.value = true
    userApi.resetAppletUserPwd(row.userId).then(res => {
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

const changeUserStatus = (row: UserProps | anyObj) => {
  if (!row.userId) {
    ElMessage.error('获取参数出错')
    return
  }
  const type = row.status ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${type}该用户吗?'`, '确认',
    {
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning',
      autofocus: false
    }
  ).then(() => {
    loading.value = true
    userApi.changeUserStatus(row.userId).then(res => {
      console.log('update res', res)
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

const changeUserVip = (row: UserProps | anyObj) => {
  if (!row.userId) {
    ElMessage.error('获取参数出错')
    return
  }
  const type = row.vip ? '回收资源访问授权权限' : '授权资源访问权限'
  ElMessageBox.confirm(`确认给该用户${type}吗?'`, '确认',
    {
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      type: 'warning',
      autofocus: false
    }
  ).then(() => {
    loading.value = true
    userApi.changeUserVip(row.userId).then(res => {
      console.log('update res', res)
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

const handleCurrPageChange = (val: number) => {
  pageData.currPage = val
  getDataList()
}

const handleSizeChange = (val: number) => {
  pageData.pageSize = val
  getDataList()
}

const delCurrRow = (row: UserProps) => {
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
    // TODO
    // delete and then refresh list
  }).catch(() => {})
}


defineExpose({
  search,
  getDataList
})

</script>

<style lang="scss" scoped>

</style>
