class ImagePreviewer {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.scale = 1;
        this.rotation = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.translateX = 0;
        this.translateY = 0;
        
        this.initElements();
        this.bindEvents();
    }
    
    initElements() {
        this.fileInput = document.getElementById('fileInput');
        this.imageList = document.getElementById('imageList');
        this.viewer = document.getElementById('viewer');
        this.viewerImage = document.getElementById('viewerImage');
        this.imageCounter = document.getElementById('imageCounter');
        this.imageName = document.getElementById('imageName');
        
        // 控制按钮
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.rotateLeftBtn = document.getElementById('rotateLeft');
        this.rotateRightBtn = document.getElementById('rotateRight');
        this.fullscreenBtn = document.getElementById('fullscreen');
        this.resetBtn = document.getElementById('reset');
        this.closeBtn = document.getElementById('closeViewer');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
    }
    
    bindEvents() {
        // 文件选择
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 控制按钮事件
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.rotateLeftBtn.addEventListener('click', () => this.rotateLeft());
        this.rotateRightBtn.addEventListener('click', () => this.rotateRight());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.resetBtn.addEventListener('click', () => this.resetTransform());
        this.closeBtn.addEventListener('click', () => this.closeViewer());
        this.prevBtn.addEventListener('click', () => this.prevImage());
        this.nextBtn.addEventListener('click', () => this.nextImage());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // 鼠标拖拽
        this.viewerImage.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
        
        // 鼠标滚轮缩放
        this.viewer.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // 点击背景关闭
        this.viewer.addEventListener('click', (e) => {
            if (e.target === this.viewer) {
                this.closeViewer();
            }
        });
    }
    
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.images = [];
        this.imageList.innerHTML = '';
        
        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        src: e.target.result,
                        name: file.name,
                        index: index
                    };
                    
                    this.images.push(imageData);
                    this.createImageItem(imageData);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    createImageItem(imageData) {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.innerHTML = `
            <img src="${imageData.src}" alt="${imageData.name}">
            <div class="name">${imageData.name}</div>
        `;
        
        item.addEventListener('click', () => {
            this.openViewer(imageData.index);
        });
        
        this.imageList.appendChild(item);
    }
    
    openViewer(index) {
        this.currentIndex = index;
        this.resetTransform();
        this.updateViewer();
        this.viewer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    closeViewer() {
        this.viewer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    updateViewer() {
        if (this.images.length === 0) return;
        
        const currentImage = this.images[this.currentIndex];
        this.viewerImage.src = currentImage.src;
        this.imageCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
        this.imageName.textContent = currentImage.name;
        
        // 更新导航按钮状态
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.images.length - 1;
        
        this.applyTransform();
    }
    
    prevImage() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.resetTransform();
            this.updateViewer();
        }
    }
    
    nextImage() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
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
        this.viewerImage.style.transform = transform;
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.viewer.requestFullscreen().catch(err => {
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
    
    drag(event) {
        if (!this.isDragging) return;
        
        this.translateX = event.clientX - this.startX;
        this.translateY = event.clientY - this.startY;
        this.applyTransform();
    }
    
    endDrag() {
        this.isDragging = false;
    }
    
    handleWheel(event) {
        event.preventDefault();
        
        if (event.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    }
    
    handleKeydown(event) {
        if (this.viewer.style.display === 'none') return;
        
        switch (event.key) {
            case 'Escape':
                this.closeViewer();
                break;
            case 'ArrowLeft':
                this.prevImage();
                break;
            case 'ArrowRight':
                this.nextImage();
                break;
            case '+':
            case '=':
                this.zoomIn();
                break;
            case '-':
                this.zoomOut();
                break;
            case 'r':
            case 'R':
                this.rotateRight();
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
            case '0':
                this.resetTransform();
                break;
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ImagePreviewer();
});