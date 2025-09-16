<template>
  <div class="absolute left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col items-center py-2 z-20" style="width: 60px;">
    <!-- 顶部导航按钮 -->
    <div class="flex flex-col items-center space-y-1">
      <nav-button
        v-for="item in navItems"
        :key="item.id"
        :icon="item.icon"
        :label="item.label"
        :active="currentNavItem === item.id"
        @click="setNavItem(item.id)"
      />
      
      <!-- 插件注册的按钮 -->
      <nav-button
        v-for="button in pluginButtons"
        :key="button.id"
        :icon="getPluginIcon(button.icon)"
        :label="button.title"
        :active="false"
        @click="button.onClick"
      />
    </div>
    
    <!-- 弹性空间 -->
    <div class="flex-1"></div>
    
    <!-- 底部设置按钮 -->
    <div class="flex flex-col items-center">
      <!-- 分隔线 -->
      <div class="w-6 h-px bg-gray-300 mb-2"></div>
      
      <!-- 设置按钮 -->
      <nav-button
        :icon="Settings"
        :label="$t('nav.settings')"
        :active="currentNavItem === 'settings'"
        @click="setNavItem('settings')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import {
  Home,
  Rss,
  Search,
  BookOpen,
  RotateCcw,
  Settings,
  Palette
} from 'lucide-vue-next'
import NavButton from './NavButton.vue'
import { pluginManager } from '@/core/PluginSystem'

const { t } = useI18n()
const appStore = useAppStore()

const currentNavItem = computed(() => appStore.currentNavItem)

// 导航项配置
const navItems = computed(() => [
  {
    id: 'home',
    icon: Home,
    label: t('nav.home')
  },
  {
    id: 'subscribe',
    icon: Rss,
    label: t('nav.subscribe')
  },
  {
    id: 'search',
    icon: Search,
    label: t('nav.search')
  },
  {
    id: 'diary',
    icon: BookOpen,
    label: t('nav.diary')
  },
  {
    id: 'review',
    icon: RotateCcw,
    label: t('nav.review')
  }
])

// 设置当前导航项
const setNavItem = (itemId: string) => {
  appStore.setCurrentNavItem(itemId)
  appStore.openNavigationPage(itemId)
}

// 插件按钮 - 需要响应式更新
const pluginButtons = computed(() => {
  // 监听插件系统变化（通过全局事件或状态）
  appStore.tabSystemUpdateTrigger // 借用已有的更新触发器
  return pluginManager.getAllSidebarButtons()
})

// 获取插件图标
const getPluginIcon = (iconName: string) => {
  // 如果是emoji或字符串图标，直接返回
  if (typeof iconName === 'string' && (iconName.startsWith('�') || iconName.length <= 2)) {
    return iconName
  }
  
  const iconMap = {
    'Palette': Palette,
    'Home': Home,
    'Search': Search,
    'Settings': Settings
  }
  return iconMap[iconName] || Settings
}
</script>
