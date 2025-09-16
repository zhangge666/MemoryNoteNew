/**
 * 文档管理器 - 统一维护文档的内存模型
 * 支持多标签打开，每个标签绑定一个文档模型
 * 提供保存、关闭、恢复、撤销/重做接口
 */

export interface DocumentModel {
  /** 文档唯一标识符 */
  id: string
  /** 文档标题 */
  title: string
  /** 文件路径（如果是文件） */
  filePath?: string
  /** 文档内容 */
  content: string
  /** 原始内容（用于对比是否有修改） */
  originalContent: string
  /** 是否有未保存的修改 */
  isDirty: boolean
  /** 文档类型 */
  type: 'markdown' | 'text' | 'page'
  /** 创建时间 */
  createdAt: Date
  /** 最后修改时间 */
  modifiedAt: Date
  /** 光标位置 */
  cursorPosition?: {
    line: number
    column: number
  }
  /** 滚动位置 */
  scrollPosition?: number
  /** 编辑历史（用于撤销/重做） */
  history?: {
    past: string[]
    future: string[]
    maxSize: number
  }
}

export interface DocumentChangeEvent {
  documentId: string
  type: 'content' | 'title' | 'saved' | 'closed'
  content?: string
  title?: string
}

/**
 * 文档管理器类
 */
export class DocumentManager {
  private documents = new Map<string, DocumentModel>()
  private changeListeners: ((event: DocumentChangeEvent) => void)[] = []
  private autoSaveTimer?: NodeJS.Timeout
  private autoSaveInterval = 30000 // 30秒自动保存

  /**
   * 创建新文档
   */
  createDocument(options: {
    title?: string
    content?: string | any
    type?: DocumentModel['type']
    filePath?: string
  }): DocumentModel {
    const id = this.generateDocumentId()
    const now = new Date()
    
    // 确保content是字符串
    const contentStr = typeof options.content === 'string' ? options.content : (options.content ? String(options.content) : '')
    
    const document: DocumentModel = {
      id,
      title: options.title || '未命名文档',
      filePath: options.filePath,
      content: contentStr,
      originalContent: contentStr,
      isDirty: false,
      type: options.type || 'markdown',
      createdAt: now,
      modifiedAt: now,
      history: {
        past: [],
        future: [],
        maxSize: 50
      }
    }

    this.documents.set(id, document)
    
    // 启动自动保存
    this.startAutoSave()
    
    return document
  }

  /**
   * 获取文档
   */
  getDocument(id: string): DocumentModel | undefined {
    return this.documents.get(id)
  }

  /**
   * 获取所有文档
   */
  getAllDocuments(): DocumentModel[] {
    return Array.from(this.documents.values())
  }

  /**
   * 更新文档内容
   */
  updateDocumentContent(id: string, content: string): boolean {
    const document = this.documents.get(id)
    if (!document) return false

    // 保存到历史记录
    this.saveToHistory(document, document.content)

    // 更新内容
    document.content = content
    document.isDirty = content !== document.originalContent
    document.modifiedAt = new Date()

    // 触发变更事件
    this.emitChange({
      documentId: id,
      type: 'content',
      content
    })

    return true
  }

  /**
   * 更新文档标题
   */
  updateDocumentTitle(id: string, title: string): boolean {
    const document = this.documents.get(id)
    if (!document) return false

    document.title = title
    document.modifiedAt = new Date()

    this.emitChange({
      documentId: id,
      type: 'title',
      title
    })

    return true
  }

  /**
   * 保存文档
   */
  async saveDocument(id: string): Promise<boolean> {
    const document = this.documents.get(id)
    if (!document) return false

    try {
      // 如果有文件路径，保存到文件
      if (document.filePath && window.electronAPI) {
        await window.electronAPI.writeFile(document.filePath, document.content)
      }

      // 更新原始内容
      document.originalContent = document.content
      document.isDirty = false
      document.modifiedAt = new Date()

      this.emitChange({
        documentId: id,
        type: 'saved'
      })

      return true
    } catch (error) {
      console.error('保存文档失败:', error)
      return false
    }
  }

  /**
   * 关闭文档
   */
  closeDocument(id: string): boolean {
    const document = this.documents.get(id)
    if (!document) return false

    // 如果有未保存的修改，可以在这里添加确认逻辑
    this.documents.delete(id)

    this.emitChange({
      documentId: id,
      type: 'closed'
    })

    // 如果没有文档了，停止自动保存
    if (this.documents.size === 0) {
      this.stopAutoSave()
    }

    return true
  }

  /**
   * 撤销操作
   */
  undo(id: string): boolean {
    const document = this.documents.get(id)
    if (!document || !document.history) return false

    const { past, future } = document.history
    if (past.length === 0) return false

    const previous = past.pop()!
    future.push(document.content)
    
    // 限制future大小
    if (future.length > document.history.maxSize) {
      future.shift()
    }

    document.content = previous
    document.isDirty = previous !== document.originalContent
    document.modifiedAt = new Date()

    this.emitChange({
      documentId: id,
      type: 'content',
      content: previous
    })

    return true
  }

  /**
   * 重做操作
   */
  redo(id: string): boolean {
    const document = this.documents.get(id)
    if (!document || !document.history) return false

    const { past, future } = document.history
    if (future.length === 0) return false

    const next = future.pop()!
    past.push(document.content)
    
    // 限制past大小
    if (past.length > document.history.maxSize) {
      past.shift()
    }

    document.content = next
    document.isDirty = next !== document.originalContent
    document.modifiedAt = new Date()

    this.emitChange({
      documentId: id,
      type: 'content',
      content: next
    })

    return true
  }

  /**
   * 更新光标位置
   */
  updateCursorPosition(id: string, line: number, column: number): boolean {
    const document = this.documents.get(id)
    if (!document) return false

    document.cursorPosition = { line, column }
    return true
  }

  /**
   * 更新滚动位置
   */
  updateScrollPosition(id: string, position: number): boolean {
    const document = this.documents.get(id)
    if (!document) return false

    document.scrollPosition = position
    return true
  }

  /**
   * 监听文档变更
   */
  onDocumentChange(listener: (event: DocumentChangeEvent) => void): () => void {
    this.changeListeners.push(listener)
    
    // 返回取消监听的函数
    return () => {
      const index = this.changeListeners.indexOf(listener)
      if (index > -1) {
        this.changeListeners.splice(index, 1)
      }
    }
  }

  /**
   * 获取未保存的文档列表
   */
  getDirtyDocuments(): DocumentModel[] {
    return Array.from(this.documents.values()).filter(doc => doc.isDirty)
  }

  /**
   * 保存所有未保存的文档
   */
  async saveAllDocuments(): Promise<boolean> {
    const dirtyDocs = this.getDirtyDocuments()
    const results = await Promise.all(
      dirtyDocs.map(doc => this.saveDocument(doc.id))
    )
    
    return results.every(result => result)
  }

  /**
   * 清理所有文档
   */
  cleanup(): void {
    this.documents.clear()
    this.changeListeners.length = 0
    this.stopAutoSave()
  }

  // 私有方法
  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private saveToHistory(document: DocumentModel, content: string): void {
    if (!document.history) return

    const { past } = document.history
    
    // 避免重复保存相同内容
    if (past.length > 0 && past[past.length - 1] === content) {
      return
    }

    past.push(content)
    
    // 限制历史记录大小
    if (past.length > document.history.maxSize) {
      past.shift()
    }

    // 清空future（新的操作会清除重做历史）
    document.history.future.length = 0
  }

  private emitChange(event: DocumentChangeEvent): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('文档变更监听器执行错误:', error)
      }
    })
  }

  private startAutoSave(): void {
    if (this.autoSaveTimer) return

    this.autoSaveTimer = setInterval(() => {
      this.saveAllDocuments().catch(error => {
        console.error('自动保存失败:', error)
      })
    }, this.autoSaveInterval)
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = undefined
    }
  }
}

// 创建全局文档管理器实例
export const documentManager = new DocumentManager()

