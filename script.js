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
        this.showEmptyState();
    }

    initElements() {
        this.fileInput = document.getElementById('fileInput');
        this.imageList = document.getElementById('imageList');
        this.viewer = document.getElementById('viewer');
        this.viewerImage = document.getElementById('viewerImage');
        this.imageCounter = document.getElementById('imageCounter');
        this.imageName = document.getElementById('imageName');
        this.emptyState = document.getElementById('emptyState');

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

        // 添加清空所有图片的功能
        this.addClearAllButton();
    }

    // 显示空状态
    showEmptyState() {
        if (this.images.length === 0) {
            this.imageList.innerHTML = `
                <div class="empty-state" id="emptyState">
                    <div class="icon">🖼️</div>
                    <h3>还没有选择图片</h3>
                    <p>点击上方按钮选择图片开始预览</p>
                </div>
            `;
        }
    }

    // 隐藏空状态
    hideEmptyState() {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.remove();
        }
    }

    // 添加清空所有图片按钮
    addClearAllButton() {
        const header = document.querySelector('.header');
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-all-btn';
        clearBtn.innerHTML = '🗑️ 清空所有';
        clearBtn.style.cssText = `
            margin-left: 15px;
            padding: 12px 20px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            color: #e53e3e;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            display: none;
        `;

        clearBtn.addEventListener('click', () => this.clearAllImages());
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.background = 'rgba(229, 62, 62, 0.1)';
            clearBtn.style.transform = 'translateY(-2px)';
        });
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.background = 'rgba(255, 255, 255, 0.9)';
            clearBtn.style.transform = 'translateY(0)';
        });

        header.appendChild(clearBtn);
        this.clearAllBtn = clearBtn;
    }

    // 清空所有图片
    clearAllImages() {
        if (confirm('确定要清空所有图片吗？')) {
            this.images = [];
            this.currentIndex = 0;
            this.imageList.innerHTML = '';
            this.showEmptyState();
            this.clearAllBtn.style.display = 'none';
            this.fileInput.value = ''; // 清空文件输入
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);

        // 如果是第一次添加图片，隐藏空状态
        if (this.images.length === 0) {
            this.hideEmptyState();
        }

        // 显示清空按钮
        if (files.length > 0) {
            this.clearAllBtn.style.display = 'inline-block';
        }

        // 处理新选择的文件，累积添加而不是覆盖
        files.forEach((file) => {
            if (file.type.startsWith('image/')) {
                // 检查是否已存在相同名称的文件
                const existingImage = this.images.find(img => img.name === file.name);
                if (existingImage) {
                    console.log(`图片 "${file.name}" 已存在，跳过添加`);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = {
                        src: e.target.result,
                        name: file.name,
                        index: this.images.length, // 使用当前数组长度作为索引
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified
                    };

                    this.images.push(imageData);
                    this.createImageItem(imageData);

                };
                reader.readAsDataURL(file);
            }
        });

        // 清空文件输入，允许重复选择相同文件
        this.fileInput.value = '';
    }



    createImageItem(imageData) {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.setAttribute('data-index', imageData.index);

        // 格式化文件大小
        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        item.innerHTML = `
            <img src="${imageData.src}" alt="${imageData.name}" loading="lazy">
            <div class="image-overlay">
                <div class="image-info-overlay">
                    <div class="name">${imageData.name}</div>
                    <div class="size">${formatFileSize(imageData.size)}</div>
                </div>
                <button class="remove-btn" title="删除图片">✕</button>
            </div>
        `;

        // 修复：将点击事件绑定到整个item上，而不是img
        item.addEventListener('click', (e) => {
            // 如果点击的是删除按钮，不触发预览
            if (e.target.classList.contains('remove-btn')) {
                return;
            }
            const currentIndex = Array.from(this.imageList.children).indexOf(item);
            this.openViewer(currentIndex);
        });

        // 删除单张图片
        const removeBtn = item.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentIndex = Array.from(this.imageList.children).indexOf(item);
            this.removeImage(currentIndex);
        });

        // 图片加载完成后添加loaded类
        const imgElement = item.querySelector('img');
        imgElement.addEventListener('load', () => {
            imgElement.classList.add('loaded');
        });

        this.imageList.appendChild(item);
    }

    // 删除单张图片
    removeImage(index) {
        if (confirm('确定要删除这张图片吗？')) {
            // 从数组中移除
            this.images.splice(index, 1);

            // 从DOM中移除
            const items = this.imageList.querySelectorAll('.image-item');
            if (items[index]) {
                items[index].remove();
            }

            // 如果删除的是当前预览的图片，调整当前索引
            if (this.currentIndex >= this.images.length) {
                this.currentIndex = Math.max(0, this.images.length - 1);
            }

            // 如果没有图片了，显示空状态
            if (this.images.length === 0) {
                this.showEmptyState();
                this.clearAllBtn.style.display = 'none';
                if (this.viewer.style.display === 'flex') {
                    this.closeViewer();
                }
            } else {
                // 更新预览器
                if (this.viewer.style.display === 'flex') {
                    this.updateViewer();
                }
            }
        }
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
            case 'Delete':
            case 'Backspace':
                if (this.images.length > 0) {
                    this.removeImage(this.currentIndex);
                }
                break;
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ImagePreviewer();
});
