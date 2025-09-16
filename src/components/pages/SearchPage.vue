<template>
  <div class="h-full bg-white flex flex-col transition-all duration-300 ease-out">
    <!-- 搜索头部 -->
    <div class="p-6 border-b border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">搜索笔记</h1>
      
      <!-- 搜索框 -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="搜索标题、内容或标签..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
        >
          <X class="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <!-- 搜索过滤器 -->
      <div class="mt-4 flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">类型:</span>
          <select
            v-model="searchFilters.type"
            @change="handleSearch"
            class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">全部</option>
            <option value="file">笔记</option>
            <option value="diary">日记</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">时间:</span>
          <select
            v-model="searchFilters.timeRange"
            @change="handleSearch"
            class="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">任何时间</option>
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- 搜索结果 -->
    <div class="flex-1 overflow-auto">
      <div class="p-6">
        <!-- 搜索统计 -->
        <div v-if="searchQuery" class="mb-4">
          <p class="text-sm text-gray-600">
            找到 <span class="font-medium text-gray-900">{{ searchResults.length }}</span> 个结果
            <span v-if="searchTime > 0" class="ml-2">(耗时 {{ searchTime }}ms)</span>
          </p>
        </div>
        
        <!-- 搜索结果列表 -->
        <div v-if="searchResults.length > 0" class="space-y-4">
          <search-result-item
            v-for="result in searchResults"
            :key="result.id"
            :result="result"
            :query="searchQuery"
            @open="openResult"
          />
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="searchQuery" class="text-center py-12">
          <Search class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">未找到相关结果</h3>
          <p class="text-gray-500 mb-4">尝试使用不同的关键词或调整搜索条件</p>
          <button
            @click="clearSearch"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            清除搜索
          </button>
        </div>
        
        <!-- 初始状态 -->
        <div v-else class="text-center py-12">
          <Search class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">搜索你的笔记</h3>
          <p class="text-gray-500 mb-6">输入关键词开始搜索</p>
          
          <!-- 快速搜索建议 -->
          <div class="max-w-md mx-auto">
            <h4 class="text-sm font-medium text-gray-700 mb-3">搜索建议</h4>
            <div class="flex flex-wrap gap-2 justify-center">
              <button
                v-for="suggestion in searchSuggestions"
                :key="suggestion"
                @click="applySuggestion(suggestion)"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { Search, X } from 'lucide-vue-next'
import SearchResultItem from '@/components/common/SearchResultItem.vue'

const appStore = useAppStore()

// 搜索状态
const searchQuery = ref('')
const searchTime = ref(0)
const searchResults = ref<SearchResult[]>([])

// 搜索过滤器
const searchFilters = reactive({
  type: '',
  timeRange: ''
})

// 搜索建议
const searchSuggestions = [
  'JavaScript', 'Vue.js', 'TypeScript', '算法',
  '数据结构', '设计模式', '项目总结'
]

// 模拟搜索结果数据类型
interface SearchResult {
  id: string
  title: string
  content: string
  type: 'file' | 'diary'
  path?: string
  lastModified: string
  highlights: string[]
}

// 模拟搜索数据
const mockSearchData: SearchResult[] = [
  {
    id: '1',
    title: 'Vue 3 组合式 API 学习笔记',
    content: 'Vue 3 引入了组合式 API，它提供了一种更灵活的方式来组织组件逻辑。通过 setup 函数，我们可以更好地复用逻辑代码...',
    type: 'file',
    path: '/notes/vue3-composition-api.md',
    lastModified: '2024-09-15',
    highlights: ['Vue 3', '组合式 API', 'setup 函数']
  },
  {
    id: '2',
    title: 'JavaScript 异步编程总结',
    content: 'JavaScript 中的异步编程是一个重要概念，包括回调函数、Promise、async/await 等方式...',
    type: 'file',
    path: '/notes/javascript-async.md',
    lastModified: '2024-09-14',
    highlights: ['JavaScript', '异步编程', 'Promise', 'async/await']
  },
  {
    id: '3',
    title: '2024-09-15 日记',
    content: '今天学习了 TypeScript 的高级类型，感觉对类型系统有了更深的理解...',
    type: 'diary',
    path: '/diary/2024-09-15.md',
    lastModified: '2024-09-15',
    highlights: ['TypeScript', '高级类型', '类型系统']
  }
]

// 执行搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  const startTime = Date.now()
  
  // 模拟搜索延迟
  setTimeout(() => {
    const query = searchQuery.value.toLowerCase()
    const results = mockSearchData.filter(item => {
      // 基本文本匹配
      const titleMatch = item.title.toLowerCase().includes(query)
      const contentMatch = item.content.toLowerCase().includes(query)
      
      // 类型过滤
      const typeMatch = !searchFilters.type || item.type === searchFilters.type
      
      // 时间过滤 (简化实现)
      const timeMatch = !searchFilters.timeRange || true
      
      return (titleMatch || contentMatch) && typeMatch && timeMatch
    })
    
    searchResults.value = results
    searchTime.value = Date.now() - startTime
  }, 100)
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchFilters.type = ''
  searchFilters.timeRange = ''
}

// 应用搜索建议
const applySuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  handleSearch()
}

// 打开搜索结果
const openResult = (result: SearchResult) => {
  // 检查是否已经打开该文件
  const existingTab = appStore.tabs.find(tab => tab.path === result.path)
  if (existingTab) {
    appStore.setActiveTab(existingTab.id)
  } else {
    // 打开新标签页
    appStore.addTab({
      name: result.title,
      path: result.path,
      content: result.content,
      saved: true,
      type: result.type
    })
  }
}
</script>
