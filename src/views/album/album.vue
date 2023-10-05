<template>
  <el-tabs
    v-model="activeName"
    type="card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane label="图册列表" name="list">
      <AlbumList
        ref="albumListRef"
        @add="handleToAdd"
        @detail="handleToDetail"
      />
    </el-tab-pane>

    <el-tab-pane :label="tabName" name="detail">
      <AlbumDetail
        ref="albumDetailRef"
        @add="handleToAdd"
        @detail="handleToDetail"
      />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import AlbumList from './albumList.vue'
import AlbumDetail from './albumDetail.vue'

const activeName = ref('list')
const albumListRef = ref<InstanceType<typeof AlbumList>>()
const albumDetailRef = ref<InstanceType<typeof AlbumDetail>>()
const tabName = ref('新增图册')

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === 'list') albumListRef.value!.getDataList()
}

const handleToAdd = () => {
  tabName.value = '新增图册'
  albumDetailRef.value!.detailForm = {}
  activeName.value = 'detail'
}

const handleToDetail = (row: anyObj) => {
  tabName.value = '图册详情'
  albumDetailRef.value!.detailForm = row
  activeName.value = 'detail'
}

</script>

<style lang="scss" scoped>

</style>
