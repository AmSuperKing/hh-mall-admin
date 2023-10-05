<template>
  <div class="container">
    <el-row :gutter="15">
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <el-card style="margin-bottom: 5px;" shadow="hover">
          <div class="userinfo">
            <el-avatar :size="80" :src="avatarImg" />
            <div class="userinfo-text">
              <div class="user-name">{{ userInfo.userNameCn }}</div>
              <div class="user-account">账号：{{ userInfo.userName }}</div>
              <div class="user-last">上次登陆IP：{{ userInfo.selfInfo.lastIp }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <el-card shadow="hover">
          <div class="curr-time">
            <div class="time-txt">{{ currentTime }}</div>
            <div class="week">{{ weekday.value.zh + '  ' + weekday.value.en }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-divider></el-divider>

    <div>
      <h3 class="log-title">系统操作日志</h3>
      <filter-pane :fields="filterFileds" @search="handleSearch" />
      <cus-table
        v-loading="loading"
        :config="tableConfig"
        :data="tableData"
        :cols="tableCols"
        :pageData="pageData"
        @operatesClick="handleOperateClick"
        @currPageChange="handleCurrPageChange"
        @sizeChange="handleSizeChange"
      />
    </div>

    <el-dialog
      v-model="paramsViewerVisible"
      title="请求参数"
      destroy-on-close
      width="70%"
      draggable
      append-to-body
    >
      <div class="params-viewer-wrapper">
        <pre>{{ JSON.parse(currOperateParams) }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="dashboard">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import { userApi } from '@/api/userApi'
import { ElMessage } from 'element-plus'
import CusTable from '@/components/CusTable/cusTable.vue'
import FilterPane from '@/components/FilterPane/filterPane.vue'
import avatarImg from '@/assets/images/avatar.png'

const userInfo = useUserInfoStore()

const weekArr = [
  { zh: '星期一', en: 'Mon.' },
  { zh: '星期二', en: 'Tues.' },
  { zh: '星期三', en: 'Wed.' },
  { zh: '星期四', en: 'Thurs.' },
  { zh: '星期五', en: 'Fri.' },
  { zh: '星期六', en: 'Sat.' },
  { zh: '星期日', en: 'Sun.' }
]

const currentTime = ref('')
const weekday = reactive({
  value: {
    zh: '',
    en: ''
  }
})
const interval = ref<number | any>(null)

const loading = ref(false)
const tableData = ref<OpertionLog[]>([])
const search = ref<anyObj>({})
const paramsViewerVisible = ref(false)
const currOperateParams = ref('')

onMounted(() => {
  currentTime.value = formatDate()
  interval.value = setInterval(() => { currentTime.value = formatDate() }, 1000)
  getLogsList()
})
onBeforeUnmount(() => {
  clearInterval(interval.value)
})

const formatDate = () => {
  const date = new Date()
  const day = new Date().getDay() ? new Date().getDay() : 7
  weekday.value = weekArr[day - 1]
  let val = ''
  val = date.getFullYear() + '-'
  val += formatXX(date.getMonth() + 1) + '-'
  val += formatXX(date.getDate()) + ' '
  val += formatXX(date.getHours()) + ':'
  val += formatXX(date.getMinutes()) + ':'
  val += formatXX(date.getSeconds())
  return val
}
const formatXX = (val: number) => {
  return val > 9 ? val + '' : `0${val}`
}

const pageData = reactive({
  currPage: 1,
  pageSize: 30,
  pageSizes: [30, 50, 100, 150, 300],
  background: true,
  total: 0
})
const operateTypes = ref([
  { label: '新增', value: 1 },
  { label: '修改', value: 2 },
  { label: '删除', value: 3 }
])
const filterFileds = computed(() => [
  { key: 'adminAccount', label: '操作人账号' },
  { key: 'adminName', label: '操作人名称' },
  { key: 'operationTime', label: '操作时间', type: 'date' },
  {
    key: 'operationType',
    label: '操作类型',
    type: 'select',
    options: operateTypes.value,
    labelKey: 'label',
    valueKey: 'value'
  },
  { key: 'operationModule', label: '操作模块' },
  {
    key: 'operationResult',
    label: '操作结果',
    formatter: (row: anyObj) => {
      let res = ''
      if (row.operationResult) {
        let str = row.operationResult.replace('CommonResult(', '')
        res = str.replace(', data=null)', '')
      }
      return res || row.operationResult
    }
  },
  { key: 'operationIp', label: '访问IP' }
])

const tableConfig = {
  showIndex: true,
  border: true,
  showOperate: true,
  showPager: true,
  operates: [
    { text: '查看请求参数', type: 'primary' }
  ]
}

const tableCols = computed(() => [
  { key: 'adminAccount', label: '操作人账号', colWidth: '120' },
  { key: 'adminName', label: '操作人名称', colWidth: '120' },
  {
    key: 'operationType',
    label: '操作类型',
    colWidth: '100',
    formatter: (row: OpertionLog) => {
      for (const item of operateTypes.value) {
        if (row.operationType == item.value) return item.label
      }
    }
  },
  { key: 'operationModule', label: '操作模块', colWidth: '250' },
  {
    key: 'operationResult',
    label: '操作结果',
    colMinWidth: '250',
    align: 'left',
    formatter: (row: OpertionLog) => {
      let res = ''
      if (row.operationResult) res = row.operationResult.replace(/CommonResult|, data=null|\{|\}|\(|\)/g, '')
      return res || row.operationResult
    }
  },
  { key: 'operationIp', label: '访问IP', colWidth: '150' },
  { key: 'operationTime', label: '操作时间', colWidth: '250' },
])

const getLogsList = () => {
  loading.value = true
  const params = {
    ...search.value,
    page: pageData.currPage,
    limit: pageData.pageSize
  }
  userApi.getOpertionLogs(params).then(res => {
    const { data } = res
    tableData.value = data.list || []
    pageData.total = data.total || 0
  }).catch(e => {
    ElMessage.error(e)
  }).finally(() => {
    loading.value = false
  })
}
const handleSearch = (searchParams: OpertionLog) => {
  search.value = searchParams
  getLogsList()
}

const handleOperateClick = (type: string, row: anyObj) => {
  if (userInfo.selfInfo.level < 2) {
    ElMessage.warning('无权限查看')
    return
  }
  currOperateParams.value = row.operationParam
  paramsViewerVisible.value = true
}

const handleCurrPageChange = (val: number) => {
  pageData.currPage = val
  getLogsList()
}

const handleSizeChange = (val: number) => {
  pageData.pageSize = val
  getLogsList()
}

</script>

<style lang="scss" scoped>
.container {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

.userinfo {
  display: flex;
  &-text {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 0 20px;
    color: #666;
    .user-name {
      font-weight: 700;
      font-size: 20px;
    }
    .user-account {
      font-size: 15px;
    }
    .user-last {
      font-size: 12px;
      color: #999;
    }
  }
}

.curr-time {
  width: 100%;
  padding: 11px 0;
  text-align: center;
  color: #555;
  user-select: none;
  .time-txt {
    font-family: UnidreamLED;
    font-size: 32px;
    letter-spacing: 5px;
  }
  .week {
    font-size: 18px;
    font-family: FangSong, STFangsong;
    font-weight: 700;
  }
}

.log-title {
  color: #333;
  margin-bottom: 10px;
}

.params-viewer-wrapper {
  pre {
    padding: 15px;
    margin: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fafafa;
  }
}
</style>
