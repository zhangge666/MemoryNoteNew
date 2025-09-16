<template>
  <div class="h-10 px-4 flex items-center justify-between border-b border-gray-200 bg-gray-50">
    <!-- 左侧：文档信息 -->
    <div class="flex items-center space-x-3">
      <div class="flex items-center space-x-2">
        <FileText class="w-4 h-4 text-gray-500" />
        <span class="text-sm font-medium text-gray-700">{{ documentTitle }}</span>
        <span v-if="documentPath" class="text-xs text-gray-500">{{ documentPath }}</span>
      </div>
      
      <!-- 未保存指示器 -->
      <div 
        v-if="isDirty" 
        class="w-2 h-2 bg-orange-400 rounded-full" 
        title="未保存"
      />
    </div>
    
    <!-- 右侧：工具按钮 -->
    <div class="flex items-center space-x-2">
      <!-- 格式化按钮 -->
      <button
        @click="$emit('format')"
        class="p-1.5 hover:bg-gray-200 rounded transition-colors"
        title="格式化文档"
      >
        <AlignLeft class="w-4 h-4 text-gray-600" />
      </button>
      
      <!-- 查找替换 -->
      <button
        @click="$emit('find')"
        class="p-1.5 hover:bg-gray-200 rounded transition-colors"
        title="查找替换"
      >
        <Search class="w-4 h-4 text-gray-600" />
      </button>
      
      <!-- 实时预览 -->
      <button
        @click="$emit('toggle-preview')"
        class="p-1.5 hover:bg-gray-200 rounded transition-colors"
        :class="{ 'bg-blue-100 text-blue-600': showPreview }"
        title="实时预览"
      >
        <Eye class="w-4 h-4" />
      </button>
      
      <!-- 字数统计 -->
      <div class="text-xs text-gray-500 px-2">
        {{ wordCount }} 字
      </div>
      
      <!-- 保存按钮 -->
      <button
        @click="$emit('save')"
        :disabled="!isDirty"
        class="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
      >
        {{ isDirty ? '保存' : '已保存' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlignLeft, Search, Eye, FileText } from 'lucide-vue-next'

interface Props {
  documentTitle?: string
  documentPath?: string
  isDirty?: boolean
  showPreview?: boolean
  wordCount?: number
}

withDefaults(defineProps<Props>(), {
  documentTitle: '未命名文档',
  isDirty: false,
  showPreview: false,
  wordCount: 0
})

defineEmits<{
  save: []
  format: []
  find: []
  'toggle-preview': []
}>()
</script>

<style scoped>
.editor-toolbar {
  background: linear-gradient(to bottom, #f8f9fa, #f1f3f4);
}
</style>
