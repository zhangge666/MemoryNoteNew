<template>
  <div class="h-full bg-white flex workspace-sync">
    <!-- 设置导航 -->
    <div class="w-64 border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-900">设置</h1>
      </div>
      
      <nav class="flex-1 p-4">
        <div class="space-y-1">
          <!-- 系统设置 -->
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
          
          <!-- 插件设置分割线 -->
          <div v-if="pluginSettingSections.length > 0" class="py-2">
            <div class="border-t border-gray-300"></div>
            <div class="text-xs text-gray-500 mt-2 px-3 font-medium">插件设置</div>
          </div>
          
          <!-- 插件设置项 -->
          <button
            v-for="pluginSection in pluginSettingSections"
            :key="pluginSection.id"
            @click="activeSection = pluginSection.id"
            class="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors"
            :class="{
              'bg-green-50 text-green-700 border border-green-200': activeSection === pluginSection.id,
              'text-gray-700 hover:bg-gray-50': activeSection !== pluginSection.id
            }"
          >
            <component :is="pluginSection.icon" class="w-4 h-4" />
            <span class="text-sm">{{ pluginSection.label }}</span>
            <span class="text-xs text-gray-400 ml-auto">插件</span>
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
                  <toggle-switch 
                    :model-value="plugin.enabled" 
                    @update:model-value="togglePlugin(plugin.id, $event)"
                  />
                  <button
                    @click="resetPluginSettings(plugin.id)"
                    class="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                    title="重置插件"
                  >
                    <RotateCcw class="w-4 h-4" />
                  </button>
                  <button
                    @click="configurePlugin(plugin.id)"
                    :disabled="!hasPluginSettings(plugin.id)"
                    class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :title="hasPluginSettings(plugin.id) ? '配置插件设置' : '此插件暂无设置项'"
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
      
      <!-- 插件自定义设置页面容器 -->
      <div v-else-if="activeSection.startsWith('plugin_custom_')" class="plugin-custom-settings-container">
        <!-- 插件自定义设置内容将在这里动态插入 -->
      </div>
      
      <!-- 插件设置页面 -->
      <div v-else-if="isPluginSettingsSection(activeSection)" class="p-6">
        <div v-if="currentPluginSettings" class="space-y-6">
          <!-- 插件信息头部 -->
          <div class="flex items-start justify-between pb-4 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <component :is="currentPluginSettings.icon" class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ currentPluginSettings.name }}</h2>
                <p class="text-sm text-gray-500">{{ currentPluginSettings.description }}</p>
                <div class="flex items-center space-x-2 mt-1">
                  <span class="text-xs text-gray-400">v{{ currentPluginSettings.version }}</span>
                  <span class="text-xs text-gray-400">•</span>
                  <span class="text-xs text-gray-400">{{ currentPluginSettings.author }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">启用状态</span>
              <toggle-switch 
                :model-value="currentPluginSettings.enabled" 
                @update:model-value="togglePlugin(currentPluginSettings.pluginId, $event)"
              />
            </div>
          </div>
          
          <!-- 插件设置表单 -->
          <div v-if="currentPluginSettings.settingsSchema && currentPluginSettings.settingsSchema.length > 0">
            <h3 class="text-base font-medium text-gray-900 mb-4">插件设置</h3>
            <div class="space-y-4">
              <div 
                v-for="setting in currentPluginSettings.settingsSchema" 
                :key="setting.key"
                class="space-y-2"
              >
                <!-- 布尔类型设置 -->
                <div v-if="setting.type === 'boolean'" class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700">{{ setting.name }}</label>
                    <p v-if="setting.description" class="text-xs text-gray-500">{{ setting.description }}</p>
                  </div>
                  <toggle-switch 
                    :model-value="getPluginSettingValue(currentPluginSettings.pluginId, setting.key, setting.default)"
                    @update:model-value="updatePluginSetting(currentPluginSettings.pluginId, setting.key, $event)"
                  />
                </div>
                
                <!-- 选择类型设置 -->
                <div v-else-if="setting.type === 'select'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">{{ setting.name }}</label>
                  <select
                    :value="getPluginSettingValue(currentPluginSettings.pluginId, setting.key, setting.default)"
                    @change="updatePluginSetting(currentPluginSettings.pluginId, setting.key, $event.target.value)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                  >
                    <option 
                      v-for="option in setting.options" 
                      :key="option.value" 
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <p v-if="setting.description" class="text-xs text-gray-500">{{ setting.description }}</p>
                </div>
                
                <!-- 文本类型设置 -->
                <div v-else-if="setting.type === 'string'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">{{ setting.name }}</label>
                  <input
                    type="text"
                    :value="getPluginSettingValue(currentPluginSettings.pluginId, setting.key, setting.default)"
                    @input="updatePluginSetting(currentPluginSettings.pluginId, setting.key, $event.target.value)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                    :placeholder="setting.placeholder"
                  />
                  <p v-if="setting.description" class="text-xs text-gray-500">{{ setting.description }}</p>
                </div>
                
                <!-- 数字类型设置 -->
                <div v-else-if="setting.type === 'number'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">{{ setting.name }}</label>
                  <input
                    type="number"
                    :value="getPluginSettingValue(currentPluginSettings.pluginId, setting.key, setting.default)"
                    @input="updatePluginSetting(currentPluginSettings.pluginId, setting.key, Number($event.target.value))"
                    :min="setting.min"
                    :max="setting.max"
                    :step="setting.step"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                  />
                  <p v-if="setting.description" class="text-xs text-gray-500">{{ setting.description }}</p>
                </div>
                
                <!-- 时间类型设置 -->
                <div v-else-if="setting.type === 'time'" class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">{{ setting.name }}</label>
                  <input
                    type="time"
                    :value="getPluginSettingValue(currentPluginSettings.pluginId, setting.key, setting.default)"
                    @input="updatePluginSetting(currentPluginSettings.pluginId, setting.key, $event.target.value)"
                    class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                  />
                  <p v-if="setting.description" class="text-xs text-gray-500">{{ setting.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 无设置项提示 -->
          <div v-else class="text-center py-8">
            <Settings class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500 text-sm">此插件暂无可配置的设置项</p>
          </div>
          
          <!-- 插件操作 -->
          <div class="border-t border-gray-200 pt-4">
            <div class="flex space-x-3">
              <button
                @click="resetPluginSettings(currentPluginSettings.pluginId)"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                重置设置
              </button>
              <button
                @click="uninstallPlugin(currentPluginSettings.pluginId)"
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                卸载插件
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
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
  Download,
  Palette,
  Zap
} from 'lucide-vue-next'
import ToggleSwitch from '@/components/common/ToggleSwitch.vue'
import { pluginManager } from '@/core/PluginSystem'

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

// 插件数据 - 添加响应式触发器
const pluginUpdateTrigger = ref(0)

const installedPlugins = computed(() => {
  // 强制依赖更新触发器
  pluginUpdateTrigger.value
  return pluginManager.getAllPlugins().map(plugin => ({
    id: plugin.manifest.id,
    name: plugin.manifest.name,
    description: plugin.manifest.description,
    version: plugin.manifest.version,
    author: plugin.manifest.author,
    enabled: plugin.enabled,
    type: plugin.manifest.type || 'utility',
    icon: plugin.manifest.icon || 'Package'
  }))
})

const storePlugins = ref([])
const isImporting = ref(false)
const importError = ref('')
const importUrl = ref('')

// 插件设置相关
const pluginSettingsData = ref(new Map()) // 存储插件设置数据

// 触发插件列表更新
const triggerPluginUpdate = () => {
  pluginUpdateTrigger.value++
  console.log('🔄 触发插件列表更新')
}

// 计算属性：获取插件设置区域
const pluginSettingSections = computed(() => {
  // 强制依赖更新触发器
  pluginUpdateTrigger.value
  const plugins = pluginManager.getAllPlugins()
  return plugins
    .filter(plugin => {
      // 检查插件是否有设置模式或自定义设置页面
      const hasSettingsSchema = plugin.manifest.settingsSchema && plugin.manifest.settingsSchema.length > 0
      const hasCustomSettings = pluginManager.getPluginSettingsPage(plugin.manifest.id) !== undefined
      return hasSettingsSchema || hasCustomSettings
    })
    .map(plugin => ({
      id: `plugin_${plugin.manifest.id}`,
      label: plugin.manifest.name,
      icon: getPluginIcon(plugin.manifest.icon || 'Package'),
      pluginId: plugin.manifest.id,
      name: plugin.manifest.name,
      description: plugin.manifest.description,
      version: plugin.manifest.version,
      author: plugin.manifest.author,
      enabled: plugin.enabled,
      settingsSchema: plugin.manifest.settingsSchema
    }))
})

// 计算属性：当前插件设置
const currentPluginSettings = computed(() => {
  if (!isPluginSettingsSection(activeSection.value)) return null
  
  const pluginId = activeSection.value.replace('plugin_', '')
  return pluginSettingSections.value.find(section => section.pluginId === pluginId)
})

// 获取插件图标
const getPluginIcon = (iconName: string) => {
  const iconMap = {
    'Palette': Palette,
    'Package': Package,
    'Settings': Settings,
    'Zap': Zap,
    'Edit': Edit,
    'Info': Info
  }
  return iconMap[iconName] || Package
}

// 判断是否为插件设置区域
const isPluginSettingsSection = (sectionId: string) => {
  return sectionId.startsWith('plugin_')
}

// 获取插件设置值
const getPluginSettingValue = (pluginId: string, key: string, defaultValue: any) => {
  const pluginSettings = pluginSettingsData.value.get(pluginId) || {}
  return pluginSettings[key] !== undefined ? pluginSettings[key] : defaultValue
}

// 更新插件设置
const updatePluginSetting = async (pluginId: string, key: string, value: any) => {
  try {
    const pluginSettings = pluginSettingsData.value.get(pluginId) || {}
    pluginSettings[key] = value
    pluginSettingsData.value.set(pluginId, pluginSettings)
    
    // 通知插件系统设置已更改
    const plugin = pluginManager.getPlugin(pluginId)
    if (plugin && plugin.instance && plugin.instance.onSettingsChange) {
      await plugin.instance.onSettingsChange(key, value)
    }
    
    console.log(`🔧 插件设置已更新: ${pluginId}.${key} = ${value}`)
  } catch (error) {
    console.error('更新插件设置失败:', error)
  }
}

// 切换插件启用状态
const togglePlugin = async (pluginId: string, enabled: boolean) => {
  try {
    if (enabled) {
      await pluginManager.enablePlugin(pluginId)
    } else {
      await pluginManager.disablePlugin(pluginId)
    }
    console.log(`🔌 插件 ${pluginId} ${enabled ? '已启用' : '已禁用'}`)
    
    // 触发UI更新
    triggerPluginUpdate()
    // 同时触发导航侧边栏更新
    appStore.triggerTabSystemUpdate()
  } catch (error) {
    console.error('切换插件状态失败:', error)
  }
}

// 重置插件设置
const resetPluginSettings = async (pluginId: string) => {
  const plugin = pluginManager.getPlugin(pluginId)
  if (!plugin) {
    console.error('插件不存在:', pluginId)
    return
  }
  
  if (confirm(`确定要重置插件 "${plugin.manifest.name}" 的所有设置吗？这将恢复插件的默认配置。`)) {
    try {
      // 调用插件管理器的重置方法
      const success = await pluginManager.resetPlugin(pluginId)
      
      if (success) {
        console.log(`🔄 插件 ${plugin.manifest.name} 已重置`)
        
        // 清理本地设置数据
        pluginSettingsData.value.delete(pluginId)
        
        // 触发UI更新
        triggerPluginUpdate()
        appStore.triggerTabSystemUpdate()
        
        // 显示成功消息
        alert(`插件 "${plugin.manifest.name}" 已重置为默认设置`)
      } else {
        throw new Error('重置失败')
      }
    } catch (error) {
      console.error('重置插件失败:', error)
      alert(`重置插件失败: ${error.message}`)
    }
  }
}

// 检查插件是否有设置项
const hasPluginSettings = (pluginId: string) => {
  const plugin = pluginManager.getPlugin(pluginId)
  if (!plugin) return false
  
  // 检查是否注册了自定义设置页面
  const hasCustomSettings = pluginManager.getPluginSettingsPage(pluginId) !== undefined
  
  // 检查是否有设置模式配置
  const hasSettingsSchema = plugin.manifest.settingsSchema && plugin.manifest.settingsSchema.length > 0
  
  return hasCustomSettings || hasSettingsSchema
}

// 修改configurePlugin方法，显示插件的自定义设置页面
const configurePlugin = (pluginId: string) => {
  const plugin = pluginManager.getPlugin(pluginId)
  if (!plugin) {
    console.error('插件不存在:', pluginId)
    return
  }
  
  // 检查插件是否有自定义设置页面
  const customSettingsRenderer = pluginManager.getPluginSettingsPage(pluginId)
  if (customSettingsRenderer) {
    console.log(`🔧 显示插件自定义设置页面: ${plugin.manifest.name}`)
    // 切换到自定义设置页面区域
    activeSection.value = `plugin_custom_${pluginId}`
    
    // 在下一个tick中渲染自定义设置页面
    nextTick(() => {
      const container = document.querySelector('.plugin-custom-settings-container')
      if (container) {
        // 清空容器
        container.innerHTML = ''
        // 调用插件的自定义设置页面渲染器
        customSettingsRenderer(container as HTMLElement)
      }
    })
  } else {
    // 如果没有自定义设置页面，跳转到Vue渲染的设置页面
    console.log(`🔧 跳转到标准插件设置页面: ${plugin.manifest.name}`)
    activeSection.value = `plugin_${pluginId}`
  }
}

// 显示插件自定义设置页面
const showPluginCustomSettings = (pluginId: string, content: string, pluginName: string) => {
  // 创建一个新的设置区域来显示插件自定义内容
  const customSettingsId = `plugin_custom_${pluginId}`
  
  // 临时添加到设置区域
  activeSection.value = customSettingsId
  
  // 使用Vue的nextTick确保DOM更新后再插入内容
  nextTick(() => {
    const settingsContainer = document.querySelector('.plugin-custom-settings-container')
    if (settingsContainer) {
      settingsContainer.innerHTML = `
        <div class="p-6">
          <div class="flex items-center mb-6">
            <button 
              onclick="document.querySelector('[data-section=plugins]').click()" 
              class="flex items-center text-blue-600 hover:text-blue-800 text-sm"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              返回插件管理
            </button>
            <span class="mx-2 text-gray-400">•</span>
            <span class="text-gray-600">${pluginName} 设置</span>
          </div>
          ${content}
        </div>
      `
    }
  })
}

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
    
    // 对于ZIP文件，读取为DataURL（包含base64数据）
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (fileExtension === '.zip') {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
  })
}

const parsePluginFile = async (file: File, content: string) => {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  
  if (fileExtension === '.zip') {
    // 解析ZIP文件
    try {
      // 将base64字符串转换为ArrayBuffer
      const binaryString = atob(content.split(',')[1] || content)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      // 使用JSZip解析
      const JSZip = (window as any).JSZip
      if (!JSZip) {
        throw new Error('JSZip库未加载，无法解析ZIP文件')
      }
      
      const zip = await JSZip.loadAsync(bytes)
      
      // 读取manifest.json
      const manifestFile = zip.file('manifest.json')
      if (!manifestFile) {
        throw new Error('ZIP文件中缺少manifest.json')
      }
      
      const manifestContent = await manifestFile.async('string')
      const manifest = JSON.parse(manifestContent)
      
      // 读取index.js
      const indexFile = zip.file('index.js')
      let pluginCode = null
      if (indexFile) {
        pluginCode = await indexFile.async('string')
      }
      
      return {
        ...manifest,
        source: 'file',
        code: pluginCode
      }
    } catch (error) {
      console.error('解析ZIP文件失败:', error)
      throw new Error(`解析ZIP文件失败: ${error.message}`)
    }
  } else {
    // 对于JS/TS文件，直接使用文件内容
    const pluginInfo = {
      id: `plugin_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      description: '从文件导入的插件',
      version: '1.0.0',
      author: '未知',
      enabled: false,
      source: 'file',
      code: content
    }
    
    return pluginInfo
  }
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
  const existing = installedPlugins.value.find(p => p.name === pluginInfo.name || p.id === pluginInfo.id)
  if (existing) {
    throw new Error(`插件 "${pluginInfo.name}" 已安装`)
  }
  console.log('✅ 插件检查通过，可以安装')
  
  // 创建插件清单（符合规范）
  const manifest = {
    id: pluginInfo.id || `plugin_${Date.now()}`,
    name: pluginInfo.name,
    version: pluginInfo.version || '1.0.0',
    author: pluginInfo.author || '未知',
    description: pluginInfo.description || '导入的插件',
    entry: 'index.js',
    settings: true,
    type: pluginInfo.type || 'utility',
    mountPoints: pluginInfo.mountPoints || ['right-sidebar'],
    icon: pluginInfo.icon || 'Package',
    defaultEnabled: true,
    permissions: pluginInfo.permissions || ['ui', 'storage'],
    settingsSchema: pluginInfo.settingsSchema || [
      {
        key: 'enabled',
        name: '启用插件',
        description: '控制插件是否启用',
        type: 'boolean',
        default: true
      }
    ]
  }
  
  // 创建插件模块
  let pluginModule = null
  
  // 如果有插件代码，尝试执行
  if (pluginInfo.code) {
    try {
      console.log('🔄 执行插件代码...')
      // 创建安全的执行环境并执行插件代码
      const executePlugin = new Function('manifest', 'console', `
        // 创建module对象以支持CommonJS格式
        var module = { exports: {} };
        var exports = module.exports;
        
        ${pluginInfo.code}
        
        // 返回导出的对象
        return module.exports;
      `)
      pluginModule = executePlugin.call({}, manifest, console)
      
      // 验证插件模块是否有效
      if (!pluginModule || typeof pluginModule.onload !== 'function') {
        console.warn('插件代码执行成功但未返回有效模块，使用默认模块')
        pluginModule = null
      } else {
        console.log('✅ 插件代码执行成功')
      }
    } catch (error) {
      console.error('插件代码执行失败:', error)
      pluginModule = null
    }
  }
  
  // 如果没有插件代码或执行失败，创建默认模块
  if (!pluginModule) {
    console.log('🔄 创建默认插件模块')
    pluginModule = {
      onload: async (app, data) => {
        console.log(`插件 ${manifest.name} 已加载`)
        
        // 注册设置页面（规范要求）
        app.registerSettingsPage(manifest.id, (container: any) => {
          container.innerHTML = `
            <div class="space-y-6">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h2 class="text-xl font-bold text-blue-900 mb-2">${manifest.name}</h2>
              <p class="text-blue-700 mb-4">${manifest.description}</p>
              <div class="flex items-center space-x-4 text-sm text-blue-600">
                <span>版本: ${manifest.version}</span>
                <span>•</span>
                <span>作者: ${manifest.author}</span>
                <span>•</span>
                <span>类型: ${manifest.type}</span>
              </div>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">插件功能</h3>
              <ul class="space-y-2 text-gray-600">
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  支持侧边栏按钮注册
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  自定义设置页面
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  数据持久化存储
                </li>
              </ul>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-yellow-800">这是插件自定义设置页面</h4>
                  <p class="text-sm text-yellow-700 mt-1">
                    这个页面是由插件通过 <code class="bg-yellow-100 px-1 rounded">app.registerSettingsPage()</code> 方法注册的自定义设置界面。
                  </p>
                </div>
              </div>
            </div>
            
            ${manifest.settingsSchema && manifest.settingsSchema.length > 0 ? `
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">插件设置</h3>
              <div class="space-y-4">
                ${manifest.settingsSchema.map(setting => `
                  <div class="flex items-center justify-between">
                    <div>
                      <label class="text-sm font-medium text-gray-700">${setting.name}</label>
                      <p class="text-xs text-gray-500">${setting.description || ''}</p>
                    </div>
                    <div class="ml-4">
                      ${setting.type === 'boolean' ? `
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" ${setting.default ? 'checked' : ''} class="sr-only peer">
                          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      ` : `
                        <input type="text" value="${setting.default || ''}" class="px-3 py-1 border border-gray-300 rounded text-sm">
                      `}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
        `
      })
      
      // 如果有侧边栏按钮配置，注册按钮
      if (manifest.mountPoints.includes('navigation-sidebar')) {
        app.registerSidebarButton({
          id: `${manifest.id}-btn`,
          title: manifest.name,
          icon: manifest.icon || 'Package',
          onClick: () => {
            console.log(`${manifest.name} 插件按钮被点击`)
          }
        })
      }
    },
    
    onunload: async (app) => {
      console.log(`插件 ${manifest.name} 已卸载`)
      app.unregister(`${manifest.id}-ui`)
      app.unregisterSidebarButton(`${manifest.id}-btn`)
    },
    
    // 必需：插件重置功能
    onReset: async () => {
      console.log(`重置插件 ${manifest.name}`)
      // 重置插件数据为默认值
      const defaultData = {
        currentTheme: 'light',
        enableAnimation: true,
        customThemes: {}
      }
      
      // 通过app保存默认数据
      if (window.pluginManager) {
        const plugin = window.pluginManager.getPlugin(manifest.id)
        if (plugin && plugin.instance && plugin.instance.app) {
          await plugin.instance.app.saveData(manifest.id, defaultData)
        }
      }
      
      console.log(`插件 ${manifest.name} 已重置为默认设置`)
    }
  }
  }
  
  try {
    // 加载到插件管理器
    console.log('🔌 正在加载插件到插件管理器...')
    const success = await pluginManager.loadPlugin(manifest, pluginModule)
    
    if (success) {
      // 保存插件配置到本地存储
      console.log('💾 正在保存插件配置到本地存储...')
      const installedPluginsList = JSON.parse(localStorage.getItem('installed_plugins') || '[]')
      installedPluginsList.push({
        manifest: manifest,
        installedAt: new Date().toISOString(),
        source: pluginInfo.source || 'manual',
        code: pluginInfo.code || null  // 保存插件代码
      })
      localStorage.setItem('installed_plugins', JSON.stringify(installedPluginsList))
      
      console.log('🎉 插件安装完成!')
      console.log('📊 插件详细信息:')
      console.log(`   - ID: ${manifest.id}`)
      console.log(`   - 名称: ${manifest.name}`)
      console.log(`   - 版本: ${manifest.version}`)
      console.log(`   - 作者: ${manifest.author}`)
      console.log(`   - 来源: ${pluginInfo.source || 'manual'}`)
      
      // 显示成功消息
      importError.value = ''
      console.log(`✨ "${manifest.name}" 插件已成功安装并加载！`)
      
      // 触发UI更新
      triggerPluginUpdate()
      // 同时触发导航侧边栏更新
      appStore.triggerTabSystemUpdate()
    } else {
      throw new Error('插件加载失败')
    }
  } catch (error) {
    console.error('插件安装失败:', error)
    throw error
  }
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

const uninstallPlugin = async (pluginId: string) => {
  if (confirm('确定要卸载这个插件吗？')) {
    try {
      // 使用插件管理器卸载插件
      await pluginManager.unloadPlugin(pluginId)
      
      // 从本地存储中移除
      const installedPluginsList = JSON.parse(localStorage.getItem('installed_plugins') || '[]')
      const updatedList = installedPluginsList.filter(item => item.manifest.id !== pluginId)
      localStorage.setItem('installed_plugins', JSON.stringify(updatedList))
      
      console.log('插件卸载成功')
      
      // 触发UI更新
      triggerPluginUpdate()
      // 同时触发导航侧边栏更新
      appStore.triggerTabSystemUpdate()
    } catch (error) {
      console.error('插件卸载失败:', error)
    }
  }
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
