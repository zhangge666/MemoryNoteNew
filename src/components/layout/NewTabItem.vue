<template>
  <div
    class="tab-item flex items-center px-3 py-2 border-r border-gray-200 cursor-pointer min-w-0 max-w-48"
    :class="{
      'bg-white border-b-2 border-blue-500 text-blue-600': active,
      'bg-gray-100 hover:bg-gray-200 text-gray-700': !active
    }"
    @click="$emit('click')"
  >
    <!-- 图标 -->
    <SafeIcon 
      :icon="tab.input.icon" 
      class="w-4 h-4 mr-2 flex-shrink-0" 
    />
    
    <!-- 标题 -->
    <span 
      class="text-sm font-medium truncate flex-1"
      :title="tab.input.title"
    >
      {{ tab.input.title }}
    </span>
    
    <!-- 未保存指示器 -->
    <div
      v-if="!tab.input.saved"
      class="w-2 h-2 bg-orange-400 rounded-full ml-2 flex-shrink-0"
      title="未保存"
    />
    
    <!-- 关闭按钮 -->
    <button
      v-if="tab.input.canClose()"
      @click.stop="$emit('close')"
      class="ml-2 p-1 hover:bg-gray-300 rounded transition-colors flex-shrink-0"
      title="关闭标签"
    >
      <X class="w-3 h-3" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { TabInfo } from '@/core/TabPanelSystem'
import SafeIcon from '@/components/common/SafeIcon.vue'

interface Props {
  tab: TabInfo
  active: boolean
}

defineProps<Props>()

defineEmits<{
  click: []
  close: []
}>()
</script>

<style scoped>
.tab-item {
  transition: all 0.2s ease;
}

.tab-item:hover .close-button {
  opacity: 1;
}
</style>


