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
      readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>
      writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
      
      // 应用信息
      getAppVersion: () => Promise<string>
      getAppPath: () => Promise<string>
    }
  }
}

export {}

