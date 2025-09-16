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
  Settings
} from 'lucide-vue-next'
import NavButton from './NavButton.vue'

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
}
</script>
