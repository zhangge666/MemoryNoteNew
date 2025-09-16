<template>
  <div id="app" class="h-screen flex flex-col bg-gray-50">
    <!-- 自定义标题栏 -->
    <TitleBar />
    
    <!-- 主工作区 -->
    <div class="flex-1 relative overflow-hidden">
      <!-- 左侧导航栏 - 固定定位 -->
      <NavigationSidebar />
      
      <!-- 左侧文件树 - 绝对定位 -->
      <Transition
        name="push-left"
        enter-active-class="push-left-enter-active"
        leave-active-class="push-left-leave-active"
        enter-from-class="push-left-enter-from"
        enter-to-class="push-left-enter-to"
        leave-from-class="push-left-leave-from"
        leave-to-class="push-left-leave-to"
      >
        <FileTreeSidebar v-if="!appStore.isLeftSidebarCollapsed" />
      </Transition>
      
      <!-- 主内容区域 - 使用动态左边距 -->
      <div 
        class="flex flex-col h-full workspace-sync gpu-accelerated transition-all duration-300 ease-out"
        :style="{ 
          marginLeft: appStore.isLeftSidebarCollapsed ? '60px' : `${60 + appStore.leftSidebarWidth}px`,
          marginRight: appStore.isRightSidebarCollapsed ? '0px' : `${appStore.rightSidebarWidth}px`
        }"
      >
        <!-- 新的标签系统容器 -->
        <TabPanelContainer />
      </div>
      
      
      <!-- 右侧栏 - 绝对定位 -->
      <Transition
        name="push-right"
        enter-active-class="push-right-enter-active"
        leave-active-class="push-right-leave-active"
        enter-from-class="push-right-enter-from"
        enter-to-class="push-right-enter-to"
        leave-from-class="push-right-leave-from"
        leave-to-class="push-right-leave-to"
      >
        <RightSidebar v-if="!appStore.isRightSidebarCollapsed" />
      </Transition>
    </div>
    
    <!-- 状态栏 -->
    <StatusBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import TitleBar from '@/components/layout/TitleBar.vue'
import NavigationSidebar from '@/components/layout/NavigationSidebar.vue'
import FileTreeSidebar from '@/components/layout/FileTreeSidebar.vue'
import RightSidebar from '@/components/layout/RightSidebar.vue'
import StatusBar from '@/components/layout/StatusBar.vue'
import TabPanelContainer from '@/components/layout/TabPanelContainer.vue'

// 使用应用状态管理
const appStore = useAppStore()

// 计算属性
const currentNavItem = computed(() => appStore.currentNavItem)

// 初始化应用 - 只在首次加载时执行
onMounted(() => {
  appStore.initializeApp()
})

// 侧边栏折叠状态由store管理
</script>

<style scoped>
/* 应用级别的样式 */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
