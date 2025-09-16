<template>
  <div class="flex-1 flex flex-col bg-white workspace-sync">
    <!-- 编辑器工具栏 -->
    <div v-if="activeTab" class="h-10 px-4 flex items-center justify-between border-b border-gray-200 bg-gray-50">
      <div class="flex items-center space-x-2">
        <span class="text-sm font-medium text-gray-700">{{ activeTab.name }}</span>
        <span v-if="activeTab.path" class="text-xs text-gray-500">{{ activeTab.path }}</span>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          @click="saveFile"
          :disabled="activeTab.saved"
          class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
        >
          {{ activeTab.saved ? '已保存' : '保存' }}
        </button>
      </div>
    </div>
    
    <!-- 编辑器区域 -->
    <div class="flex-1 overflow-hidden">
      <div v-if="!activeTab" class="h-full flex items-center justify-center bg-gray-50">
        <div class="text-center">
          <FileText class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-600 mb-2">欢迎使用 Memory Note</h3>
          <p class="text-sm text-gray-500 mb-4">选择文件开始编辑，或创建新文件</p>
          <button
            @click="createNewFile"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            新建文件
          </button>
        </div>
      </div>
      
      <codemirror-editor
        v-else
        :key="activeTab.id"
        :content="activeTab.content"
        :language="getEditorLanguage(activeTab)"
        @content-change="updateContent"
        @save="saveFile"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { FileText } from 'lucide-vue-next'
import CodeMirrorEditor from './CodeMirrorEditor.vue'

const appStore = useAppStore()

// 计算属性
const activeTab = computed(() => {
  const tab = appStore.activeTab
  if (!tab || tab.input.type !== 'document') return null
  
  // 适配新标签系统的数据结构
  const documentModel = (tab.input as any).documentModel
  if (!documentModel) return null
  
  return {
    id: tab.id,
    name: documentModel.title,
    content: documentModel.content,
    saved: tab.input.saved,
    path: documentModel.filePath,
    type: 'file'
  }
})

// 更新内容
const updateContent = (content: string) => {
  const tab = appStore.activeTab
  if (tab && tab.input.type === 'document') {
    const documentModel = (tab.input as any).documentModel
    if (documentModel) {
      appStore.updateDocumentContent(documentModel.id, content)
    }
  }
}

// 保存文件
const saveFile = async () => {
  const tab = appStore.activeTab
  if (tab && tab.input.type === 'document') {
    const documentModel = (tab.input as any).documentModel
    if (documentModel) {
      await appStore.saveDocument(documentModel.id)
      console.log('保存文件:', documentModel.title)
    }
  }
}

// 创建新文件
const createNewFile = () => {
  appStore.createNewDocument({
    title: '新建文档.md',
    content: '# 新建文档\n\n开始编写你的内容...\n'
  })
}

// 获取编辑器语言
const getEditorLanguage = (tab: any) => {
  if (tab.name.endsWith('.md') || tab.name.endsWith('.markdown')) {
    return 'markdown'
  } else if (tab.name.endsWith('.js')) {
    return 'javascript'
  } else if (tab.name.endsWith('.ts')) {
    return 'typescript'
  } else if (tab.name.endsWith('.json')) {
    return 'json'
  } else if (tab.name.endsWith('.css')) {
    return 'css'
  } else if (tab.name.endsWith('.html')) {
    return 'html'
  }
  return 'plaintext'
}
</script>
