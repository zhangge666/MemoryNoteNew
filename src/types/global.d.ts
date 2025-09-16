// 全局类型定义

declare global {
  interface Window {
    electronAPI: {
      // 窗口控制
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      
      // 文件系统操作
      showOpenDialog: (options: any) => Promise<any>
      showSaveDialog: (options: any) => Promise<any>
      readFile: (filePath: string) => Promise<string | { success: boolean; error: string }>
      writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
      readDirectory: (dirPath: string) => Promise<Array<{
        name: string
        path: string
        type: 'file' | 'folder'
        size?: number
        modified: Date
      }> | { success: boolean; error: string }>
      
      // 应用信息
      getAppVersion: () => Promise<string>
      getAppPath: () => Promise<string>
      getCwd: () => Promise<string>
    }
  }
}

export {}

