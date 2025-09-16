<template>
  <div id="app" class="h-screen flex flex-col bg-gray-50">
    <!-- 自定义标题栏 -->
    <TitleBar />
    
    <!-- 主工作区 -->
    <div class="flex flex-1 overflow-hidden layout-transition gpu-accelerated">
      <!-- 左侧导航栏 -->
      <NavigationSidebar />
      
      <!-- 左侧文件树 -->
      <Transition
        name="slide-left"
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform -translate-x-full opacity-0"
        enter-to-class="transform translate-x-0 opacity-100"
        leave-from-class="transform translate-x-0 opacity-100"
        leave-to-class="transform -translate-x-full opacity-0"
      >
        <FileTreeSidebar v-if="!appStore.isLeftSidebarCollapsed" />
      </Transition>
      
      <!-- 主内容区域 -->
      <div class="flex-1 flex flex-col workspace-transition gpu-accelerated">
        <!-- 标签页区域 -->
        <TabManager />
        
        <!-- 主内容区域 -->
        <div class="flex-1 overflow-hidden">
          <!-- 根据当前导航显示不同页面 -->
          <HomePage v-if="currentNavItem === 'home'" />
          <SubscribePage v-else-if="currentNavItem === 'subscribe'" />
          <SearchPage v-else-if="currentNavItem === 'search'" />
          <DiaryPage v-else-if="currentNavItem === 'diary'" />
          <ReviewPage v-else-if="currentNavItem === 'review'" />
          <SettingsPage v-else-if="currentNavItem === 'settings'" />
          
          <!-- 默认编辑器区域 -->
          <EditorContainer v-else />
        </div>
      </div>
      
      <!-- 右侧栏 -->
      <Transition
        name="slide-right"
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform translate-x-full opacity-0"
        enter-to-class="transform translate-x-0 opacity-100"
        leave-from-class="transform translate-x-0 opacity-100"
        leave-to-class="transform translate-x-full opacity-0"
      >
        <RightSidebar v-if="!appStore.isRightSidebarCollapsed" />
      </Transition>
    </div>
    
    <!-- 状态栏 -->
    <StatusBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'
import TitleBar from '@/components/layout/TitleBar.vue'
import NavigationSidebar from '@/components/layout/NavigationSidebar.vue'
import FileTreeSidebar from '@/components/layout/FileTreeSidebar.vue'
import TabManager from '@/components/layout/TabManager.vue'
import EditorContainer from '@/components/editor/EditorContainer.vue'
import RightSidebar from '@/components/layout/RightSidebar.vue'
import StatusBar from '@/components/layout/StatusBar.vue'
import HomePage from '@/components/pages/HomePage.vue'
import SubscribePage from '@/components/pages/SubscribePage.vue'
import SearchPage from '@/components/pages/SearchPage.vue'
import DiaryPage from '@/components/pages/DiaryPage.vue'
import ReviewPage from '@/components/pages/ReviewPage.vue'
import SettingsPage from '@/components/pages/SettingsPage.vue'

// 使用应用状态管理
const appStore = useAppStore()

// 计算属性
const currentNavItem = computed(() => appStore.currentNavItem)

// 侧边栏折叠状态由store管理
</script>

<style scoped>
/* 应用级别的样式 */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
