<template>
  <div
    @click="$emit('select', subscription)"
    class="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
    :class="{ 'bg-blue-50 border-blue-200': active }"
  >
    <div class="flex items-start space-x-3">
      <img 
        :src="subscription.favicon"
        :alt="subscription.title"
        class="w-8 h-8 rounded flex-shrink-0"
        @error="handleImageError"
      />
      
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-medium text-gray-900 text-sm truncate">{{ subscription.title }}</h3>
          <div 
            class="w-2 h-2 rounded-full flex-shrink-0 ml-2"
            :class="getStatusColor(subscription.status)"
          ></div>
        </div>
        
        <p class="text-xs text-gray-500 mb-2">{{ subscription.category }}</p>
        
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">{{ formatLastUpdate(subscription.lastUpdate) }}</span>
          <div class="flex items-center space-x-2">
            <span v-if="subscription.unreadCount > 0" class="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
              {{ subscription.unreadCount }}
            </span>
            <button
              @click.stop="$emit('toggle', subscription.id)"
              class="p-1 text-gray-400 hover:text-orange-500 transition-colors"
              :title="subscription.status === 'active' ? '暂停' : '恢复'"
            >
              <component :is="subscription.status === 'active' ? Pause : Play" class="w-3 h-3" />
            </button>
            <button
              @click.stop="$emit('delete', subscription.id)"
              class="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="删除"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pause, Play, Trash2 } from 'lucide-vue-next'

interface SubscriptionItem {
  id: string
  title: string
  url: string
  category: string
  status: 'active' | 'paused' | 'error'
  favicon: string
  description: string
  lastUpdate: string
  itemCount: number
  unreadCount: number
}

interface Props {
  subscription: SubscriptionItem
  active: boolean
}

defineProps<Props>()

defineEmits<{
  select: [subscription: SubscriptionItem]
  toggle: [id: string]
  delete: [id: string]
}>()

const getStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-400',
    paused: 'bg-yellow-400',
    error: 'bg-red-400'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-400'
}

const formatLastUpdate = (dateString: string) => {
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

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-favicon.ico'
}
</script>

