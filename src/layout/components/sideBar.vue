<template>
  <div id="menu-sidebar" class="sidebar">
    <div v-if="device.isMobile && !sidebar.collapse" class="sidebar-header">
      <Fold class="fold-icon" @click="handleCollapse" />
    </div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        id="menu-list"
        class="sidebar-el-menu"
        :default-active="onRoutes"
        :collapse="sidebar.collapse"
        :background-color="variablesList.menuBg"
        :text-color="variablesList.menuText"
        :active-text-color="variablesList.menuActiveText"
      >
        <menu-item
          v-for="item of authMenus"
          :key="item.path"
          :item="item"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/userInfo'
import { useSidebarStore } from '@/stores/sidebar'
import { useDeviceStore } from '@/stores/device'
import MenuItem from './menuItem.vue'
import variables from '@/styles/variables.module.scss'
import { routes } from '@/router'

const variablesList = computed(() => variables)
const route = useRoute()
const userInfo = useUserInfoStore()
const sidebar = useSidebarStore()
const device = useDeviceStore()

const onRoutes = computed(() => route.path)

const authMenus = ref<anyObj[]>([])
const concatMenuPath = (menuItem: any) => {
  if (menuItem.children && menuItem.children.length) {
    if (menuItem.children && menuItem.children.length) {
      if (menuItem.path !== '/') {
        menuItem.children.forEach((subItem: any) => {
          if (subItem.path !== '/') subItem.path = menuItem.path + '/' +subItem.path
          if (subItem.children && subItem.children.length) concatMenuPath(subItem)
        })
      }
      if (menuItem.path === '/') {
        menuItem.children.forEach((subItem: any) => {
          const index = subItem.path.indexOf(menuItem.path)
          if (index === -1) subItem.path = menuItem.path + subItem.path
          if (subItem.children && subItem.children.length) concatMenuPath(subItem)
        })
      }
      return menuItem
    }
    return menuItem
  }
}
const routesList: anyObj[] = routes.filter(path => !path.hidden)
routesList.forEach(item => {
  if (item.path && item.children) {
    item = concatMenuPath(item)
  }
})
authMenus.value = routesList

const handleCollapse = () => {
  sidebar.toggleCollappse()
}

</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.sidebar {
  display: block;
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  background-color: $menuBg;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    width: 0;
  }
  .sidebar-header {
    position: relative;
    width: 210px;
    height: 56px;
    border-bottom: 1px solid $subMenuBorder;
    background-color: #fafafa;
    background-image: url('../../assets/images/logo.png');
    background-position: center center;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    transition: all .3s ease-in-out;
    transition-delay: .3s;
    .fold-icon {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      color: #0080ff;
      cursor: pointer;
      &:hover {
        color: $blueColor;
      }
    }

  }
  .el-scrollbar {
    height: 100%;
  }
}
.sidebar::-webkit-scrollbar {
  width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
  width: 210px;
}
.sidebar > ul {
  height: 100%;
}
</style>
