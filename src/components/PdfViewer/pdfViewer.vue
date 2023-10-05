<template>
  <div
    v-loading="isLoading"
    element-loading-text="Loading..."
    element-loading-background="rgba(122, 122, 122, 0.8)"
    class="pdf-viewer"
  >
    <div class="app-header">
      <template v-if="isLoading"> Loading... </template>

      <template v-else>
        <el-pagination
          v-model:current-page="page"
          small
          background
          layout="prev, pager, next"
          :default-page-size="1"
          :total="pageCount"
          @current-change="handleCurrentChange"
        />
      </template>
    </div>

    <div class="app-content">
      <vue-pdf-embed
        ref="pdfRef"
        :source="pdfSource"
        :page="page"
        :zoom="10"
        @password-requested="handlePasswordRequest"
        @rendered="handleDocumentRender"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
// PDF预览组件
import { ref, watch } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'

interface ParamProps {
  pdfSource?: string
}

// pdfSource：pdf 的 url 地址
const props = withDefaults(defineProps<ParamProps>(), {
  pdfSource: ''
})

const pdfRef = ref<InstanceType<typeof VuePdfEmbed>>()
const isLoading = ref(true)
const page = ref<number | null | any>(1)
const pageCount = ref<number | null | any>(1)
const showAllPages = ref(false)

watch(showAllPages, (newVal, oldVal) => {
  page.value = newVal ? null : 1
})

const handleDocumentRender = (args: any) => {
  isLoading.value = false
  pageCount.value = pdfRef.value!.pageCount
}

const handlePasswordRequest = (callback: Function, retry: any) => {
  callback(prompt(retry ? 'Enter password again' : 'Enter password'))
}

const handleCurrentChange = (val: number) => {
  page.value = val
}

</script>

<style lang="scss" scoped>
.pdf-viewer {
  min-height: 450px;
  background-color: #ccc;
  .app-header {
    padding: 16px;
    color: #ddd;
    box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
    background-color: #555;
  }

  .app-content {
    padding: 15px;
    box-sizing: border-box;
    .vue-pdf-embed {
      box-sizing: border-box;
      margin: 15px;
    }
  }
}
.vue-pdf-embed > div {
  margin-bottom: 8px;
  box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
}
</style>
