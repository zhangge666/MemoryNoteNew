import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { documentManager } from '@/core/DocumentManager'
import { tabPanelSystem } from '@/core/TabPanelSystem'
import { EditorInputFactory } from '@/core/EditorInput'
import type { EditorInput } from '@/core/EditorInput'
import { pluginManager } from '@/core/PluginSystem'


export interface WorkspaceSettings {
  workingDirectory: string
  language: 'zh-CN' | 'en-US'
  theme: 'light' | 'dark' | 'auto'
  autoSave: boolean
  fontSize: number
  lineHeight: string
  wordWrap: boolean
  showEditorToolbar: boolean
  dailyReviewReminder?: boolean
  reminderTime?: string
  reviewAlgorithm?: string
}

export const useAppStore = defineStore('app', () => {
  // 应用状态
  const isLeftSidebarCollapsed = ref(false)
  const isRightSidebarCollapsed = ref(true)
  const leftSidebarWidth = ref(250)
  const rightSidebarWidth = ref(300)
  const isResizing = ref(false) // 添加拖拽状态
  
  
  // 工作区设置
  const settings = ref<WorkspaceSettings>({
    workingDirectory: '',
    language: 'zh-CN',
    theme: 'light',
    autoSave: true,
    fontSize: 14,
    lineHeight: '1.6',
    wordWrap: true,
    showEditorToolbar: true,
    dailyReviewReminder: true,
    reminderTime: '09:00',
    reviewAlgorithm: 'sm2'
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
      // 首先检查文件是否已经在标签中打开
      const allTabs = tabPanelSystem.getAllTabs()
      for (const tab of allTabs) {
        if (tab.input.type === 'document') {
          const documentModel = (tab.input as any).documentModel
          if (documentModel?.filePath === filePath) {
            // 文件已经打开，激活该标签
            tabPanelSystem.activateTab(tab.id)
            triggerTabSystemUpdate()
            return tab
          }
        }
      }
      
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
  const initializeApp = async () => {
    // 初始化插件系统
    await initializePluginSystem()
    
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

    // 应用保存的主题
    applyTheme(settings.value.theme)
    
    // 打开默认首页
    openNavigationPage('home')
    triggerTabSystemUpdate() // 确保初始状态正确
  }

  // 初始化插件系统
  const initializePluginSystem = async () => {
    try {
      console.log('🔌 开始初始化插件系统...')
      console.log('✅ 插件管理器已就绪')
      
      // 加载已安装的插件
      await loadInstalledPlugins()
      
      // 显示插件系统状态
      const allPlugins = pluginManager.getAllPlugins()
      console.log(`🎉 插件系统初始化完成 (已加载 ${allPlugins.length} 个插件)`)
      
      // 显示侧边栏按钮数量
      const sidebarButtons = pluginManager.getAllSidebarButtons()
      if (sidebarButtons.length > 0) {
        console.log(`🔘 已注册 ${sidebarButtons.length} 个侧边栏按钮:`)
        sidebarButtons.forEach(button => {
          console.log(`   - ${button.title} (${button.id})`)
        })
      } else {
        console.log('📝 暂无注册的侧边栏按钮')
      }
      
    } catch (error) {
      console.error('💥 插件系统初始化失败:', error)
      console.error('错误详情:', error.message)
      console.error('错误堆栈:', error.stack)
    }
  }
  
  // 加载已安装的插件
  const loadInstalledPlugins = async () => {
    try {
      const installedPluginsList = JSON.parse(localStorage.getItem('installed_plugins') || '[]')
      console.log(`📦 发现 ${installedPluginsList.length} 个已安装的插件`)
      
      for (const pluginData of installedPluginsList) {
        const manifest = pluginData.manifest
        console.log(`🔄 正在加载插件: ${manifest.name}`)
        
        // 尝试执行实际插件代码
        let pluginModule = null
        
        // 如果有保存的插件代码，尝试执行
        if (pluginData.code) {
          try {
            console.log(`🔄 执行插件代码: ${manifest.name}`)
            // 创建安全的执行环境并执行插件代码
            const executePlugin = new Function('manifest', 'console', `
              // 创建module对象以支持CommonJS格式
              var module = { exports: {} };
              var exports = module.exports;
              
              ${pluginData.code}
              
              // 返回导出的对象
              return module.exports;
            `)
            pluginModule = executePlugin.call({}, manifest, console)
            
            // 验证插件模块是否有效
            if (!pluginModule || typeof pluginModule.onload !== 'function') {
              console.warn(`插件 ${manifest.name} 代码执行成功但未返回有效模块，使用默认模块`)
              pluginModule = null
            } else {
              console.log(`✅ 插件 ${manifest.name} 代码执行成功`)
            }
          } catch (error) {
            console.error(`插件 ${manifest.name} 代码执行失败:`, error)
            pluginModule = null
          }
        }
        
        // 如果没有插件代码或执行失败，创建默认模块
        if (!pluginModule) {
          console.log(`🔄 为插件 ${manifest.name} 创建默认模块`)
          pluginModule = {
            onload: async (app: any, data: any) => {
              console.log(`插件 ${manifest.name} 已加载`)
              
              // 注册设置页面（规范要求）
              app.registerSettingsPage(manifest.id, (container: any) => {
                container.innerHTML = `
                  <div class="p-4">
                    <h2 class="text-lg font-semibold mb-4">${manifest.name} 设置</h2>
                    <p class="text-gray-600 mb-4">${manifest.description}</p>
                    <div class="bg-blue-50 p-4 rounded-lg">
                      <p class="text-sm text-blue-700">这是一个已安装的插件。</p>
                      <p class="text-xs text-blue-600 mt-2">版本: ${manifest.version} | 作者: ${manifest.author}</p>
                      <p class="text-xs text-gray-500 mt-1">安装时间: ${new Date(pluginData.installedAt).toLocaleString()}</p>
                    </div>
                  </div>
                `
              })
              
              // 如果有侧边栏按钮配置，注册按钮
              if (manifest.mountPoints && manifest.mountPoints.includes('navigation-sidebar')) {
                app.registerSidebarButton({
                  id: `${manifest.id}-btn`,
                  title: manifest.name,
                  icon: manifest.icon || 'Package',
                  onClick: () => {
                    console.log(`${manifest.name} 插件按钮被点击`)
                  }
                })
              }
            },
            
            onunload: async (app: any) => {
              console.log(`插件 ${manifest.name} 已卸载`)
              app.unregister(`${manifest.id}-ui`)
              app.unregisterSidebarButton(`${manifest.id}-btn`)
            },
            
            // 必需：插件重置功能
            onReset: async () => {
              console.log(`重置插件 ${manifest.name}`)
              // 重置插件数据为默认值
              const defaultData = {
                installedAt: pluginData.installedAt,
                source: pluginData.source
              }
              
              // 保存默认数据
              if ((window as any).electronAPI) {
                const dataPath = `plugins/${manifest.id}/data.json`
                await (window as any).electronAPI.writeFile(dataPath, JSON.stringify(defaultData, null, 2))
              }
              
              console.log(`插件 ${manifest.name} 已重置为默认设置`)
            }
          }
        }
        
        // 确保插件有设置模式
        if (!manifest.settingsSchema || manifest.settingsSchema.length === 0) {
          manifest.settingsSchema = [
            {
              key: 'enabled',
              name: '启用插件',
              description: '控制插件是否启用',
              type: 'boolean',
              default: true
            }
          ]
        }
        
        // 加载插件
        const success = await pluginManager.loadPlugin(manifest, pluginModule)
        if (success) {
          console.log(`✅ 插件 ${manifest.name} 加载成功`)
        } else {
          console.error(`❌ 插件 ${manifest.name} 加载失败`)
        }
      }
    } catch (error) {
      console.error('加载已安装插件失败:', error)
    }
  }
  
  // 应用主题
  const applyTheme = (themeId: string) => {
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    
    if (themeId === 'auto') {
      // 检测系统主题
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.classList.add(isDark ? 'dark' : 'light')
    } else {
      html.classList.add(themeId)
    }
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
    isResizing,
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
    tabSystemUpdateTrigger,
    
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
    triggerTabSystemUpdate,
    initializeApp,
    applyTheme
  }
})

