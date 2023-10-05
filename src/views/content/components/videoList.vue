<template>
  <div v-loading="loading">
    <div>
      <FilterPane :fields="searchFields" @search="onSearch">
        <el-button type="success" plain @click="handleAdd">新增视频</el-button>
      </FilterPane>
    </div>
    <CusTable
      :data="tableData"
      :config="tableConfig"
      :cols="tableCols"
      :pageData="pageData"
      @rowDbClick="toDetail"
      @rowChange="handleRowChange"
      @operatesClick="handleOperateClick"
      @currPageChange="handleCurrPageChange"
      @sizeChange="handleSizeChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onActivated, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { videoApi } from '@/api/videoApi'
import CusTable from '@/components/CusTable/cusTable.vue'
import FilterPane from '@/components/FilterPane/filterPane.vue'

const emits = defineEmits<{
  (e: 'add'): void
  (e: 'detail', val: anyObj): void
}>()

const loading = ref(false)
const search: anyObj = reactive({})
const tableData = ref<anyObj[]>([])

const searchFields = computed(() => [
  { key: ' headline', label: '视频标题' },
  { key: 'categoryName', label: '所属系统分类' },
  {
    key: 'flag',
    label: '首页展示',
    type: 'select',
    options: [
      { label: '是', value: 1 },
      { label: '否', value: 0 }
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
    { text: '详情', type: 'primary' },
    { text: '删除', type: 'danger' }
  ]
}
const tableCols = [
  { key: 'headline', label: '视频标题' },
  { key: 'videoLink', label: '视频链接' },
  { key: 'flatPattern', label: '视频封面', type: 'image' },
  { key: 'flag', label: '是否首页展示', type: 'switch', colWidth: 120 },
  { key: 'categoryName', label: '所属分类' },
  { key: 'createTime', label: '创建时间', sortable: true, colWidth: 200 },
  { key: 'updateTime', label: '修改时间', sortable: true, colWidth: 200 }
]

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
  videoApi.getVideoList(searchParams).then(res => {
    console.log(res)
    if (res?.data) {
      pageData.total = res.data.total
      tableData.value = res.data.list
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

const handleAdd = () => {
  emits('add')
}

const toDetail = (row: anyObj) => {
  emits('detail', row)
}

const handleRowChange = (row: anyObj) => {
  videoApi.updateVideo(row).then(res => {
    if (res?.code === 200) {
      ElMessage.success('修改成功')
    } else {
      ElMessage.error('修改出错')
    }
  }).catch(e => {
    ElMessage.error(e.message || e + '' || '更新失败')
  }).finally(() => {
    loading.value = false
    getDataList()
  })
}

const delCurrRow = (row: anyObj) => {
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
    videoApi.delVideo(row.videoId).then(res => {
      if (res?.code === 200) ElMessage.success('删除成功')
      else ElMessage.error('删除失败')
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


defineExpose({
  search,
  getDataList
})

</script>

<style lang="scss" scoped>

</style>
