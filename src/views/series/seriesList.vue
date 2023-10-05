<template>
  <div v-loading="loading">
    <div class="mgb10">
      <el-button type="success" plain @click="handleAddType">新增系列</el-button>
    </div>
    <CusTable
      :data="tableData"
      :config="tableConfig"
      :cols="tableCols"
      :pageData="pageData"
      @rowChange="handleRowChange"
      @rowDbClick="toDetail"
      @operatesClick="handleOperateClick"
      @currPageChange="handleCurrPageChange"
      @sizeChange="handleSizeChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { onActivated, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { categoryApi } from '@/api/categoryApi'
import CusTable from '@/components/CusTable/cusTable.vue'
import settings from '@/settings'

const emits = defineEmits<{
  (e: 'add'): void
  (e: 'detail', val: anyObj): void
}>()

const loading = ref(false)
const tableData = ref<anyObj[]>([])

const tableConfig = {
  border: true,
  showIndex: true,
  showOperate: true,
  showPager: true,
  operates: [
    { text: '详情', type: 'primary' },
    { text: '删除', type: 'danger' }
  ]
}

const pathFormatter = (row: anyObj) => {
  if (!row.appPath) return '-'
  for (const item of settings.appPaths) {
    if (item.path === row.appPath) return item.title
  }
}

const tableCols = [
  { key: 'name', label: '系列名称' },
  { key: 'status', label: '状态', formatter: (row: anyObj) => row.status ? '正常' : '失效' },
  { key: 'imageLink', label: '封面', type: 'image' },
  { key: 'flag', label: '是否首页展示', type: 'switch' },
  { key: 'sort', label: '排序优先值', colWidth: 100 },
  { key: 'appPath', label: '小程序路径', formatter: pathFormatter },
  { key: 'createTime', label: '创建时间', sortable: true },
  { key: 'updateTime', label: '修改时间', sortable: true }
]

const pageData = reactive({
  currPage: 1,
  pageSize: 30,
  pageSizes: [30, 50, 100, 150, 300],
  background: true,
  total: 0
})

onMounted(() => {
  getMainTypeList()
})
onActivated(() => {
  getMainTypeList()
})

const getMainTypeList = () => {
  const searchParams = {
    ids: 0,
    page: pageData.currPage,
    limit: pageData.pageSize
  }
  loading.value = true
  categoryApi.getCategoryListByParent(searchParams).then(res => {
    console.log('-series list-', res)
    const { data } = res
    if (data) {
      tableData.value = data.list || []
      pageData.total = data.total
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const handleOperateClick = (type: string, row: anyObj) => {
  switch (type) {
    case '详情':
      toDetail(row)
      break
    case '删除':
      delCurrRow(row)
      break
    default:
      break
  }
}

const handleAddType = () => {
  emits('add')
}

const toDetail = (row: anyObj) => {
  emits('detail', row)
}

const delCurrRow = (row: anyObj) => {
  ElMessageBox.confirm('确认删除该系列吗?', '确认',
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
      getMainTypeList()
    })
  }).catch(() => {})
}

const handleCurrPageChange = (val: number) => {
  pageData.currPage = val
  getMainTypeList()
}

const handleSizeChange = (val: number) => {
  pageData.pageSize = val
  getMainTypeList()
}

const handleRowChange = (row: anyObj) => {
  categoryApi.updateCategory(row).then(res => {
    if (res?.code === 200) {
      ElMessage.success('修改成功')
    } else {
      ElMessage.error('修改出错')
    }
  }).catch(e => {
    ElMessage.error(e.message || e + '' || '更新失败')
  }).finally(() => {
    loading.value = false
    getMainTypeList()
  })
}


defineExpose({
  getMainTypeList
})

</script>

<style lang="scss" scoped>

</style>
