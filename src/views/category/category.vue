<template>
  <el-tabs
    v-model="activeName"
    type="card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane label="类别列表" name="categoryList">
      <CategoryList
        ref="categoryListRef"
        @add="handleToAdd"
        @detail="handleToDetail"
      />
    </el-tab-pane>
    <el-tab-pane :label="tabName" name="categoryDetail">
      <CategoryDetail ref="categoryDetailRef" />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import CategoryList from './categoryList.vue'
import CategoryDetail from './categoryDetail.vue'

const activeName = ref('categoryList')
const categoryListRef = ref<InstanceType<typeof CategoryList>>()
const categoryDetailRef = ref<InstanceType<typeof CategoryDetail>>()
const tabName = ref('新增分类')

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === 'categoryList') categoryListRef.value!.getCategoryList()
}

const handleToAdd = () => {
  tabName.value = '新增分类'
  categoryDetailRef.value!.isAdd = true
  categoryDetailRef.value!.isEdit = false
  categoryDetailRef.value!.rawData = {}
  categoryDetailRef.value!.detailForm = { status: true }
  activeName.value = 'categoryDetail'
}

const handleToDetail = (row: anyObj) => {
  tabName.value = '分类详情'
  categoryDetailRef.value!.isAdd = false
  categoryDetailRef.value!.isEdit = true
  categoryDetailRef.value!.rawData = row
  categoryDetailRef.value!.detailForm = row
  categoryDetailRef.value!.getDetailList()
  activeName.value = 'categoryDetail'
}

</script>

<style lang="scss" scoped>

</style>
