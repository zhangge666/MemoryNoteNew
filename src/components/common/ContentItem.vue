<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-2">
      <h3 
        class="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
        :class="{ 'text-gray-600': item.read }"
        @click="openItem"
      >
        {{ item.title }}
      </h3>
      <div class="flex items-center space-x-2 ml-4">
        <span v-if="!item.read" class="w-2 h-2 bg-blue-500 rounded-full"></span>
        <button
          @click="$emit('save', item.id)"
          class="p-1 text-gray-400 hover:text-blue-500 transition-colors"
          :class="{ 'text-blue-500': item.saved }"
          title="保存到笔记"
        >
          <Bookmark class="w-4 h-4" :class="{ 'fill-current': item.saved }" />
        </button>
      </div>
    </div>
    
    <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ item.description }}</p>
    
    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>{{ formatDate(item.publishDate) }}</span>
      <div class="flex items-center space-x-2">
        <button
          @click="openItem"
          class="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <ExternalLink class="w-3 h-3" />
          <span>阅读</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bookmark, ExternalLink } from 'lucide-vue-next'

interface ContentItem {
  id: string
  title: string
  description: string
  url: string
  publishDate: string
  read: boolean
  saved: boolean
}

interface Props {
  item: ContentItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  read: [itemId: string]
  save: [itemId: string]
}>()

const openItem = () => {
  // 标记为已读
  if (!props.item.read) {
    emit('read', props.item.id)
  }
  
  // 在浏览器中打开
  window.electronAPI?.openExternal?.(props.item.url)
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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

