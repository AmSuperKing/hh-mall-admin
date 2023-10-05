<template>
  <el-tabs
    v-model="activeName"
    type="card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane label="安装说明列表" name="list">
      <InstallationsList
        ref="installationsListRef"
        @add="handleToAdd"
        @detail="handleToDetail"
      />
    </el-tab-pane>

    <el-tab-pane :label="tabName" name="detail">
      <InstallationsDetail ref="installationsDetailRef" />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import InstallationsList from './components/installationsList.vue'
import InstallationsDetail from './components/installationsDetail.vue'

const activeName = ref('list')
const installationsListRef = ref<InstanceType<typeof InstallationsList>>()
const installationsDetailRef = ref<InstanceType<typeof InstallationsDetail>>()
const tabName = ref('新增安装说明')

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === 'list') installationsListRef.value!.getDataList()
}

const handleToAdd = () => {
  tabName.value = '新增安装说明'
  installationsDetailRef.value!.detailForm = {}
  activeName.value = 'detail'
}

const handleToDetail = (row: anyObj) => {
  tabName.value = '安装说明详情'
  installationsDetailRef.value!.detailForm = row
  activeName.value = 'detail'
}

</script>

<style lang="scss" scoped>

</style>
