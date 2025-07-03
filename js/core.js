class ImagePreviewerCore {
    constructor() {
        // 初始化各个模块
        this.ui = new UIManager(this);
        this.imageManager = new ImageManager(this);
        this.viewer = new ImageViewer(this);
        this.editor = new ImageEditor(this);
        this.dragUpload = new DragUploadManager(this);
        this.eventHandler = new EventHandler(this);
        
        // 初始化应用
        this.init();
    }
    
    init() {
        // 初始化UI
        this.ui.init();
        // 绑定事件
        this.eventHandler.bindEvents();
        // 显示空状态
        this.ui.showEmptyState();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ImagePreviewerCore();
    new ThemeManager(); // 主题管理
});