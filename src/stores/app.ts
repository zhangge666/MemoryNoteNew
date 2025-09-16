import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface FileTab {
  id: string
  name: string
  path?: string
  content: string
  saved: boolean
  type: 'file' | 'diary' | 'review'
}

export interface WorkspaceSettings {
  workingDirectory: string
  language: 'zh-CN' | 'en-US'
  theme: 'light' | 'dark' | 'auto'
  autoSave: boolean
  fontSize: number
}

export const useAppStore = defineStore('app', () => {
  // 应用状态
  const isLeftSidebarCollapsed = ref(false)
  const isRightSidebarCollapsed = ref(true)
  const leftSidebarWidth = ref(250)
  const rightSidebarWidth = ref(300)
  
  // 标签页管理
  const tabs = ref<FileTab[]>([])
  const activeTabId = ref<string>('')
  
  // 工作区设置
  const settings = ref<WorkspaceSettings>({
    workingDirectory: '',
    language: 'zh-CN',
    theme: 'light',
    autoSave: true,
    fontSize: 14
  })
  
  // 当前导航选择
  const currentNavItem = ref('home')
  
  // 文件树状态
  const expandedFolders = ref<Set<string>>(new Set())
  const selectedFile = ref<string>('')
  
  // 方法：切换左侧栏
  const toggleLeftSidebar = () => {
    isLeftSidebarCollapsed.value = !isLeftSidebarCollapsed.value
  }
  
  // 方法：切换右侧栏
  const toggleRightSidebar = () => {
    isRightSidebarCollapsed.value = !isRightSidebarCollapsed.value
  }
  
  // 方法：添加标签页
  const addTab = (tab: Omit<FileTab, 'id'>) => {
    const newTab: FileTab = {
      id: Date.now().toString(),
      ...tab
    }
    tabs.value.push(newTab)
    activeTabId.value = newTab.id
    return newTab
  }
  
  // 方法：关闭标签页
  const closeTab = (tabId: string) => {
    const index = tabs.value.findIndex(tab => tab.id === tabId)
    if (index !== -1) {
      tabs.value.splice(index, 1)
      
      // 如果关闭的是当前活跃标签，切换到邻近标签
      if (activeTabId.value === tabId) {
        if (tabs.value.length > 0) {
          const newIndex = Math.min(index, tabs.value.length - 1)
          activeTabId.value = tabs.value[newIndex].id
        } else {
          activeTabId.value = ''
        }
      }
    }
  }
  
  // 方法：切换活跃标签
  const setActiveTab = (tabId: string) => {
    activeTabId.value = tabId
  }
  
  // 方法：更新标签内容
  const updateTabContent = (tabId: string, content: string) => {
    const tab = tabs.value.find(t => t.id === tabId)
    if (tab) {
      tab.content = content
      tab.saved = false
    }
  }
  
  // 方法：保存标签
  const saveTab = (tabId: string) => {
    const tab = tabs.value.find(t => t.id === tabId)
    if (tab) {
      // 这里应该调用文件系统API保存文件
      tab.saved = true
    }
  }
  
  // 方法：设置导航项
  const setCurrentNavItem = (item: string) => {
    currentNavItem.value = item
  }
  
  // 方法：更新设置
  const updateSettings = (newSettings: Partial<WorkspaceSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }
  
  return {
    // 状态
    isLeftSidebarCollapsed,
    isRightSidebarCollapsed,
    leftSidebarWidth,
    rightSidebarWidth,
    tabs,
    activeTabId,
    settings,
    currentNavItem,
    expandedFolders,
    selectedFile,
    
    // 方法
    toggleLeftSidebar,
    toggleRightSidebar,
    addTab,
    closeTab,
    setActiveTab,
    updateTabContent,
    saveTab,
    setCurrentNavItem,
    updateSettings
  }
})

