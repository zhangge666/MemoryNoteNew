<template>
  <div
    @click="$emit('select', tab.id)"
    @contextmenu="(e) => $emit('context-menu', e, tab.id)"
    class="flex-shrink-0 max-w-xs flex items-center px-3 py-1 border-r border-gray-300 cursor-pointer transition-colors group"
    :class="{
      'bg-white text-gray-900': active,
      'bg-gray-100 text-gray-600 hover:bg-gray-200': !active
    }"
  >
    <!-- 文件类型图标 -->
    <div class="w-4 flex justify-center mr-2">
      <FileText
        v-if="isMarkdownFile"
        class="w-3 h-3 text-blue-500"
      />
      <BookOpen
        v-else-if="tab.type === 'diary'"
        class="w-3 h-3 text-green-500"
      />
      <RotateCcw
        v-else-if="tab.type === 'review'"
        class="w-3 h-3 text-orange-500"
      />
      <File
        v-else
        class="w-3 h-3 text-gray-400"
      />
    </div>
    
    <!-- 文件名 -->
    <span class="flex-1 text-sm truncate">{{ tab.name }}</span>
    
    <!-- 未保存指示器 -->
    <div
      v-if="!tab.saved"
      class="w-2 h-2 bg-orange-400 rounded-full mx-1"
      title="有未保存的更改"
    ></div>
    
    <!-- 关闭按钮 -->
    <button
      @click.stop="$emit('close', tab.id)"
      class="w-4 h-4 flex items-center justify-center rounded hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
      title="关闭"
    >
      <X class="w-3 h-3 text-gray-500" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FileTab } from '@/stores/app'
import {
  File,
  FileText,
  BookOpen,
  RotateCcw,
  X
} from 'lucide-vue-next'

interface Props {
  tab: FileTab
  active: boolean
}

const props = defineProps<Props>()

defineEmits<{
  select: [tabId: string]
  close: [tabId: string]
  'context-menu': [e: MouseEvent, tabId: string]
}>()

// 计算属性
const isMarkdownFile = computed(() => {
  return props.tab.name.endsWith('.md') || props.tab.name.endsWith('.markdown')
})
</script>

