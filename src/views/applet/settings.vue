<template>
  <el-tabs
    v-model="activeName"
    type="card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane label="设置列表" name="list">
      <SettingList ref="settingListRef" />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup name="AppletSettings">
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import SettingList from './settingList.vue'

const activeName = ref('list')
const settingListRef = ref<InstanceType<typeof SettingList>>()

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === 'list') settingListRef.value!.getDataList()
}

</script>

<style lang="scss" scoped>

</style>
