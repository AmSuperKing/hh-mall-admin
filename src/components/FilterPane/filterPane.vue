<template>
  <div>
    <div class="operates">
      <div>
        <slot></slot>
      </div>
      <div>
        <el-button type="info" plain @click="resetForm(filterFormRef)">重置</el-button>
        <el-button type="primary" plain @click="handleSearch">查询</el-button>
        <el-button link type="primary" @click="toggleShowPane">{{ showPane ? '收起' : '展开' }}筛选</el-button>
      </div>
    </div>
    <el-form
      ref="filterFormRef"
      :model="search"
      label-width="100px"
    >
      <el-row v-show="showPane">
        <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="4" v-for="(item, index) of fieldsArr" :key="index">
          <el-form-item
            :label="item.label"
            :prop="item.key"
            style="width: 100%"
          >
            <template v-if="item.type === 'select'">
              <el-select
                v-model="search[item.key]"
                :placeholder="item.placeholder ? item.placeholder : '搜索'"
                filterable
                clearable
                style="width: 100%"
                @change="handleSearch"
              >
                <el-option
                  v-for="(opt, idx) of item.options"
                  :key="idx"
                  :label="opt[item.labelKey]"
                  :value="opt[item.valueKey]"
                />
              </el-select>
            </template>
            <template v-if="item.type === 'cascader'">
              <el-cascader
                v-model="search[item.key]"
                :props="item.props"
                :options="item.options"
                :show-all-levels="false"
                :placeholder="item.placeholder ? item.placeholder : '搜索'"
                clearable
                filterable
                style="width: 100%"
                @change="handleSearch"
              />
            </template>
            <template v-if="item.type === 'date'">
              <el-date-picker
                v-model="search[item.key]"
                type="date"
                value-format="YYYY-MM-DD"
                :label="item.label"
                :placeholder="item.placeholder ? item.placeholder : '搜索'"
                clearable
                style="width: 100%"
                @change="handleSearch"
              />
            </template>
            <template v-if="item.type === 'textarea'">
              <el-input v-model.trim="search[item.key]" type="textarea" autosize clearable @change="handleSearch" />
            </template>
            <template v-if="item.type === 'input' || !item.type">
              <el-input v-model.trim="search[item.key]" clearable @change="handleSearch" />
            </template>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'

/**
 * 自定义筛选表单面板，配合 CusTable 组件使用
 * @property {Array[Object]} fields 字段定义对象数组
 * Object对象定义：
 *  @value label 标签名
 *  @value key el-form-item 字段值
 *  @value type = ['select', 'cascader', 'date', 'textarea', 'input']， 默认 input
 *  @value placeholder 提示文字
 *  @value options type = 'select' | 'cascader' 时数据数组
 *  @value labelKey 下拉框显示标签字段
 *  @value valueKey 下拉选择值字段
 *  @value props 联动选择器配置，参考el-cascader 的props配置
 * @event {Function} search 各字段变化时触发，数据是变化后的Form表单数据 
 */

interface Props {
  fields?: anyObj[]
}
const props = withDefaults(defineProps<Props>(), {
  fields: () => []
})

const emits = defineEmits(['search'])

const fieldsArr = computed(() => props.fields)

const filterFormRef = ref<FormInstance>()
const search: anyObj = reactive({})
const showPane = ref(false)

const toggleShowPane = () => {
  showPane.value = !showPane.value
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  emits('search', search)
}

const handleSearch = () => {
  emits('search', search)
}

</script>

<style lang="scss" scoped>
.operates {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}
</style>
