<template>
  <div class="h-full bg-white flex flex-col transition-all duration-300 ease-out">
    <!-- 复习头部 -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">智能复习系统</h1>
          <p class="text-gray-600">基于艾宾浩斯遗忘曲线的科学复习计划</p>
        </div>
        <button
          @click="addToReview"
          class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus class="w-4 h-4" />
          <span>添加复习</span>
        </button>
      </div>
    </div>
    
    <!-- 复习内容 -->
    <div class="flex-1 overflow-hidden flex">
      <!-- 复习概览 -->
      <div class="w-80 border-r border-gray-200 flex flex-col">
        <!-- 今日复习概况 -->
        <div class="p-4 bg-orange-50 border-b border-gray-200">
          <h2 class="font-semibold text-gray-900 mb-3">今日复习</h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">待复习</span>
              <span class="font-medium text-orange-600">{{ todayReviews.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">已完成</span>
              <span class="font-medium text-green-600">{{ completedToday }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">完成率</span>
              <span class="font-medium text-blue-600">{{ completionRate }}%</span>
            </div>
          </div>
          
          <button
            v-if="todayReviews.length > 0"
            @click="startBatchReview"
            class="w-full mt-3 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            开始批量复习
          </button>
        </div>
        
        <!-- 复习计划列表 -->
        <div class="flex-1 overflow-auto">
          <div class="p-4">
            <div class="space-y-3">
              <div
                v-for="review in upcomingReviews"
                :key="review.id"
                @click="selectReview(review)"
                class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-all"
                :class="{
                  'border-orange-300 bg-orange-50': review.dueDate <= today,
                  'border-yellow-300 bg-yellow-50': review.dueDate <= tomorrow && review.dueDate > today,
                  'border-gray-200': review.dueDate > tomorrow
                }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900 text-sm">{{ review.title }}</h3>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ formatDueDate(review.dueDate) }}
                    </p>
                    <div class="flex items-center space-x-2 mt-2">
                      <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        第{{ review.repetitionCount }}次
                      </span>
                      <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        难度 {{ review.difficulty }}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end space-y-1">
                    <div 
                      class="w-3 h-3 rounded-full"
                      :class="getDifficultyColor(review.difficulty)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 复习统计 -->
        <div class="p-4 border-t border-gray-200 bg-gray-50">
          <h3 class="font-medium text-gray-900 mb-2 text-sm">复习统计</h3>
          <div class="grid grid-cols-2 gap-3 text-center">
            <div>
              <div class="text-lg font-bold text-gray-900">{{ totalReviews }}</div>
              <div class="text-xs text-gray-500">总复习项</div>
            </div>
            <div>
              <div class="text-lg font-bold text-green-600">{{ masteredCount }}</div>
              <div class="text-xs text-gray-500">已掌握</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 复习内容区域 -->
      <div class="flex-1 flex flex-col">
        <div v-if="!selectedReview && !showBatchReview" class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <RotateCcw class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-600 mb-2">选择一个复习项目</h3>
            <p class="text-gray-500 mb-4">开始你的科学复习之旅</p>
            <div class="space-y-2">
              <button
                v-if="todayReviews.length > 0"
                @click="startBatchReview"
                class="block mx-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                开始今日复习 ({{ todayReviews.length }})
              </button>
              <button
                @click="addToReview"
                class="block mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                添加复习内容
              </button>
            </div>
          </div>
        </div>
        
        <!-- 批量复习界面 -->
        <div v-else-if="showBatchReview" class="flex-1 flex flex-col">
          <batch-review-interface
            :reviews="todayReviews"
            :current-index="currentReviewIndex"
            @complete="handleReviewComplete"
            @next="nextReview"
            @finish="finishBatchReview"
          />
        </div>
        
        <!-- 单个复习界面 -->
        <div v-else-if="selectedReview" class="flex-1 flex flex-col">
          <single-review-interface
            :review="selectedReview"
            @complete="handleSingleReviewComplete"
            @close="selectedReview = null"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { Plus, RotateCcw } from 'lucide-vue-next'
import BatchReviewInterface from '@/components/review/BatchReviewInterface.vue'
import SingleReviewInterface from '@/components/review/SingleReviewInterface.vue'

const appStore = useAppStore()

// 复习项数据类型
interface ReviewItem {
  id: string
  title: string
  content: string
  difficulty: number // 1-5
  repetitionCount: number
  easeFactor: number
  intervalDays: number
  dueDate: string
  lastReviewed?: string
  mastered: boolean
}

// 状态管理
const selectedReview = ref<ReviewItem | null>(null)
const showBatchReview = ref(false)
const currentReviewIndex = ref(0)

// 时间常量
const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

// 模拟复习数据
const reviews = ref<ReviewItem[]>([
  {
    id: '1',
    title: 'JavaScript 闭包概念',
    content: '闭包是指有权访问另一个函数作用域中的变量的函数...',
    difficulty: 3,
    repetitionCount: 2,
    easeFactor: 2.5,
    intervalDays: 3,
    dueDate: today,
    lastReviewed: '2024-09-12',
    mastered: false
  },
  {
    id: '2',
    title: 'Vue 3 组合式 API',
    content: 'Composition API 是 Vue 3 的新特性...',
    difficulty: 2,
    repetitionCount: 1,
    easeFactor: 2.6,
    intervalDays: 1,
    dueDate: today,
    lastReviewed: '2024-09-14',
    mastered: false
  },
  {
    id: '3',
    title: 'TypeScript 泛型',
    content: '泛型提供了一种创建可重用组件的方法...',
    difficulty: 4,
    repetitionCount: 3,
    easeFactor: 2.2,
    intervalDays: 7,
    dueDate: '2024-09-16',
    lastReviewed: '2024-09-09',
    mastered: false
  },
  {
    id: '4',
    title: 'CSS Grid 布局',
    content: 'CSS Grid 是一个二维的布局系统...',
    difficulty: 2,
    repetitionCount: 4,
    easeFactor: 2.8,
    intervalDays: 14,
    dueDate: '2024-09-20',
    lastReviewed: '2024-09-06',
    mastered: true
  }
])

// 计算属性
const todayReviews = computed(() => {
  return reviews.value.filter(review => 
    review.dueDate <= today && !review.mastered
  ).sort((a, b) => a.difficulty - b.difficulty)
})

const upcomingReviews = computed(() => {
  return reviews.value
    .filter(review => !review.mastered)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
})

const completedToday = computed(() => {
  return reviews.value.filter(review => 
    review.lastReviewed === today
  ).length
})

const completionRate = computed(() => {
  const total = todayReviews.value.length + completedToday.value
  return total === 0 ? 100 : Math.round((completedToday.value / total) * 100)
})

const totalReviews = computed(() => reviews.value.length)

const masteredCount = computed(() => {
  return reviews.value.filter(review => review.mastered).length
})

// 方法
const selectReview = (review: ReviewItem) => {
  selectedReview.value = review
  showBatchReview.value = false
}

const startBatchReview = () => {
  if (todayReviews.value.length === 0) return
  
  showBatchReview.value = true
  selectedReview.value = null
  currentReviewIndex.value = 0
}

const addToReview = () => {
  // 显示添加复习内容的对话框
  const title = prompt('请输入要复习的内容标题:')
  if (!title) return
  
  const content = prompt('请输入复习内容:')
  if (!content) return
  
  const newReview: ReviewItem = {
    id: Date.now().toString(),
    title,
    content,
    difficulty: 3,
    repetitionCount: 0,
    easeFactor: 2.5,
    intervalDays: 1,
    dueDate: today,
    mastered: false
  }
  
  reviews.value.push(newReview)
}

const handleReviewComplete = (reviewId: string, quality: number) => {
  updateReviewProgress(reviewId, quality)
}

const handleSingleReviewComplete = (quality: number) => {
  if (selectedReview.value) {
    updateReviewProgress(selectedReview.value.id, quality)
    selectedReview.value = null
  }
}

const nextReview = () => {
  currentReviewIndex.value++
}

const finishBatchReview = () => {
  showBatchReview.value = false
  currentReviewIndex.value = 0
}

// SM-2算法实现
const updateReviewProgress = (reviewId: string, quality: number) => {
  const review = reviews.value.find(r => r.id === reviewId)
  if (!review) return
  
  review.lastReviewed = today
  review.repetitionCount++
  
  // SM-2算法计算
  if (quality < 3) {
    // 回答质量低，重置间隔
    review.repetitionCount = 0
    review.intervalDays = 1
  } else {
    if (review.repetitionCount === 1) {
      review.intervalDays = 1
    } else if (review.repetitionCount === 2) {
      review.intervalDays = 6
    } else {
      review.intervalDays = Math.round(review.intervalDays * review.easeFactor)
    }
    
    // 更新难度因子
    review.easeFactor = review.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (review.easeFactor < 1.3) {
      review.easeFactor = 1.3
    }
  }
  
  // 计算下次复习日期
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + review.intervalDays)
  review.dueDate = nextDate.toISOString().split('T')[0]
  
  // 判断是否掌握（连续3次高质量回答）
  if (quality >= 4 && review.repetitionCount >= 3 && review.intervalDays >= 21) {
    review.mastered = true
  }
}

const formatDueDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return `逾期 ${Math.abs(diffDays)} 天`
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays < 7) return `${diffDays} 天后`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const getDifficultyColor = (difficulty: number) => {
  const colors = {
    1: 'bg-green-400',
    2: 'bg-blue-400',
    3: 'bg-yellow-400',
    4: 'bg-orange-400',
    5: 'bg-red-400'
  }
  return colors[difficulty as keyof typeof colors] || 'bg-gray-400'
}

onMounted(() => {
  // 初始化复习数据
})
</script>
