

## 1. 插件目录结构
插件目录在软件工作目录下的.memorynote目录下

每个插件必须为独立目录，且包含以下文件：

`<plugin-id>/  ├─ manifest.json   # 插件声明文件（必需）  ├─ index.js        # 插件入口逻辑（必需）  └─ data.json       # 插件默认配置（必需）`

- **不允许**出现多余文件（图片、CSS、外部依赖等应由宿主软件提供公共接口）。
    
- 缺少任何一个文件即判定为安装失败。
    

---

## 2. manifest.json 规范

`{   "id": "unique-plugin-id",   "name": "插件名称",   "version": "1.0.0",   "author": "开发者",   "description": "插件功能介绍，不能为空",   "entry": "index.js",   "settings": true,   "mountPoints": ["left-sidebar", "right-sidebar", "editor-enhance"],   "sidebarButtons": [     {       "id": "btn-id",       "label": "按钮名称",       "defaultVisible": true     }   ] }`

### 必须字段

- `id`：插件唯一标识符，推荐小写英文+短横线。
    
- `name`：插件名称。
    
- `version`：语义化版本号。
    
- `author`：插件作者。
    
- `description`：插件介绍，不允许为空。
    
- `entry`：入口文件，必须为 `index.js`。
    
- `settings`：必须为 `true`，代表插件必须提供设置界面。
    
- `mountPoints`：插件支持的挂载点数组，可选值：
    
    - `"left-sidebar"`
        
    - `"right-sidebar"`
        
    - `"editor-enhance"`
        
- `sidebarButtons`：可选，定义插件注册的侧边栏按钮。
    

---

## 3. index.js 规范

插件必须导出一个对象，包含以下生命周期方法：

`module.exports = {   onload(app, data) {     // 插件加载逻辑   },   onunload(app) {     // 插件卸载逻辑   } };`

### 3.1 生命周期

- **onload(app, data)**
    
    - 在插件启用时调用。
        
    - `app`：宿主应用 API 对象。
        
    - `data`：插件数据对象（由 `data.json` 提供，用户修改后会更新）。
        
    - 插件必须在此方法内：
        
        1. 注册挂载点 UI（如果有）。
            
        2. 注册侧边栏按钮（如果有）。
            
        3. 注册设置界面（必需）。
            
- **onunload(app)**
    
    - 在插件禁用或卸载时调用。
        
    - 插件必须清理自身注册的资源（UI、按钮、事件）。
        

---

### 3.2 宿主 API

宿主应用提供以下接口供插件调用：

- **UI 挂载**
    
    `app.registerMount("editor-enhance", { id, render(container) }) app.unregister(id)`
    
- **侧边栏按钮**
    
    `app.registerSidebarButton({ id, icon, onClick }) app.unregisterSidebarButton(id)`
    
- **设置页面**
    
    `app.registerSettingsPage(pluginId, renderFn)`
    
- **数据存储**
    
    `app.loadData(pluginId)      // 读取 data.json app.saveData(pluginId, obj) // 保存 data.json`
    

---

## 4. data.json 规范

- 用于存储插件默认配置与用户设置。
    
- 插件初始化时加载，修改后通过 `app.saveData()` 持久化。
    

示例：

`{   "defaultTheme": "dark",   "sidebarButtonVisible": true }`

---

## 5. 挂载点规范

插件 UI 可注入以下位置：

1. **left-sidebar**：左侧栏
    
2. **right-sidebar**：右侧栏
    
3. **editor-enhance**：编辑器增强区
    

规则：

- 插件必须在 `manifest.json` 的 `mountPoints` 中声明挂载点。
    
- 宿主应用仅在声明的挂载点中注入插件 UI。
    
- 未声明的挂载点调用 `registerMount` 时应抛出错误。
    

---

## 6. 侧边栏按钮规范

- 插件可注册 0~N 个侧边栏按钮。
    
- 每个按钮定义在 `manifest.json → sidebarButtons` 中。
    
- 宿主应用的 **设置界面** 会提供开关，允许用户控制该插件的按钮是否展示。
    
- 插件逻辑通过 `app.registerSidebarButton` 绑定，需与 manifest 声明对应。
    

---

## 7. 插件安装与校验

安装时必须通过以下检查：

1. 插件目录包含 `manifest.json`、`index.js`、`data.json`。
    
2. `manifest.json` 内必须包含：
    
    - `description`（非空）
        
    - `settings: true`
        
3. 插件必须在 `onload` 中注册 **设置界面**。
    
4. 缺少介绍或设置界面 → 安装失败。
    

---

## 8. 开发约束

1. 插件不能操作宿主应用的私有状态，只能通过提供的 API 交互。
    
2. 插件 UI 必须通过挂载点渲染，不允许直接修改宿主 DOM。
    
3. 插件必须可被正常卸载（清理事件、UI、按钮）。
    
4. 插件不得加载外部脚本或资源（避免安全风险）。
    
5. 插件必须兼容软件更新，不得覆盖宿主的系统文件。
    

---

## 9. 插件示例

`theme-switcher/  ├─ manifest.json  ├─ index.js  └─ data.json`

- **manifest.json**
    

`{   "id": "theme-switcher",   "name": "主题切换器",   "version": "1.0.0",   "author": "阿振",   "description": "允许用户快速切换软件主题。",   "entry": "index.js",   "settings": true,   "mountPoints": ["editor-enhance"],   "sidebarButtons": [     {       "id": "theme-btn",       "label": "切换主题",       "defaultVisible": true     }   ] }`

- **index.js**
    

``module.exports = {   onload(app, data) {     app.registerMount("editor-enhance", {       id: "theme-switcher-ui",       render(container) {         container.innerHTML = `<button id="switch-theme">切换主题</button>`;         container.querySelector("#switch-theme").onclick = () => {           app.toggleTheme();         };       }     });      app.registerSidebarButton({       id: "theme-btn",       icon: "🎨",       onClick() {         app.toggleTheme();       }     });      app.registerSettingsPage("theme-switcher", (container) => {       container.innerHTML = `         <h2>主题切换设置</h2>         <label>           默认主题：           <select id="default-theme">             <option value="light">明亮</option>             <option value="dark">黑暗</option>           </select>         </label>       `;     });   },   onunload(app) {     app.unregister("theme-switcher-ui");     app.unregisterSidebarButton("theme-btn");   } };``

- **data.json**
    

`{   "defaultTheme": "dark" }`