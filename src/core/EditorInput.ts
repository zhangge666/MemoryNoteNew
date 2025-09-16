/**
 * EditorInput - 标签统一抽象（参考 VS Code 设计）
 * 所有的页面都要注册到标签，包括/pages下的设置，首页，复习等页面
 */

import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import type { DocumentModel } from './DocumentManager'
import { 
  Home, 
  Rss, 
  Search, 
  BookOpen, 
  RotateCcw, 
  Settings,
  FileText 
} from 'lucide-vue-next'

export type EditorInputType = 
  | 'document'     // Markdown 文本编辑器
  | 'page'         // 页面类型（设置、首页、复习等）
  | 'webview'      // Webview 类型
  | 'custom'       // 自定义类型

export interface EditorInputOptions {
  /** 输入类型 */
  type: EditorInputType
  /** 标题 */
  title: string
  /** 图标 */
  icon?: string | Component
  /** 是否可关闭 */
  closable?: boolean
  /** 是否已保存 */
  saved?: boolean
  /** 是否固定标签（不可关闭） */
  pinned?: boolean
  /** 自定义数据 */
  metadata?: Record<string, any>
}

/**
 * EditorInput 基类
 */
export abstract class EditorInput {
  readonly id: string
  readonly type: EditorInputType
  title: string
  icon?: string | Component
  closable: boolean
  saved: boolean
  pinned: boolean
  metadata: Record<string, any>

  constructor(options: EditorInputOptions) {
    this.id = this.generateId()
    this.type = options.type
    this.title = options.title
    this.icon = options.icon
    this.closable = options.closable ?? true
    this.saved = options.saved ?? true
    this.pinned = options.pinned ?? false
    this.metadata = options.metadata ?? {}
  }

  /**
   * 获取要渲染的Vue组件
   */
  abstract getComponent(): Component

  /**
   * 获取组件的props
   */
  abstract getProps(): Record<string, any>

  /**
   * 标签是否可以关闭
   */
  canClose(): boolean {
    return this.closable && !this.pinned
  }

  /**
   * 标签关闭前的处理
   */
  async beforeClose(): Promise<boolean> {
    return true
  }

  /**
   * 标签关闭后的清理
   */
  onClosed(): void {
    // 子类可以重写此方法进行清理
  }

  /**
   * 标签激活时的处理
   */
  onActivated(): void {
    // 子类可以重写此方法
  }

  /**
   * 标签失活时的处理
   */
  onDeactivated(): void {
    // 子类可以重写此方法
  }

  /**
   * 更新标题
   */
  updateTitle(title: string): void {
    this.title = title
  }

  /**
   * 更新保存状态
   */
  updateSavedState(saved: boolean): void {
    this.saved = saved
  }

  private generateId(): string {
    return `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 文档类型的EditorInput
 */
export class DocumentEditorInput extends EditorInput {
  constructor(
    public documentModel: DocumentModel,
    options?: Partial<EditorInputOptions>
  ) {
    super({
      type: 'document',
      title: documentModel.title,
      saved: !documentModel.isDirty,
      icon: FileText,
      ...options
    })
  }

  getComponent(): Component {
    // 返回CodeMirror编辑器组件
    return defineAsyncComponent(() => import('@/components/editor/CodeMirrorEditor.vue'))
  }

  getProps(): Record<string, any> {
    // 确保content是字符串
    const content = this.documentModel.content
    const contentStr = typeof content === 'string' ? content : String(content)
    
    return {
      documentId: this.documentModel.id,
      content: contentStr,
      language: 'markdown'
    }
  }

  async beforeClose(): Promise<boolean> {
    // 如果有未保存的修改，询问用户
    if (!this.documentModel.isDirty) {
      return true
    }

    // 这里可以显示确认对话框
    // 暂时直接返回true
    return true
  }

  onClosed(): void {
    // 文档关闭时可以选择是否从DocumentManager中移除
    // 这里暂时保留文档，只关闭标签
  }
}

/**
 * 页面类型的EditorInput
 */
export class PageEditorInput extends EditorInput {
  constructor(
    public pageType: string,
    public component: Component,
    options?: Partial<EditorInputOptions>
  ) {
    super({
      type: 'page',
      title: options?.title || pageType,
      closable: false, // 页面类型默认不可关闭
      ...options
    })
  }

  getComponent(): Component {
    return this.component
  }

  getProps(): Record<string, any> {
    return {
      pageType: this.pageType,
      ...this.metadata
    }
  }
}

/**
 * 自定义EditorInput
 */
export class CustomEditorInput extends EditorInput {
  constructor(
    public component: Component,
    public props: Record<string, any> = {},
    options?: Partial<EditorInputOptions>
  ) {
    super({
      type: 'custom',
      title: options?.title || 'Custom',
      ...options
    })
  }

  getComponent(): Component {
    return this.component
  }

  getProps(): Record<string, any> {
    return this.props
  }
}

/**
 * EditorInput工厂类
 */
export class EditorInputFactory {
  /**
   * 创建文档类型的EditorInput
   */
  static createDocument(documentModel: DocumentModel): DocumentEditorInput {
    return new DocumentEditorInput(documentModel)
  }

  /**
   * 创建页面类型的EditorInput
   */
  static createPage(
    pageType: string, 
    component: Component, 
    options?: Partial<EditorInputOptions>
  ): PageEditorInput {
    return new PageEditorInput(pageType, component, options)
  }

  /**
   * 创建自定义EditorInput
   */
  static createCustom(
    component: Component,
    props?: Record<string, any>,
    options?: Partial<EditorInputOptions>
  ): CustomEditorInput {
    return new CustomEditorInput(component, props, options)
  }

  /**
   * 创建首页EditorInput
   */
  static createHomePage(): PageEditorInput {
    return new PageEditorInput(
      'home',
      defineAsyncComponent(() => import('@/components/pages/HomePage.vue')),
      {
        title: '首页',
        icon: Home,
        closable: true,
        pinned: false
      }
    )
  }

  /**
   * 创建设置页EditorInput
   */
  static createSettingsPage(): PageEditorInput {
    return new PageEditorInput(
      'settings',
      defineAsyncComponent(() => import('@/components/pages/SettingsPage.vue')),
      {
        title: '设置',
        icon: Settings,
        closable: true
      }
    )
  }

  /**
   * 创建复习页EditorInput
   */
  static createReviewPage(): PageEditorInput {
    return new PageEditorInput(
      'review',
      defineAsyncComponent(() => import('@/components/pages/ReviewPage.vue')),
      {
        title: '复习',
        icon: RotateCcw,
        closable: true
      }
    )
  }

  /**
   * 创建搜索页EditorInput
   */
  static createSearchPage(): PageEditorInput {
    return new PageEditorInput(
      'search',
      defineAsyncComponent(() => import('@/components/pages/SearchPage.vue')),
      {
        title: '搜索',
        icon: Search,
        closable: true
      }
    )
  }

  /**
   * 创建日记页EditorInput
   */
  static createDiaryPage(): PageEditorInput {
    return new PageEditorInput(
      'diary',
      defineAsyncComponent(() => import('@/components/pages/DiaryPage.vue')),
      {
        title: '日记',
        icon: BookOpen,
        closable: true
      }
    )
  }

  /**
   * 创建订阅页EditorInput
   */
  static createSubscribePage(): PageEditorInput {
    return new PageEditorInput(
      'subscribe',
      defineAsyncComponent(() => import('@/components/pages/SubscribePage.vue')),
      {
        title: '订阅',
        icon: Rss,
        closable: true
      }
    )
  }
}
