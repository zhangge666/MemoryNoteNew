<template>
  <div class="flex-1 flex flex-col">
    <!-- 复习进度 -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between mb-2">
        <h2 class="font-semibold text-gray-900">批量复习模式</h2>
        <button
          @click="$emit('finish')"
          class="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
        >
          退出复习
        </button>
      </div>
      
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-orange-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>
        <span class="text-sm text-gray-600">
          {{ currentIndex + 1 }} / {{ reviews.length }}
        </span>
      </div>
    </div>
    
    <!-- 复习内容 -->
    <div v-if="currentReview" class="flex-1 flex flex-col p-6">
      <!-- 题目信息 -->
      <div class="mb-6">
        <div class="flex items-center space-x-2 mb-2">
          <h1 class="text-2xl font-bold text-gray-900">{{ currentReview.title }}</h1>
          <span class="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
            第{{ currentReview.repetitionCount + 1 }}次复习
          </span>
        </div>
        <p class="text-gray-600">
          上次复习: {{ formatLastReviewed(currentReview.lastReviewed) }}
        </p>
      </div>
      
      <!-- 复习内容显示 -->
      <div class="flex-1 mb-6">
        <div v-if="!showAnswer" class="text-center py-12">
          <Lightbulb class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-600 mb-2">回忆一下这个知识点</h3>
          <p class="text-gray-500 mb-6">在心里默念或者口述相关内容</p>
          <button
            @click="showAnswer = true"
            class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            显示答案
          </button>
        </div>
        
        <div v-else class="prose max-w-none">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="text-lg font-semibold text-blue-900 mb-3">复习内容</h4>
            <div class="text-gray-800" v-html="renderedContent"></div>
          </div>
        </div>
      </div>
      
      <!-- 评分区域 -->
      <div v-if="showAnswer" class="border-t border-gray-200 pt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">你记得多少？</h3>
        <div class="grid grid-cols-5 gap-3 mb-4">
          <button
            v-for="score in 5"
            :key="score"
            @click="submitReview(score)"
            class="flex flex-col items-center p-4 border-2 rounded-lg transition-all hover:shadow-md"
            :class="getScoreButtonClass(score)"
          >
            <div class="text-2xl mb-2">{{ getScoreEmoji(score) }}</div>
            <div class="text-sm font-medium">{{ getScoreLabel(score) }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ getScoreDescription(score) }}</div>
          </button>
        </div>
        
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-3">
            评分将影响下次复习的时间间隔
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Lightbulb } from 'lucide-vue-next'

interface ReviewItem {
  id: string
  title: string
  content: string
  difficulty: number
  repetitionCount: number
  easeFactor: number
  intervalDays: number
  dueDate: string
  lastReviewed?: string
  mastered: boolean
}

interface Props {
  reviews: ReviewItem[]
  currentIndex: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [reviewId: string, quality: number]
  next: []
  finish: []
}>()

const showAnswer = ref(false)

const currentReview = computed(() => {
  return props.reviews[props.currentIndex]
})

const progress = computed(() => {
  return ((props.currentIndex + 1) / props.reviews.length) * 100
})

const renderedContent = computed(() => {
  if (!currentReview.value) return ''
  
  // 简单的内容渲染
  return currentReview.value.content
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^(.*)$/gm, '<p class="mb-3">$1</p>')
})

const submitReview = (quality: number) => {
  if (!currentReview.value) return
  
  emit('complete', currentReview.value.id, quality)
  
  // 如果不是最后一个，继续下一个
  if (props.currentIndex < props.reviews.length - 1) {
    showAnswer.value = false
    emit('next')
  } else {
    // 完成所有复习
    emit('finish')
  }
}

const formatLastReviewed = (dateString?: string) => {
  if (!dateString) return '首次复习'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString('zh-CN')
}

const getScoreButtonClass = (score: number) => {
  const classes = {
    1: 'border-red-300 hover:border-red-400 hover:bg-red-50',
    2: 'border-orange-300 hover:border-orange-400 hover:bg-orange-50',
    3: 'border-yellow-300 hover:border-yellow-400 hover:bg-yellow-50',
    4: 'border-blue-300 hover:border-blue-400 hover:bg-blue-50',
    5: 'border-green-300 hover:border-green-400 hover:bg-green-50'
  }
  return classes[score as keyof typeof classes] || 'border-gray-300'
}

const getScoreEmoji = (score: number) => {
  const emojis = ['😞', '😕', '😐', '😊', '😄']
  return emojis[score - 1]
}

const getScoreLabel = (score: number) => {
  const labels = ['完全忘记', '勉强记得', '基本记得', '记得清楚', '非常熟练']
  return labels[score - 1]
}

const getScoreDescription = (score: number) => {
  const descriptions = [
    '需要重新学习',
    '有印象但不清晰',
    '大部分内容记得',
    '内容记得很清楚',
    '可以流利讲述'
  ]
  return descriptions[score - 1]
}
</script>

<style scoped>
.prose p {
  @apply mb-3 text-gray-800 leading-relaxed;
}
</style>
