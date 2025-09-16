/**
 * 插件系统 - 参考 Obsidian 设计
 * 提供统一的插件 API，支持多种插件类型
 * 插件运行在沙盒化环境中，通过生命周期管理
 */

import type { Component } from 'vue'

// 插件类型定义
export type PluginType = 
  | 'editor'     // 编辑器插件：操作 Markdown 文本
  | 'renderer'   // 渲染插件：修改 Markdown 渲染输出
  | 'theme'      // 主题插件：修改软件的UI主题
  | 'utility'    // 实用工具插件

// 插件清单配置
export interface PluginManifest {
  /** 插件唯一标识 */
  id: string
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description: string
  /** 插件类型 */
  type: PluginType
  /** 插件作者 */
  author: string
  /** 最小应用版本要求 */
  minAppVersion: string
  /** 插件图标 */
  icon?: string
  /** 是否可以注册到侧边栏 */
  canRegisterSidebar?: boolean
  /** 默认是否启用 */
  defaultEnabled?: boolean
  /** 插件权限 */
  permissions?: PluginPermission[]
  /** 插件设置 */
  settings?: PluginSettingSchema[]
}

// 插件权限
export type PluginPermission = 
  | 'filesystem'    // 文件系统访问
  | 'network'       // 网络访问
  | 'clipboard'     // 剪贴板访问
  | 'notification'  // 通知权限
  | 'storage'       // 本地存储权限

// 插件设置配置
export interface PluginSettingSchema {
  key: string
  name: string
  description?: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color'
  default?: any
  options?: Array<{ label: string; value: any }>
  required?: boolean
}

// 插件数据存储
export interface PluginData {
  [key: string]: any
}

// 插件API接口
export interface PluginAPI {
  /** 获取应用版本 */
  getAppVersion(): string
  
  /** 获取插件信息 */
  getPluginInfo(): PluginManifest
  
  /** 获取插件设置 */
  getSettings(): PluginData
  
  /** 更新插件设置 */
  updateSettings(settings: Partial<PluginData>): void
  
  /** 获取插件数据 */
  getData(): PluginData
  
  /** 保存插件数据 */
  saveData(data: PluginData): Promise<void>
  
  /** 注册到侧边栏 */
  registerSidebarButton(button: SidebarButton): void
  
  /** 注册右侧栏面板 */
  registerRightPanel(panel: RightPanel): void
  
  /** 注册命令 */
  registerCommand(command: PluginCommand): void
  
  /** 显示通知 */
  showNotification(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void
  
  /** 显示确认对话框 */
  showConfirm(message: string): Promise<boolean>
  
  /** 日志记录 */
  log(message: string, level?: 'info' | 'warn' | 'error'): void
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

// 插件实例接口
export interface PluginInstance {
  /** 插件加载时调用 */
  onLoad?(): Promise<void> | void
  
  /** 插件卸载时调用 */
  onUnload?(): Promise<void> | void
  
  /** 插件启用时调用 */
  onEnable?(): Promise<void> | void
  
  /** 插件禁用时调用 */
  onDisable?(): Promise<void> | void
  
  /** 设置变更时调用 */
  onSettingsChange?(settings: PluginData): Promise<void> | void
}

// 插件基类
export abstract class Plugin implements PluginInstance {
  protected api: PluginAPI
  protected manifest: PluginManifest
  
  constructor(api: PluginAPI, manifest: PluginManifest) {
    this.api = api
    this.manifest = manifest
  }
  
  // 生命周期方法（子类可以重写）
  async onLoad(): Promise<void> {}
  async onUnload(): Promise<void> {}
  async onEnable(): Promise<void> {}
  async onDisable(): Promise<void> {}
  async onSettingsChange(settings: PluginData): Promise<void> {}
  
  // 便利方法
  protected getSettings(): PluginData {
    return this.api.getSettings()
  }
  
  protected updateSettings(settings: Partial<PluginData>): void {
    this.api.updateSettings(settings)
  }
  
  protected async getData(): Promise<PluginData> {
    return this.api.getData()
  }
  
  protected async saveData(data: PluginData): Promise<void> {
    await this.api.saveData(data)
  }
  
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    this.api.log(`[${this.manifest.name}] ${message}`, level)
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
   * 加载插件
   */
  async loadPlugin(manifest: PluginManifest, pluginClass: new (api: PluginAPI, manifest: PluginManifest) => Plugin): Promise<boolean> {
    try {
      if (this.plugins.has(manifest.id)) {
        throw new Error(`插件 ${manifest.id} 已经加载`)
      }
      
      // 创建插件状态
      const pluginState: PluginState = {
        manifest,
        enabled: manifest.defaultEnabled ?? true,
        loaded: false,
        settings: this.loadPluginSettings(manifest.id),
        data: await this.loadPluginData(manifest.id)
      }
      
      // 创建插件API
      const api = this.createPluginAPI(manifest.id)
      
      // 创建插件实例
      const instance = new pluginClass(api, manifest)
      pluginState.instance = instance
      
      // 调用加载生命周期
      await instance.onLoad?.()
      
      pluginState.loaded = true
      this.plugins.set(manifest.id, pluginState)
      
      // 如果默认启用，则启用插件
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
      
      // 调用卸载生命周期
      await pluginState.instance?.onUnload?.()
      
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
      await pluginState.instance?.onEnable?.()
      pluginState.enabled = true
      
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
      await pluginState.instance?.onSettingsChange?.(newSettings)
      
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
      
      getSettings: () => {
        const plugin = this.plugins.get(pluginId)
        return plugin?.settings || {}
      },
      
      updateSettings: (settings: Partial<PluginData>) => {
        this.updatePluginSettings(pluginId, settings)
      },
      
      getData: () => {
        const plugin = this.plugins.get(pluginId)
        return plugin?.data || {}
      },
      
      saveData: async (data: PluginData) => {
        const plugin = this.plugins.get(pluginId)
        if (plugin) {
          plugin.data = data
          await this.savePluginData(pluginId, data)
        }
      },
      
      registerSidebarButton: (button: SidebarButton) => {
        this.registeredSidebarButtons.set(`${pluginId}:${button.id}`, button)
      },
      
      registerRightPanel: (panel: RightPanel) => {
        this.registeredRightPanels.set(`${pluginId}:${panel.id}`, panel)
      },
      
      registerCommand: (command: PluginCommand) => {
        this.registeredCommands.set(`${pluginId}:${command.id}`, command)
      },
      
      showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        // 这里可以集成通知系统
        console.log(`[通知] ${message}`)
      },
      
      showConfirm: async (message: string) => {
        return confirm(message)
      },
      
      log: (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
        console[level](`[插件-${pluginId}] ${message}`)
      }
    }
  }
  
  private cleanupPluginRegistrations(pluginId: string): void {
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
        const data = await window.electronAPI.readFile(dataPath)
        return JSON.parse(data)
      }
    } catch {
      // 文件不存在或读取失败，返回空对象
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
    return Array.from(this.registeredSidebarButtons.values())
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


