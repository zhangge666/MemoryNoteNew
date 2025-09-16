/**
 * 多分区标签系统（Tab & Panel System）
 * 支持标签可拖拽、分屏（左、右、上下分区）
 * 统一生命周期：打开 → 激活 → 修改 → 保存 → 关闭
 */

import type { EditorInput } from './EditorInput'

export type PanelDirection = 'horizontal' | 'vertical'
export type PanelPosition = 'left' | 'right' | 'top' | 'bottom'

export interface TabInfo {
  /** 标签ID */
  id: string
  /** EditorInput */
  input: EditorInput
  /** 是否激活 */
  active: boolean
  /** 标签在面板中的索引 */
  index: number
}

export interface PanelInfo {
  /** 面板ID */
  id: string
  /** 面板中的标签列表 */
  tabs: TabInfo[]
  /** 当前激活的标签ID */
  activeTabId?: string
  /** 面板方向 */
  direction: PanelDirection
  /** 面板大小比例 */
  size: number
  /** 最小尺寸 */
  minSize: number
  /** 最大尺寸 */
  maxSize: number
}

export interface SplitOptions {
  /** 分割方向 */
  direction: PanelDirection
  /** 新面板的大小比例 */
  size?: number
  /** 要移动到新面板的标签 */
  tabToMove?: TabInfo
}

export interface TabChangeEvent {
  type: 'opened' | 'closed' | 'activated' | 'moved' | 'title-changed'
  tabId: string
  panelId: string
  input?: EditorInput
}

export interface PanelChangeEvent {
  type: 'created' | 'removed' | 'resized' | 'split'
  panelId: string
  direction?: PanelDirection
  size?: number
}

/**
 * 标签面板系统类
 */
export class TabPanelSystem {
  private panels = new Map<string, PanelInfo>()
  private tabs = new Map<string, TabInfo>()
  private tabChangeListeners: ((event: TabChangeEvent) => void)[] = []
  private panelChangeListeners: ((event: PanelChangeEvent) => void)[] = []
  private currentPanelId?: string

  constructor() {
    // 创建默认主面板
    this.createPanel('main', 'horizontal', 1.0)
    this.currentPanelId = 'main'
  }

  /**
   * 创建新面板
   */
  createPanel(
    id: string,
    direction: PanelDirection = 'horizontal',
    size: number = 0.5,
    minSize: number = 0.1,
    maxSize: number = 0.9
  ): PanelInfo {
    const panel: PanelInfo = {
      id,
      tabs: [],
      direction,
      size: Math.max(minSize, Math.min(maxSize, size)),
      minSize,
      maxSize
    }

    this.panels.set(id, panel)
    
    this.emitPanelChange({
      type: 'created',
      panelId: id,
      direction,
      size
    })

    return panel
  }

  /**
   * 移除面板
   */
  removePanel(panelId: string): boolean {
    const panel = this.panels.get(panelId)
    if (!panel || panelId === 'main') return false // 主面板不能移除

    // 关闭面板中的所有标签
    const tabsToClose = [...panel.tabs]
    for (const tab of tabsToClose) {
      this.closeTab(tab.id)
    }

    this.panels.delete(panelId)
    
    // 如果当前面板被移除，切换到主面板
    if (this.currentPanelId === panelId) {
      this.currentPanelId = 'main'
    }

    this.emitPanelChange({
      type: 'removed',
      panelId
    })

    return true
  }

  /**
   * 分割面板
   */
  splitPanel(panelId: string, options: SplitOptions): string | null {
    const sourcePanel = this.panels.get(panelId)
    if (!sourcePanel) return null

    // 创建新面板ID
    const newPanelId = this.generatePanelId()
    
    // 调整源面板大小
    const newSize = options.size ?? 0.5
    sourcePanel.size = 1 - newSize

    // 创建新面板
    const newPanel = this.createPanel(
      newPanelId,
      options.direction,
      newSize
    )

    // 如果指定了要移动的标签，移动到新面板
    if (options.tabToMove) {
      this.moveTabToPanel(options.tabToMove.id, newPanelId)
    }

    this.emitPanelChange({
      type: 'split',
      panelId: newPanelId,
      direction: options.direction,
      size: newSize
    })

    return newPanelId
  }

  /**
   * 调整面板大小
   */
  resizePanel(panelId: string, size: number): boolean {
    const panel = this.panels.get(panelId)
    if (!panel) return false

    panel.size = Math.max(panel.minSize, Math.min(panel.maxSize, size))
    
    this.emitPanelChange({
      type: 'resized',
      panelId,
      size: panel.size
    })

    return true
  }

  /**
   * 打开新标签
   */
  openTab(input: EditorInput, panelId?: string): TabInfo {
    const targetPanelId = panelId || this.currentPanelId || 'main'
    const panel = this.panels.get(targetPanelId)
    
    if (!panel) {
      throw new Error(`面板 ${targetPanelId} 不存在`)
    }

    // 检查是否已经存在相同的标签
    const existingTab = this.findTabByInput(input)
    if (existingTab) {
      this.activateTab(existingTab.id)
      return existingTab
    }

    // 创建新标签
    const tab: TabInfo = {
      id: this.generateTabId(),
      input,
      active: false,
      index: panel.tabs.length
    }

    // 添加到面板和全局映射，创建新数组引用确保Vue检测到变化
    panel.tabs = [...panel.tabs, tab]
    this.tabs.set(tab.id, tab)

    // 激活新标签
    this.activateTab(tab.id)

    // 调用input的生命周期方法
    input.onActivated()

    this.emitTabChange({
      type: 'opened',
      tabId: tab.id,
      panelId: targetPanelId,
      input
    })

    return tab
  }

  /**
   * 关闭标签
   */
  async closeTab(tabId: string): Promise<boolean> {
    const tab = this.tabs.get(tabId)
    if (!tab) return false

    // 调用input的beforeClose方法
    const canClose = await tab.input.beforeClose()
    if (!canClose) return false

    // 找到包含此标签的面板
    const panel = this.findPanelByTabId(tabId)
    if (!panel) return false

    // 从面板中移除标签
    const tabIndex = panel.tabs.findIndex(t => t.id === tabId)
    if (tabIndex === -1) return false

    // 创建新的tabs数组，确保Vue能检测到变化
    const newTabs = panel.tabs.filter(t => t.id !== tabId)
    
    // 重新计算索引
    newTabs.forEach((t, index) => {
      t.index = index
    })
    
    // 替换整个数组引用
    panel.tabs = newTabs

    // 如果关闭的是激活标签，激活其他标签
    if (panel.activeTabId === tabId) {
      if (panel.tabs.length > 0) {
        // 激活相邻的标签
        const newActiveIndex = Math.min(tabIndex, panel.tabs.length - 1)
        panel.activeTabId = panel.tabs[newActiveIndex].id
        
        // 通知标签激活事件
        this.emitTabChange({
          type: 'activated',
          tabId: panel.activeTabId,
          panelId: panel.id
        })
      } else {
        panel.activeTabId = undefined
      }
    }

    // 从全局映射中移除
    this.tabs.delete(tabId)

    // 调用input的生命周期方法
    tab.input.onClosed()

    this.emitTabChange({
      type: 'closed',
      tabId,
      panelId: panel.id,
      input: tab.input
    })

    // 如果面板为空且不是主面板，移除面板
    if (panel.tabs.length === 0 && panel.id !== 'main') {
      this.removePanel(panel.id)
    }

    return true
  }

  /**
   * 激活标签
   */
  activateTab(tabId: string): boolean {
    const tab = this.tabs.get(tabId)
    if (!tab) return false

    const panel = this.findPanelByTabId(tabId)
    if (!panel) return false

    // 取消之前激活的标签
    if (panel.activeTabId) {
      const prevTab = this.tabs.get(panel.activeTabId)
      if (prevTab) {
        prevTab.active = false
        prevTab.input.onDeactivated()
      }
    }

    // 激活新标签
    tab.active = true
    panel.activeTabId = tabId
    this.currentPanelId = panel.id

    // 调用input的生命周期方法
    tab.input.onActivated()

    this.emitTabChange({
      type: 'activated',
      tabId,
      panelId: panel.id,
      input: tab.input
    })

    return true
  }

  /**
   * 移动标签到另一个面板
   */
  moveTabToPanel(tabId: string, targetPanelId: string): boolean {
    const tab = this.tabs.get(tabId)
    const targetPanel = this.panels.get(targetPanelId)
    
    if (!tab || !targetPanel) return false

    const sourcePanel = this.findPanelByTabId(tabId)
    if (!sourcePanel || sourcePanel.id === targetPanelId) return false

    // 从源面板移除
    const tabIndex = sourcePanel.tabs.findIndex(t => t.id === tabId)
    if (tabIndex === -1) return false

    // 创建新的源面板tabs数组，确保Vue能检测到变化
    const newSourceTabs = sourcePanel.tabs.filter(t => t.id !== tabId)
    
    // 重新计算源面板索引
    newSourceTabs.forEach((t, index) => {
      t.index = index
    })
    
    // 替换整个数组引用
    sourcePanel.tabs = newSourceTabs

    // 添加到目标面板，创建新数组引用确保Vue检测到变化
    tab.index = targetPanel.tabs.length
    targetPanel.tabs = [...targetPanel.tabs, tab]

    // 如果移动的是激活标签，更新面板状态
    if (sourcePanel.activeTabId === tabId) {
      sourcePanel.activeTabId = sourcePanel.tabs.length > 0 
        ? sourcePanel.tabs[0].id 
        : undefined
    }

    this.emitTabChange({
      type: 'moved',
      tabId,
      panelId: targetPanelId,
      input: tab.input
    })

    return true
  }

  /**
   * 获取面板信息
   */
  getPanel(panelId: string): PanelInfo | undefined {
    return this.panels.get(panelId)
  }

  /**
   * 获取所有面板
   */
  getAllPanels(): PanelInfo[] {
    return Array.from(this.panels.values())
  }

  /**
   * 获取标签信息
   */
  getTab(tabId: string): TabInfo | undefined {
    return this.tabs.get(tabId)
  }

  /**
   * 获取所有标签
   */
  getAllTabs(): TabInfo[] {
    return Array.from(this.tabs.values())
  }

  /**
   * 获取当前激活的标签
   */
  getActiveTab(): TabInfo | undefined {
    if (!this.currentPanelId) return undefined
    
    const panel = this.panels.get(this.currentPanelId)
    if (!panel || !panel.activeTabId) return undefined
    
    return this.tabs.get(panel.activeTabId)
  }

  /**
   * 获取当前面板ID
   */
  getCurrentPanelId(): string | undefined {
    return this.currentPanelId
  }

  /**
   * 监听标签变更
   */
  onTabChange(listener: (event: TabChangeEvent) => void): () => void {
    this.tabChangeListeners.push(listener)
    
    return () => {
      const index = this.tabChangeListeners.indexOf(listener)
      if (index > -1) {
        this.tabChangeListeners.splice(index, 1)
      }
    }
  }

  /**
   * 监听面板变更
   */
  onPanelChange(listener: (event: PanelChangeEvent) => void): () => void {
    this.panelChangeListeners.push(listener)
    
    return () => {
      const index = this.panelChangeListeners.indexOf(listener)
      if (index > -1) {
        this.panelChangeListeners.splice(index, 1)
      }
    }
  }

  /**
   * 清理所有数据
   */
  cleanup(): void {
    // 关闭所有标签
    const allTabs = Array.from(this.tabs.keys())
    for (const tabId of allTabs) {
      this.closeTab(tabId)
    }

    this.panels.clear()
    this.tabs.clear()
    this.tabChangeListeners.length = 0
    this.panelChangeListeners.length = 0
    this.currentPanelId = undefined
  }

  // 私有方法
  private findPanelByTabId(tabId: string): PanelInfo | undefined {
    for (const panel of this.panels.values()) {
      if (panel.tabs.some(tab => tab.id === tabId)) {
        return panel
      }
    }
    return undefined
  }

  private findTabByInput(input: EditorInput): TabInfo | undefined {
    for (const tab of this.tabs.values()) {
      // 简单比较，可以根据需要改进
      if (tab.input === input || tab.input.id === input.id) {
        return tab
      }
    }
    return undefined
  }

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generatePanelId(): string {
    return `panel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private emitTabChange(event: TabChangeEvent): void {
    this.tabChangeListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('标签变更监听器执行错误:', error)
      }
    })
  }

  private emitPanelChange(event: PanelChangeEvent): void {
    this.panelChangeListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('面板变更监听器执行错误:', error)
      }
    })
  }
}

// 创建全局标签面板系统实例
export const tabPanelSystem = new TabPanelSystem()
