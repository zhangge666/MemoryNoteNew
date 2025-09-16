<template>
  <div class="h-full bg-white flex flex-col transition-all duration-300 ease-out">
    <!-- 页面头部 -->
    <div class="p-6 border-b border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">欢迎使用 Memory Note</h1>
      <p class="text-gray-600">你的个人知识库和学习系统</p>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="flex-1 overflow-auto">
      <div class="p-6 max-w-6xl mx-auto">
        <!-- 快速操作卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <quick-action-card
            title="新建笔记"
            description="创建一个新的笔记文档"
            icon="FileText"
            color="blue"
            @click="createNewNote"
          />
          <quick-action-card
            title="今日日记"
            description="记录今天的想法和事件"
            icon="BookOpen"
            color="green"
            @click="openTodayDiary"
          />
          <quick-action-card
            title="开始复习"
            description="复习需要巩固的知识点"
            icon="RotateCcw"
            color="orange"
            @click="startReview"
          />
          <quick-action-card
            title="搜索笔记"
            description="在所有笔记中查找内容"
            icon="Search"
            color="purple"
            @click="openSearch"
          />
        </div>
        
        <!-- 统计信息 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <stats-card
            title="总笔记数"
            :value="stats.totalNotes"
            icon="FileText"
            trend="+5 本周"
            color="blue"
          />
          <stats-card
            title="复习进度"
            :value="`${stats.reviewProgress}%`"
            icon="TrendingUp"
            trend="+12% 本月"
            color="green"
          />
          <stats-card
            title="学习天数"
            :value="stats.studyDays"
            icon="Calendar"
            trend="连续学习"
            color="purple"
          />
        </div>
        
        <!-- 最近活动 -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">最近活动</h2>
          <div class="space-y-4">
            <activity-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :activity="activity"
            />
          </div>
          <div v-if="recentActivities.length === 0" class="text-center py-8">
            <FileText class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">暂无最近活动</p>
            <p class="text-sm text-gray-400 mt-1">开始创建你的第一个笔记吧！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { FileText } from 'lucide-vue-next'
import QuickActionCard from '@/components/common/QuickActionCard.vue'
import StatsCard from '@/components/common/StatsCard.vue'
import ActivityItem from '@/components/common/ActivityItem.vue'

const appStore = useAppStore()

// 统计数据
const stats = ref({
  totalNotes: 42,
  reviewProgress: 78,
  studyDays: 15
})

// 最近活动数据
const recentActivities = ref([
  {
    id: '1',
    type: 'create',
    title: '创建了新笔记：Vue 3 组合式 API 学习',
    time: '2小时前',
    icon: 'FileText'
  },
  {
    id: '2',
    type: 'review',
    title: '完成复习：JavaScript 闭包概念',
    time: '4小时前',
    icon: 'RotateCcw'
  },
  {
    id: '3',
    type: 'diary',
    title: '写了今日日记',
    time: '昨天',
    icon: 'BookOpen'
  },
  {
    id: '4',
    type: 'edit',
    title: '编辑了笔记：TypeScript 高级类型',
    time: '2天前',
    icon: 'Edit'
  }
])

// 快速操作方法
const createNewNote = () => {
  appStore.addTab({
    name: '新建笔记.md',
    content: '# 新建笔记\n\n开始记录你的想法...\n',
    saved: false,
    type: 'file'
  })
}

const openTodayDiary = () => {
  const today = new Date().toISOString().split('T')[0]
  const diaryName = `日记-${today}.md`
  
  // 检查是否已经打开今日日记
  const existingTab = appStore.tabs.find(tab => tab.name === diaryName)
  if (existingTab) {
    appStore.setActiveTab(existingTab.id)
  } else {
    appStore.addTab({
      name: diaryName,
      content: `# ${today} 日记\n\n## 今日感想\n\n\n## 学习收获\n\n\n## 明日计划\n\n`,
      saved: false,
      type: 'diary'
    })
  }
  
  // 切换到日记导航
  appStore.setCurrentNavItem('diary')
}

const startReview = () => {
  appStore.setCurrentNavItem('review')
}

const openSearch = () => {
  appStore.setCurrentNavItem('search')
}

onMounted(() => {
  // 加载统计数据
  // TODO: 从实际数据源加载
})
</script>
