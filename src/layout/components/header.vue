<template>
  <div class="header-bar">
    <!-- 折叠按钮 -->
    <div id="collapse-btn" class="collapse-btn" @click="collapseChage">
      <el-icon v-if="!sidebar.collapse" class="collapse-btn-icon" :size="22">
        <Fold />
      </el-icon>
      <el-icon v-else class="collapse-btn-icon" :size="22">
        <Expand />
      </el-icon>
    </div>
    <!-- brand -->
    <div class="logo hidden-md-and-down"> {{ settings.title }} </div>
    <div class="header-right">
      <div class="right-content">
        <!-- screenfull -->
        <Screenfull id="screenfull" class="screenfull-btn hidden-sm-and-down" />
        <!-- 用户头像 -->
        <div class="user-avator hidden-sm-and-down">
          <img :src="avatarImg">
        </div>
        <!-- 用户名下拉菜单 -->
        <el-dropdown id="user-setting" class="user-name" trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ userInfo.userNameCn }}
            <el-icon :color="variablesList.textColor"><CaretBottom /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="user">我的设置</el-dropdown-item>
              <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CaretBottom, Fold, Expand } from '@element-plus/icons-vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { useSidebarStore } from '@/stores/sidebar'
import settings from '@/settings'
import variables from '@/styles/variables.module.scss'
import Screenfull from '@/components/Screenfull/index.vue'
import avatarImg from '@/assets/images/avatar.png'

const userInfo = useUserInfoStore()
const sidebar = useSidebarStore()
const variablesList = computed(() => variables)


// 侧边栏折叠
const collapseChage = () => {
  sidebar.toggleCollappse()
}

onMounted(() => {
  if (document.body.clientWidth < 1500) {
    collapseChage()
  }
})

// 用户名下拉菜单选择事件
const router = useRouter()
const handleCommand = (command: string) => {
  if (command === 'loginout') {
    userInfo.resetInfo()
    router.push('/login')
  } else if (command === 'user') {
    router.push('/user/userCenter')
  }
}

</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
.header-bar {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  color: $headerText;
  border-bottom: 1px solid #eee;
  background-color: $headerBg;
  .logo {
    float: left;
    width: 250px;
    line-height: 70px;
    font-size: 20px;
    font-weight: bold;
  }
}

.collapse-btn {
  float: left;
  padding: 0 21px;
  cursor: pointer;
  line-height: 66px;
  &:hover {
    background-color: var(--el-color-primary-light-9);
  }
  &:hover .collapse-btn-icon {
    color: #555;
  }
  .collapse-btn-icon {
    vertical-align: middle;
    color: $headerText;
  }
}

.header-right {
  position: absolute;
  top: 0;
  right: 0;
  padding-right: 15px;
  .right-content {
    position: relative;
    display: flex;
    height: 70px;
    align-items: center;
  }
}

.screenfull-btn {
  display: inline-block;
  margin-right: 15px;
  font-size: 18px;
  color: $menuText;
  &:hover {
    color: $headerText;
  }
}

.user-avator {
  margin-left: 20px;
  & img {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}

.user-name {
  margin-left: 10px;
}
.el-dropdown-link {
  color: $textColor;
  cursor: pointer;
}
.el-dropdown-menu__item {
  text-align: center;
}
</style>
