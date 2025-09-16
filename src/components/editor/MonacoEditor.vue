<template>
  <div ref="editorContainer" class="w-full h-full workspace-sync"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

interface Props {
  documentId?: string
  content: string
  language: string
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false
})

const emit = defineEmits<{
  'content-change': [content: string]
  save: []
}>()

const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 配置Monaco Worker环境
const configureMonacoWorkers = () => {
  // 禁用Monaco的Web Workers，避免在Electron中的兼容性问题
  if (!window.MonacoEnvironment) {
    window.MonacoEnvironment = {
      getWorker: function () {
        // 返回一个空的Worker，Monaco会自动回退到主线程模式
        return {
          postMessage: () => {},
          terminate: () => {},
          addEventListener: () => {},
          removeEventListener: () => {}
        } as any
      }
    }
  }
}

// 初始化编辑器
const initEditor = async () => {
  if (!editorContainer.value) return

  // 配置Worker环境
  configureMonacoWorkers()

  // Monaco编辑器配置
  editor = monaco.editor.create(editorContainer.value, {
    value: props.content,
    language: props.language,
    theme: 'vs', // 可以是 'vs', 'vs-dark', 'hc-black'
    readOnly: props.readOnly,
    automaticLayout: true,
    minimap: {
      enabled: true,
      scale: 0.5
    },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    fontSize: 14,
    lineHeight: 20,
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: 'selection',
    renderLineHighlight: 'line',
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    mouseWheelZoom: true,
    folding: true,
    lineNumbers: 'on',
    glyphMargin: true,
    contextmenu: true,
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    suggest: {
      showKeywords: true,
      showSnippets: true
    }
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    if (editor) {
      const value = editor.getValue()
      emit('content-change', value)
    }
  })

  // 监听保存快捷键 (Ctrl+S)
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    emit('save')
  })

  // 设置Markdown语言的特殊配置
  if (props.language === 'markdown') {
    monaco.languages.registerCompletionItemProvider('markdown', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'header1',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '# ${1:标题}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '一级标题'
          },
          {
            label: 'header2',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '## ${1:标题}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '二级标题'
          },
          {
            label: 'bold',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '**${1:粗体文本}**',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '粗体'
          },
          {
            label: 'italic',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '*${1:斜体文本}*',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '斜体'
          },
          {
            label: 'link',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '[${1:链接文本}](${2:URL})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '链接'
          },
          {
            label: 'code',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '`${1:代码}`',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '行内代码'
          },
          {
            label: 'codeblock',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '```${1:language}\n${2:代码}\n```',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '代码块'
          }
        ]
        return { suggestions }
      }
    })
  }
}

// 监听props变化
watch(() => props.content, (newContent) => {
  if (editor && editor.getValue() !== newContent) {
    editor.setValue(newContent)
  }
})

watch(() => props.language, (newLanguage) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

onMounted(async () => {
  await nextTick()
  initEditor()
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

// 暴露编辑器实例方法
defineExpose({
  getEditor: () => editor,
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value),
  focus: () => editor?.focus(),
  insertText: (text: string) => {
    if (editor) {
      const selection = editor.getSelection()
      if (selection) {
        editor.executeEdits('', [{
          range: selection,
          text
        }])
      }
    }
  }
})
</script>

<style>
/* Monaco编辑器样式调整 - 使用全局样式避免CSS嵌套问题 */
.monaco-editor {
  --vscode-editor-background: #ffffff !important;
  --vscode-editor-foreground: #1f2937 !important;
}

.monaco-editor .margin {
  background-color: #f9fafb !important;
}

.monaco-editor .line-numbers {
  color: #9ca3af !important;
}

.monaco-scrollable-element .scrollbar .slider {
  background: rgba(0, 0, 0, 0.2) !important;
}

.monaco-scrollable-element .scrollbar .slider:hover {
  background: rgba(0, 0, 0, 0.4) !important;
}
</style>
