<template>
  <el-tabs
    v-model="activeName"
    type="card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane label="视频列表" name="list">
      <VideoList
        ref="videoListRef"
        @add="handleToAdd"
        @detail="handleToDetail"
      />
    </el-tab-pane>

    <el-tab-pane :label="tabName" name="detail">
      <VideoDetail ref="videoDetailRef" />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import VideoList from './components/videoList.vue'
import VideoDetail from './components/videoDetail.vue'

const activeName = ref('list')
const videoListRef = ref<InstanceType<typeof VideoList>>()
const videoDetailRef = ref<InstanceType<typeof VideoDetail>>()
const tabName = ref('新增视频')

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === 'list') videoListRef.value!.getDataList()
}

const handleToAdd = () => {
  tabName.value = '新增视频'
  videoDetailRef.value!.detailForm = {}
  activeName.value = 'detail'
}

const handleToDetail = (row: anyObj) => {
  tabName.value = '视频详情'
  videoDetailRef.value!.detailForm = row
  activeName.value = 'detail'
}

</script>

<style lang="scss" scoped>

</style>
