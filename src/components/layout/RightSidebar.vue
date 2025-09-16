<template>
  <div 
    class="bg-white border-l border-gray-200 flex flex-col relative min-w-0"
    :style="{ width: `${appStore.rightSidebarWidth}px` }"
  >
    <!-- 右侧栏标题 -->
    <div class="h-8 px-3 flex items-center justify-between border-b border-gray-200 bg-gray-50">
      <span class="text-xs font-medium text-gray-700">扩展面板</span>
      <button
        @click="$emit('close')"
        class="p-1 hover:bg-gray-200 rounded transition-colors"
      >
        <X class="w-3 h-3 text-gray-500" />
      </button>
    </div>
    
    <!-- 标签切换 -->
    <div class="flex border-b border-gray-200">
      <button
        v-for="tab in rightSidebarTabs"
        :key="tab.id"
        @click="activeRightTab = tab.id"
        class="flex-1 px-3 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0 transition-colors"
        :class="{
          'bg-white text-blue-600 border-b-2 border-blue-600': activeRightTab === tab.id,
          'bg-gray-50 text-gray-600 hover:bg-gray-100': activeRightTab !== tab.id
        }"
      >
        <component :is="tab.icon" class="w-4 h-4 mx-auto" />
      </button>
    </div>
    
    <!-- 内容区域 -->
    <div class="flex-1 overflow-auto">
      <!-- 大纲视图 -->
      <div v-if="activeRightTab === 'outline'" class="p-3">
        <h3 class="text-sm font-medium text-gray-700 mb-3">文档大纲</h3>
        <div v-if="documentOutline.length === 0" class="text-sm text-gray-500 text-center py-8">
          <FileText class="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p>当前文档暂无标题</p>
        </div>
        <div v-else class="space-y-1">
          <div
            v-for="item in documentOutline"
            :key="item.id"
            @click="jumpToHeading(item)"
            class="text-sm text-gray-700 hover:text-blue-600 cursor-pointer py-1 px-2 rounded hover:bg-blue-50 transition-colors"
            :class="`pl-${item.level * 2 + 2}`"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
      
      <!-- 复习管理 -->
      <div v-else-if="activeRightTab === 'review'" class="p-3">
        <h3 class="text-sm font-medium text-gray-700 mb-3">复习管理</h3>
        <div class="space-y-3">
          <div class="bg-blue-50 p-3 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-blue-700">今日复习</span>
              <span class="text-xs text-blue-600">3 篇</span>
            </div>
            <button class="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
              开始复习
            </button>
          </div>
          
          <div class="bg-orange-50 p-3 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-orange-700">即将到期</span>
              <span class="text-xs text-orange-600">5 篇</span>
            </div>
            <div class="text-xs text-orange-600">明天需要复习</div>
          </div>
          
          <div class="space-y-2">
            <h4 class="text-xs font-medium text-gray-600">复习统计</h4>
            <div class="text-xs text-gray-500 space-y-1">
              <div class="flex justify-between">
                <span>本周已复习</span>
                <span>12 篇</span>
              </div>
              <div class="flex justify-between">
                <span>总计笔记</span>
                <span>48 篇</span>
              </div>
              <div class="flex justify-between">
                <span>复习完成率</span>
                <span>85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 插件扩展 -->
      <div v-else-if="activeRightTab === 'plugins'" class="p-3">
        <h3 class="text-sm font-medium text-gray-700 mb-3">已安装插件</h3>
        <div v-if="installedPlugins.length === 0" class="text-sm text-gray-500 text-center py-8">
          <Package class="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p>暂无已安装插件</p>
          <button class="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
            浏览插件商店
          </button>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="plugin in installedPlugins"
            :key="plugin.id"
            class="p-2 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">{{ plugin.name }}</span>
              <button class="text-xs text-blue-600 hover:text-blue-800">设置</button>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ plugin.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 可调整大小的分隔条 -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-blue-400 transition-all duration-200 z-10 group"
      @mousedown="startResize"
    >
      <div class="w-full h-full bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>
      <!-- 调整提示 -->
      <div class="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="w-1 h-8 bg-blue-500 rounded-full shadow-lg"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  X,
  List,
  RotateCcw,
  Package,
  FileText
} from 'lucide-vue-next'

defineEmits<{
  close: []
}>()

const appStore = useAppStore()

const activeRightTab = ref('outline')

// 右侧栏标签配置
const rightSidebarTabs = [
  {
    id: 'outline',
    icon: List,
    label: '大纲'
  },
  {
    id: 'review',
    icon: RotateCcw,
    label: '复习'
  },
  {
    id: 'plugins',
    icon: Package,
    label: '插件'
  }
]

// 文档大纲数据 (模拟)
const documentOutline = ref([
  { id: '1', text: '项目介绍', level: 1, line: 1 },
  { id: '2', text: '技术栈', level: 2, line: 15 },
  { id: '3', text: '功能特性', level: 2, line: 25 },
  { id: '4', text: '安装使用', level: 1, line: 40 },
  { id: '5', text: '配置说明', level: 2, line: 50 }
])

// 已安装插件数据 (模拟)
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
    enabled: true
  }
])

// 跳转到标题
const jumpToHeading = (item: any) => {
  // TODO: 实现跳转到编辑器指定行的功能
  console.log('跳转到标题:', item.text, '行号:', item.line)
}

// 调整侧边栏大小
const startResize = (e: MouseEvent) => {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = appStore.rightSidebarWidth
  
  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    // 右侧栏向左拖拽减小宽度，向右拖拽增大宽度
    const newWidth = Math.max(250, Math.min(600, startWidth - deltaX))
    appStore.rightSidebarWidth = newWidth
  }
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>
