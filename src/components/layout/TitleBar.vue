<template>
  <div class="h-8 bg-white border-b border-gray-200 flex items-center drag-region">
    <!-- 左侧区域 -->
    <div class="flex items-center px-3 space-x-2 no-drag">
      <!-- 应用图标 -->
      <div class="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
        <span class="text-white text-xs font-bold">M</span>
      </div>
      
      <!-- 左侧栏切换按钮 -->
      <button
        @click="toggleLeftSidebar"
        class="p-1 hover:bg-gray-100 rounded transition-colors"
        :title="$t('toolbar.toggleSidebar')"
      >
        <Menu class="w-3 h-3 text-gray-600" />
      </button>
      
      <!-- 搜索按钮 -->
      <button
        @click="openSearch"
        class="p-1 hover:bg-gray-100 rounded transition-colors"
        :title="$t('toolbar.search')"
      >
        <Search class="w-3 h-3 text-gray-600" />
      </button>
    </div>
    
    <!-- 中间标签管理区域 -->
    <div class="flex-1 flex justify-center items-center drag-region">
      <div class="flex items-center space-x-4 no-drag">
        <!-- 分屏布局按钮 -->
        <button
          @click="toggleSplitView"
          class="p-1 hover:bg-gray-100 rounded transition-colors"
          :title="$t('toolbar.splitView')"
        >
          <SplitSquareHorizontal class="w-3 h-3 text-gray-600" />
        </button>
      </div>
    </div>
    
    <!-- 右侧区域 -->
    <div class="flex items-center px-3 space-x-2 no-drag">
      <!-- 用户头像 -->
      <div class="relative">
        <button
          @click="toggleUserMenu"
          class="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
        >
          <User class="w-3 h-3 text-gray-600" />
        </button>
        
        <!-- 用户菜单下拉 -->
        <div v-if="showUserMenu" class="absolute right-0 top-6 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          <div class="px-3 py-2 border-b border-gray-100">
            <div class="text-sm font-medium text-gray-900">用户</div>
            <div class="text-xs text-gray-500">user@example.com</div>
          </div>
          <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            学习提醒
          </button>
          <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            个人统计
          </button>
        </div>
      </div>
      
      <!-- 右侧栏切换按钮 -->
      <button
        @click="toggleRightSidebar"
        class="p-1 hover:bg-gray-100 rounded transition-colors"
        :title="$t('toolbar.toggleRightSidebar')"
      >
        <PanelRight class="w-3 h-3 text-gray-600" />
      </button>
      
      <!-- 窗口控制按钮 -->
      <div class="flex items-center space-x-1">
        <button
          @click="minimizeWindow"
          class="p-1 hover:bg-gray-100 rounded transition-colors"
          title="最小化"
        >
          <Minimize2 class="w-3 h-3 text-gray-600" />
        </button>
        <button
          @click="maximizeWindow"
          class="p-1 hover:bg-gray-100 rounded transition-colors"
          title="最大化"
        >
          <Maximize2 class="w-3 h-3 text-gray-600" />
        </button>
        <button
          @click="closeWindow"
          class="p-1 hover:bg-red-100 rounded transition-colors group"
          title="关闭"
        >
          <X class="w-3 h-3 text-gray-600 group-hover:text-red-600" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import {
  Menu,
  Search,
  SplitSquareHorizontal,
  User,
  PanelRight,
  Minimize2,
  Maximize2,
  X
} from 'lucide-vue-next'

const { t } = useI18n()
const appStore = useAppStore()

const showUserMenu = ref(false)

// 切换左侧栏
const toggleLeftSidebar = () => {
  appStore.toggleLeftSidebar()
}

// 切换右侧栏
const toggleRightSidebar = () => {
  appStore.toggleRightSidebar()
}

// 打开搜索
const openSearch = () => {
  // TODO: 实现搜索功能
  console.log('打开搜索')
}

// 切换分屏视图
const toggleSplitView = () => {
  // TODO: 实现分屏功能
  console.log('切换分屏视图')
}

// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 窗口控制
const minimizeWindow = () => {
  window.electronAPI?.minimizeWindow()
}

const maximizeWindow = () => {
  window.electronAPI?.maximizeWindow()
}

const closeWindow = () => {
  window.electronAPI?.closeWindow()
}

// 点击外部关闭用户菜单
document.addEventListener('click', (e) => {
  if (!e.target?.closest('.relative')) {
    showUserMenu.value = false
  }
})
</script>

<style scoped>
/* 标题栏专用样式 */
.drag-region {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}
</style>

