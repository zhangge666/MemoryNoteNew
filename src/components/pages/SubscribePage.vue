<template>
  <div class="h-full bg-white flex flex-col transition-all duration-300 ease-out">
    <!-- 订阅头部 -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">知识订阅</h1>
          <p class="text-gray-600">订阅感兴趣的知识源，自动同步最新内容</p>
        </div>
        <button
          @click="addSubscription"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <Plus class="w-4 h-4" />
          <span>添加订阅</span>
        </button>
      </div>
    </div>
    
    <!-- 订阅内容 -->
    <div class="flex-1 overflow-hidden flex">
      <!-- 订阅源列表 -->
      <div class="w-80 border-r border-gray-200 flex flex-col">
        <!-- 分类过滤 -->
        <div class="p-4 border-b border-gray-200">
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-700">分类筛选</label>
              <select
                v-model="selectedCategory"
                @change="filterSubscriptions"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">全部分类</option>
                <option value="tech">技术</option>
                <option value="design">设计</option>
                <option value="business">商业</option>
                <option value="science">科学</option>
                <option value="other">其他</option>
              </select>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-700">状态筛选</label>
              <select
                v-model="selectedStatus"
                @change="filterSubscriptions"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">全部状态</option>
                <option value="active">活跃</option>
                <option value="paused">暂停</option>
                <option value="error">错误</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- 订阅源列表 -->
        <div class="flex-1 overflow-auto">
          <div v-if="filteredSubscriptions.length === 0" class="p-4 text-center">
            <Rss class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500 text-sm">暂无订阅源</p>
          </div>
          
          <subscription-item
            v-for="subscription in filteredSubscriptions"
            :key="subscription.id"
            :subscription="subscription"
            :active="selectedSubscription?.id === subscription.id"
            @select="selectSubscription"
            @toggle="toggleSubscription"
            @delete="deleteSubscription"
          />
        </div>
        
        <!-- 订阅统计 -->
        <div class="p-4 border-t border-gray-200 bg-gray-50">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <div class="text-lg font-bold text-gray-900">{{ subscriptions.length }}</div>
              <div class="text-xs text-gray-500">订阅源</div>
            </div>
            <div>
              <div class="text-lg font-bold text-blue-600">{{ unreadCount }}</div>
              <div class="text-xs text-gray-500">未读</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="flex-1 flex flex-col">
        <div v-if="!selectedSubscription" class="flex-1 flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <Rss class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-600 mb-2">选择一个订阅源</h3>
            <p class="text-gray-500 mb-4">查看最新的知识内容</p>
            <button
              @click="addSubscription"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              添加订阅源
            </button>
          </div>
        </div>
        
        <div v-else class="flex-1 flex flex-col">
          <!-- 订阅源详情头部 -->
          <div class="p-4 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <img 
                  :src="selectedSubscription.favicon"
                  :alt="selectedSubscription.title"
                  class="w-8 h-8 rounded"
                  @error="handleImageError"
                />
                <div>
                  <h2 class="font-semibold text-gray-900">{{ selectedSubscription.title }}</h2>
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{{ selectedSubscription.category }}</span>
                    <span>{{ formatLastUpdate(selectedSubscription.lastUpdate) }}</span>
                    <span class="flex items-center space-x-1">
                      <div 
                        class="w-2 h-2 rounded-full"
                        :class="getStatusColor(selectedSubscription.status)"
                      ></div>
                      <span>{{ getStatusText(selectedSubscription.status) }}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <button
                  @click="refreshSubscription(selectedSubscription.id)"
                  class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="刷新"
                >
                  <RefreshCw class="w-4 h-4" />
                </button>
                <button
                  @click="toggleSubscription(selectedSubscription.id)"
                  class="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  :title="selectedSubscription.status === 'active' ? '暂停' : '恢复'"
                >
                  <component :is="selectedSubscription.status === 'active' ? Pause : Play" class="w-4 h-4" />
                </button>
                <button
                  @click="openInBrowser(selectedSubscription.url)"
                  class="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="在浏览器中打开"
                >
                  <ExternalLink class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- 内容列表 -->
          <div class="flex-1 overflow-auto">
            <div class="p-4">
              <div v-if="selectedSubscription.items.length === 0" class="text-center py-12">
                <FileText class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-gray-500">暂无内容</p>
              </div>
              
              <div v-else class="space-y-4">
                <content-item
                  v-for="item in selectedSubscription.items"
                  :key="item.id"
                  :item="item"
                  @read="markAsRead"
                  @save="saveToNotes"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加订阅对话框 -->
    <add-subscription-dialog
      v-if="showAddDialog"
      @close="showAddDialog = false"
      @add="handleAddSubscription"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  Plus,
  Rss,
  RefreshCw,
  Pause,
  Play,
  ExternalLink,
  FileText
} from 'lucide-vue-next'
import SubscriptionItem from '@/components/common/SubscriptionItem.vue'
import ContentItem from '@/components/common/ContentItem.vue'
import AddSubscriptionDialog from '@/components/common/AddSubscriptionDialog.vue'

const appStore = useAppStore()

// 订阅源数据类型
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
  items: ContentItem[]
}

interface ContentItem {
  id: string
  title: string
  description: string
  url: string
  publishDate: string
  read: boolean
  saved: boolean
}

// 状态管理
const selectedCategory = ref('')
const selectedStatus = ref('')
const selectedSubscription = ref<SubscriptionItem | null>(null)
const showAddDialog = ref(false)

// 模拟订阅数据
const subscriptions = ref<SubscriptionItem[]>([
  {
    id: '1',
    title: 'Vue.js 官方博客',
    url: 'https://blog.vuejs.org',
    category: 'tech',
    status: 'active',
    favicon: 'https://vuejs.org/logo.svg',
    description: 'Vue.js 框架的最新动态和技术文章',
    lastUpdate: '2024-09-15',
    itemCount: 25,
    unreadCount: 3,
    items: [
      {
        id: '1-1',
        title: 'Vue 3.4 发布：新的响应式系统优化',
        description: 'Vue 3.4 带来了显著的性能提升和新的 API...',
        url: 'https://blog.vuejs.org/posts/vue-3-4.html',
        publishDate: '2024-09-15',
        read: false,
        saved: false
      },
      {
        id: '1-2',
        title: 'Composition API 最佳实践指南',
        description: '深入了解如何在大型项目中有效使用 Composition API...',
        url: 'https://blog.vuejs.org/posts/composition-api-guide.html',
        publishDate: '2024-09-14',
        read: false,
        saved: true
      }
    ]
  },
  {
    id: '2',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    category: 'tech',
    status: 'active',
    favicon: 'https://developer.mozilla.org/favicon.ico',
    description: 'Web 开发技术文档和教程',
    lastUpdate: '2024-09-14',
    itemCount: 15,
    unreadCount: 2,
    items: [
      {
        id: '2-1',
        title: 'CSS Grid 最新特性详解',
        description: 'CSS Grid 的最新特性和使用技巧...',
        url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_Grid_Layout',
        publishDate: '2024-09-14',
        read: true,
        saved: false
      }
    ]
  },
  {
    id: '3',
    title: 'Design Systems Repo',
    url: 'https://designsystemsrepo.com',
    category: 'design',
    status: 'paused',
    favicon: 'https://designsystemsrepo.com/favicon.ico',
    description: '设计系统相关资源和案例',
    lastUpdate: '2024-09-10',
    itemCount: 8,
    unreadCount: 0,
    items: []
  }
])

// 计算属性
const filteredSubscriptions = computed(() => {
  return subscriptions.value.filter(sub => {
    const categoryMatch = !selectedCategory.value || sub.category === selectedCategory.value
    const statusMatch = !selectedStatus.value || sub.status === selectedStatus.value
    return categoryMatch && statusMatch
  })
})

const unreadCount = computed(() => {
  return subscriptions.value.reduce((total, sub) => total + sub.unreadCount, 0)
})

// 方法
const selectSubscription = (subscription: SubscriptionItem) => {
  selectedSubscription.value = subscription
}

const addSubscription = () => {
  showAddDialog.value = true
}

const handleAddSubscription = (subscriptionData: any) => {
  const newSubscription: SubscriptionItem = {
    id: Date.now().toString(),
    ...subscriptionData,
    status: 'active',
    favicon: subscriptionData.favicon || '/default-favicon.ico',
    lastUpdate: new Date().toISOString().split('T')[0],
    itemCount: 0,
    unreadCount: 0,
    items: []
  }
  
  subscriptions.value.push(newSubscription)
  showAddDialog.value = false
}

const toggleSubscription = (id: string) => {
  const subscription = subscriptions.value.find(sub => sub.id === id)
  if (subscription) {
    subscription.status = subscription.status === 'active' ? 'paused' : 'active'
  }
}

const deleteSubscription = (id: string) => {
  if (confirm('确定要删除这个订阅源吗？')) {
    const index = subscriptions.value.findIndex(sub => sub.id === id)
    if (index !== -1) {
      subscriptions.value.splice(index, 1)
      if (selectedSubscription.value?.id === id) {
        selectedSubscription.value = null
      }
    }
  }
}

const refreshSubscription = async (id: string) => {
  const subscription = subscriptions.value.find(sub => sub.id === id)
  if (subscription) {
    // 模拟刷新
    subscription.lastUpdate = new Date().toISOString().split('T')[0]
    // TODO: 实际实现RSS/API抓取
    console.log('刷新订阅源:', subscription.title)
  }
}

const openInBrowser = (url: string) => {
  window.electronAPI?.openExternal?.(url)
}

const markAsRead = (itemId: string) => {
  if (selectedSubscription.value) {
    const item = selectedSubscription.value.items.find(item => item.id === itemId)
    if (item && !item.read) {
      item.read = true
      selectedSubscription.value.unreadCount = Math.max(0, selectedSubscription.value.unreadCount - 1)
    }
  }
}

const saveToNotes = (itemId: string) => {
  if (selectedSubscription.value) {
    const item = selectedSubscription.value.items.find(item => item.id === itemId)
    if (item) {
      // 创建新笔记
      appStore.addTab({
        name: `${item.title}.md`,
        content: `# ${item.title}\n\n> 来源: [${selectedSubscription.value.title}](${item.url})\n> 发布时间: ${item.publishDate}\n\n${item.description}\n\n---\n\n## 我的笔记\n\n`,
        saved: false,
        type: 'file'
      })
      
      item.saved = true
    }
  }
}

const filterSubscriptions = () => {
  // 过滤逻辑已在计算属性中处理
}

const formatLastUpdate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天更新'
  if (diffDays === 1) return '昨天更新'
  if (diffDays < 7) return `${diffDays}天前更新`
  
  return date.toLocaleDateString('zh-CN')
}

const getStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-400',
    paused: 'bg-yellow-400',
    error: 'bg-red-400'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-400'
}

const getStatusText = (status: string) => {
  const texts = {
    active: '活跃',
    paused: '暂停',
    error: '错误'
  }
  return texts[status as keyof typeof texts] || '未知'
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-favicon.ico'
}

onMounted(() => {
  // 默认选择第一个订阅源
  if (filteredSubscriptions.value.length > 0) {
    selectedSubscription.value = filteredSubscriptions.value[0]
  }
})
</script>
