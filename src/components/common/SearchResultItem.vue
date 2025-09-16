<template>
  <div 
    @click="$emit('open', result)"
    class="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
  >
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center space-x-2">
        <component :is="typeIcon" class="w-4 h-4" :class="typeIconClass" />
        <h3 class="font-medium text-gray-900" v-html="highlightText(result.title, query)"></h3>
      </div>
      <span class="text-xs text-gray-500">{{ formatDate(result.lastModified) }}</span>
    </div>
    
    <p class="text-sm text-gray-600 mb-3 line-clamp-2" v-html="highlightText(result.content, query)"></p>
    
    <div class="flex items-center justify-between">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="highlight in result.highlights.slice(0, 3)"
          :key="highlight"
          class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
        >
          {{ highlight }}
        </span>
      </div>
      
      <div class="flex items-center space-x-2 text-xs text-gray-500">
        <span v-if="result.path">{{ getFileName(result.path) }}</span>
        <ChevronRight class="w-3 h-3" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  FileText,
  BookOpen,
  ChevronRight
} from 'lucide-vue-next'

interface SearchResult {
  id: string
  title: string
  content: string
  type: 'file' | 'diary'
  path?: string
  lastModified: string
  highlights: string[]
}

interface Props {
  result: SearchResult
  query: string
}

const props = defineProps<Props>()

defineEmits<{
  open: [result: SearchResult]
}>()

// 类型图标
const typeIcon = computed(() => {
  return props.result.type === 'diary' ? BookOpen : FileText
})

const typeIconClass = computed(() => {
  return props.result.type === 'diary' ? 'text-green-600' : 'text-blue-600'
})

// 高亮搜索关键词
const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// 获取文件名
const getFileName = (path: string) => {
  return path.split('/').pop() || path
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

