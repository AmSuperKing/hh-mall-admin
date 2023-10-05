<template>
  <el-tabs
    v-model="activeName"
    type="card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane label="客户端用户" name="appletUsers">
      <AppletUsers ref="appletUsersRef" />
    </el-tab-pane>
    <el-tab-pane label="内部用户" name="companyUsers">
      <CompanyUsers ref="companyUsersRef" />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import AppletUsers from './appletUsers.vue'
import CompanyUsers from './companyUsers.vue'

const activeName = ref('appletUsers')
const appletUsersRef = ref<InstanceType<typeof AppletUsers>>()
const companyUsersRef = ref<InstanceType<typeof CompanyUsers>>()

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === 'appletUsers') appletUsersRef.value!.getDataList()
  if (tab.paneName === 'companyUsers') companyUsersRef.value!.getDataList()
}

</script>

<style lang="scss" scoped>

</style>
