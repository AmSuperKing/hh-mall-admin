<template>
  <div v-loading="loading">
    <div>
      <FilterPane :fields="searchFields" @search="onSearch">
        <el-button type="success" plain @click="handleAdd">新增文章</el-button>
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
import { articleApi } from '@/api/articleApi'
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
  { key: 'title', label: '文章标题' },
  { key: 'cid',
    label: '所属类型',
    type: 'select',
    options: typeList.value,
    labelKey: 'name',
    valueKey: 'cid'
  },
  { key: 'author', label: '文章作者' },
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
  { key: 'title', label: '文章标题' },
  { key: 'flatPattern', label: '文章封面', type: 'image'},
  { key: 'categoryName', label: '所属分类' },
  { key: 'sort', label: '排序优先值', colWidth: 110 },
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

onMounted(async () => {
  await getTypeList()
  await getDataList()
})
onActivated(async () => {
  await getTypeList()
  await getDataList()
})

const getTypeList = () => {
  // const searchParams = { ids: 1, page: 1, limit: 1000 }
  // loading.value = true
  // categoryApi.getCategoryListByParent(searchParams).then(res => {
  //   console.log('-getCategoryListByParent-', res)
  //   const { data } = res
  //   if (data) {
  //     typeList.value = data.list
  //   }
  // }).catch(e => {
  //   ElMessage.error(e)
  // }).finally(() => {
  //   loading.value = false
  // })
  loading.value = true
  categoryApi.getCategoryListTree().then(res => {
    typeList.value = flatArr(res.data || [])
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}

const getDataList = () => {
  const searchParams = {
    ...search.value,
    page: pageData.currPage,
    limit: pageData.pageSize
  }
  loading.value = true
  articleApi.getArticleList(searchParams).then(res => {
    console.log('-getArticleList-', res)
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
  articleApi.updateArticle(row).then(res => {
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
    articleApi.delArticle(row.articleId).then(res => {
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

const flatArr = (arr: anyObj[]): any[] => {
  if (!arr || !arr.length) return []
  
  let result: any[] = []
  arr.forEach(item => {
    result.push(item)
    if (item?.child?.length) result = [...result, ...flatArr(item.child)]
  })
  return result
}


defineExpose({
  search,
  getDataList
})

</script>

<style lang="scss" scoped>

</style>
