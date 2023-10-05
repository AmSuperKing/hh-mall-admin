<template>
  <div v-loading="loading">
    <el-button type="primary" plain class="mgb20" @click="showInfoFormDialog">新增设置</el-button>
    <CusTable
      :data="tableData"
      :config="tableConfig"
      :cols="tableCols"
      :pageData="pageData"
      @rowChange="updateSetting"
      @operatesClick="handleOperateClick"
      @currPageChange="handleCurrPageChange"
      @sizeChange="handleSizeChange"
    />

    <el-dialog
      v-model="infoDialogVisible"
      title="设置"
      width="70%"
      draggable
      destroy-on-close
    >
      <SettingInfo :data="currSettingInfo" @close="closeInfoFormDialog" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onActivated, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { appletApi } from '@/api/appletApi'
import CusTable from '@/components/CusTable/cusTable.vue'
import SettingInfo from './settingInfo.vue'

const loading = ref(false)
const tableData = ref<AppletInfo[]>([])

const tableConfig = {
  border: true,
  showIndex: true,
  showOperate: true,
  showPager: true,
  operates: [
    { text: '修改', type: 'primary' },
    { text: '删除', type: 'danger' }
  ],
  operateWidth: 180
}
const tableCols = computed(() => [
  { key: 'flag', label: '启用设置', type: 'switch', colMinWidth: 100 },
  { key: 'flatPattern', label: '首页Banner图', type: 'image', colMinWidth: 120 },
  { key: 'telNum', label: '联系电话', colMinWidth: 100 },
  { key: 'faxNum', label: '传真', colMinWidth: 100 },
  { key: 'vxNum', label: '微信客服', colMinWidth: 100 },
  { key: 'qqNum', label: 'QQ客服', colMinWidth: 100 },
  { key: 'email', label: '邮箱', colMinWidth: 100 },
  { key: 'qrCodeLink', label: '公众号', type: 'image', colMinWidth: 120 },
  { key: 'createTime', label: '创建时间', sortable: true, colMinWidth: 250 },
  { key: 'updateTime', label: '修改时间', sortable: true, colMinWidth: 250 }
])

const pageData = reactive({
  currPage: 1,
  pageSize: 30,
  pageSizes: [30, 50, 100, 150, 300],
  background: true,
  total: 0
})

const infoDialogVisible = ref(false)
const currSettingInfo = ref<anyObj>({})

onMounted(() => {
  getDataList()
})
onActivated(() => {
  getDataList()
})

const getDataList = () => {
  const searchParams = {
    page: pageData.currPage,
    limit: pageData.pageSize
  }
  loading.value = true
  appletApi.getSettingList(searchParams).then(res => {
    console.log('-setting List-', res)
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

const handleOperateClick = (type: string, row: UserProps | anyObj) => {
  switch (type) {
    case '修改':
      showInfoFormDialog(row)
      break
    case '删除':
    confirmDelOperate(row)
      break
    default:
      break
  }
}

const updateSetting = (row: AppletInfo | anyObj) => {
  loading.value = true
  appletApi.updateSetting(row).then(res => {
    console.log('update res', res)
    res.code === 200 ? ElMessage.success('修改成功') : ElMessage.error('操作失败')
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
    getDataList()
  })
}

const confirmDelOperate = (row: AppletInfo | anyObj) => {
  ElMessageBox.confirm('删除后将不可恢复，确认删除吗?', '确认',
    {
      confirmButtonText: '删 除',
      cancelButtonText: '取 消',
      type: 'error',
      autofocus: false,
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    delSetting(row)
  }).catch(() => {})
}

const delSetting = (row: AppletInfo | anyObj) => {
  loading.value = true
  appletApi.delSetting(row.dataId).then(res => {
    console.log('del res', res)
    res.code === 200 ? ElMessage.success('删除成功') : ElMessage.error('操作失败')
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
    getDataList()
  })
}

const handleCurrPageChange = (val: number) => {
  pageData.currPage = val
  getDataList()
}

const handleSizeChange = (val: number) => {
  pageData.pageSize = val
  getDataList()
}

const showInfoFormDialog = (currInfo = {}) => {
  console.log('currInfo', currInfo)
  currSettingInfo.value = currInfo
  infoDialogVisible.value = true
}
const closeInfoFormDialog = () => {
  infoDialogVisible.value = false
  getDataList()
}

defineExpose({
  getDataList
})
</script>
