<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">添加订阅源</h2>
          <button
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">订阅URL</label>
            <input
              v-model="form.url"
              type="url"
              required
              placeholder="https://example.com/feed.xml"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p class="text-xs text-gray-500 mt-1">支持RSS、Atom或网站URL</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标题 (可选)</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="自动检测或手动输入"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              v-model="form.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="tech">技术</option>
              <option value="design">设计</option>
              <option value="business">商业</option>
              <option value="science">科学</option>
              <option value="other">其他</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述 (可选)</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="订阅源的简短描述"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            ></textarea>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              :disabled="!form.url"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              添加订阅
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { X } from 'lucide-vue-next'

const emit = defineEmits<{
  close: []
  add: [data: any]
}>()

const form = reactive({
  url: '',
  title: '',
  category: 'tech',
  description: ''
})

const handleSubmit = () => {
  if (!form.url) return
  
  const subscriptionData = {
    ...form,
    title: form.title || extractTitleFromUrl(form.url)
  }
  
  emit('add', subscriptionData)
  
  // 重置表单
  Object.assign(form, {
    url: '',
    title: '',
    category: 'tech',
    description: ''
  })
}

const extractTitleFromUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return 'Unknown Source'
  }
}
</script>
