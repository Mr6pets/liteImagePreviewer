# API参考

<cite>
**本文档中引用的文件**  
- [core.js](file://js/core.js)
- [imageManager.js](file://js/imageManager.js)
- [viewer.js](file://js/viewer.js)
- [editor.js](file://js/editor.js)
- [eventHandler.js](file://js/eventHandler.js)
</cite>

## 目录
1. [ImagePreviewerCore 核心类](#imagepreviewercore-核心类)  
2. [ImageManager 图像管理类](#imagemanager-图像管理类)  
3. [ImageViewer 图像查看器类](#imageviewer-图像查看器类)  
4. [ImageEditor 图像编辑器类](#imageeditor-图像编辑器类)  
5. [事件系统 API](#事件系统-api)

## ImagePreviewerCore 核心类

`ImagePreviewerCore` 是整个应用的主控制器，负责初始化所有模块并启动应用。

### 构造函数
```js
new ImagePreviewerCore()
```
- **参数**：无  
- **功能**：  
  - 初始化 `UIManager`、`ImageManager`、`ImageViewer`、`ImageEditor`、`DragUploadManager` 和 `EventHandler` 模块  
  - 自动调用 `init()` 方法完成初始化流程  

### init() 方法
```js
app.init()
```
- **功能**：  
  - 初始化用户界面（UI）  
  - 绑定全局事件监听器  
  - 显示空状态界面（无图片时）  
- **触发时机**：构造函数中自动调用  
- **异常处理**：无显式异常抛出，依赖各模块内部处理  

**Section sources**  
- [core.js](file://js/core.js#L1-L22)

## ImageManager 图像管理类

`ImageManager` 负责管理图像的添加、删除和列表维护。

### addImage (通过 handleFileSelect)
```js
imageManager.handleFileSelect(event)
```
- **参数**：`event` - 文件输入元素的 `change` 事件对象  
- **功能**：  
  - 读取选中的图像文件并添加到图像列表  
  - 若列表为空，则隐藏空状态提示  
  - 支持批量添加，跳过同名文件  
- **返回值**：无  
- **异常处理**：控制台输出跳过信息，无异常抛出  

### removeImage
```js
imageManager.removeImage(index)
```
- **参数**：`index` - 要删除的图像在列表中的索引  
- **功能**：  
  - 弹出确认对话框  
  - 从内存和 DOM 中移除图像  
  - 若为当前预览图像，自动调整当前索引  
  - 若无图像剩余，显示空状态并关闭查看器  
- **返回值**：无  
- **内存管理**：撤销 `blob:` URL 以释放内存  

### clearAll
```js
imageManager.clearAllImages()
```
- **参数**：无  
- **功能**：  
  - 清空所有图像  
  - 撤销所有对象 URL  
  - 重置 UI 状态  
- **返回值**：无  

### getImageList
```js
imageManager.images
```
- **类型**：`Array<Object>`  
- **元素结构**：
  ```js
  {
    src: string,           // Data URL 或 Blob URL
    originalSrc: string,   // 原始 Data URL
    name: string,          // 文件名
    size: number,          // 文件大小（字节）
    type: string,          // MIME 类型
    filters: {
      brightness: number,  // 亮度 (0-200)
      contrast: number,    // 对比度 (0-200)
      saturation: number,  // 饱和度 (0-200)
      filter: string       // 滤镜 ('none', 'grayscale', 'sepia', 'invert', 'blur')
    }
  }
  ```
- **访问方式**：直接访问 `imageManager.images` 属性  

**Section sources**  
- [imageManager.js](file://js/imageManager.js#L1-L195)

## ImageViewer 图像查看器类

`ImageViewer` 提供图像的查看、缩放、旋转和全屏功能。

### zoomIn
```js
viewer.zoomIn()
```
- **功能**：将图像缩放比例增加 20%（最大 5 倍）  
- **参数**：无  
- **返回值**：无  
- **状态变更**：`scale` 属性更新，调用 `applyTransform()`  

### zoomOut
```js
viewer.zoomOut()
```
- **功能**：将图像缩放比例减少 20%（最小 0.1 倍）  
- **参数**：无  
- **返回值**：无  
- **状态变更**：`scale` 属性更新  

### rotate
```js
viewer.rotateLeft()  // 逆时针旋转 90°
viewer.rotateRight() // 顺时针旋转 90°
```
- **参数**：无  
- **返回值**：无  
- **状态变更**：`rotation` 属性更新（以 90° 为单位）  

### toggleFullscreen
```js
viewer.toggleFullscreen()
```
- **功能**：切换全屏模式  
- **参数**：无  
- **返回值**：无  
- **异常处理**：捕获全屏请求失败并输出日志  

### 其他核心方法
| 方法 | 功能 | 参数 | 返回值 |
|------|------|------|--------|
| `openViewer(index)` | 打开查看器并显示指定索引图像 | `index: number` | 无 |
| `closeViewer()` | 关闭查看器 | 无 | 无 |
| `resetTransform()` | 重置缩放、旋转和位移 | 无 | 无 |
| `prevImage()` | 显示上一张图像 | 无 | 无 |
| `nextImage()` | 显示下一张图像 | 无 | 无 |

**Section sources**  
- [viewer.js](file://js/viewer.js#L1-L152)

## ImageEditor 图像编辑器类

`ImageEditor` 提供图像的滤镜调整、裁剪和水印功能。

### adjustBrightness (通过 updateFilter)
```js
editor.updateFilter('brightness', value)
```
- **参数**：`value` - 亮度值 (0-200)  
- **功能**：调整图像亮度，实时预览  
- **影响**：修改 `imageFilters.brightness` 并应用滤镜  

### applyCrop
```js
editor.applyCrop()
```
- **功能**：  
  - 使用当前裁剪框区域创建新图像  
  - 更新当前图像的 `src` 为裁剪后的 Data URL  
  - 同步更新查看器和缩略图  
  - 退出裁剪模式  
- **参数**：无  
- **返回值**：无  
- **技术实现**：使用 `<canvas>` 绘制裁剪区域  

### addWatermark
```js
editor.applyWatermark()
```
- **功能**：  
  - 在图像上添加文本水印  
  - 支持位置、颜色、大小、透明度和样式（阴影、描边）  
  - 生成带水印的新图像并更新  
- **参数**：通过 UI 控件设置水印属性  
- **影响**：修改当前图像的 `src` 数据  
- **异常处理**：回退到当前显示图像以防原始图像加载失败  

### 其他编辑接口
| 方法 | 功能 | 参数 | 返回值 |
|------|------|------|--------|
| `toggleEditPanel(show)` | 显示/隐藏编辑面板 | `show: boolean` | 无 |
| `updateFilter(type, value)` | 更新滤镜值 | `type: string`, `value: number` | 无 |
| `applyImageChanges()` | 保存滤镜更改 | 无 | 无 |
| `cancelImageChanges()` | 取消编辑并恢复 | 无 | 无 |
| `toggleCropMode(enable)` | 进入/退出裁剪模式 | `enable: boolean` | 无 |
| `toggleWatermarkMode(enable)` | 进入/退出水印模式 | `enable: boolean` | 无 |

**Section sources**  
- [editor.js](file://js/editor.js#L1-L753)

## 事件系统 API

应用通过 `EventHandler` 类绑定用户交互事件，支持以下自定义行为：

### 支持的键盘快捷键
| 键 | 功能 | 触发条件 |
|----|------|----------|
| `←` | 上一张图像 | 非编辑模式 |
| `→` | 下一张图像 | 非编辑模式 |
| `+` / `=` | 放大 | 非编辑模式 |
| `-` | 缩小 | 非编辑模式 |
| `r` | 顺时针旋转 | 非编辑模式 |
| `f` | 切换全屏 | 非编辑模式 |
| `0` | 重置视图 | 非编辑模式 |
| `d` | 下载图像 | 非编辑模式 |
| `e` | 切换编辑面板 | 非裁剪/水印模式 |
| `c` | 切换裁剪模式 | 编辑模式下 |
| `w` | 切换水印模式 | 编辑模式下 |
| `Delete` | 删除当前图像 | 非编辑模式 |

### UI 事件绑定示例
```js
// 绑定缩放按钮
ui.elements.zoomInBtn.addEventListener('click', () => viewer.zoomIn());

// 绑定滤镜按钮
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    editor.updateFilter('filter', btn.dataset.filter);
  });
});
```

### 自定义事件数据结构
应用虽未使用 `CustomEvent`，但可通过以下方式扩展：
```js
// 示例：触发图像加载完成事件
const event = new CustomEvent('imageLoaded', {
  detail: {
    image: currentImage,
    index: currentIndex
  }
});
document.dispatchEvent(event);
```

**Section sources**  
- [eventHandler.js](file://js/eventHandler.js#L1-L214)