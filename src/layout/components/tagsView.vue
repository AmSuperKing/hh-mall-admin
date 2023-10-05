<template>
  <div id="tags-list" ref="containerRef" class="tags">
    <ul ref="tagsRef">
      <li
        v-for="(item, index) of tagsArr"
        :key="index"
        :ref="tabsRefs.set"
        class="tags-li"
      >
        <div class="tags-li-item" :class="{ active: isActive(item.path) }">
          <router-link :to="item.path" class="tags-li-title">
            {{ item.title }}
          </router-link>
          <span v-if="tagsArr.length > 1" class="tags-li-icon" @click="closeTags(index)">
            <el-icon class="tags-icon-content" :size="14"><Close /></el-icon>
          </span>
        </div>
      </li>
    </ul>
    <div id="tags-operation" class="tags-close-box">
      <el-dropdown @command="handleTags">
        <el-button size="small" class="close-btn" plain>
          标签选项
          <el-icon class="close-btn-icon"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu size="small">
            <el-dropdown-item :icon="DArrowLeft" command="left">关闭左侧</el-dropdown-item>
            <el-dropdown-item :icon="DArrowRight" command="right">关闭右侧</el-dropdown-item>
            <el-dropdown-item :icon="Remove" command="other">关闭其他</el-dropdown-item>
            <el-dropdown-item :icon="CircleClose" command="all">关闭所有</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, computed, ref, onMounted, nextTick } from 'vue'
import { useTemplateRefsList } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { DArrowLeft, DArrowRight, Remove, CircleClose } from '@element-plus/icons-vue'
import { useTagsListStore } from '@/stores/tagsList'
import HorizontalScroll from './HorizontalScroll'

const route = useRoute()
const router = useRouter()

const tagsList = useTagsListStore()
const tagsArr = computed(() => tagsList.list)
const isActive = (path: string) => path && path === route.fullPath
const containerRef = ref<HTMLElement | null>()
const tagsRef = ref<HTMLElement | any>()
const tabsRefs = useTemplateRefsList()

onMounted(() => {
  setTags(route)
  new HorizontalScroll(tagsRef.value)
})

watch(route, (newVal, oldVal) => { 
  setTags(newVal) 
  const index = tagsArr.value.findIndex(item => item.path && item.path === newVal.fullPath)
  nextTick(() => {
    if (index !== -1) selectNavTab(tabsRefs.value[index])
  })
})

// onBeforeRouteUpdate((to: any) => {
//   setTags(to)
//   const index = tagsList.list.findIndex(item => item.path === to.fullPath)
//   nextTick(() => {
//     if (index !== -1) selectNavTab(tabsRefs.value[index])
//   })
// })

// 设置标签
const setTags = (route: anyObj) => {
  if (!route || !route.meta.title) return
  tagsList.setTagsItem({
    name: route.name,
    title: route?.meta?.title || '未知路径',
    path: route.fullPath
  })
}
// 关闭单个标签
const closeTags = (index: number) => {
  if (index === -1 || index === undefined || index === null) return
  const delItem = tagsList.list[index]
  tagsList.closeTagsItem(index)
  const item = tagsList.list[index] ? tagsList.list[index] : tagsList.list[index - 1]
  const activeIndex = tagsList.list[index] ? index : tagsList.list[index - 1] ? index - 1 : 0
  if (item) {
    delItem.path === route.fullPath && router.push(item.path)
  } else {
    router.push('/')
  }
  nextTick(() => {
    if (activeIndex !== -1) selectNavTab(tabsRefs.value[activeIndex])
  })
}
// 关闭其他标签
const closeOther = () => {
  // const curItem = tagsList.list.filter((item) => item.path && item.path === route.fullPath)
  // if (!curItem) return
  const index = tagsList.list.findIndex((item) => item.path && item.path === route.fullPath)
  if (index === -1) return
  tagsList.closeOtherTags(index)
}
//关闭左侧标签
const closeLeft = () => {
  const index = tagsList.list.findIndex((item) => item.path && item.path === route.fullPath)
  if (index === -1) return
  tagsList.closeLeftTagsItem(index)
}
//关闭右侧标签
const closeRight = () => {
  const index = tagsList.list.findIndex((item) => item.path && item.path === route.fullPath)
  if (index === -1) return
  tagsList.closeRightTagsItem(index)
}
// 关闭全部标签
const closeAll = () => {
  tagsList.clearTags()
  router.push('/')
}
const selectNavTab = function (dom: HTMLElement | any) {
  if (!dom) return false
  let scrollLeft = dom.offsetLeft + dom.clientWidth - tagsRef.value.clientWidth
  if (dom.offsetLeft < tagsRef.value.scrollLeft) {
    tagsRef.value.scrollTo(dom.offsetLeft, 0)
  } else if (scrollLeft > tagsRef.value.scrollLeft) {
    tagsRef.value.scrollTo(scrollLeft, 0)
  }
}
const handleTags = (command: string) => {
  switch (command) {
    case 'left':
      closeLeft()
      break
    case 'right':
      closeRight()
      break
    case 'other':
      closeOther()
      break
    case 'all':
      closeAll()
      break
    default:
      break
  }
}

</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
$dark-text: #666;
.tags {
  position: relative;
  height: 34px;
  overflow: hidden;
  background: $tagsContainerBg;
  padding-right: 120px;
  border-bottom: 1px solid #e3e3e3;
  box-shadow: 0 2px 4px #dfdfdf;
  & ul {
    display: flex;
    box-sizing: border-box;
    list-style: none;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    padding-left: 10px;
    &::-webkit-scrollbar {
      height: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #eaeaea;
      border-radius: var(--el-border-radius-base);
      box-shadow: none;
    }
  }
  &:hover {
    &::-webkit-scrollbar-thumb:hover {
      background: #c8c9cc;
    }
  }
}
.tags-li {
  float: left;
}

.tags-li-item {
  display: inline-block;
  flex-shrink: 0;
  position: relative;
  margin: 4px 6px 0 6px;
  padding: 0 12px;
  border-radius: 3px;
  font-size: 12px;
  // overflow: hidden;
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  background: #fff;
  vertical-align: middle;
  color: $dark-text;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  transition: all 0.3s ease-in;
  background-color: #fff;
  &::before {
    content: '';
    position: absolute;
    left: -6px;
    bottom: 0;
    width: 0;
    height: 0;
    border-bottom: 6px solid #fff;
    border-top: 6px solid transparent;
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;
    border-radius: 2px;
    transition: all 0.3s ease-in;
  }
  &::after {
    content: '';
    position: absolute;
    right: -6px;
    bottom: 0;
    width: 0;
    height: 0;
    border-bottom: 6px solid #fff;
    border-top: 6px solid transparent;
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;
    border-radius: 2px;
    transition: all 0.3s ease-in;
  }
  &:hover::before,
  &:hover::after {
    border-bottom-color: $tagsBg;
  }
}
.tags-li-item:not(.active):hover {
  background: $tagsBg;
}
.active {
  background: $tagsBg;
  &::before,
  &::after {
    border-bottom-color: $tagsBg;
  }
}
.tags-li-title {
  float: left;
  max-width: 80px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 2px;
  color: $dark-text;
}
.tags-li-item.active {
  .tags-li-title,
  .tags-icon-content {
    color: $tagActiveText;
  }
}

.tags-li-icon {
  display: inline-block;
  height: 23px;
  &:hover {
    .tags-icon-content {
      color: #fff;
      background-color: $tagActiveText;
    }
    .el-icon {
      color: #fff !important;
    }
  }
  .el-icon {
    border-radius: 50% !important;
  }
}
.tags-icon-content {
  color: $dark-text;
  top: 3px;
  left: 8px;
  border-radius: 3px;
}

.tags-close-box {
  position: absolute;
  right: 0;
  top: 0;
  box-sizing: border-box;
  padding-top: 1px;
  text-align: center;
  width: 110px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: -3px 0 15px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;

  .close-btn {
    min-height: 28px;
    padding: 7px 15px !important;
    border: none;
    .close-btn-icon {
      margin-left: 5px;
    }
  }

  &:hover {
    background-color: $tagsBg;
    .close-btn {
      background-color: $tagsBg;
    }
  }
}
</style>
