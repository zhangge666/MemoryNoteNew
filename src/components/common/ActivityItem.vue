<template>
  <div class="flex items-center space-x-3 py-2">
    <div 
      class="w-8 h-8 rounded-full flex items-center justify-center"
      :class="iconBgClass"
    >
      <component :is="iconComponent" class="w-4 h-4" :class="iconColorClass" />
    </div>
    <div class="flex-1">
      <p class="text-sm text-gray-900">{{ activity.title }}</p>
      <p class="text-xs text-gray-500">{{ activity.time }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  FileText,
  RotateCcw,
  BookOpen,
  Edit
} from 'lucide-vue-next'

interface Activity {
  id: string
  type: 'create' | 'review' | 'diary' | 'edit'
  title: string
  time: string
  icon: string
}

interface Props {
  activity: Activity
}

const props = defineProps<Props>()

// 图标映射
const iconMap = {
  FileText,
  RotateCcw,
  BookOpen,
  Edit
}

const iconComponent = computed(() => {
  return iconMap[props.activity.icon as keyof typeof iconMap] || FileText
})

// 根据活动类型设置样式
const iconBgClass = computed(() => {
  const typeClassMap = {
    create: 'bg-blue-100',
    review: 'bg-orange-100',
    diary: 'bg-green-100',
    edit: 'bg-purple-100'
  }
  return typeClassMap[props.activity.type] || 'bg-gray-100'
})

const iconColorClass = computed(() => {
  const typeClassMap = {
    create: 'text-blue-600',
    review: 'text-orange-600',
    diary: 'text-green-600',
    edit: 'text-purple-600'
  }
  return typeClassMap[props.activity.type] || 'text-gray-600'
})
</script>

