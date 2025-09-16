/**
 * Memory Note 插件系统
 * 参考 Obsidian 设计理念，结合应用特定需求
 * 支持多种挂载点和生命周期管理
 */

import type { Component } from 'vue'

// 插件类型定义
export type PluginType = 
  | 'editor'     // 编辑器插件：操作 Markdown 文本、编辑器增强
  | 'renderer'   // 渲染插件：修改 Markdown 渲染输出
  | 'theme'      // 主题插件：修改软件的UI主题
  | 'utility'    // 实用工具插件：通用功能扩展
  | 'workflow'   // 工作流插件：自动化任务和流程
  | 'integration' // 集成插件：第三方服务集成

// 插件挂载点（基于应用实际结构）
export type PluginMountPoint = 
  | 'navigation-sidebar'    // 左侧导航栏（60px宽度区域）
  | 'file-tree-sidebar'     // 文件树侧边栏
  | 'right-sidebar'         // 右侧边栏（大纲、插件等）
  | 'editor-toolbar'        // 编辑器工具栏
  | 'editor-enhance'        // 编辑器增强区域
  | 'status-bar'           // 底部状态栏
  | 'title-bar'            // 顶部标题栏
  | 'tab-panel'            // 标签面板区域
  | 'modal-overlay'        // 模态覆盖层
  | 'context-menu'         // 右键菜单
  | 'command-palette'      // 命令面板

// 插件清单配置（遵循规范）
export interface PluginManifest {
  /** 插件唯一标识 */
  id: string
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件作者 */
  author: string
  /** 插件描述（必需，不能为空） */
  description: string
  /** 入口文件（必须为 index.js） */
  entry: 'index.js'
  /** 是否提供设置界面（必须为 true） */
  settings: true
  /** 插件类型 */
  type?: PluginType
  /** 支持的挂载点 */
  mountPoints: PluginMountPoint[]
  /** 侧边栏按钮配置 */
  sidebarButtons?: SidebarButtonConfig[]
  /** 插件图标 */
  icon?: string
  /** 最小应用版本要求 */
  minAppVersion?: string
  /** 默认是否启用 */
  defaultEnabled?: boolean
  /** 插件权限 */
  permissions?: PluginPermission[]
  /** 插件设置模式配置 */
  settingsSchema?: PluginSettingSchema[]
}

// 插件权限
export type PluginPermission = 
  | 'filesystem'    // 文件系统访问
  | 'network'       // 网络访问
  | 'clipboard'     // 剪贴板访问
  | 'notification'  // 通知权限
  | 'storage'       // 本地存储权限
  | 'ui'           // UI操作权限
  | 'editor'       // 编辑器操作权限
  | 'workspace'    // 工作区操作权限

// 侧边栏按钮配置（规范要求）
export interface SidebarButtonConfig {
  id: string
  label: string
  defaultVisible: boolean
}

// 插件设置配置
export interface PluginSettingSchema {
  key: string
  name: string
  description?: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'time' | 'file' | 'range'
  default?: any
  options?: Array<{ label: string; value: any }>
  required?: boolean
  min?: number
  max?: number
  step?: number
  placeholder?: string
  condition?: string  // 依赖其他设置项
}

// 插件挂载组件配置
export interface PluginMountConfig {
  id: string
  mountPoint: PluginMountPoint
  render: (container: HTMLElement) => void | Promise<void>
  cleanup?: () => void
}

// 插件数据存储
export interface PluginData {
  [key: string]: any
}

// 插件API接口（遵循规范的宿主API）
export interface PluginAPI {
  /** 获取应用版本 */
  getAppVersion(): string
  
  /** 获取插件信息 */
  getPluginInfo(): PluginManifest
  
  // 数据存储API（规范要求）
  /** 读取插件数据（从 data.json） */
  loadData(pluginId: string): Promise<PluginData>
  
  /** 保存插件数据（到 data.json） */
  saveData(pluginId: string, data: PluginData): Promise<void>
  
  // UI 挂载API（规范要求）
  /** 注册UI挂载点 */
  registerMount(mountPoint: PluginMountPoint, config: PluginMountConfig): void
  
  /** 取消注册挂载点 */
  unregister(id: string): void
  
  // 侧边栏按钮API（规范要求）
  /** 注册侧边栏按钮 */
  registerSidebarButton(config: { id: string; icon: string; onClick: () => void }): void
  
  /** 取消注册侧边栏按钮 */
  unregisterSidebarButton(id: string): void
  
  // 设置页面API（规范要求）
  /** 注册设置页面 */
  registerSettingsPage(pluginId: string, renderFn: (container: HTMLElement) => void): void
  
  // 扩展API
  /** 注册右侧栏面板 */
  registerRightPanel(panel: RightPanel): void
  
  /** 注册命令 */
  registerCommand(command: PluginCommand): void
  
  /** 注册右键菜单项 */
  registerContextMenuItem(item: ContextMenuItem): void
  
  /** 显示通知 */
  showNotification(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void
  
  /** 显示确认对话框 */
  showConfirm(message: string): Promise<boolean>
  
  /** 打开模态窗口 */
  showModal(title: string, content: string | HTMLElement): Promise<any>
  
  /** 日志记录 */
  log(message: string, level?: 'info' | 'warn' | 'error'): void
  
  // 编辑器API
  /** 获取活动编辑器 */
  getActiveEditor(): EditorInstance | null
  
  /** 注册编辑器命令 */
  registerEditorCommand(command: EditorCommand): void
  
  // 工作区API
  /** 获取工作区信息 */
  getWorkspace(): WorkspaceInfo
  
  /** 监听工作区事件 */
  onWorkspaceEvent(event: string, callback: Function): () => void
}

// 侧边栏按钮配置
export interface SidebarButton {
  id: string
  title: string
  icon: string | Component
  onClick: () => void
  tooltip?: string
}

// 右侧栏面板配置
export interface RightPanel {
  id: string
  title: string
  icon: string | Component
  component: Component
  props?: Record<string, any>
}

// 插件命令
export interface PluginCommand {
  id: string
  name: string
  callback: () => void | Promise<void>
  hotkey?: string
}

// 右键菜单项
export interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  action: () => void
  condition?: () => boolean
  separator?: boolean
}

// 编辑器实例接口
export interface EditorInstance {
  getValue(): string
  setValue(value: string): void
  getSelection(): string
  replaceSelection(text: string): void
  getCursor(): { line: number; ch: number }
  setCursor(pos: { line: number; ch: number }): void
  focus(): void
}

// 编辑器命令
export interface EditorCommand {
  id: string
  name: string
  callback: (editor: EditorInstance) => void | Promise<void>
  hotkey?: string
}

// 工作区信息
export interface WorkspaceInfo {
  activeFile: string | null
  openFiles: string[]
  workingDirectory: string
}

// 插件状态
export interface PluginState {
  manifest: PluginManifest
  enabled: boolean
  loaded: boolean
  instance?: PluginInstance
  settings: PluginData
  data: PluginData
  error?: string
}

// 插件实例接口（遵循规范的生命周期）
export interface PluginInstance {
  /** 插件加载时调用（规范要求，接收app和data参数） */
  onload(app: PluginAPI, data: PluginData): void | Promise<void>
  
  /** 插件卸载时调用（规范要求） */
  onunload(app: PluginAPI): void | Promise<void>
  
  /** 插件重置功能（必需，用于恢复默认设置） */
  onReset(): Promise<void> | void
  
  // 扩展生命周期（参考Obsidian）
  /** 插件启用时调用 */
  onEnable?(): Promise<void> | void
  
  /** 插件禁用时调用 */
  onDisable?(): Promise<void> | void
  
  /** 设置变更时调用 */
  onSettingsChange?(key: string, value: any): Promise<void> | void
  
  /** 工作区准备就绪时调用 */
  onLayoutReady?(): Promise<void> | void
  
  /** 文件打开时调用 */
  onFileOpen?(file: string): Promise<void> | void
  
  /** 文件保存时调用 */
  onFileSave?(file: string): Promise<void> | void
  
  /** 编辑器切换时调用 */
  onActiveEditorChange?(editor: EditorInstance | null): Promise<void> | void
}

// 插件基类（可选，为了向后兼容）
export abstract class Plugin implements PluginInstance {
  protected api: PluginAPI
  protected manifest: PluginManifest
  protected data: PluginData
  
  constructor(api: PluginAPI, manifest: PluginManifest) {
    this.api = api
    this.manifest = manifest
    this.data = {}
  }
  
  // 实现规范要求的生命周期方法
  abstract onload(app: PluginAPI, data: PluginData): void | Promise<void>
  abstract onunload(app: PluginAPI): void | Promise<void>
  abstract onReset(): void | Promise<void>
  
  // 可选的扩展生命周期方法
  async onEnable(): Promise<void> {}
  async onDisable(): Promise<void> {}
  async onSettingsChange(key: string, value: any): Promise<void> {}
  async onLayoutReady(): Promise<void> {}
  async onFileOpen(file: string): Promise<void> {}
  async onFileSave(file: string): Promise<void> {}
  async onActiveEditorChange(editor: EditorInstance | null): Promise<void> {}
  
  // 便利方法
  protected async loadData(): Promise<PluginData> {
    this.data = await this.api.loadData(this.manifest.id)
    return this.data
  }
  
  protected async saveData(data: PluginData): Promise<void> {
    this.data = { ...this.data, ...data }
    await this.api.saveData(this.manifest.id, this.data)
  }
  
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    this.api.log(`[${this.manifest.name}] ${message}`, level)
  }
  
  protected registerMount(mountPoint: PluginMountPoint, config: Omit<PluginMountConfig, 'mountPoint'>): void {
    this.api.registerMount(mountPoint, { ...config, mountPoint })
  }
  
  protected registerSidebarButton(config: { id: string; icon: string; onClick: () => void }): void {
    this.api.registerSidebarButton(config)
  }
  
  protected registerSettingsPage(renderFn: (container: HTMLElement) => void): void {
    this.api.registerSettingsPage(this.manifest.id, renderFn)
  }
}

// 插件事件
export interface PluginEvent {
  type: 'loaded' | 'unloaded' | 'enabled' | 'disabled' | 'error'
  pluginId: string
  error?: string
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins = new Map<string, PluginState>()
  private eventListeners: ((event: PluginEvent) => void)[] = []
  private registeredSidebarButtons = new Map<string, SidebarButton>()
  private registeredRightPanels = new Map<string, RightPanel>()
  private registeredCommands = new Map<string, PluginCommand>()
  
  /**
   * 加载插件（支持规范格式）
   */
  async loadPlugin(manifest: PluginManifest, pluginModule: any): Promise<boolean> {
    try {
      // 验证插件规范
      this.validatePluginManifest(manifest)
      
      if (this.plugins.has(manifest.id)) {
        throw new Error(`插件 ${manifest.id} 已经加载`)
      }
      
      // 加载插件数据
      const pluginData = await this.loadPluginData(manifest.id)
      
      // 创建插件状态
      const pluginState: PluginState = {
        manifest,
        enabled: this.loadPluginState(manifest.id, manifest), // 传入manifest
        loaded: false,
        settings: this.loadPluginSettings(manifest.id),
        data: pluginData
      }
      
      // 创建插件API
      const api = this.createPluginAPI(manifest.id)
      
      // 创建插件实例
      let instance: PluginInstance
      
      if (typeof pluginModule === 'function') {
        // 基于类的插件
        instance = new pluginModule(api, manifest)
      } else if (typeof pluginModule === 'object' && pluginModule.onload) {
        // 基于对象的插件（符合规范）
        instance = pluginModule
      } else {
        throw new Error('插件格式不正确，必须导出包含 onload 方法的对象')
      }
      
      // 验证插件必须实现重置功能
      if (!instance.onReset || typeof instance.onReset !== 'function') {
        throw new Error('插件必须实现 onReset 方法，用于重置功能')
      }
      
      pluginState.instance = instance
      pluginState.loaded = true
      this.plugins.set(manifest.id, pluginState)
      
      // 如果插件应该启用，则启用插件（这会调用onload）
      if (pluginState.enabled) {
        await this.enablePlugin(manifest.id)
      }
      
      this.emitEvent({
        type: 'loaded',
        pluginId: manifest.id
      })
      
      return true
    } catch (error) {
      console.error(`加载插件 ${manifest.id} 失败:`, error)
      
      // 保存错误状态
      this.plugins.set(manifest.id, {
        manifest,
        enabled: false,
        loaded: false,
        settings: {},
        data: {},
        error: error instanceof Error ? error.message : '未知错误'
      })
      
      this.emitEvent({
        type: 'error',
        pluginId: manifest.id,
        error: error instanceof Error ? error.message : '未知错误'
      })
      
      return false
    }
  }
  
  /**
   * 验证插件清单是否符合规范
   */
  private validatePluginManifest(manifest: PluginManifest): void {
    // 检查必需字段
    const requiredFields = ['id', 'name', 'version', 'author', 'description', 'entry', 'settings', 'mountPoints']
    for (const field of requiredFields) {
      if (!manifest[field as keyof PluginManifest]) {
        throw new Error(`插件清单缺少必需字段: ${field}`)
      }
    }
    
    // 检查描述不能为空
    if (!manifest.description.trim()) {
      throw new Error('插件描述不能为空')
    }
    
    // 检查入口文件必须为 index.js
    if (manifest.entry !== 'index.js') {
      throw new Error('入口文件必须为 index.js')
    }
    
    // 检查必须提供设置界面
    if (manifest.settings !== true) {
      throw new Error('插件必须提供设置界面 (settings: true)')
    }
    
    // 验证挂载点
    const validMountPoints: PluginMountPoint[] = [
      'navigation-sidebar', 'file-tree-sidebar', 'right-sidebar',
      'editor-toolbar', 'editor-enhance', 'status-bar', 'title-bar',
      'tab-panel', 'modal-overlay', 'context-menu', 'command-palette'
    ]
    
    for (const mountPoint of manifest.mountPoints) {
      if (!validMountPoints.includes(mountPoint)) {
        throw new Error(`无效的挂载点: ${mountPoint}`)
      }
    }
  }
  
  /**
   * 卸载插件
   */
  async unloadPlugin(pluginId: string): Promise<boolean> {
    const pluginState = this.plugins.get(pluginId)
    if (!pluginState) return false
    
    try {
      // 如果插件已启用，先禁用
      if (pluginState.enabled) {
        await this.disablePlugin(pluginId)
      }
      
      // 调用规范要求的卸载生命周期
      await pluginState.instance?.onunload(this.createPluginAPI(pluginId))
      
      // 清理注册的组件
      this.cleanupPluginRegistrations(pluginId)
      
      // 移除插件
      this.plugins.delete(pluginId)
      
      this.emitEvent({
        type: 'unloaded',
        pluginId
      })
      
      return true
    } catch (error) {
      console.error(`卸载插件 ${pluginId} 失败:`, error)
      return false
    }
  }
  
  /**
   * 启用插件
   */
  async enablePlugin(pluginId: string): Promise<boolean> {
    const pluginState = this.plugins.get(pluginId)
    if (!pluginState || !pluginState.loaded || pluginState.enabled) return false
    
    try {
      // 重新调用插件的 onload 方法来重新注册组件
      if (pluginState.instance) {
        const api = this.createPluginAPI(pluginId)
        await pluginState.instance.onload(api, pluginState.data)
      }
      
      await pluginState.instance?.onEnable?.()
      pluginState.enabled = true
      
      // 保存插件状态
      await this.savePluginState(pluginId, true)
      
      this.emitEvent({
        type: 'enabled',
        pluginId
      })
      
      return true
    } catch (error) {
      console.error(`启用插件 ${pluginId} 失败:`, error)
      return false
    }
  }
  
  /**
   * 禁用插件
   */
  async disablePlugin(pluginId: string): Promise<boolean> {
    const pluginState = this.plugins.get(pluginId)
    if (!pluginState || !pluginState.enabled) return false
    
    try {
      await pluginState.instance?.onDisable?.()
      pluginState.enabled = false
      
      // 清理注册的组件
      this.cleanupPluginRegistrations(pluginId)
      
      // 保存插件状态
      await this.savePluginState(pluginId, false)
      
      this.emitEvent({
        type: 'disabled',
        pluginId
      })
      
      return true
    } catch (error) {
      console.error(`禁用插件 ${pluginId} 失败:`, error)
      return false
    }
  }
  
  /**
   * 获取插件状态
   */
  getPlugin(pluginId: string): PluginState | undefined {
    return this.plugins.get(pluginId)
  }
  
  /**
   * 获取所有插件
   */
  getAllPlugins(): PluginState[] {
    return Array.from(this.plugins.values())
  }
  
  /**
   * 获取已启用的插件
   */
  getEnabledPlugins(): PluginState[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled)
  }
  
  /**
   * 更新插件设置
   */
  async updatePluginSettings(pluginId: string, settings: Partial<PluginData>): Promise<boolean> {
    const pluginState = this.plugins.get(pluginId)
    if (!pluginState) return false
    
    try {
      const newSettings = { ...pluginState.settings, ...settings }
      pluginState.settings = newSettings
      
      // 保存设置
      await this.savePluginSettings(pluginId, newSettings)
      
      // 通知插件设置变更
      for (const [key, value] of Object.entries(settings)) {
        await pluginState.instance?.onSettingsChange?.(key, value)
      }
      
      return true
    } catch (error) {
      console.error(`更新插件 ${pluginId} 设置失败:`, error)
      return false
    }
  }
  
  /**
   * 获取注册的侧边栏按钮
   */
  getRegisteredSidebarButtons(): SidebarButton[] {
    return Array.from(this.registeredSidebarButtons.values())
  }
  
  /**
   * 获取注册的右侧栏面板
   */
  getRegisteredRightPanels(): RightPanel[] {
    return Array.from(this.registeredRightPanels.values())
  }
  
  /**
   * 获取注册的命令
   */
  getRegisteredCommands(): PluginCommand[] {
    return Array.from(this.registeredCommands.values())
  }
  
  /**
   * 监听插件事件
   */
  onPluginEvent(listener: (event: PluginEvent) => void): () => void {
    this.eventListeners.push(listener)
    
    return () => {
      const index = this.eventListeners.indexOf(listener)
      if (index > -1) {
        this.eventListeners.splice(index, 1)
      }
    }
  }
  
  /**
   * 清理所有插件
   */
  async cleanup(): Promise<void> {
    const pluginIds = Array.from(this.plugins.keys())
    
    for (const pluginId of pluginIds) {
      await this.unloadPlugin(pluginId)
    }
    
    this.plugins.clear()
    this.eventListeners.length = 0
    this.registeredSidebarButtons.clear()
    this.registeredRightPanels.clear()
    this.registeredCommands.clear()
  }
  
  // 私有方法
  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      getAppVersion: () => '1.0.0', // 从应用配置获取
      
      getPluginInfo: () => {
        const plugin = this.plugins.get(pluginId)
        if (!plugin) throw new Error(`插件 ${pluginId} 不存在`)
        return plugin.manifest
      },
      
      // 规范要求的数据存储API
      loadData: async (id: string) => {
        return await this.loadPluginData(id)
      },
      
      saveData: async (id: string, data: PluginData) => {
        const plugin = this.plugins.get(id)
        if (plugin) {
          plugin.data = data
          await this.savePluginData(id, data)
        }
      },
      
      // 规范要求的UI挂载API
      registerMount: (mountPoint: PluginMountPoint, config: PluginMountConfig) => {
        this.registerPluginMount(pluginId, mountPoint, config)
      },
      
      unregister: (id: string) => {
        this.unregisterPluginMount(pluginId, id)
      },
      
      // 规范要求的侧边栏按钮API
      registerSidebarButton: (config: { id: string; icon: string; title?: string; onClick: () => void }) => {
        const button: SidebarButton = {
          id: config.id,
          title: config.title || config.id,
          icon: config.icon,
          onClick: config.onClick
        }
        this.registeredSidebarButtons.set(`${pluginId}:${config.id}`, button)
        console.log(`🔌 插件 ${pluginId} 注册侧边栏按钮: ${button.title}`)
      },
      
      unregisterSidebarButton: (id: string) => {
        this.registeredSidebarButtons.delete(`${pluginId}:${id}`)
      },
      
      // 规范要求的设置页面API
      registerSettingsPage: (id: string, renderFn: (container: HTMLElement) => void) => {
        this.registerPluginSettingsPage(id, renderFn)
      },
      
      // 扩展API
      registerRightPanel: (panel: RightPanel) => {
        this.registeredRightPanels.set(`${pluginId}:${panel.id}`, panel)
      },
      
      registerCommand: (command: PluginCommand) => {
        this.registeredCommands.set(`${pluginId}:${command.id}`, command)
      },
      
      registerContextMenuItem: (item: ContextMenuItem) => {
        // TODO: 实现右键菜单注册
        console.log('注册右键菜单项:', item)
      },
      
      showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        // 集成通知系统
        console.log(`[${type.toUpperCase()}] ${message}`)
      },
      
      showConfirm: async (message: string) => {
        return confirm(message)
      },
      
      showModal: async (title: string, content: string | HTMLElement) => {
        // TODO: 实现模态窗口
        console.log('显示模态窗口:', title)
        return Promise.resolve()
      },
      
      log: (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
        console[level](`[插件-${pluginId}] ${message}`)
      },
      
      // 编辑器API
      getActiveEditor: () => {
        // TODO: 获取活动编辑器实例
        return null
      },
      
      registerEditorCommand: (command: EditorCommand) => {
        // TODO: 注册编辑器命令
        console.log('注册编辑器命令:', command)
      },
      
      // 工作区API
      getWorkspace: () => {
        return {
          activeFile: null,
          openFiles: [],
          workingDirectory: ''
        }
      },
      
      onWorkspaceEvent: (event: string, callback: Function) => {
        // TODO: 实现工作区事件监听
        console.log('监听工作区事件:', event)
        return () => {}
      }
    }
  }
  
  // 插件挂载管理
  private pluginMounts = new Map<string, Map<string, PluginMountConfig>>()
  private pluginSettingsPages = new Map<string, (container: HTMLElement) => void>()
  
  private registerPluginMount(pluginId: string, mountPoint: PluginMountPoint, config: PluginMountConfig): void {
    if (!this.pluginMounts.has(pluginId)) {
      this.pluginMounts.set(pluginId, new Map())
    }
    
    const pluginMountMap = this.pluginMounts.get(pluginId)!
    pluginMountMap.set(config.id, config)
    
    // TODO: 实际挂载到UI中
    console.log(`插件 ${pluginId} 注册挂载点 ${mountPoint}:`, config.id)
  }
  
  private unregisterPluginMount(pluginId: string, mountId: string): void {
    const pluginMountMap = this.pluginMounts.get(pluginId)
    if (pluginMountMap) {
      const config = pluginMountMap.get(mountId)
      if (config) {
        config.cleanup?.()
        pluginMountMap.delete(mountId)
      }
    }
  }
  
  private registerPluginSettingsPage(pluginId: string, renderFn: (container: HTMLElement) => void): void {
    this.pluginSettingsPages.set(pluginId, renderFn)
  }
  
  /**
   * 获取插件设置页面渲染函数
   */
  getPluginSettingsPage(pluginId: string): ((container: HTMLElement) => void) | undefined {
    return this.pluginSettingsPages.get(pluginId)
  }
  
  /**
   * 重置插件
   */
  async resetPlugin(pluginId: string): Promise<boolean> {
    const pluginState = this.plugins.get(pluginId)
    if (!pluginState || !pluginState.instance) return false
    
    try {
      // 调用插件的重置方法
      await pluginState.instance.onReset()
      
      // 重置插件设置
      pluginState.settings = {}
      await this.savePluginSettings(pluginId, {})
      
      // 重置插件数据
      pluginState.data = {}
      await this.savePluginData(pluginId, {})
      
      console.log(`🔄 插件 ${pluginId} 已重置`)
      return true
    } catch (error) {
      console.error(`重置插件 ${pluginId} 失败:`, error)
      return false
    }
  }
  
  private cleanupPluginRegistrations(pluginId: string): void {
    // 清理挂载点
    const pluginMountMap = this.pluginMounts.get(pluginId)
    if (pluginMountMap) {
      for (const [mountId, config] of pluginMountMap) {
        config.cleanup?.()
      }
      this.pluginMounts.delete(pluginId)
    }
    
    // 清理设置页面
    this.pluginSettingsPages.delete(pluginId)
    
    // 清理侧边栏按钮
    for (const [key] of this.registeredSidebarButtons) {
      if (key.startsWith(`${pluginId}:`)) {
        this.registeredSidebarButtons.delete(key)
      }
    }
    
    // 清理右侧栏面板
    for (const [key] of this.registeredRightPanels) {
      if (key.startsWith(`${pluginId}:`)) {
        this.registeredRightPanels.delete(key)
      }
    }
    
    // 清理命令
    for (const [key] of this.registeredCommands) {
      if (key.startsWith(`${pluginId}:`)) {
        this.registeredCommands.delete(key)
      }
    }
  }
  
  private loadPluginSettings(pluginId: string): PluginData {
    // 从localStorage或文件加载设置
    try {
      const stored = localStorage.getItem(`plugin_settings_${pluginId}`)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }
  
  private async savePluginSettings(pluginId: string, settings: PluginData): Promise<void> {
    // 保存设置到localStorage或文件
    try {
      localStorage.setItem(`plugin_settings_${pluginId}`, JSON.stringify(settings))
    } catch (error) {
      console.error(`保存插件 ${pluginId} 设置失败:`, error)
    }
  }
  
  private async loadPluginData(pluginId: string): Promise<PluginData> {
    // 从文件加载插件数据
    try {
      if (window.electronAPI) {
        const dataPath = `plugins/${pluginId}/data.json`
        const result = await window.electronAPI.readFile(dataPath)
        // 处理可能的错误响应格式
        if (typeof result === 'string') {
          return JSON.parse(result)
        } else if (result && typeof result === 'object' && 'success' in result) {
          if ((result as any).success && (result as any).data) {
            return JSON.parse((result as any).data)
          }
        }
      }
    } catch (error) {
      console.warn(`加载插件 ${pluginId} 数据失败:`, error)
    }
    return {}
  }
  
  private async savePluginData(pluginId: string, data: PluginData): Promise<void> {
    // 保存插件数据到文件
    try {
      if (window.electronAPI) {
        const dataPath = `plugins/${pluginId}/data.json`
        await window.electronAPI.writeFile(dataPath, JSON.stringify(data, null, 2))
      }
    } catch (error) {
      console.error(`保存插件 ${pluginId} 数据失败:`, error)
    }
  }

  /**
   * 保存插件启用状态
   */
  private async savePluginState(pluginId: string, enabled: boolean): Promise<void> {
    try {
      const pluginStates = JSON.parse(localStorage.getItem('plugin_states') || '{}')
      pluginStates[pluginId] = enabled
      localStorage.setItem('plugin_states', JSON.stringify(pluginStates))
      console.log(`💾 插件 ${pluginId} 状态已保存: ${enabled ? '启用' : '禁用'}`)
    } catch (error) {
      console.error(`保存插件状态失败 ${pluginId}:`, error)
    }
  }

  /**
   * 加载插件启用状态
   */
  private loadPluginState(pluginId: string, manifest?: PluginManifest): boolean {
    try {
      const pluginStates = JSON.parse(localStorage.getItem('plugin_states') || '{}')
      // 如果有保存的状态，使用保存的状态
      if (pluginStates.hasOwnProperty(pluginId)) {
        return pluginStates[pluginId]
      }
      
      // 如果没有保存状态，使用manifest的defaultEnabled
      return manifest?.defaultEnabled ?? false // 默认禁用
    } catch (error) {
      console.error(`加载插件状态失败 ${pluginId}:`, error)
      return false // 默认禁用
    }
  }
  
  private emitEvent(event: PluginEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('插件事件监听器执行错误:', error)
      }
    })
  }

  /**
   * 获取所有侧边栏按钮
   */
  getAllSidebarButtons(): SidebarButton[] {
    const enabledButtons: SidebarButton[] = []
    
    for (const [key, button] of this.registeredSidebarButtons) {
      const pluginId = key.split(':')[0]
      const plugin = this.plugins.get(pluginId)
      
      // 只返回已启用插件的按钮
      if (plugin && plugin.enabled && plugin.loaded) {
        enabledButtons.push(button)
      }
    }
    
    return enabledButtons
  }

  /**
   * 获取所有右侧面板
   */
  getAllRightPanels(): RightPanel[] {
    return Array.from(this.registeredRightPanels.values())
  }

  /**
   * 获取插件状态
   */
  getPluginState(pluginId: string): PluginState | undefined {
    return this.plugins.get(pluginId)
  }
}

// 创建全局插件管理器实例
export const pluginManager = new PluginManager()


