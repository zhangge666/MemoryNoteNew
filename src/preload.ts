import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  
  // 文件系统操作
  showOpenDialog: (options: any) => ipcRenderer.invoke('dialog-open', options),
  showSaveDialog: (options: any) => ipcRenderer.invoke('dialog-save', options),
  readFile: (filePath: string) => ipcRenderer.invoke('fs-read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs-write-file', filePath, content),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('fs-read-directory', dirPath),
  
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('app-get-version'),
  getAppPath: () => ipcRenderer.invoke('app-get-path'),
  getCwd: () => ipcRenderer.invoke('app-get-cwd'),
})
