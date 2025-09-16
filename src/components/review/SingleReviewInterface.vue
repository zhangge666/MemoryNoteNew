<template>
  <div class="flex-1 flex flex-col">
    <!-- 复习头部 -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold text-gray-900">{{ review.title }}</h2>
          <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
            <span>第{{ review.repetitionCount + 1 }}次复习</span>
            <span>难度: {{ review.difficulty }}/5</span>
            <span>上次: {{ formatLastReviewed(review.lastReviewed) }}</span>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <!-- 复习内容 -->
    <div class="flex-1 flex flex-col p-6">
      <!-- 回忆模式 -->
      <div v-if="!showContent" class="flex-1 flex items-center justify-center">
        <div class="text-center max-w-md">
          <Lightbulb class="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 class="text-xl font-medium text-gray-700 mb-3">开始回忆</h3>
          <p class="text-gray-500 mb-6">尝试回忆关于"{{ review.title }}"的所有相关内容</p>
          
          <div class="space-y-3">
            <button
              @click="showContent = true"
              class="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              我已回忆完毕，显示内容
            </button>
            <button
              @click="giveUpRecall"
              class="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              想不起来，直接查看
            </button>
          </div>
          
          <!-- 提示按钮 -->
          <div class="mt-6">
            <button
              @click="showHint = !showHint"
              class="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {{ showHint ? '隐藏提示' : '需要提示?' }}
            </button>
            <div v-if="showHint" class="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              {{ getHint() }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 内容显示模式 -->
      <div v-else class="flex-1 flex flex-col">
        <!-- 内容区域 -->
        <div class="flex-1 mb-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 class="text-lg font-semibold text-blue-900 mb-4">复习内容</h4>
            <div class="prose max-w-none text-gray-800" v-html="renderedContent"></div>
          </div>
          
          <!-- 相关链接或扩展内容 -->
          <div v-if="hasRelatedContent" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h5 class="font-medium text-gray-900 mb-2">相关内容</h5>
            <div class="space-y-2">
              <a
                v-for="link in relatedLinks"
                :key="link.id"
                @click="openRelatedContent(link)"
                class="block text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {{ link.title }}
              </a>
            </div>
          </div>
        </div>
        
        <!-- 自评区域 -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">复习效果自评</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
            <button
              v-for="score in 5"
              :key="score"
              @click="submitReview(score)"
              class="flex flex-col items-center p-4 border-2 rounded-lg transition-all hover:shadow-md"
              :class="getScoreButtonClass(score)"
            >
              <div class="text-3xl mb-2">{{ getScoreEmoji(score) }}</div>
              <div class="text-sm font-medium text-center">{{ getScoreLabel(score) }}</div>
              <div class="text-xs text-gray-500 mt-1 text-center">{{ getScoreDescription(score) }}</div>
            </button>
          </div>
          
          <!-- 下次复习预告 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">复习间隔预告</h4>
            <div class="grid grid-cols-5 gap-2 text-xs">
              <div v-for="score in 5" :key="score" class="text-center">
                <div class="font-medium">{{ getScoreLabel(score) }}</div>
                <div class="text-gray-500">{{ getNextInterval(score) }}</div>
              </div>
            </div>
          </div>
          
          <!-- 笔记区域 -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              复习笔记 (可选)
            </label>
            <textarea
              v-model="reviewNote"
              rows="3"
              placeholder="记录你的想法、疑问或者改进建议..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Lightbulb, X } from 'lucide-vue-next'

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
  review: ReviewItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [quality: number]
  close: []
}>()

const showContent = ref(false)
const showHint = ref(false)
const reviewNote = ref('')

const renderedContent = computed(() => {
  return props.review.content
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^(.*)$/gm, '<p class="mb-3">$1</p>')
})

const hasRelatedContent = computed(() => {
  return relatedLinks.value.length > 0
})

// 模拟相关内容
const relatedLinks = ref([
  { id: '1', title: 'JavaScript 作用域链', type: 'note' },
  { id: '2', title: 'ES6 箭头函数', type: 'note' }
])

const giveUpRecall = () => {
  showContent.value = true
  // 记录用户直接查看，可能影响评分建议
}

const getHint = () => {
  // 根据标题生成简单提示
  const hints = {
    'JavaScript 闭包概念': '提示：函数 + 作用域 + 变量访问',
    'Vue 3 组合式 API': '提示：setup函数、响应式、生命周期',
    'TypeScript 泛型': '提示：<T>、类型参数、类型约束'
  }
  
  return hints[props.review.title as keyof typeof hints] || '仔细思考这个概念的核心要点...'
}

const submitReview = (quality: number) => {
  emit('complete', quality)
}

const openRelatedContent = (link: any) => {
  // 打开相关内容
  console.log('打开相关内容:', link.title)
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

const getNextInterval = (score: number) => {
  // 根据当前复习项目和评分预测下次间隔
  const { repetitionCount, easeFactor, intervalDays } = props.review
  
  if (score < 3) {
    return '1天'
  }
  
  let nextInterval: number
  if (repetitionCount === 0) {
    nextInterval = 1
  } else if (repetitionCount === 1) {
    nextInterval = 6
  } else {
    const adjustedEaseFactor = Math.max(1.3, easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)))
    nextInterval = Math.round(intervalDays * adjustedEaseFactor)
  }
  
  if (nextInterval === 1) return '1天'
  if (nextInterval < 7) return `${nextInterval}天`
  if (nextInterval < 30) return `${Math.round(nextInterval / 7)}周`
  return `${Math.round(nextInterval / 30)}月`
}
</script>

<style scoped>
.prose p {
  @apply mb-3 text-gray-800 leading-relaxed;
}
</style>
