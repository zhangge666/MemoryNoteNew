<template>
  <div 
    class="absolute top-0 h-full bg-white border-r border-gray-200 flex flex-col z-10"
    :style="{ 
      left: '60px',
      width: `${appStore.leftSidebarWidth}px`
    }"
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
        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex items-center justify-center py-4">
          <div class="flex items-center space-x-2 text-gray-500">
            <RefreshCw class="w-4 h-4 animate-spin" />
            <span class="text-sm">正在读取目录...</span>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-else-if="errorMessage" class="px-3 py-4">
          <div class="bg-red-50 border border-red-200 rounded p-3">
            <p class="text-red-600 text-sm">{{ errorMessage }}</p>
            <button 
              @click="refreshFileTree"
              class="mt-2 text-xs text-red-500 hover:text-red-700 underline"
            >
              重试
            </button>
          </div>
        </div>
        
        <!-- 文件列表 -->
        <div v-else-if="fileTree.length > 0">
          <file-tree-item
            v-for="item in fileTree"
            :key="item.path"
            :item="item"
            :level="0"
            @select="selectFile"
            @toggle="toggleFolder"
          />
        </div>
        
        <!-- 空目录提示 -->
        <div v-else class="px-3 py-4 text-center text-gray-500">
          <p class="text-sm">workspace目录为空</p>
          <p class="text-xs mt-1">在工作目录下的workspace文件夹中添加一些文件</p>
        </div>
      </div>
    </div>
    
    <!-- 可调整大小的分隔条 -->
    <div
      class="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-blue-400 hover:bg-opacity-20 transition-all duration-200 z-10"
      @mousedown="startResize"
    >
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
const isLoading = ref(false)
const errorMessage = ref('')

// 刷新文件树
const refreshFileTree = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 获取当前工作目录
    const cwd = await window.electronAPI?.getCwd()
    if (!cwd) {
      throw new Error('无法获取工作目录')
    }
    
    // 构造workspace目录路径
    const workspacePath = `${cwd}/workspace`
    workingDirectory.value = workspacePath
    
    // 读取workspace目录内容
    const result = await window.electronAPI?.readDirectory(workspacePath)
    
    if (!result) {
      throw new Error('无法读取目录')
    }
    
    // 检查是否返回错误
    if ('error' in result) {
      throw new Error(result.error)
    }
    
    // 转换为FileItem格式
    const items: FileItem[] = result.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      expanded: false,
      children: item.type === 'folder' ? [] : undefined
    }))
    
    fileTree.value = items
  } catch (error) {
    console.error('读取文件树失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '读取目录失败'
    
    // 如果workspace目录不存在，显示提示
    if (errorMessage.value.includes('ENOENT')) {
      errorMessage.value = 'workspace目录不存在，请在工作目录下创建workspace文件夹'
    }
    
    fileTree.value = []
  } finally {
    isLoading.value = false
  }
}

// 新建文件
const newFile = () => {
  const fileName = prompt('请输入文件名:')
  if (fileName) {
    // 使用新的文档系统创建文件
    appStore.createNewDocument({
      title: fileName,
      content: `# ${fileName}\n\n`,
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
const selectWorkingDirectory = async () => {
  try {
    const result = await window.electronAPI?.showOpenDialog({
      properties: ['openDirectory'],
      title: '选择workspace目录'
    })
    
    if (result && !result.canceled && result.filePaths.length > 0) {
      workingDirectory.value = result.filePaths[0]
      await refreshFileTree()
    }
  } catch (error) {
    console.error('选择目录失败:', error)
  }
}

// 选择文件
const selectFile = (item: FileItem) => {
  if (item.type === 'file') {
    // 使用新的文档系统打开文件
    appStore.openFileAsDocument(item.path)
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
  refreshFileTree()
})
</script>
