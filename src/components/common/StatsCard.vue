<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
        <p class="text-xs mt-2" :class="`text-${color}-600`">{{ trend }}</p>
      </div>
      <div 
        class="w-12 h-12 rounded-lg flex items-center justify-center"
        :class="`bg-${color}-100`"
      >
        <component :is="iconComponent" :class="`w-6 h-6 text-${color}-600`" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  FileText,
  TrendingUp,
  Calendar
} from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  icon: string
  trend: string
  color: 'blue' | 'green' | 'purple'
}

const props = defineProps<Props>()

// 图标映射
const iconMap = {
  FileText,
  TrendingUp,
  Calendar
}

const iconComponent = computed(() => {
  return iconMap[props.icon as keyof typeof iconMap] || FileText
})
</script>

