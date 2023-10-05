<template>
  <div v-loading="loading">
    <div>
      <FilterPane :fields="searchFields" @search="onSearch">
        <el-button type="success" plain @click="handleAddType">新增分类</el-button>
      </FilterPane>
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
import { computed, onActivated, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { categoryApi } from '@/api/categoryApi'
import CusTable from '@/components/CusTable/cusTable.vue'
import FilterPane from '@/components/FilterPane/filterPane.vue'

const emits = defineEmits<{
  (e: 'add'): void
  (e: 'detail', val: anyObj): void
}>()

const loading = ref(false)
const search: anyObj = reactive({})
const tableData = ref<anyObj[]>([])
const typeList = ref<anyObj[]>([])

const searchFields = computed(() => [
  { key: 'name', label: '分类名称' },
  {
    key: 'parentId',
    label: '所属类型',
    type: 'select',
    options: typeList.value,
    labelKey: 'name',
    valueKey: 'cid'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '全部', value: -1 },
      { label: '失效', value: 0 },
      { label: '正常', value: 1 }
    ],
    labelKey: 'label',
    valueKey: 'value'
  },
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
  }
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
  { key: 'name', label: '分类名称' },
  { key: 'status', label: '状态', formatter: (row: anyObj) => row.status ? '正常' : '失效' },
  { key: 'imageLink', label: '封面', type: 'image' },
  { key: 'flag', label: '是否首页展示', type: 'switch' },
  { key: 'parentName', label: '所属类型', type: 'tag', size: 'large' },
  { key: 'sort', label: '排序优先值', colWidth: 100 },
  { key: 'createTime', label: '创建时间', sortable: true },
  { key: 'updateTime', label: '修改时间', sortable: true }
]

const pageData = reactive({
  currPage: 1,
  pageSize: 30,
  pageSizes: [30, 50, 100, 150, 300],
  small: false,
  disabled: false,
  background: true,
  total: 0
})

onMounted(async () => {
  await getMainTypeList()
  await getCategoryList()
})
onActivated(async () => {
  await getMainTypeList()
  await getCategoryList()
})

const getMainTypeList = () => {
  const searchParams = { ids: 0, page: 1, limit: 1000 }
  loading.value = true
  categoryApi.getCategoryListByParent(searchParams).then(res => {
    const { data } = res
    if (data) {
      typeList.value = data.list
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const getCategoryList = () => {
  const searchParams = {
    ...search.value,
    page: pageData.currPage,
    limit: pageData.pageSize
  }
  loading.value = true
  categoryApi.getSubCategoryList(searchParams).then(res => {
    if (res?.data) {
      const resData = res.data.list
      pageData.total = res.data.total
      resData.forEach((item: anyObj) => {
        for (const t of typeList.value) {
          if (t.cid === item.parentId) item.parentName = t.name
        }
      })
      tableData.value = resData
    }
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const onSearch = (searchParams: anyObj) => {
  search.value = searchParams
  getCategoryList()
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
      getCategoryList()
    })
  }).catch(() => {})
}

const handleCurrPageChange = (val: number) => {
  pageData.currPage = val
  getCategoryList()
}

const handleSizeChange = (val: number) => {
  pageData.pageSize = val
  getCategoryList()
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
    getCategoryList()
  })
}


defineExpose({
  search,
  getCategoryList
})

</script>

<style lang="scss" scoped>

</style>
