<template>
  <el-tabs
    v-model="activeName"
    type="card"
    @tab-click="handleTabClick"
  >
    <el-tab-pane label="文章列表" name="list">
      <ArticleList
        ref="articleListRef"
        @add="handleToAdd"
        @detail="handleToDetail"
      />
    </el-tab-pane>

    <el-tab-pane :label="tabName" name="detail">
      <ArticleDetail ref="articleDetailRef" />
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import ArticleList from './components/articleList.vue'
import ArticleDetail from './components/articleDetail.vue'

const activeName = ref('list')
const articleListRef = ref<InstanceType<typeof ArticleList>>()
const articleDetailRef = ref<InstanceType<typeof ArticleDetail>>()
const tabName = ref('新增文章')

const handleTabClick = (tab: TabsPaneContext, event: Event) => {
  if (tab.paneName === 'list') articleListRef.value!.getDataList()
}

const handleToAdd = () => {
  tabName.value = '新增文章'
  activeName.value = 'detail'
  articleDetailRef.value!.detailForm = {}
}

const handleToDetail = (row: anyObj) => {
  tabName.value = '文章详情'
  activeName.value = 'detail'
  articleDetailRef.value!.detailForm = row
  articleDetailRef.value!.refreshInfo()
}

</script>

<style lang="scss" scoped>

</style>
