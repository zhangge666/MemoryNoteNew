<template>
  <div 
    class="bg-white border-r border-gray-200 flex flex-col relative min-w-0"
    :style="{ width: `${appStore.leftSidebarWidth}px` }"
  >
    <!-- 工作目录头部 -->
    <div class="h-8 px-3 flex items-center justify-between border-b border-gray-200 bg-gray-50">
      <span class="text-xs font-medium text-gray-700">工作目录</span>
      <div class="flex items-center space-x-1">
        <button
          @click="refreshFileTree"
          class="p-1 hover:bg-gray-200 rounded transition-colors"
          title="刷新"
        >
          <RefreshCw class="w-3 h-3 text-gray-500" />
        </button>
        <button
          @click="newFile"
          class="p-1 hover:bg-gray-200 rounded transition-colors"
          title="新建文件"
        >
          <FilePlus class="w-3 h-3 text-gray-500" />
        </button>
        <button
          @click="newFolder"
          class="p-1 hover:bg-gray-200 rounded transition-colors"
          title="新建文件夹"
        >
          <FolderPlus class="w-3 h-3 text-gray-500" />
        </button>
      </div>
    </div>
    
    <!-- 文件树内容 -->
    <div class="flex-1 overflow-auto">
      <div v-if="!workingDirectory" class="p-4 text-center">
        <Folder class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500 mb-3">未选择工作目录</p>
        <button
          @click="selectWorkingDirectory"
          class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          选择目录
        </button>
      </div>
      
      <div v-else class="py-1">
        <file-tree-item
          v-for="item in fileTree"
          :key="item.path"
          :item="item"
          :level="0"
          @select="selectFile"
          @toggle="toggleFolder"
        />
      </div>
    </div>
    
    <!-- 可调整大小的分隔条 -->
    <div
      class="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-blue-400 transition-all duration-200 z-10 group"
      @mousedown="startResize"
    >
      <div class="w-full h-full bg-gray-200 group-hover:bg-blue-400 transition-colors"></div>
      <!-- 调整提示 -->
      <div class="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="w-1 h-8 bg-blue-500 rounded-full shadow-lg"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  RefreshCw,
  FilePlus,
  FolderPlus,
  Folder
} from 'lucide-vue-next'
import FileTreeItem from './FileTreeItem.vue'

interface FileItem {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileItem[]
  expanded?: boolean
}

const appStore = useAppStore()

const workingDirectory = ref('')
const fileTree = ref<FileItem[]>([])

// 模拟文件树数据
const mockFileTree: FileItem[] = [
  {
    name: '笔记',
    path: '/notes',
    type: 'folder',
    expanded: true,
    children: [
      {
        name: '学习笔记.md',
        path: '/notes/study.md',
        type: 'file'
      },
      {
        name: '工作日志.md',
        path: '/notes/work.md',
        type: 'file'
      }
    ]
  },
  {
    name: '项目',
    path: '/projects',
    type: 'folder',
    children: [
      {
        name: 'Memory Note',
        path: '/projects/memory-note',
        type: 'folder',
        children: [
          {
            name: 'README.md',
            path: '/projects/memory-note/README.md',
            type: 'file'
          }
        ]
      }
    ]
  },
  {
    name: '草稿.md',
    path: '/draft.md',
    type: 'file'
  }
]

// 刷新文件树
const refreshFileTree = () => {
  // TODO: 实现真实的文件系统读取
  fileTree.value = [...mockFileTree]
}

// 新建文件
const newFile = () => {
  const fileName = prompt('请输入文件名:')
  if (fileName) {
    const newTab = appStore.addTab({
      name: fileName,
      content: '',
      saved: false,
      type: 'file'
    })
    console.log('新建文件:', fileName)
  }
}

// 新建文件夹
const newFolder = () => {
  const folderName = prompt('请输入文件夹名:')
  if (folderName) {
    console.log('新建文件夹:', folderName)
  }
}

// 选择工作目录
const selectWorkingDirectory = () => {
  // TODO: 调用Electron文件对话框
  workingDirectory.value = '/mock/working/directory'
  refreshFileTree()
}

// 选择文件
const selectFile = (item: FileItem) => {
  if (item.type === 'file') {
    // 检查是否已经打开该文件
    const existingTab = appStore.tabs.find(tab => tab.path === item.path)
    if (existingTab) {
      appStore.setActiveTab(existingTab.id)
    } else {
      // 打开新标签页
      appStore.addTab({
        name: item.name,
        path: item.path,
        content: `# ${item.name}\n\n这是 ${item.name} 的内容...`,
        saved: true,
        type: 'file'
      })
    }
  }
}

// 切换文件夹展开状态
const toggleFolder = (item: FileItem) => {
  if (item.type === 'folder') {
    item.expanded = !item.expanded
  }
}

// 调整侧边栏大小
const startResize = (e: MouseEvent) => {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = appStore.leftSidebarWidth
  
  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const newWidth = Math.max(200, Math.min(500, startWidth + deltaX))
    appStore.leftSidebarWidth = newWidth
  }
  
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

onMounted(() => {
  // 初始化模拟数据
  workingDirectory.value = '/mock/working/directory'
  refreshFileTree()
})
</script>
