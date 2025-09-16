import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { documentManager } from '@/core/DocumentManager'
import { tabPanelSystem } from '@/core/TabPanelSystem'
import { EditorInputFactory } from '@/core/EditorInput'
import type { EditorInput } from '@/core/EditorInput'


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

  // 响应式状态 - 强制更新标签系统
  const tabSystemUpdateTrigger = ref(0)

  // 新增：计算属性
  const activePanelId = computed(() => {
    // 强制依赖更新触发器
    tabSystemUpdateTrigger.value
    return tabPanelSystem.getCurrentPanelId()
  })

  const activeTab = computed(() => {
    // 强制依赖更新触发器
    tabSystemUpdateTrigger.value
    return tabPanelSystem.getActiveTab()
  })

  const allPanels = computed(() => {
    // 强制依赖更新触发器
    tabSystemUpdateTrigger.value
    return tabPanelSystem.getAllPanels()
  })

  const allTabInputs = computed(() => {
    // 强制依赖更新触发器
    tabSystemUpdateTrigger.value
    return tabPanelSystem.getAllTabs()
  })

  const unsavedDocumentCount = computed(() => {
    return documentManager.getDirtyDocuments().length
  })

  // 辅助方法：触发标签系统更新
  const triggerTabSystemUpdate = () => {
    tabSystemUpdateTrigger.value++
  }
  
  // 方法：切换左侧栏
  const toggleLeftSidebar = () => {
    isLeftSidebarCollapsed.value = !isLeftSidebarCollapsed.value
  }
  
  // 方法：切换右侧栏
  const toggleRightSidebar = () => {
    isRightSidebarCollapsed.value = !isRightSidebarCollapsed.value
  }
  
  
  // 方法：设置导航项
  const setCurrentNavItem = (item: string) => {
    currentNavItem.value = item
    // 打开对应的导航页面
    openNavigationPage(item)
  }

  // 新增：打开导航页面
  const openNavigationPage = (navItem: string) => {
    // 检查是否已经存在相同类型的页面标签
    const existingTabs = tabPanelSystem.getAllTabs()
    const existingTab = existingTabs.find(tab => 
      tab.input.type === 'page' && 
      tab.input.title === getPageTitle(navItem)
    )
    
    if (existingTab) {
      // 如果已存在，直接激活
      tabPanelSystem.activateTab(existingTab.id)
      triggerTabSystemUpdate()
      return
    }

    let input: EditorInput | null = null

    switch (navItem) {
      case 'home':
        input = EditorInputFactory.createHomePage()
        break
      case 'settings':
        input = EditorInputFactory.createSettingsPage()
        break
      case 'review':
        input = EditorInputFactory.createReviewPage()
        break
      case 'search':
        input = EditorInputFactory.createSearchPage()
        break
      case 'diary':
        input = EditorInputFactory.createDiaryPage()
        break
      case 'subscribe':
        input = EditorInputFactory.createSubscribePage()
        break
    }

    if (input) {
      tabPanelSystem.openTab(input)
      triggerTabSystemUpdate() // 触发UI更新
    }
  }

  // 辅助函数：获取页面标题
  const getPageTitle = (navItem: string): string => {
    const titleMap: Record<string, string> = {
      'home': '首页',
      'settings': '设置',
      'review': '复习',
      'search': '搜索',
      'diary': '日记',
      'subscribe': '订阅'
    }
    return titleMap[navItem] || navItem
  }

  // 新增：文档和标签管理方法
  const createNewDocument = (options?: {
    title?: string
    content?: string
    filePath?: string
  }) => {
    const document = documentManager.createDocument(options || {})
    const input = EditorInputFactory.createDocument(document)
    const tab = tabPanelSystem.openTab(input)
    triggerTabSystemUpdate() // 触发UI更新
    return tab
  }

  const openFileAsDocument = async (filePath: string) => {
    try {
      const result = await window.electronAPI?.readFile(filePath)
      
      // 检查结果是否为错误对象
      if (!result || typeof result !== 'string') {
        if (result && typeof result === 'object' && 'error' in result) {
          console.error('文件读取失败:', result.error)
          // 创建一个错误内容的文档
          const title = filePath.split(/[/\\]/).pop() || '未命名文档'
          const errorContent = `# 文件读取失败\n\n**错误信息:** ${result.error}\n\n**文件路径:** ${filePath}\n\n请检查文件是否存在或是否有读取权限。`
          
          const document = documentManager.createDocument({
            title: `[错误] ${title}`,
            content: errorContent,
            filePath
          })
          
          const input = EditorInputFactory.createDocument(document)
          const tab = tabPanelSystem.openTab(input)
          triggerTabSystemUpdate()
          return tab
        }
        throw new Error('文件读取返回了无效的内容')
      }
      
      const title = filePath.split(/[/\\]/).pop() || '未命名文档'
      
      const document = documentManager.createDocument({
        title,
        content: result,
        filePath
      })
      
      const input = EditorInputFactory.createDocument(document)
      const tab = tabPanelSystem.openTab(input)
      triggerTabSystemUpdate() // 触发UI更新
      return tab
    } catch (error) {
      console.error('打开文件失败:', error)
      return null
    }
  }

  const closeTabInput = async (tabId: string) => {
    const result = await tabPanelSystem.closeTab(tabId)
    triggerTabSystemUpdate() // 触发UI更新
    return result
  }

  const activateTabInput = (tabId: string) => {
    const result = tabPanelSystem.activateTab(tabId)
    triggerTabSystemUpdate() // 触发UI更新
    return result
  }

  const updateDocumentContent = (documentId: string, content: string) => {
    return documentManager.updateDocumentContent(documentId, content)
  }

  const saveDocument = async (documentId: string) => {
    return await documentManager.saveDocument(documentId)
  }

  const saveAllDocuments = async () => {
    return await documentManager.saveAllDocuments()
  }

  // 新增：初始化应用
  const initializeApp = () => {
    // 监听文档变更，更新标签状态
    documentManager.onDocumentChange((event) => {
      if (event.type === 'content' || event.type === 'saved') {
        const allTabs = tabPanelSystem.getAllTabs()
        for (const tab of allTabs) {
          if (tab.input.type === 'document' && 
              (tab.input as any).documentModel?.id === event.documentId) {
            const document = documentManager.getDocument(event.documentId)
            if (document) {
              tab.input.updateSavedState(!document.isDirty)
              if (event.title) {
                tab.input.updateTitle(event.title)
              }
            }
            break
          }
        }
      }
    })

    // 打开默认首页
    openNavigationPage('home')
    triggerTabSystemUpdate() // 确保初始状态正确
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
    settings,
    currentNavItem,
    expandedFolders,
    selectedFile,
    
    // 新标签系统计算属性
    activePanelId,
    activeTab,
    allPanels,
    allTabInputs,
    unsavedDocumentCount,
    
    // 基础方法
    toggleLeftSidebar,
    toggleRightSidebar,
    setCurrentNavItem,
    updateSettings,
    
    // 新标签系统方法
    openNavigationPage,
    createNewDocument,
    openFileAsDocument,
    closeTabInput,
    activateTabInput,
    updateDocumentContent,
    saveDocument,
    saveAllDocuments,
    initializeApp
  }
})

