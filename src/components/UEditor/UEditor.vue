<template>
  <div>
    <div style="border: 1px solid #ccc;">
      <Toolbar
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
        style="border-bottom: 1px solid #ccc"
      />
      <Editor
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        :style="{ height: height + 'px' }"
        style="overflow-y: hidden"
        @onCreated="handleCreated"
        @onChange="handleChange"
        @onDestroyed="handleDestroyed"
        @onFocus="handleFocus"
        @onBlur="handleBlur"
        @customAlert="customAlert"
        @customPaste="customPaste"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
// 富文本编辑器
import { onBeforeUnmount, ref, reactive, shallowRef, watch } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import type { IDomEditor, IEditorConfig } from '@wangeditor/editor'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

type InsertFnType = (url: string, alt: string, href: string) => void

interface EditorProps {
  pid?: string | number,
  html?: string,
  disabled?: boolean,
  height?: number
}

/**
 * html 富文本字符串
 * disabled 是否禁用编辑
 * height 编辑器高度
 */
const props = withDefaults(defineProps<EditorProps>(), {
  pid: '',
  html: '',
  disabled: false,
  height: 800
})

const emits = defineEmits<{
  (e: 'change', value: string): void
}>()

const serverUrl = ref('/api/admin/upload2MinIO/image')

// 编辑器实例，必须用 shallowRef，重要！
const editorRef = shallowRef();

const mode = 'default'

// 内容 HTML
const valueHtml = ref('<p></p>')

const toolbarConfig = {
  toolbarKeys: [
    'headerSelect',
    'blockquote',
    'codeBlock',
    '|',
    'bold',
    'underline',
    'italic',
    {
      key: 'group-more-style',
      title: '更多',
      iconSvg:
        '<svg viewBox="0 0 1024 1024">' +
        '<path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path>' +
        '<path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path>' +
        '<path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path>' +
        '</svg>',
      menuKeys: ['through', 'code', 'sup', 'sub', 'clearStyle'],
    },
    'color',
    'bgColor',
    '|',
    'fontSize',
    'fontFamily',
    'lineHeight',
    '|',
    'bulletedList',
    'numberedList',
    'todo',
    {
      key: 'group-justify',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
      title: '对齐',
      menuKeys: [
        'justifyLeft',
        'justifyRight',
        'justifyCenter',
        'justifyJustify',
      ],
    },
    {
      key: 'group-indent',
      title: '缩进',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
      menuKeys: ['indent', 'delIndent'],
    },
    '|',
    'emotion',
    {
      key: 'group-image',
      title: '图片',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
      menuKeys: ['insertImage', 'uploadImage'],
    },
    'insertTable',
    'divider',
    '|',
    'undo',
    'redo',
    '|',
    'fullScreen'
  ]
}

const editorConfig: Partial<IEditorConfig> = reactive({
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: `${import.meta.env.VITE_AXIOS_BASE_URL}${serverUrl.value}`,
      fieldName: 'multipart',
      maxFileSize: 15 * 1024 * 1024,
      maxNumberOfFiles: 1,
      headers: {
        'Authori-zation': `${getToken()}`
      },
      // 单个文件上传失败
      onFailed(file: File, res: any) {
        ElMessage.error('上传文件失败' + res)
      },
      // 上传错误，或者触发 timeout 超时
      onError(file: File, err: any, res: any) {
        console.log(err)
        if (err && err.toString()) {
          if (String(err).indexOf('exceeds maximum allowed size') > -1) ElMessage.error('图片大小不能大于 15MB')
          else ElMessage.error(String(err) || 'Error in Editor')
        } else {
          ElMessage.error('编辑器出错')
        }
      },
      // 自定义插入图片
      customInsert(res: any, insertFn: InsertFnType) {
        console.log('=uploadImage=', res)
        // res 即服务端的返回结果
        if (res.code === 200) {
          let url = res.message
          let alt = res.message.substring(res.message.length - 36)
          let href = res.message
          // 从 res 中找到 url alt href ，然后插入图片
          console.log(props.pid)
          insertFn(url, alt, href)
        } else {
          ElMessage.error(res.message)
        }
      }
    }
  }
});

watch(
  () => props.html,
  (newValue, oldValue) => {
    valueHtml.value = newValue + '' || '<p></p>'
  },
  { immediate: true, deep: true }
)

watch(
  () => props.pid,
  (newValue, oldValue) => {
    if (newValue) {
      serverUrl.value = '/api/admin/upload2MinIO/uploadWithPId/' + newValue
      editorConfig!.MENU_CONF!.uploadImage.server = `${import.meta.env.VITE_AXIOS_BASE_URL}${serverUrl.value}`
    }
    else {
      serverUrl.value = '/api/admin/upload2MinIO/image'
      editorConfig!.MENU_CONF!.uploadImage.server = `${import.meta.env.VITE_AXIOS_BASE_URL}${serverUrl.value}`
    }
  },
  { immediate: true }
)

watch(
  () => props.disabled,
  (newVal, oldVal) => {
    if (!newVal) {
      const editor = editorRef.value;
      if (editor == null) return;
      editor.disable()
    } else {
      const editor = editorRef.value;
      if (editor == null) return;
      editor.enable()
    }
  },
  { immediate: true }
)

// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return

  editor.destroy()
})

// 编辑器回调函数
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
const handleChange = (editor: IDomEditor) => {
  // console.log('editor change:', editor.getHtml())
  emits('change', editor.getHtml())
}
const handleDestroyed = (editor: IDomEditor) => {
  // console.log('editor destroyed', editor)
}
const handleFocus = (editor: IDomEditor) => {
  // console.log('editor focus', editor)
}
const handleBlur = (editor: IDomEditor) => {
  // console.log('editor blur', editor)
}
const customAlert = (info: string, type: string) => {
  switch (type) {
    case 'success':
      ElMessage.success(info)
      break
    case 'info':
      ElMessage.info(info)
      break
    case 'warning':
      ElMessage.warning(info)
      break
    case 'error':
      ElMessage.error(info)
      break
    default:
      ElMessage.info(info)
      break
  }
}
const customPaste = (editor: IDomEditor, event: ClipboardEvent, callback: Function) => {
  // console.log('ClipboardEvent 粘贴事件对象', event)

  // 自定义插入内容
  // editor.insertText('xxx')

  // 返回值（注意，vue 事件的返回值，不能用 return）
  // callback(false) // 返回 false ，阻止默认粘贴行为
  callback(true) // 返回 true ，继续默认的粘贴行为
}
</script>

<style lang="scss" scoped>

</style>
