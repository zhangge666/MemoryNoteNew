<template>
  <div class="h-full bg-white flex workspace-sync">
    <!-- 设置导航 -->
    <div class="w-64 border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">设置</h1>
      </div>
      
      <nav class="flex-1 p-4">
        <div class="space-y-1">
          <button
            v-for="section in settingSections"
            :key="section.id"
            @click="activeSection = section.id"
            class="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors"
            :class="{
              'bg-blue-50 text-blue-700 border border-blue-200': activeSection === section.id,
              'text-gray-700 hover:bg-gray-50': activeSection !== section.id
            }"
          >
            <component :is="section.icon" class="w-4 h-4" />
            <span class="text-sm">{{ section.label }}</span>
          </button>
        </div>
      </nav>
    </div>
    
    <!-- 设置内容 -->
    <div class="flex-1 overflow-auto">
      <!-- 通用设置 -->
      <div v-if="activeSection === 'general'" class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">通用设置</h2>
        
        <div class="space-y-6">
          <!-- 工作目录 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">工作目录</label>
            <div class="flex items-center space-x-3">
              <input
                v-model="settings.workingDirectory"
                type="text"
                readonly
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                placeholder="未选择工作目录"
              />
              <button
                @click="selectWorkingDirectory"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                选择目录
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">所有笔记和数据将存储在此目录下</p>
          </div>
          
          <!-- 语言设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">界面语言</label>
            <select
              v-model="settings.language"
              @change="updateLanguage"
              class="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
          
          <!-- 主题设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">外观主题</label>
            <div class="flex space-x-3">
              <button
                v-for="theme in themes"
                :key="theme.id"
                @click="applyTheme(theme.id)"
                class="flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-all"
                :class="{
                  'border-blue-500 bg-blue-50': settings.theme === theme.id,
                  'border-gray-300 hover:border-gray-400': settings.theme !== theme.id
                }"
              >
                <div :class="theme.preview" class="w-4 h-4 rounded"></div>
                <span class="text-sm">{{ theme.name }}</span>
              </button>
            </div>
          </div>
          
          <!-- 自动保存 -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700">自动保存</label>
              <p class="text-xs text-gray-500">编辑时自动保存内容</p>
            </div>
            <toggle-switch v-model="settings.autoSave" />
          </div>
          
          
          <!-- 编辑器工具栏 -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700">显示编辑工具栏</label>
              <p class="text-xs text-gray-500">在编辑器上方显示格式化、查找等工具</p>
            </div>
            <toggle-switch v-model="settings.showEditorToolbar" />
          </div>
        </div>
      </div>
      
      <!-- 编辑器设置 -->
      <div v-else-if="activeSection === 'editor'" class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">编辑器设置</h2>
        
        <div class="space-y-6">
          <!-- 字体大小 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">字体大小</label>
            <div class="flex items-center space-x-4">
              <input
                v-model.number="settings.fontSize"
                type="range"
                min="12"
                max="24"
                step="1"
                class="flex-1"
              />
              <span class="text-sm text-gray-600 w-12">{{ settings.fontSize }}px</span>
            </div>
          </div>
          
          <!-- 行高 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">行高</label>
            <select
              v-model="settings.lineHeight"
              class="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="1.4">紧凑 (1.4)</option>
              <option value="1.6">标准 (1.6)</option>
              <option value="1.8">舒适 (1.8)</option>
              <option value="2.0">宽松 (2.0)</option>
            </select>
          </div>
          
          <!-- 显示设置 -->
          <div class="space-y-4">
            
            
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">自动换行</label>
                <p class="text-xs text-gray-500">长行自动换行显示</p>
              </div>
              <toggle-switch v-model="settings.wordWrap" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 复习设置 -->
      <div v-else-if="activeSection === 'review'" class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">复习设置</h2>
        
        <div class="space-y-6">
          <!-- 每日复习提醒 -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium text-gray-700">每日复习提醒</label>
              <p class="text-xs text-gray-500">定时提醒你完成复习任务</p>
            </div>
            <toggle-switch v-model="settings.dailyReviewReminder" />
          </div>
          
          <!-- 提醒时间 -->
          <div v-if="settings.dailyReviewReminder">
            <label class="block text-sm font-medium text-gray-700 mb-2">提醒时间</label>
            <input
              v-model="settings.reminderTime"
              type="time"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          
          <!-- 复习算法设置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">复习算法</label>
            <select
              v-model="settings.reviewAlgorithm"
              class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            >
              <option value="sm2">SM-2 (标准间隔重复)</option>
              <option value="sm17">SM-17 (改进版本)</option>
              <option value="custom">自定义间隔</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 插件设置 -->
      <div v-else-if="activeSection === 'plugins'" class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">插件管理</h2>
        
        <div class="space-y-6">
          <!-- 插件导入 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-blue-900 mb-3">导入插件</h3>
            <div class="space-y-3">
              <!-- 文件导入 -->
              <div>
                <label class="block text-sm text-blue-800 mb-2">从文件导入</label>
                <div class="flex space-x-2">
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".zip,.js,.ts"
                    @change="importFromFile"
                    class="hidden"
                  />
                  <button
                    @click="$refs.fileInput.click()"
                    :disabled="isImporting"
                    class="flex-1 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Upload class="w-4 h-4" :class="{ 'animate-pulse': isImporting }" />
                    <span>{{ isImporting ? '📦 正在导入插件...' : '选择插件文件' }}</span>
                  </button>
                </div>
              </div>
              
              <!-- URL导入 -->
              <div>
                <label class="block text-sm text-blue-800 mb-2">从链接导入</label>
                <div class="flex space-x-2">
                  <input
                    v-model="importUrl"
                    type="url"
                    placeholder="输入插件下载链接或GitHub仓库地址"
                    class="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    @click="importFromUrl"
                    :disabled="isImporting || !importUrl.trim()"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Download class="w-4 h-4" :class="{ 'animate-spin': isImporting }" />
                    <span>{{ isImporting ? '🌐 正在下载插件...' : '导入' }}</span>
                  </button>
                </div>
              </div>
              
              <!-- 错误提示 -->
              <div v-if="importError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {{ importError }}
              </div>
            </div>
          </div>

          <!-- 已安装插件 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-3">已安装插件</h3>
            <div v-if="installedPlugins.length === 0" class="text-center py-8">
              <Package class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-gray-500 text-sm">暂无已安装插件</p>
              <p class="text-xs text-gray-400 mt-1">通过上方的导入功能添加插件</p>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="plugin in installedPlugins"
                :key="plugin.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ plugin.name }}</h4>
                  <p class="text-sm text-gray-500">{{ plugin.description }}</p>
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="text-xs text-gray-400">v{{ plugin.version }}</span>
                    <span class="text-xs text-gray-400">•</span>
                    <span class="text-xs text-gray-400">{{ plugin.author }}</span>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <toggle-switch v-model="plugin.enabled" />
                  <button
                    @click="configurePlugin(plugin.id)"
                    class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="配置"
                  >
                    <Settings class="w-4 h-4" />
                  </button>
                  <button
                    @click="uninstallPlugin(plugin.id)"
                    class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="卸载"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 插件开发指南 -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 class="text-sm font-medium text-gray-900 mb-2">插件开发</h3>
            <p class="text-sm text-gray-600 mb-3">
              想要开发自己的插件？查看我们的开发文档和示例代码。
            </p>
            <div class="flex space-x-2">
              <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors">
                查看文档
              </button>
              <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors">
                示例代码
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 关于页面 -->
      <div v-else-if="activeSection === 'about'" class="p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">关于 Memory Note</h2>
        
        <div class="space-y-6">
          <div class="text-center">
            <div class="w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span class="text-white text-2xl font-bold">M</span>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Memory Note</h3>
            <p class="text-gray-600">智能知识管理系统</p>
            <p class="text-sm text-gray-500 mt-2">版本 1.0.0</p>
          </div>
          
          <div class="border-t border-gray-200 pt-6">
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-700">开发者</dt>
                <dd class="text-sm text-gray-600 mt-1">zhangge666</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-700">联系邮箱</dt>
                <dd class="text-sm text-gray-600 mt-1">2395217248@qq.com</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-700">技术栈</dt>
                <dd class="text-sm text-gray-600 mt-1">Electron + Vue 3 + TypeScript</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-700">许可证</dt>
                <dd class="text-sm text-gray-600 mt-1">MIT License</dd>
              </div>
            </dl>
          </div>
          
          <div class="flex space-x-4">
            <button class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
              检查更新
            </button>
            <button class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              用户手册
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import {
  Settings,
  Edit,
  RotateCcw,
  Package,
  Info,
  Folder,
  Trash2,
  Upload,
  Download
} from 'lucide-vue-next'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'

const appStore = useAppStore()
const { locale } = useI18n()

const activeSection = ref('general')

// 设置项配置
const settingSections = [
  { id: 'general', label: '通用', icon: Settings },
  { id: 'editor', label: '编辑器', icon: Edit },
  { id: 'review', label: '复习', icon: RotateCcw },
  { id: 'plugins', label: '插件', icon: Package },
  { id: 'about', label: '关于', icon: Info }
]

// 主题配置
const themes = [
  { id: 'light', name: '浅色', preview: 'bg-white border border-gray-300' },
  { id: 'dark', name: '深色', preview: 'bg-gray-800' },
  { id: 'auto', name: '跟随系统', preview: 'bg-gradient-to-r from-white to-gray-800' }
]

// 从store获取设置数据
const settings = reactive({
  workingDirectory: appStore.settings.workingDirectory,
  language: appStore.settings.language,
  theme: appStore.settings.theme,
  autoSave: appStore.settings.autoSave,
  fontSize: appStore.settings.fontSize,
  lineHeight: appStore.settings.lineHeight,
  wordWrap: appStore.settings.wordWrap,
  showEditorToolbar: appStore.settings.showEditorToolbar,
  dailyReviewReminder: appStore.settings.dailyReviewReminder || true,
  reminderTime: appStore.settings.reminderTime || '09:00',
  reviewAlgorithm: appStore.settings.reviewAlgorithm || 'sm2'
})

// 插件数据
const installedPlugins = ref([])
const storePlugins = ref([])
const isImporting = ref(false)
const importError = ref('')
const importUrl = ref('')

// 方法
const selectWorkingDirectory = async () => {
  // TODO: 调用Electron文件选择对话框
  const result = await window.electronAPI?.showOpenDialog?.({
    properties: ['openDirectory']
  })
  
  if (result && !result.canceled && result.filePaths.length > 0) {
    settings.workingDirectory = result.filePaths[0]
    appStore.updateSettings({ workingDirectory: result.filePaths[0] })
  }
}

const updateLanguage = () => {
  locale.value = settings.language
  appStore.updateSettings({ language: settings.language as 'zh-CN' | 'en-US' })
}

const applyTheme = (themeId: string) => {
  settings.theme = themeId
  // 使用store的applyTheme方法
  appStore.applyTheme(themeId)
}

const importFromFile = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  isImporting.value = true
  importError.value = ''

  try {
    console.log('📦 开始导入插件文件:', file.name)
    
    // 验证文件类型
    console.log('🔍 验证文件类型...')
    const validTypes = ['.zip', '.js', '.ts']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!validTypes.includes(fileExtension)) {
      throw new Error('不支持的文件类型。请选择 .zip, .js 或 .ts 文件。')
    }
    console.log('✅ 文件类型验证通过:', fileExtension)

    // 读取文件内容
    console.log('📖 正在读取文件内容...')
    const fileContent = await readFileContent(file)
    console.log('✅ 文件读取完成, 大小:', fileContent.length, '字符')
    
    // 解析插件信息
    console.log('🔧 正在解析插件信息...')
    const pluginInfo = await parsePluginFile(file, fileContent)
    console.log('✅ 插件信息解析完成:', pluginInfo.name)
    
    // 安装插件
    console.log('⚡ 正在安装插件...')
    await installPluginFromInfo(pluginInfo)
    console.log('🎉 插件安装成功!')
    
    // 清空文件输入
    ;(event.target as HTMLInputElement).value = ''
    
  } catch (error) {
    console.error('❌ 插件导入失败:', error)
    importError.value = error.message || '导入插件时发生错误'
  } finally {
    isImporting.value = false
  }
}

const importFromUrl = async () => {
  if (!importUrl.value.trim()) return

  isImporting.value = true
  importError.value = ''

  try {
    console.log('🌐 开始从URL导入插件:', importUrl.value)
    
    // 验证URL格式
    console.log('🔍 验证URL格式...')
    const url = new URL(importUrl.value)
    console.log('✅ URL格式验证通过')
    
    // 支持GitHub仓库链接
    if (url.hostname === 'github.com') {
      console.log('📱 检测到GitHub仓库链接')
      const repoPath = url.pathname
      const downloadUrl = `https://raw.githubusercontent.com${repoPath}/main/plugin.json`
      console.log('📡 正在下载插件配置:', downloadUrl)
      
      // 下载插件配置
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error('无法访问插件配置文件')
      }
      console.log('✅ 插件配置下载成功')
      
      const pluginConfig = await response.json()
      console.log('🔧 解析插件配置完成:', pluginConfig.name || '未命名插件')
      
      console.log('⚡ 正在安装插件...')
      await installPluginFromUrl(url.toString(), pluginConfig)
      console.log('🎉 GitHub插件安装成功!')
    } else {
      console.log('📦 直接下载插件文件')
      // 直接下载插件文件
      const response = await fetch(importUrl.value)
      if (!response.ok) {
        throw new Error('无法下载插件文件')
      }
      console.log('✅ 插件文件下载成功')
      
      const blob = await response.blob()
      console.log('🔧 正在解析插件信息...')
      const pluginInfo = await parsePluginBlob(blob)
      console.log('✅ 插件信息解析完成:', pluginInfo.name)
      
      console.log('⚡ 正在安装插件...')
      await installPluginFromInfo(pluginInfo)
      console.log('🎉 URL插件安装成功!')
    }
    
    importUrl.value = ''
    
  } catch (error) {
    console.error('❌ URL插件导入失败:', error)
    importError.value = error.message || '导入插件时发生错误'
  } finally {
    isImporting.value = false
  }
}

const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

const parsePluginFile = async (file: File, content: string) => {
  // 这里应该解析插件文件并提取插件信息
  // 简化实现，实际应该解析manifest.json等
  const pluginInfo = {
    id: `plugin_${Date.now()}`,
    name: file.name.replace(/\.[^/.]+$/, ''),
    description: '从文件导入的插件',
    version: '1.0.0',
    author: '未知',
    enabled: false,
    source: 'file',
    content: content
  }
  
  return pluginInfo
}

const parsePluginBlob = async (blob: Blob) => {
  const content = await blob.text()
  return {
    id: `plugin_${Date.now()}`,
    name: '从URL导入的插件',
    description: '从URL导入的插件',
    version: '1.0.0',
    author: '未知',
    enabled: false,
    source: 'url',
    content: content
  }
}

const installPluginFromInfo = async (pluginInfo: any) => {
  console.log('🔍 检查插件是否已安装...')
  
  // 检查是否已安装
  const existing = installedPlugins.value.find(p => p.name === pluginInfo.name)
  if (existing) {
    throw new Error(`插件 "${pluginInfo.name}" 已安装`)
  }
  console.log('✅ 插件检查通过，可以安装')
  
  // 添加到已安装列表
  console.log('📝 正在将插件添加到已安装列表...')
  installedPlugins.value.push(pluginInfo)
  
  // 这里应该保存插件到本地存储
  console.log('💾 正在保存插件配置到本地存储...')
  // TODO: 实际的本地存储逻辑
  
  console.log('🎉 插件安装完成!')
  console.log('📊 插件详细信息:')
  console.log(`   - 名称: ${pluginInfo.name}`)
  console.log(`   - 版本: ${pluginInfo.version}`)
  console.log(`   - 作者: ${pluginInfo.author}`)
  console.log(`   - 来源: ${pluginInfo.source}`)
  
  // 显示成功消息
  importError.value = ''
  console.log(`✨ "${pluginInfo.name}" 插件已成功安装并添加到插件列表中！`)
}

const installPluginFromUrl = async (url: string, config: any) => {
  const pluginInfo = {
    id: `plugin_${Date.now()}`,
    name: config.name || '未命名插件',
    description: config.description || '从URL导入的插件',
    version: config.version || '1.0.0',
    author: config.author || '未知',
    enabled: false,
    source: 'url',
    url: url
  }
  
  await installPluginFromInfo(pluginInfo)
}

const uninstallPlugin = (pluginId: string) => {
  if (confirm('确定要卸载这个插件吗？')) {
    const index = installedPlugins.value.findIndex(p => p.id === pluginId)
    if (index !== -1) {
      installedPlugins.value.splice(index, 1)
      console.log('插件卸载成功')
    }
  }
}

const configurePlugin = (pluginId: string) => {
  console.log('配置插件:', pluginId)
  // TODO: 打开插件配置界面
}

// 监听设置变化并自动保存到store
watch(settings, (newSettings) => {
  appStore.updateSettings({
    workingDirectory: newSettings.workingDirectory,
    language: newSettings.language,
    theme: newSettings.theme,
    autoSave: newSettings.autoSave,
    fontSize: newSettings.fontSize,
    lineHeight: newSettings.lineHeight,
    wordWrap: newSettings.wordWrap,
    showEditorToolbar: newSettings.showEditorToolbar,
    dailyReviewReminder: newSettings.dailyReviewReminder,
    reminderTime: newSettings.reminderTime,
    reviewAlgorithm: newSettings.reviewAlgorithm
  })
}, { deep: true })
</script>
