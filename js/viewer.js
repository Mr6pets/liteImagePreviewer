class ImageViewer {
    constructor(core) {
        this.core = core;
        this.scale = 1;
        this.rotation = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.animationId = null; // 添加动画ID
    }

    openViewer(index) {
        this.core.imageManager.currentIndex = index;
        this.resetTransform();
        this.updateViewer();
        this.core.ui.elements.viewer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeViewer() {
        this.core.ui.elements.viewer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    updateViewer() {
        const images = this.core.imageManager.images;
        const currentIndex = this.core.imageManager.currentIndex;

        if (images.length === 0) return;

        const currentImage = images[currentIndex];

        // 更新UI
        this.core.ui.updateViewerUI(currentImage, currentIndex, images.length);

        // 应用变换
        this.applyTransform();

        // 应用滤镜
        this.core.editor.applyFilters();
    }

    prevImage() {
        if (this.core.imageManager.currentIndex > 0) {
            this.core.imageManager.currentIndex--;
            this.resetTransform();
            this.updateViewer();
        }
    }

    nextImage() {
        if (this.core.imageManager.currentIndex < this.core.imageManager.images.length - 1) {
            this.core.imageManager.currentIndex++;
            this.resetTransform();
            this.updateViewer();
        }
    }

    zoomIn() {
        this.scale = Math.min(this.scale * 1.2, 5);
        this.applyTransform();
    }

    zoomOut() {
        this.scale = Math.max(this.scale / 1.2, 0.1);
        this.applyTransform();
    }

    rotateLeft() {
        this.rotation -= 90;
        this.applyTransform();
    }

    rotateRight() {
        this.rotation += 90;
        this.applyTransform();
    }

    resetTransform() {
        this.scale = 1;
        this.rotation = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.applyTransform();
    }

    applyTransform() {
        const transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale}) rotate(${this.rotation}deg)`;
        this.core.ui.elements.viewerImage.style.transform = transform;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.core.ui.elements.viewer.requestFullscreen().catch(err => {
                console.log('无法进入全屏模式:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    startDrag(event) {
        this.isDragging = true;
        this.startX = event.clientX - this.translateX;
        this.startY = event.clientY - this.translateY;
        event.preventDefault();
    }

    drag(e) {
        if (!this.isDragging) return;

        // 取消之前的动画帧
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // 使用 requestAnimationFrame 优化性能
        this.animationId = requestAnimationFrame(() => {
            this.translateX = e.clientX - this.startX;
            this.translateY = e.clientY - this.startY;
            this.applyTransform();
        });
    }

    endDrag() {
        this.isDragging = false;
        // 清理动画帧
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    handleWheel(event) {
        const editPanel = this.core.ui.elements.editPanel;

        // 检查鼠标是否在编辑面板上
        if (editPanel.contains(event.target)) {
            // 允许在编辑面板上滚动
            return;
        }

        event.preventDefault();

        if (event.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }
}
