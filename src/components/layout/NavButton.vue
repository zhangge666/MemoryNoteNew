<template>
  <button
    @click="$emit('click')"
    class="w-8 h-8 flex items-center justify-center rounded-md transition-colors group relative"
    :class="{
      'bg-blue-500 text-white shadow-md': active,
      'text-gray-600 hover:text-blue-600 hover:bg-blue-50': !active
    }"
  >
    <component :is="icon" class="w-4 h-4" />
    
    <!-- 工具提示 -->
    <div
      v-if="!active"
      class="absolute left-12 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
    >
      {{ label }}
    </div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon: any
  label: string
  active?: boolean
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>
