class EventHandler {
    constructor(core) {
        this.core = core;
    }
    
    bindEvents() {
        // 文件选择
        this.core.ui.elements.fileInput.addEventListener('change', (e) => this.core.imageManager.handleFileSelect(e));

        // 添加拖拽上传功能
        this.core.dragUpload.setupDragAndDrop();

        // 控制按钮事件
        this.core.ui.elements.zoomInBtn.addEventListener('click', () => this.core.viewer.zoomIn());
        this.core.ui.elements.zoomOutBtn.addEventListener('click', () => this.core.viewer.zoomOut());
        this.core.ui.elements.rotateLeftBtn.addEventListener('click', () => this.core.viewer.rotateLeft());
        this.core.ui.elements.rotateRightBtn.addEventListener('click', () => this.core.viewer.rotateRight());
        this.core.ui.elements.fullscreenBtn.addEventListener('click', () => this.core.viewer.toggleFullscreen());
        this.core.ui.elements.resetBtn.addEventListener('click', () => this.core.viewer.resetTransform());
        this.core.ui.elements.closeBtn.addEventListener('click', () => this.core.viewer.closeViewer());
        this.core.ui.elements.prevBtn.addEventListener('click', () => this.core.viewer.prevImage());
        this.core.ui.elements.nextBtn.addEventListener('click', () => this.core.viewer.nextImage());

        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // 鼠标拖拽
        this.core.ui.elements.viewerImage.addEventListener('mousedown', (e) => this.core.viewer.startDrag(e));
        document.addEventListener('mousemove', (e) => this.core.viewer.drag(e));
        document.addEventListener('mouseup', () => this.core.viewer.endDrag());

        // 鼠标滚轮缩放
        this.core.ui.elements.viewer.addEventListener('wheel', (e) => this.core.viewer.handleWheel(e));

        // 点击背景关闭
        this.core.ui.elements.viewer.addEventListener('click', (e) => {
            if (e.target === this.core.ui.elements.viewer) {
                this.core.viewer.closeViewer();
            }
        });
        
        // 图像编辑相关事件
        this.core.ui.elements.editBtn.addEventListener('click', () => this.core.editor.toggleEditPanel());
        this.core.ui.elements.closeEditBtn.addEventListener('click', () => this.core.editor.toggleEditPanel(false));
        
        // 滑块事件
        this.core.ui.elements.brightnessSlider.addEventListener('input', (e) => this.core.editor.updateFilter('brightness', e.target.value));
        this.core.ui.elements.contrastSlider.addEventListener('input', (e) => this.core.editor.updateFilter('contrast', e.target.value));
        this.core.ui.elements.saturationSlider.addEventListener('input', (e) => this.core.editor.updateFilter('saturation', e.target.value));
        
        // 滤镜按钮事件
        this.core.ui.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.core.editor.updateFilter('filter', filter);
                
                // 更新活动状态
                this.core.ui.elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // 重置按钮事件
        this.core.ui.elements.resetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const slider = btn.dataset.slider;
                document.getElementById(slider).value = 100;
                this.core.editor.updateFilter(slider, 100);
            });
        });
        
        // 应用/取消按钮事件
        this.core.ui.elements.applyChangesBtn.addEventListener('click', () => this.core.editor.applyImageChanges());
        this.core.ui.elements.cancelChangesBtn.addEventListener('click', () => this.core.editor.cancelImageChanges());
    }
    
    handleKeydown(e) {
        // 只在预览器打开时处理键盘事件
        if (this.core.ui.elements.viewer.style.display !== 'flex') return;

        switch (e.key) {
            case 'Escape':
                if (this.core.editor.editMode) {
                    this.core.editor.cancelImageChanges();
                } else {
                    this.core.viewer.closeViewer();
                }
                break;
            case 'ArrowLeft':
                if (!this.core.editor.editMode) this.core.viewer.prevImage();
                break;
            case 'ArrowRight':
                if (!this.core.editor.editMode) this.core.viewer.nextImage();
                break;
            case '+':
            case '=':
                if (!this.core.editor.editMode) this.core.viewer.zoomIn();
                break;
            case '-':
                if (!this.core.editor.editMode) this.core.viewer.zoomOut();
                break;
            case 'r':
            case 'R':
                if (!this.core.editor.editMode) this.core.viewer.rotateRight();
                break;
            case 'f':
            case 'F':
                if (!this.core.editor.editMode) this.core.viewer.toggleFullscreen();
                break;
            case '0':
                if (!this.core.editor.editMode) this.core.viewer.resetTransform();
                break;
            case 'e':
            case 'E':
                this.core.editor.toggleEditPanel(!this.core.editor.editMode);
                break;
            case 'Delete':
            case 'Backspace':
                if (!this.core.editor.editMode && this.core.imageManager.images.length > 0) {
                    this.core.imageManager.removeImage(this.core.imageManager.currentIndex);
                }
                break;
        }
    }
}