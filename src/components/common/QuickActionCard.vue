<template>
  <div 
    @click="$emit('click')"
    class="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 group"
    :class="`hover:border-${color}-300`"
  >
    <div class="flex items-center space-x-3">
      <div 
        class="w-10 h-10 rounded-lg flex items-center justify-center"
        :class="`bg-${color}-100 text-${color}-600 group-hover:bg-${color}-200`"
      >
        <component :is="iconComponent" class="w-5 h-5" />
      </div>
      <div class="flex-1">
        <h3 class="font-medium text-gray-900">{{ title }}</h3>
        <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
      </div>
      <ChevronRight class="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  FileText,
  BookOpen,
  RotateCcw,
  Search,
  ChevronRight
} from 'lucide-vue-next'

interface Props {
  title: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'orange' | 'purple'
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

// 图标映射
const iconMap = {
  FileText,
  BookOpen,
  RotateCcw,
  Search
}

const iconComponent = computed(() => {
  return iconMap[props.icon as keyof typeof iconMap] || FileText
})
</script>

