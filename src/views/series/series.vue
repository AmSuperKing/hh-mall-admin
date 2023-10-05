<template>
  <el-tabs
    v-model="activeName"
    type="card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane label="类别列表" name="seriesList">
      <SeriesList
        ref="seriesListRef"
        @add="handleToAdd"
        @detail="handleToDetail"
      />
    </el-tab-pane>
    <el-tab-pane :label="tabName" name="seriesDetail">
      <SeriesDetail ref="seriesDetailRef" />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import SeriesList from './seriesList.vue'
import SeriesDetail from './seriesDetail.vue'

const activeName = ref('seriesList')
const seriesListRef = ref<InstanceType<typeof SeriesList>>()
const seriesDetailRef = ref<InstanceType<typeof SeriesDetail>>()
const tabName = ref('新增分类')

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === 'seriesList') seriesListRef.value!.getMainTypeList()
}

const handleToAdd = () => {
  tabName.value = '新增系列'
  seriesDetailRef.value!.isAdd = true
  seriesDetailRef.value!.isEdit = false
  seriesDetailRef.value!.rawData = {}
  seriesDetailRef.value!.detailForm = { status: true }
  activeName.value = 'seriesDetail'
}

const handleToDetail = (row: anyObj) => {
  tabName.value = '系列详情'
  seriesDetailRef.value!.isAdd = false
  seriesDetailRef.value!.isEdit = true
  seriesDetailRef.value!.rawData = row
  seriesDetailRef.value!.detailForm = row
  activeName.value = 'seriesDetail'
}

</script>

<style lang="scss" scoped>

</style>
