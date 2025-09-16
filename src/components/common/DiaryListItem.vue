<template>
  <div
    @click="$emit('select', diary)"
    class="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
    :class="{ 'bg-green-50 border-green-200': active }"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-1">
          <h3 class="font-medium text-gray-900 text-sm">{{ formatTitle(diary.title) }}</h3>
          <span class="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
            {{ diary.mood }}
          </span>
        </div>
        
        <p class="text-xs text-gray-500 mb-2">{{ formatDate(diary.date) }}</p>
        
        <p class="text-sm text-gray-600 line-clamp-2">{{ getPreview(diary.content) }}</p>
        
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-gray-400">{{ diary.wordCount }} 字</span>
          <button
            @click.stop="$emit('delete', diary.id)"
            class="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'

interface Diary {
  id: string
  title: string
  date: string
  content: string
  mood: string
  wordCount: number
}

interface Props {
  diary: Diary
  active: boolean
}

defineProps<Props>()

defineEmits<{
  select: [diary: Diary]
  delete: [id: string]
}>()

const formatTitle = (title: string) => {
  // 移除日期前缀，只显示核心标题
  return title.replace(/^\d{4}-\d{2}-\d{2}\s*/, '')
}

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

const getPreview = (content: string) => {
  // 移除 Markdown 语法，获取纯文本预览
  return content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 60) + (content.length > 60 ? '...' : '')
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

