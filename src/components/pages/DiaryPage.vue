<template>
  <div class="h-full bg-white flex flex-col workspace-sync">
    <!-- 日记头部 -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">我的日记</h1>
          <p class="text-gray-600">记录生活点滴，追踪成长轨迹</p>
        </div>
        <button
          @click="createTodayDiary"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus class="w-4 h-4" />
          <span>今日日记</span>
        </button>
      </div>
    </div>
    
    <!-- 日记内容 -->
    <div class="flex-1 overflow-hidden flex">
      <!-- 日记列表 -->
      <div class="w-80 border-r border-gray-200 flex flex-col">
        <!-- 搜索和过滤 -->
        <div class="p-4 border-b border-gray-200">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索日记..."
              class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          
          <!-- 年月选择 -->
          <div class="mt-3 flex space-x-2">
            <select
              v-model="selectedYear"
              @change="filterDiaries"
              class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
            <select
              v-model="selectedMonth"
              @change="filterDiaries"
              class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="">全部</option>
              <option v-for="month in 12" :key="month" :value="month">
                {{ month }}月
              </option>
            </select>
          </div>
        </div>
        
        <!-- 日记列表 -->
        <div class="flex-1 overflow-auto">
          <div v-if="filteredDiaries.length === 0" class="p-4 text-center">
            <BookOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500 text-sm">暂无日记</p>
          </div>
          
          <diary-list-item
            v-for="diary in filteredDiaries"
            :key="diary.id"
            :diary="diary"
            :active="selectedDiary?.id === diary.id"
            @select="selectDiary"
            @delete="deleteDiary"
          />
        </div>
        
        <!-- 统计信息 -->
        <div class="p-4 border-t border-gray-200 bg-gray-50">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-lg font-bold text-gray-900">{{ diaries.length }}</div>
              <div class="text-xs text-gray-500">总日记数</div>
            </div>
            <div>
              <div class="text-lg font-bold text-gray-900">{{ continuousDays }}</div>
              <div class="text-xs text-gray-500">连续天数</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 日记内容区域 -->
      <div class="flex-1 flex flex-col">
        <div v-if="!selectedDiary" class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <BookOpen class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-600 mb-2">选择一篇日记开始阅读</h3>
            <p class="text-gray-500 mb-4">或者创建今日的新日记</p>
            <button
              @click="createTodayDiary"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              写日记
            </button>
          </div>
        </div>
        
        <div v-else class="flex-1 flex flex-col">
          <!-- 日记头部信息 -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ selectedDiary.title }}</h2>
                <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span class="flex items-center space-x-1">
                    <Calendar class="w-4 h-4" />
                    <span>{{ formatDate(selectedDiary.date) }}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <Clock class="w-4 h-4" />
                    <span>{{ selectedDiary.wordCount }} 字</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <Thermometer class="w-4 h-4" />
                    <span>{{ selectedDiary.mood }}</span>
                  </span>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <button
                  @click="editDiary(selectedDiary)"
                  class="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="编辑日记"
                >
                  <Edit class="w-4 h-4" />
                </button>
                <button
                  @click="deleteDiary(selectedDiary.id)"
                  class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除日记"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- 日记内容显示 -->
          <div class="flex-1 overflow-auto p-6">
            <div class="prose max-w-none" v-html="renderedContent"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  Plus,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Thermometer,
  Edit,
  Trash2
} from 'lucide-vue-next'
import DiaryListItem from '@/components/common/DiaryListItem.vue'

const appStore = useAppStore()

// 日记数据类型
interface Diary {
  id: string
  title: string
  date: string
  content: string
  mood: string
  wordCount: number
  weather?: string
}

// 状态管理
const searchQuery = ref('')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref('')
const selectedDiary = ref<Diary | null>(null)

// 模拟日记数据
const diaries = ref<Diary[]>([
  {
    id: '1',
    title: '2024-09-15 日记',
    date: '2024-09-15',
    content: '# 今日感想\n\n今天学习了 TypeScript 的高级类型，感觉对类型系统有了更深的理解。\n\n## 学习收获\n\n1. 联合类型和交叉类型的使用\n2. 泛型的高级用法\n3. 条件类型的应用场景\n\n## 明日计划\n\n- 继续深入学习 TypeScript\n- 完成项目的类型定义\n- 复习今天的内容',
    mood: '😊 开心',
    wordCount: 156,
    weather: '☀️ 晴'
  },
  {
    id: '2',
    title: '2024-09-14 日记',
    date: '2024-09-14',
    content: '# 项目进展\n\n今天主要工作在优化 Memory Note 的界面设计。\n\n## 完成的工作\n\n- 重新设计了导航栏\n- 优化了文件树组件\n- 添加了搜索功能\n\n感觉项目越来越像样了！',
    mood: '😌 满足',
    wordCount: 98,
    weather: '🌤️ 多云'
  },
  {
    id: '3',
    title: '2024-09-13 日记',
    date: '2024-09-13',
    content: '# 周末思考\n\n今天是周末，放慢了节奏，思考了一些人生规划的问题。\n\n## 思考要点\n\n- 技术成长路径\n- 工作与生活的平衡\n- 未来的目标设定\n\n需要更加明确自己的方向。',
    mood: '🤔 思考',
    wordCount: 87,
    weather: '🌧️ 小雨'
  }
])

// 计算属性
const availableYears = computed(() => {
  const years = [...new Set(diaries.value.map(d => new Date(d.date).getFullYear()))]
  return years.sort((a, b) => b - a)
})

const filteredDiaries = computed(() => {
  let filtered = diaries.value.filter(diary => {
    const diaryDate = new Date(diary.date)
    const yearMatch = diaryDate.getFullYear() === selectedYear.value
    const monthMatch = !selectedMonth.value || diaryDate.getMonth() + 1 === parseInt(selectedMonth.value)
    const searchMatch = !searchQuery.value || 
      diary.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      diary.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    return yearMatch && monthMatch && searchMatch
  })
  
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const continuousDays = computed(() => {
  // 简化的连续天数计算
  const sortedDates = diaries.value
    .map(d => new Date(d.date))
    .sort((a, b) => b.getTime() - a.getTime())
  
  let continuous = 0
  let currentDate = new Date()
  
  for (const date of sortedDates) {
    const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === continuous) {
      continuous++
      currentDate = date
    } else {
      break
    }
  }
  
  return continuous
})

const renderedContent = computed(() => {
  if (!selectedDiary.value) return ''
  
  // 简单的 Markdown 渲染
  return selectedDiary.value.content
    .replace(/# (.*)/g, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
    .replace(/## (.*)/g, '<h2 class="text-xl font-semibold mb-3 mt-6">$1</h2>')
    .replace(/### (.*)/g, '<h3 class="text-lg font-medium mb-2 mt-4">$1</h3>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(.*)$/gm, '<p class="mb-4">$1</p>')
    .replace(/- (.*)/g, '<li class="ml-4 list-disc">$1</li>')
})

// 方法
const createTodayDiary = () => {
  const today = new Date().toISOString().split('T')[0]
  const diaryName = `日记-${today}.md`
  
  // 检查今日日记是否已存在
  const existingDiary = diaries.value.find(d => d.date === today)
  if (existingDiary) {
    editDiary(existingDiary)
    return
  }
  
  appStore.addTab({
    name: diaryName,
    content: `# ${today} 日记\n\n## 今日心情\n\n😊\n\n## 今日事件\n\n\n\n## 学习收获\n\n\n\n## 明日计划\n\n`,
    saved: false,
    type: 'diary'
  })
}

const selectDiary = (diary: Diary) => {
  selectedDiary.value = diary
}

const editDiary = (diary: Diary) => {
  // 使用新的文档系统打开日记
  appStore.createNewDocument({
    title: diary.title,
    content: diary.content
  })
}

const deleteDiary = (diaryId: string) => {
  if (confirm('确定要删除这篇日记吗？')) {
    const index = diaries.value.findIndex(d => d.id === diaryId)
    if (index !== -1) {
      diaries.value.splice(index, 1)
      if (selectedDiary.value?.id === diaryId) {
        selectedDiary.value = null
      }
    }
  }
}

const filterDiaries = () => {
  // 过滤逻辑已在计算属性中处理
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

onMounted(() => {
  // 默认选择最新的日记
  if (filteredDiaries.value.length > 0) {
    selectedDiary.value = filteredDiaries.value[0]
  }
})
</script>

<style scoped>
.prose h1 {
  @apply text-2xl font-bold mb-4 text-gray-900;
}

.prose h2 {
  @apply text-xl font-semibold mb-3 mt-6 text-gray-800;
}

.prose h3 {
  @apply text-lg font-medium mb-2 mt-4 text-gray-700;
}

.prose p {
  @apply mb-4 text-gray-700 leading-relaxed;
}

.prose li {
  @apply ml-4 list-disc text-gray-700;
}
</style>
