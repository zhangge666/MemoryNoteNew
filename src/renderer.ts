/**
 * Memory Note 渲染进程入口文件
 * 该文件会被Vite自动加载并在"renderer"上下文中运行
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './index.css'

// 国际化配置
const messages = {
  'zh-CN': {
    app: {
      title: 'Memory Note',
      subtitle: '记忆笔记'
    },
    nav: {
      home: '首页',
      subscribe: '订阅',
      search: '搜索',
      diary: '日记',
      review: '复习',
      settings: '设置'
    },
    toolbar: {
      newFile: '新建文件',
      openFile: '打开文件',
      save: '保存',
      undo: '撤销',
      redo: '重做',
      toggleSidebar: '切换侧边栏',
      toggleRightSidebar: '切换右侧栏',
      search: '搜索',
      splitView: '分屏视图'
    },
    statusBar: {
      saved: '已保存',
      unsaved: '未保存',
      words: '字数',
      lines: '行数',
      position: '位置'
    }
  },
  'en-US': {
    app: {
      title: 'Memory Note',
      subtitle: 'Personal Knowledge Base'
    },
    nav: {
      home: 'Home',
      subscribe: 'Subscribe',
      search: 'Search',
      diary: 'Diary',
      review: 'Review',
      settings: 'Settings'
    },
    toolbar: {
      newFile: 'New File',
      openFile: 'Open File',
      save: 'Save',
      undo: 'Undo',
      redo: 'Redo',
      toggleSidebar: 'Toggle Sidebar',
      toggleRightSidebar: 'Toggle Right Sidebar',
      search: 'Search',
      splitView: 'Split View'
    },
    statusBar: {
      saved: 'Saved',
      unsaved: 'Unsaved',
      words: 'Words',
      lines: 'Lines',
      position: 'Position'
    }
  }
}

// 创建i18n实例
const i18n = createI18n({
  locale: 'zh-CN', // 默认语言
  fallbackLocale: 'en-US',
  messages,
  legacy: false
})

// 创建Pinia状态管理
const pinia = createPinia()

// 创建Vue应用
const app = createApp(App)
app.use(pinia)
app.use(i18n)
app.mount('#app')

console.log('🚀 Memory Note 已启动');
