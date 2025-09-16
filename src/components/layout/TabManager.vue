<template>
  <div class="h-8 bg-gray-100 border-b border-gray-200 flex items-center overflow-hidden workspace-sync">
    <!-- 标签页列表 -->
    <div class="flex-1 flex overflow-x-auto">
      <tab-item
        v-for="tab in tabs"
        :key="tab.id"
        :tab="tab"
        :active="activeTabId === tab.id"
        @select="selectTab"
        @close="closeTab"
        @context-menu="showTabContextMenu"
      />
      
      <!-- 新建标签按钮 -->
      <button
        @click="newTab"
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors border-r border-gray-300"
        title="新建标签"
      >
        <Plus class="w-3 h-3 text-gray-500" />
      </button>
    </div>
    
    <!-- 标签控制按钮 -->
    <div class="flex items-center space-x-1 px-2">
      <button
        @click="closeAllTabs"
        class="p-1 hover:bg-gray-200 rounded transition-colors"
        title="关闭所有标签"
      >
        <X class="w-3 h-3 text-gray-500" />
      </button>
      
      <button
        @click="splitHorizontal"
        class="p-1 hover:bg-gray-200 rounded transition-colors"
        title="水平分屏"
      >
        <SplitSquareHorizontal class="w-3 h-3 text-gray-500" />
      </button>
      
      <button
        @click="splitVertical"
        class="p-1 hover:bg-gray-200 rounded transition-colors"
        title="垂直分屏"
      >
        <SplitSquareVertical class="w-3 h-3 text-gray-500" />
      </button>
    </div>
    
    <!-- 标签右键菜单 -->
    <div
      v-if="showContextMenu"
      ref="contextMenu"
      class="fixed bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
      :style="contextMenuStyle"
    >
      <button
        @click="closeCurrentTab"
        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        关闭
      </button>
      <button
        @click="closeOtherTabs"
        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        关闭其他
      </button>
      <button
        @click="closeTabsToRight"
        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        关闭右侧标签
      </button>
      <div class="border-t border-gray-100 my-1"></div>
      <button
        @click="moveToNewSplit"
        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        移动到新分区
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  Plus,
  X,
  SplitSquareHorizontal,
  SplitSquareVertical
} from 'lucide-vue-next'
import TabItem from './TabItem.vue'

const appStore = useAppStore()

const showContextMenu = ref(false)
const contextMenuStyle = ref({})
const contextMenuTabId = ref('')

// 计算属性
const tabs = computed(() => appStore.tabs)
const activeTabId = computed(() => appStore.activeTabId)

// 选择标签
const selectTab = (tabId: string) => {
  appStore.setActiveTab(tabId)
}

// 关闭标签
const closeTab = (tabId: string) => {
  appStore.closeTab(tabId)
}

// 新建标签
const newTab = () => {
  appStore.addTab({
    name: '新建文档',
    content: '',
    saved: false,
    type: 'file'
  })
}

// 关闭所有标签
const closeAllTabs = () => {
  if (tabs.value.length > 0 && confirm('确定要关闭所有标签吗？')) {
    tabs.value.forEach(tab => {
      appStore.closeTab(tab.id)
    })
  }
}

// 水平分屏
const splitHorizontal = () => {
  // TODO: 实现水平分屏逻辑
  console.log('水平分屏')
}

// 垂直分屏
const splitVertical = () => {
  // TODO: 实现垂直分屏逻辑
  console.log('垂直分屏')
}

// 显示标签右键菜单
const showTabContextMenu = (e: MouseEvent, tabId: string) => {
  e.preventDefault()
  showContextMenu.value = true
  contextMenuTabId.value = tabId
  
  nextTick(() => {
    contextMenuStyle.value = {
      left: `${e.clientX}px`,
      top: `${e.clientY}px`
    }
  })
}

// 关闭当前标签
const closeCurrentTab = () => {
  if (contextMenuTabId.value) {
    appStore.closeTab(contextMenuTabId.value)
  }
  showContextMenu.value = false
}

// 关闭其他标签
const closeOtherTabs = () => {
  const currentTabId = contextMenuTabId.value
  tabs.value.forEach(tab => {
    if (tab.id !== currentTabId) {
      appStore.closeTab(tab.id)
    }
  })
  showContextMenu.value = false
}

// 关闭右侧标签
const closeTabsToRight = () => {
  const currentTabIndex = tabs.value.findIndex(tab => tab.id === contextMenuTabId.value)
  if (currentTabIndex !== -1) {
    const tabsToClose = tabs.value.slice(currentTabIndex + 1)
    tabsToClose.forEach(tab => {
      appStore.closeTab(tab.id)
    })
  }
  showContextMenu.value = false
}

// 移动到新分区
const moveToNewSplit = () => {
  // TODO: 实现移动到新分区逻辑
  console.log('移动到新分区')
  showContextMenu.value = false
}

// 点击外部关闭菜单
document.addEventListener('click', () => {
  showContextMenu.value = false
})
</script>
