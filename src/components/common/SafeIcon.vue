<template>
  <component 
    v-if="iconComponent" 
    :is="iconComponent" 
    :class="iconClass"
  />
  <FileText 
    v-else 
    :class="iconClass" 
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  FileText, 
  Home, 
  Rss, 
  Search, 
  BookOpen, 
  RotateCcw, 
  Settings 
} from 'lucide-vue-next'

interface Props {
  icon?: any
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: 'w-4 h-4'
})

// 安全的图标映射
const iconMap = {
  Home,
  Rss,
  Search,
  BookOpen,
  RotateCcw,
  Settings,
  FileText
}

const iconComponent = computed(() => {
  if (!props.icon) return null
  
  // 如果是组件，直接返回
  if (typeof props.icon === 'object' && props.icon.__vccOpts) {
    return props.icon
  }
  
  // 如果是字符串，从映射中查找
  if (typeof props.icon === 'string') {
    return iconMap[props.icon as keyof typeof iconMap] || null
  }
  
  // 如果是函数组件，直接返回
  if (typeof props.icon === 'function') {
    return props.icon
  }
  
  return props.icon
})

const iconClass = computed(() => props.class)
</script>
