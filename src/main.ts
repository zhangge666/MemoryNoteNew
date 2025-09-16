import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import { promises as fs } from 'fs';
import * as iconv from 'iconv-lite';
import * as jschardet from 'jschardet';
import started from 'electron-squirrel-startup';

// 处理Windows安装/卸载时的快捷方式创建/删除
if (started) {
  app.quit();
}

const createWindow = () => {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    titleBarStyle: 'hidden', // 隐藏默认标题栏，使用自定义标题栏
    titleBarOverlay: false,
    frame: false, // 无边框窗口，完全自定义
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    show: false, // 先不显示，等待ready-to-show事件
    backgroundColor: '#ffffff',
  });

  // 窗口准备显示时再显示，避免闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 加载应用的index.html
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // 开发环境下打开开发者工具
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC处理程序
let mainWindow: BrowserWindow | null = null;

// 窗口控制IPC处理器
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// 文件对话框IPC处理器
ipcMain.handle('dialog-open', async (event, options) => {
  if (mainWindow) {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  }
});

ipcMain.handle('dialog-save', async (event, options) => {
  if (mainWindow) {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  }
});

// 文件系统IPC处理器
ipcMain.handle('fs-read-file', async (event, filePath: string) => {
  try {
    // 读取文件为Buffer
    const buffer = await fs.readFile(filePath);
    
    // 使用jschardet检测编码
    const detected = jschardet.detect(buffer);
    let encoding = detected.encoding;
    
    // 如果检测结果不确定或为空，使用默认编码
    if (!encoding || detected.confidence < 0.8) {
      // 对于中文环境，优先尝试常见编码
      const commonEncodings = ['utf-8', 'gbk', 'gb2312', 'big5'];
      
      for (const enc of commonEncodings) {
        try {
          if (iconv.encodingExists(enc)) {
            const testContent = iconv.decode(buffer, enc);
            // 简单检测是否有乱码字符
            if (!testContent.includes('\uFFFD') && testContent.length > 0) {
              encoding = enc;
              break;
            }
          }
        } catch {
          continue;
        }
      }
      
      // 如果都失败了，使用utf-8作为默认
      if (!encoding) {
        encoding = 'utf-8';
      }
    }
    
    // 使用检测到的编码解码
    let content: string;
    try {
      if (iconv.encodingExists(encoding)) {
        content = iconv.decode(buffer, encoding);
      } else {
        content = buffer.toString('utf-8');
      }
    } catch {
      // 最后的fallback
      content = buffer.toString('utf-8');
    }
    
    return content; // 直接返回内容字符串，保持与前端期望一致
  } catch (error) {
    return { success: false, error: error.message }; // 错误时返回对象
  }
});

ipcMain.handle('fs-write-file', async (event, filePath: string, content: string) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fs-read-directory', async (event, dirPath: string) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const items = await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      const stats = await fs.stat(fullPath);
      
      return {
        name: entry.name,
        path: fullPath,
        type: entry.isDirectory() ? 'folder' : 'file',
        size: entry.isFile() ? stats.size : undefined,
        modified: stats.mtime
      };
    }));
    
    // 排序：文件夹在前，然后按名称排序
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
    
    return items;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 应用信息IPC处理器
ipcMain.handle('app-get-version', () => {
  return app.getVersion();
});

ipcMain.handle('app-get-path', () => {
  return app.getAppPath();
});

ipcMain.handle('app-get-cwd', () => {
  return process.cwd();
});
