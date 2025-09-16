<template>
  <div>
    <!-- 文件/文件夹项 -->
    <div
      @click="handleClick"
      @contextmenu="showContextMenu"
      class="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer select-none"
      :class="{
        'bg-blue-50 text-blue-700': isSelected,
        'pl-2': level === 0,
        'pl-4': level === 1,
        'pl-6': level === 2,
        'pl-8': level === 3
      }"
    >
      <!-- 展开/收起图标 -->
      <div class="w-4 flex justify-center">
        <ChevronRight
          v-if="item.type === 'folder'"
          class="w-3 h-3 text-gray-400 transition-transform"
          :class="{ 'transform rotate-90': item.expanded }"
        />
      </div>
      
      <!-- 文件/文件夹图标 -->
      <div class="w-4 flex justify-center mr-2">
        <Folder
          v-if="item.type === 'folder'"
          class="w-3 h-3"
          :class="item.expanded ? 'text-blue-500' : 'text-gray-400'"
        />
        <FileText
          v-else-if="isMarkdownFile"
          class="w-3 h-3 text-blue-500"
        />
        <File
          v-else
          class="w-3 h-3 text-gray-400"
        />
      </div>
      
      <!-- 文件名 -->
      <span class="text-sm flex-1 truncate">{{ item.name }}</span>
      
      <!-- 未保存指示器 -->
      <div
        v-if="item.type === 'file' && hasUnsavedChanges"
        class="w-2 h-2 bg-orange-400 rounded-full ml-1"
        title="有未保存的更改"
      ></div>
    </div>
    
    <!-- 子项 -->
    <div v-if="item.type === 'folder' && item.expanded && item.children">
      <file-tree-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :level="level + 1"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
    
    <!-- 右键菜单 -->
    <div
      v-if="showMenu"
      ref="contextMenu"
      class="fixed bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
      :style="menuStyle"
    >
      <button
        v-if="item.type === 'file'"
        @click="openFile"
        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        打开
      </button>
      <button
        v-if="item.type === 'folder'"
        @click="newFileInFolder"
        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        新建文件
      </button>
      <button
        v-if="item.type === 'folder'"
        @click="newFolderInFolder"
        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        新建文件夹
      </button>
      <div class="border-t border-gray-100 my-1"></div>
      <button
        @click="renameItem"
        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        重命名
      </button>
      <button
        @click="deleteItem"
        class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        删除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  ChevronRight,
  Folder,
  File,
  FileText
} from 'lucide-vue-next'

interface FileItem {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileItem[]
  expanded?: boolean
}

interface Props {
  item: FileItem
  level: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [item: FileItem]
  toggle: [item: FileItem]
}>()

const appStore = useAppStore()

const showMenu = ref(false)
const menuStyle = ref({})

// 计算属性
const isMarkdownFile = computed(() => {
  return props.item.name.endsWith('.md') || props.item.name.endsWith('.markdown')
})

const isSelected = computed(() => {
  // 检查当前激活的标签是否对应这个文件
  const activeTab = appStore.activeTab
  if (activeTab && activeTab.input.type === 'document') {
    const documentModel = (activeTab.input as any).documentModel
    return documentModel?.filePath === props.item.path
  }
  return false
})

const hasUnsavedChanges = computed(() => {
  if (props.item.type === 'file') {
    // 检查新系统中是否有未保存的文档
    const allTabs = appStore.allTabInputs
    for (const tab of allTabs) {
      if (tab.input.type === 'document') {
        const documentModel = (tab.input as any).documentModel
        if (documentModel?.filePath === props.item.path && !tab.input.saved) {
          return true
        }
      }
    }
  }
  return false
})

// 处理点击
const handleClick = () => {
  if (props.item.type === 'folder') {
    emit('toggle', props.item)
  } else {
    emit('select', props.item)
  }
}

// 显示右键菜单
const showContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  showMenu.value = true
  
  nextTick(() => {
    menuStyle.value = {
      left: `${e.clientX}px`,
      top: `${e.clientY}px`
    }
  })
}

// 打开文件
const openFile = () => {
  emit('select', props.item)
  showMenu.value = false
}

// 在文件夹中新建文件
const newFileInFolder = () => {
  const fileName = prompt('请输入文件名:')
  if (fileName) {
    console.log(`在 ${props.item.path} 中新建文件: ${fileName}`)
  }
  showMenu.value = false
}

// 在文件夹中新建文件夹
const newFolderInFolder = () => {
  const folderName = prompt('请输入文件夹名:')
  if (folderName) {
    console.log(`在 ${props.item.path} 中新建文件夹: ${folderName}`)
  }
  showMenu.value = false
}

// 重命名
const renameItem = () => {
  const newName = prompt('请输入新名称:', props.item.name)
  if (newName && newName !== props.item.name) {
    console.log(`重命名 ${props.item.name} 为 ${newName}`)
  }
  showMenu.value = false
}

// 删除
const deleteItem = () => {
  if (confirm(`确定要删除 ${props.item.name} 吗？`)) {
    console.log(`删除 ${props.item.name}`)
  }
  showMenu.value = false
}

// 点击外部关闭菜单
document.addEventListener('click', () => {
  showMenu.value = false
})
</script>

