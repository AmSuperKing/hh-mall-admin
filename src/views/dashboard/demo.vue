<template>
  <div class="container">
    <filter-pane :fields="filterFileds" />
    <cus-table :config="config" :data="tableData" :cols="cols" />
  </div>
</template>

<script lang="ts" setup name="dashboard">
import { ref } from 'vue'
import { useUserInfoStore } from '@/stores/userInfo'
import settings from '@/settings'
import CusTable from '@/components/CusTable/cusTable.vue'
import FilterPane from '@/components/FilterPane/filterPane.vue'

const userInfo = useUserInfoStore()

const tableData = ref([
 {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    tag: 'Home'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    tag: 'Office'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    tag: 'Home'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
    tag: 'Office'
  }
])
const config = {
  showSelect: true,
  selectFixed: 'left',
  showIndex: true,
  operates: [
    {
      text: '详情',
      type: 'primary'
    },
    {
      text: '删除',
      type: 'danger',
      clickable: (row: anyObj) => row.tag === 'Home'
    }
  ]
}
const cols = [
  {
    key: 'date',
    label: '日期',
    colWidth: '180',
    sortable: true,
    formatter: (row: anyObj) => row.date.slice(0, 10)
  },
  {
    key: 'name',
    label: '姓名',
    colWidth: '150'
  },
  {
    key: 'address',
    label: '住址'
  },
  {
    key: 'tag',
    label: '标识',
    type: 'tag',
    theme: (row: anyObj) => row.tag == 'Home' ? '' : 'success'
  }
]
const filterFileds = [
  {
    key: 'date',
    label: '日期',
    type: 'date'
  },
  {
    key: 'name',
    label: '姓名'
  },
  {
    key: 'address',
    label: '住址',
    type: 'textarea'
  },
  {
    key: 'tag',
    label: '标识',
    type: 'select',
    options: [
      { label: 'Home', value: 'home' },
      { lebel: 'Office', value: 'office' }
    ],
    labelKey: 'label',
    valueKey: 'value'
  },
  {
    key: 'test',
    label: 'Test'
  }
]
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  padding: 0 15px;
  min-height: calc(100vh - 130px);
  overflow: hidden;
  background-image: url('../../assets/images/wel-background.jpg');
  background-size: 100% 100%;
  background-position: center center;
  background-repeat: no-repeat;
}

</style>
