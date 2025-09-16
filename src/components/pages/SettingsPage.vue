<template>
  <div class="h-full bg-white flex transition-all duration-300 ease-out">
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
                @click="settings.theme = theme.id"
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
                <label class="text-sm font-medium text-gray-700">显示行号</label>
                <p class="text-xs text-gray-500">在编辑器左侧显示行号</p>
              </div>
              <toggle-switch v-model="settings.showLineNumbers" />
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">显示小地图</label>
                <p class="text-xs text-gray-500">在编辑器右侧显示代码缩略图</p>
              </div>
              <toggle-switch v-model="settings.showMinimap" />
            </div>
            
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
          <!-- 已安装插件 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-3">已安装插件</h3>
            <div v-if="installedPlugins.length === 0" class="text-center py-8">
              <Package class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-gray-500 text-sm">暂无已安装插件</p>
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
                  <span class="text-xs text-gray-400">v{{ plugin.version }}</span>
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
          
          <!-- 插件商店 -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-medium text-gray-700">插件商店</h3>
              <button class="text-sm text-blue-600 hover:text-blue-800">浏览全部</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="plugin in storePlugins"
                :key="plugin.id"
                class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{{ plugin.name }}</h4>
                  <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {{ plugin.category }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mb-3">{{ plugin.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-400">{{ plugin.downloads }} 下载</span>
                  <button
                    @click="installPlugin(plugin.id)"
                    class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    安装
                  </button>
                </div>
              </div>
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
import { ref, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import {
  Settings,
  Edit,
  RotateCcw,
  Package,
  Info,
  Folder,
  Trash2
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

// 设置数据
const settings = reactive({
  workingDirectory: '',
  language: 'zh-CN',
  theme: 'light',
  autoSave: true,
  fontSize: 14,
  lineHeight: '1.6',
  showLineNumbers: true,
  showMinimap: true,
  wordWrap: true,
  dailyReviewReminder: true,
  reminderTime: '09:00',
  reviewAlgorithm: 'sm2'
})

// 插件数据
const installedPlugins = ref([
  {
    id: '1',
    name: 'Markdown Preview',
    description: 'Markdown实时预览插件',
    version: '1.0.0',
    enabled: true
  },
  {
    id: '2',
    name: 'Git Integration',
    description: 'Git版本控制集成',
    version: '0.9.5',
    enabled: false
  }
])

const storePlugins = ref([
  {
    id: 'store-1',
    name: 'Mind Map',
    description: '思维导图绘制工具',
    category: '工具',
    downloads: '1.2k'
  },
  {
    id: 'store-2',
    name: 'Code Runner',
    description: '代码执行插件',
    category: '开发',
    downloads: '856'
  },
  {
    id: 'store-3',
    name: 'Export PDF',
    description: 'PDF导出功能',
    category: '导出',
    downloads: '2.1k'
  },
  {
    id: 'store-4',
    name: 'Calendar View',
    description: '日历视图插件',
    category: '视图',
    downloads: '634'
  }
])

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

const installPlugin = (pluginId: string) => {
  const plugin = storePlugins.value.find(p => p.id === pluginId)
  if (plugin) {
    console.log('安装插件:', plugin.name)
    // TODO: 实现插件安装逻辑
  }
}

const uninstallPlugin = (pluginId: string) => {
  if (confirm('确定要卸载这个插件吗？')) {
    const index = installedPlugins.value.findIndex(p => p.id === pluginId)
    if (index !== -1) {
      installedPlugins.value.splice(index, 1)
    }
  }
}

const configurePlugin = (pluginId: string) => {
  console.log('配置插件:', pluginId)
  // TODO: 打开插件配置界面
}
</script>
