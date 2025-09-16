<template>
  <div class="tab-panel-container h-full flex flex-col">
    <!-- 标签栏 -->
    <div class="flex-shrink-0 border-b border-gray-200 bg-gray-100">
      <div class="flex">
        <!-- 标签列表 -->
        <div class="flex-1 flex overflow-x-auto">
          <TabItem
            v-for="tab in currentPanelTabs"
            :key="tab.id"
            :tab="tab"
            :active="tab.id === activeTabId"
            @click="activateTab(tab.id)"
            @close="closeTab(tab.id)"
          />
        </div>
        
        <!-- 新建标签按钮 -->
        <div class="flex items-center px-2">
          <button
            @click="createNewTab"
            class="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors"
            title="新建标签"
          >
            <Plus class="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="flex-1 overflow-hidden bg-white">
      <component
        v-if="activeTabInput"
        :is="activeTabInput.getComponent()"
        v-bind="activeTabInput.getProps()"
        @content-change="handleContentChange"
        @save="handleSave"
      />
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        <div class="text-center">
          <FileText class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-lg mb-2">欢迎使用 Memory Note</p>
          <p class="text-sm text-gray-400">点击左侧导航或创建新标签开始工作</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { Plus, FileText } from 'lucide-vue-next'
import TabItem from './NewTabItem.vue'

const appStore = useAppStore()

// 计算属性
const currentPanelId = computed(() => appStore.activePanelId)

const currentPanelTabs = computed(() => {
  const panelId = currentPanelId.value
  if (!panelId) return []
  
  // 确保依赖allPanels来触发重新计算
  const panels = appStore.allPanels
  const panel = panels.find(p => p.id === panelId)
  return panel ? panel.tabs : []
})

const activeTabId = computed(() => {
  const panelId = currentPanelId.value
  if (!panelId) return undefined
  
  // 确保依赖allPanels来触发重新计算
  const panels = appStore.allPanels
  const panel = panels.find(p => p.id === panelId)
  return panel?.activeTabId
})

const activeTabInput = computed(() => {
  const activeTab = appStore.activeTab
  return activeTab?.input
})

// 方法
const activateTab = (tabId: string) => {
  appStore.activateTabInput(tabId)
}

const closeTab = async (tabId: string) => {
  await appStore.closeTabInput(tabId)
}

const createNewTab = () => {
  appStore.createNewDocument({
    title: '新建文档',
    content: '# 新建文档\n\n开始编写你的内容...'
  })
}

const handleContentChange = (content: string) => {
  const activeTab = appStore.activeTab
  if (activeTab && activeTab.input.type === 'document') {
    const documentId = (activeTab.input as any).documentModel?.id
    if (documentId) {
      appStore.updateDocumentContent(documentId, content)
    }
  }
}

const handleSave = async () => {
  const activeTab = appStore.activeTab
  if (activeTab && activeTab.input.type === 'document') {
    const documentId = (activeTab.input as any).documentModel?.id
    if (documentId) {
      await appStore.saveDocument(documentId)
    }
  }
}
</script>

<style scoped>
.tab-panel-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
