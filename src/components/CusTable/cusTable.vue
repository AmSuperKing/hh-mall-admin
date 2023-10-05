<template>
  <div>
    <el-table
      ref="tableRef"
      style="width: 100%"
      :data="props.data"
      :height="config.height ? config.height : 480"
      :max-height="config.maxHeight ? config.maxHeight : 800"
      :stripe="Boolean(config.stripe)"
      :border="Boolean(config.border)"
      :show-header="config.showHeader"
      :size="config.size ? config.size : 'default'"
      :highlight-current-row="true"
      :row-class-name="config.rowClassName ? config.rowClassName : ''"
      :row-style="config.rowStyle ? config.rowStyle : {}"
      :cell-class-name="config.cellClassName ? config.cellClassName : ''"
      :cell-style="config.cellStyle ? config.cellStyle : {}"
      :header-row-class-name="config.headerRowClassName ? config.headerRowClassName : ''"
      :header-row-style="config.headerRowStyle ? config.headerRowStyle : {}"
      :header-cell-class-name="config.headerCellClassName ? config.headerCellClassName : ''"
      :header-cell-style="config.headerCellStyle ? config.headerCellStyle : {}"
      :empty-text="config.emptyText ? config.emptyText : '数据为空'"
      :tooltip-effect="config.maxHeight ? config.maxHeight : 'dark'"
      :scrollbar-always-on="config.scrollbarAlwaysOn"
      @selection-change="handleSelectionChange"
      @current-change="handleCurrentChange"
      @row-dblclick="handleRowDbClick"
    >
      <el-table-column
        v-if="config.showSelect"
        type="selection"
        width="60"
        align="center"
        :fixed="config.selectFixed ? config.selectFixed : false"
        :selectable="(row: anyObj, index: number) => config.selectable ? config.selectable(row, index) : true"
      />
      <el-table-column
        v-if="config.showIndex"
        type="index"
        label="序号"
        width="80"
        align="center"
        :fixed="config.indexFixed ? config.indexFixed : false"
      />
      <el-table-column
				v-for="(item, index) in props.cols"
				:key="index + '-' + item.key"
				:show-overflow-tooltip="item.type === 'text' || !item.type"
        :align="item.align ? item.align : 'center'"
				:prop="item.key"
				:width="item.colWidth"
        :min-width="item.colMinWidth"
				:label="item.label"
        :fixed="item.fixed ? item.fixed : false"
        :sortable="item.sortable"
			>
				<template v-slot="scope">
					<template v-if="item.type === 'image'">
						<el-image
              v-if="scope.row[item.key]"
              :style="{ width: item.width || '80px', height: item.height || '80px'}"
              :src="scope.row[item.key]"
              :preview-src-list="scope.row[item.key] ? [scope.row[item.key]] : []"
              fit="cover"
              alt="封面图片"
              preview-teleported
              teleported
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><PictureFilled /></el-icon>
                </div>
              </template>
            </el-image>
            <span v-else>暂无图片</span>
					</template>
          <template v-if="item.type === 'checkbox'">
						<el-checkbox
              v-model="scope.row[item.key]"
              :size="item.size ? item.size : 'default'"
              :disabled="Boolean(item.disabled)"
              @change="onRowChange(scope.row)"
            />
					</template>
          <template v-if="item.type === 'switch'">
						<el-switch
              v-model="scope.row[item.key]"
              :size="item.size ? item.size : 'default'"
              :disabled="Boolean(item.disabled)"
              :style="{
                '--el-switch-on-color': item.onColor ? item.onColor : '#13ce66',
                '--el-switch-off-color': item.offColor ? item.offColor : '#dcdfe6'
              }"
              @change="onRowChange(scope.row)"
            />
					</template>
          <template v-if="item.type === 'tag'">
						<el-tag
              :type="item.theme ? item.theme(scope.row) : ''"
              :size="item.size || 'default'"
              :round="Boolean(item.round)"
            >{{ item.formatter ? item.formatter(scope.row) : scope.row[item.key] || '--' }}</el-tag>
					</template>
					<template v-if="item.type === 'text' || !item.type">
						{{ item.formatter ? item.formatter(scope.row) : scope.row[item.key] }}
					</template>
				</template>
			</el-table-column>
      <el-table-column
        v-if="Boolean(config.showOperate)"
        fixed="right"
        label="操作"
        align="center"
        :width="config.operateWidth ? config.operateWidth : '150'"
      >
        <template #default="scope">
          <template v-for="(btn, i) of config.operates">
            <el-button
              v-if="btn.show ? btn.show(scope.row) : true"
              :key="i"
              link
              :type="btn.type || ''"
              :size="btn.size || 'small'"
              @click="handleOperateClick(btn.text, scope.row)"
            >{{ btn.text }}</el-button>
          </template>
        </template>
    </el-table-column>
    </el-table>

    <div v-if="Boolean(config.showPager)" class="pager-block">
      <el-pagination
        v-model:current-page="pageData.currPage"
        v-model:page-size="pageData.pageSize"
        :page-sizes="pageData.pageSizes || [30, 50, 100, 150, 300]"
        :small="Boolean(pageData.small)"
        :disabled="Boolean(pageData.disabled)"
        :background="Boolean(pageData.background)"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageData.total || props.data.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrPageChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { TableInstance } from 'element-plus'

/**
 * CusTable 自定义表格组件
 * @description 基于 element-plus 和 el-pagination ，旨在减少重复 列（el-table-column）的书写
 * @property {Array[Object]} data 表格 data 数组
 * 
 * @property {Array[Object]} cols 表格每列定义
 *  Object 字段定义：
 * 	@value key 列显示字段
 * 	@value align = ['left', 'center', 'right'] 列对齐方式，默认 'center'
 *  @value colWidth 列宽
 *  @value colMinWidth 列最小宽度，当希望表格自动分配宽度时设置最小宽度
 *  @value label 列名称
 *  @value fixed 是否固定列，默认 false
 *  @value sortable 是否可排序
 *  @value type = ['image', 'checkbox', 'switch', 'tag', 'text'], 默认 text
 *  @value width 类型type = 'image' 时图片宽度
 *  @value height 类型type = 'image' 时图片高度
 *  @value size 类型type = 'checkbox' | 'switch' | 'tag' 时组件大小
 *  @value disabled 类型type = 'checkbox' | 'switch' 时禁用状态
 *  @value onColor 类型type = 'switch' 时开启颜色，默认 '#13ce66'
 *  @value offColor 类型type = 'switch' 时关闭颜色，默认 '#dcdfe6'
 *  @value {Function} theme = function(row) {} 类型 type = 'tag' 时 主题控制函数，参数是传入当前行数据进行自定义逻辑控制
 *  @value round 类型 type = 'tag' 时是否圆角样式
 * 
 * @property {Object} config 表格配置
 *  @value showSelect 开启多选
 *  @value selectFixed 多选列是否固定
 *  @value {Function} selectable = function(row, index) 可选控制函数，参数是当前行数据和索引
 *  @value showIndex 是否开启序号
 *  @value indexFixed 是否固定序号列
 *  @value showOperate 是否显示操作列
 *  @value operateWidth 操作列宽度， 默认 150
 *  @value operates 操作列文字按钮定义数组 [{ type: 按钮主题, size： 组件大小, text： 按钮文字, show: function(row) => {} 显示控制 }]
 *  @value showPager 是否显示分页
 *  @value 其他属性参考 el-table 属性
 * 
 * @property pageData 分页器定义
 *  @value currPage 当前页
 *  @value pageSize 每页大小
 *  @value pageSizes 页面大小数组，默认 [30, 50, 100, 150, 300]
 *  @value small，是否小尺寸
 *  @value disabled 是否禁用
 *  @value background 是否带背景色
 *  @value total 数据total, 不传默认 表格 data 长度
 * 
 * @event {Function} currentChange 行发生变化事件，数据是当前行
 * @event {Function} selectionChange 多选事件，返回多选的数据
 * @event {Function} rowDbClick 行双击事件，数据是当前行
 * @event {Function} rowChange 行数据改变事件，数据是当前行，由checkbox、switch等触发
 * @event {Function} currPageChange 页码改变时触发，数据是当前页码
 * @event {Function} sizeChange 页数大小改变触发，数据是当前页大小
 * @event {Function} operatesClick 操作列文字按钮点击事件，数据是点击的文字按钮名称，当前行数据
 */

interface Props {
  data?: anyObj[]
  cols?: anyObj[]
  config?: anyObj
  pageData?: anyObj
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  config: () => {
    return {
      height: 480,
      stripe: true,
      border: true,
      showHeader: true,
      showIndex: true,
      highlightCurrentRow: true,
      scrollbarAlwaysOn: true
    }
  },
  pageData: () => {
    return {
      currPage: 1,
      pageSize: 30,
      pageSizes: [30, 50, 100, 150, 300],
      small: false,
      disabled: false,
      background: true,
      total: 0
    }
  }
})
const emits = defineEmits<{
  (e: 'currentChange', val: anyObj | undefined): void
  (e: 'selectionChange', val: anyObj[]): void
  (e: 'rowDbClick', val: anyObj): void
  (e: 'sizeChange', val: number): void
  (e: 'currPageChange', val: number): void
  (e: 'operatesClick', text: string, val: anyObj): void
  (e: 'rowChange', val: anyObj): void
}>()

watch(
  () => props.data,
  (newValue, oldValue) => {
    tableRef.value!.clearSort()
    tableRef.value!.clearSelection()
  },
  { deep: true }
)

const config = computed(() => props.config)
const pageData = computed(() => props.pageData)

const tableRef = ref<TableInstance>()

const handleCurrentChange = (val: anyObj | undefined) => {
  emits('currentChange', val)
}
const handleSelectionChange = (vals: anyObj[]) => {
  emits('selectionChange', vals)
}
const handleRowDbClick = (row: anyObj) => {
  emits('rowDbClick', row)
}
const handleSizeChange = (val: number) => {
  emits('sizeChange', val)
}
const handleCurrPageChange = (val: number) => {
  emits('currPageChange', val)
}
const handleOperateClick = (type: string, row: anyObj) => {
  emits('operatesClick', type, row)
}
const onRowChange = (row: anyObj) => {
  emits('rowChange', row)
}
</script>

<style lang="scss">
.pager-block {
  margin: 15px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  .el-icon {
    color: #999;
    font-size: 30px;
  }
}
</style>
