<template>
  <div class="h-6 bg-blue-600 text-white flex items-center justify-between px-3 text-xs transition-all duration-300 ease-out">
    <!-- 左侧状态信息 -->
    <div class="flex items-center space-x-4">
      <!-- 服务器连接状态 -->
      <div class="flex items-center space-x-1">
        <div 
          class="w-2 h-2 rounded-full"
          :class="{
            'bg-green-400': connectionStatus === 'connected',
            'bg-yellow-400': connectionStatus === 'connecting',
            'bg-red-400': connectionStatus === 'disconnected'
          }"
        ></div>
        <span>{{ connectionStatusText }}</span>
      </div>
      
      <!-- 工作目录 -->
      <div v-if="workingDirectory" class="flex items-center space-x-1">
        <Folder class="w-3 h-3" />
        <span>{{ workingDirectoryName }}</span>
      </div>
    </div>
    
    <!-- 右侧文档信息 -->
    <div class="flex items-center space-x-4">
      <!-- 当前文档信息 -->
      <div v-if="activeTab" class="flex items-center space-x-4">
        <!-- 保存状态 -->
        <div class="flex items-center space-x-1">
          <div 
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-green-400': activeTab.saved,
              'bg-orange-400': !activeTab.saved
            }"
          ></div>
          <span>{{ activeTab.saved ? $t('statusBar.saved') : $t('statusBar.unsaved') }}</span>
        </div>
        
        <!-- 字数统计 -->
        <div class="flex items-center space-x-1">
          <Type class="w-3 h-3" />
          <span>{{ wordCount }} {{ $t('statusBar.words') }}</span>
        </div>
        
        <!-- 行数 -->
        <div class="flex items-center space-x-1">
          <AlignLeft class="w-3 h-3" />
          <span>{{ lineCount }} {{ $t('statusBar.lines') }}</span>
        </div>
        
        <!-- 光标位置 */
        <div class="flex items-center space-x-1">
          <MousePointer class="w-3 h-3" />
          <span>{{ cursorPosition.line }}:{{ cursorPosition.column }}</span>
        </div>
        
        <!-- 编码格式 -->
        <span>UTF-8</span>
        
        <!-- 语言模式 -->
        <span>{{ getLanguageDisplayName(activeTab.name) }}</span>
      </div>
      
      <!-- 系统信息 -->
      <div class="flex items-center space-x-4">
        <!-- 当前时间 -->
        <span>{{ currentTime }}</span>
        
        <!-- 内存使用 -->
        <div class="flex items-center space-x-1">
          <Monitor class="w-3 h-3" />
          <span>{{ memoryUsage }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import {
  Folder,
  Type,
  AlignLeft,
  MousePointer,
  Monitor
} from 'lucide-vue-next'

const { t } = useI18n()
const appStore = useAppStore()

// 响应式数据
const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('connected')
const workingDirectory = ref('/path/to/workspace')
const currentTime = ref('')
const memoryUsage = ref('256MB')
const cursorPosition = ref({ line: 1, column: 1 })

// 计算属性
const activeTab = computed(() => {
  return appStore.tabs.find(tab => tab.id === appStore.activeTabId)
})

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return '已连接'
    case 'connecting':
      return '连接中'
    case 'disconnected':
      return '未连接'
    default:
      return '未知'
  }
})

const workingDirectoryName = computed(() => {
  if (!workingDirectory.value) return ''
  const parts = workingDirectory.value.split('/')
  return parts[parts.length - 1] || parts[parts.length - 2]
})

const wordCount = computed(() => {
  if (!activeTab.value) return 0
  // 简单的中英文字数统计
  const content = activeTab.value.content || ''
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length
  return chineseChars + englishWords
})

const lineCount = computed(() => {
  if (!activeTab.value) return 0
  const content = activeTab.value.content || ''
  return content.split('\n').length
})

// 获取语言显示名称
const getLanguageDisplayName = (fileName: string) => {
  if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
    return 'Markdown'
  } else if (fileName.endsWith('.js')) {
    return 'JavaScript'
  } else if (fileName.endsWith('.ts')) {
    return 'TypeScript'
  } else if (fileName.endsWith('.vue')) {
    return 'Vue'
  } else if (fileName.endsWith('.json')) {
    return 'JSON'
  } else if (fileName.endsWith('.css')) {
    return 'CSS'
  } else if (fileName.endsWith('.html')) {
    return 'HTML'
  } else if (fileName.endsWith('.py')) {
    return 'Python'
  } else if (fileName.endsWith('.java')) {
    return 'Java'
  }
  return 'Plain Text'
}

// 更新当前时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 模拟内存使用更新
const updateMemoryUsage = () => {
  const usage = Math.floor(Math.random() * 50) + 200 // 200-250MB
  memoryUsage.value = `${usage}MB`
}

// 定时器
let timeInterval: number
let memoryInterval: number

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  memoryInterval = setInterval(updateMemoryUsage, 5000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (memoryInterval) clearInterval(memoryInterval)
})

// 监听编辑器光标位置变化 (模拟)
// 在实际应用中，这应该从Monaco编辑器的事件中获取
setTimeout(() => {
  setInterval(() => {
    if (activeTab.value) {
      cursorPosition.value = {
        line: Math.floor(Math.random() * lineCount.value) + 1,
        column: Math.floor(Math.random() * 50) + 1
      }
    }
  }, 2000)
}, 1000)
</script>
