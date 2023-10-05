<template>
  <el-tabs
    v-model="activeName"
    type="card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane label="产品列表" name="list">
      <ProductList
        ref="productListRef"
        @add="handleToAdd"
        @detail="handleToDetail"
      />
    </el-tab-pane>
    <el-tab-pane :label="tabName" name="detail">
      <ProductDetail ref="productDetailRef" />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import ProductList from './productList.vue'
import ProductDetail from './productDetail.vue'

const activeName = ref('list')
const productListRef = ref<InstanceType<typeof ProductList>>()
const productDetailRef = ref<InstanceType<typeof ProductDetail>>()
const tabName = ref('新增产品')

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === 'list') productListRef.value!.getDataList()
}

const handleToAdd = () => {
  tabName.value = '新增产品'
  activeName.value = 'detail'
  productDetailRef.value!.isAdd = true
  productDetailRef.value!.isEdit = false
  productDetailRef.value!.rawData = {}
  productDetailRef.value!.detailForm = {}
}

const handleToDetail = (row: anyObj) => {
  tabName.value = '产品详情'
  activeName.value = 'detail'
  productDetailRef.value!.isAdd = false
  productDetailRef.value!.isEdit = true
  productDetailRef.value!.rawData = row
  productDetailRef.value!.detailForm = row
  productDetailRef.value!.getDetailInfo()
  
}

</script>

<style lang="scss" scoped>

</style>
