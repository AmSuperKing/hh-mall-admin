<template>
  <div v-loading="loading">
    <div>
      <FilterPane :fields="searchFields" @search="onSearch">
        <el-button type="success" plain @click="handleAdd">新增产品</el-button>
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
import { productApi } from '@/api/productApi'
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
const categoryList = ref<anyObj[]>([])

const searchFields = computed(() => [
  { key: 'prodName', label: '产品名称' },
  { key: 'prodCode', label: '产品编码' },
  {
    key: 'cid',
    label: '所属分类',
    type: 'cascader',
    props: {
      label: 'name',
      value: 'cid',
      children: "child",
      emitPath: false
    },
    options: categoryList.value
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
  { key: 'prodName', label: '产品名称' },
  { key: 'prodCode', label: '产品编码' },
  { key: 'flatPattern', label: '产品封面', type: 'image' },
  { key: 'flag', label: '是否首页展示', type: 'switch' },
  { key: 'categoryName', label: '所属分类', type: 'tag', size: 'large' },
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
  await getTypeTree()
  await getTypeList()
  await getDataList()
})
onActivated(async () => {
  await getTypeTree()
  await getTypeList()
  await getDataList()
})

const getTypeTree = () => {
  categoryApi.getCategoryListTree().then(res => {
    console.log(res)
    const ProductID = 2 // 产品系列的ID
    if (res?.data) {
      for (const item of res.data) {
        if (item.cid == ProductID) categoryList.value = item.child || []
      }
    }
    
  }).catch(e => {
    ElMessage.error(e)
  })
}

const getTypeList = () => {
  const searchParams = { ids: 2, page: 1, limit: 1000 }
  loading.value = true
  categoryApi.getCategoryListByParent(searchParams).then(res => {
    console.log(res)
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

const getDataList = () => {
  const searchParams = {
    ...search.value,
    page: pageData.currPage,
    limit: pageData.pageSize
  }
  loading.value = true
  productApi.getProductList(searchParams).then(res => {
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
    productApi.delProduct(row.prodId).then(res => {
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

const handleRowChange = (row: anyObj) => {
  productApi.updateProduct(row).then(res => {
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


defineExpose({
  search,
  getDataList
})

</script>

<style lang="scss" scoped>

</style>
