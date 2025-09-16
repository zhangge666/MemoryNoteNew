<template>
  <div class="w-full h-full workspace-sync codemirror-container flex flex-col">
    <!-- 编辑器工具栏 -->
    <EditorToolbar
      v-if="showEditorToolbar"
      :document-title="documentTitle"
      :document-path="documentPath"
      :is-dirty="isDirty"
      :word-count="wordCount"
      :show-preview="false"
      @save="handleSave"
      @format="handleFormat"
      @find="handleFind"
      @toggle-preview="handleTogglePreview"
    />
    
    <!-- 编辑器容器 -->
    <div ref="editorContainer" class="flex-1"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { EditorView, lineNumbers, gutter } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import EditorToolbar from './EditorToolbar.vue'

interface Props {
  documentId?: string
  content: string
  language: string
  readOnly?: boolean
  showLineNumbers?: boolean
  showEditorToolbar?: boolean
  documentTitle?: string
  documentPath?: string
  isDirty?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
  showLineNumbers: true,
  showEditorToolbar: true,
  documentTitle: '未命名文档',
  isDirty: false
})

const emit = defineEmits<{
  'content-change': [content: string]
  save: []
}>()

const editorContainer = ref<HTMLElement>()
let editorView: EditorView | null = null

// 字数统计
const wordCount = computed(() => {
  if (!props.content) return 0
  // 简单的中文字符统计
  return props.content.replace(/\s/g, '').length
})

// 获取语言扩展
const getLanguageExtension = (language: string) => {
  switch (language.toLowerCase()) {
    case 'markdown':
    case 'md':
      return markdown()
    case 'javascript':
    case 'js':
      return javascript()
    case 'json':
      return json()
    default:
      return markdown() // 默认使用markdown
  }
}

// 初始化编辑器
const initEditor = async () => {
  if (!editorContainer.value) return

  const extensions = [
    basicSetup,
    getLanguageExtension(props.language),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const content = update.state.doc.toString()
        emit('content-change', content)
      }
    }),
    // 根据设置显示或隐藏行号
    ...(props.showLineNumbers ? [lineNumbers()] : []),
    EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '14px'
      },
      '.cm-content': {
        padding: '16px',
        minHeight: '100%',
        fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
      },
      '.cm-focused': {
        outline: 'none'
      },
      '.cm-editor': {
        height: '100%'
      },
      '.cm-scroller': {
        height: '100%'
      }
    }),
    EditorState.readOnly.of(props.readOnly)
  ]

  // 如果是暗色主题，添加oneDark主题
  // 这里可以根据应用的主题设置来决定
  // extensions.push(oneDark)

  const state = EditorState.create({
    doc: props.content,
    extensions
  })

  editorView = new EditorView({
    state,
    parent: editorContainer.value
  })

  // 添加键盘快捷键
  editorContainer.value.addEventListener('keydown', handleKeyDown)
}

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // Ctrl+S 保存
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    emit('save')
  }
}

// 销毁编辑器
const destroyEditor = () => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
  if (editorContainer.value) {
    editorContainer.value.removeEventListener('keydown', handleKeyDown)
  }
}

// 更新编辑器内容
const updateContent = (newContent: string) => {
  if (editorView && newContent !== editorView.state.doc.toString()) {
    const transaction = editorView.state.update({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: newContent
      }
    })
    editorView.dispatch(transaction)
  }
}

// 监听props变化
watch(() => props.content, (newContent) => {
  updateContent(newContent)
})

watch(() => props.language, async () => {
  // 语言变化时重新初始化编辑器
  destroyEditor()
  await nextTick()
  initEditor()
})

watch(() => props.readOnly, (newReadOnly) => {
  if (editorView) {
    editorView.dispatch({
      effects: EditorState.readOnly.reconfigure(newReadOnly)
    })
  }
})

watch(() => props.showLineNumbers, async () => {
  // 行号设置变化时重新初始化编辑器
  destroyEditor()
  await nextTick()
  initEditor()
})

onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  destroyEditor()
})

// 工具栏事件处理
const handleSave = () => {
  emit('save')
}

const handleFormat = () => {
  // TODO: 实现文档格式化
  console.log('格式化文档')
}

const handleFind = () => {
  // TODO: 实现查找替换
  console.log('查找替换')
}

const handleTogglePreview = () => {
  // TODO: 实现预览切换
  console.log('切换预览')
}

// 暴露方法给父组件
defineExpose({
  focus: () => {
    if (editorView) {
      editorView.focus()
    }
  },
  getContent: () => {
    return editorView?.state.doc.toString() || ''
  },
  setContent: updateContent
})
</script>

<style scoped>
.codemirror-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* CodeMirror 自定义样式 */
:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-content) {
  line-height: 1.6;
}

:deep(.cm-line) {
  padding: 0 4px;
}

/* Markdown 样式增强 */
:deep(.cm-line .tok-heading) {
  font-weight: bold;
  color: #2563eb;
}

:deep(.cm-line .tok-strong) {
  font-weight: bold;
}

:deep(.cm-line .tok-emphasis) {
  font-style: italic;
}

:deep(.cm-line .tok-link) {
  color: #0ea5e9;
  text-decoration: underline;
}

:deep(.cm-line .tok-monospace) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 3px;
}
</style>
