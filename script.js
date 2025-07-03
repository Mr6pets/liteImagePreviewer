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

        // 添加拖拽上传功能
        this.setupDragAndDrop();

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

    handleKeydown(e) {
        // 只在预览器打开时处理键盘事件
        if (!this.viewer.classList.contains('active')) return;

        switch (e.key) {
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

    // 设置拖拽上传功能 - 移动到类内部
    setupDragAndDrop() {
        // 获取拖拽区域（整个页面或特定区域）
        const dropZone = document.body;

        // 防止默认拖拽行为 - 修复this绑定问题
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => this.preventDefaults(e), false);
            document.body.addEventListener(eventName, (e) => this.preventDefaults(e), false);
        });

        // 拖拽进入和悬停效果
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                this.preventDefaults(e);
                this.highlight();
            }, false);
        });

        // 拖拽离开效果
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                this.preventDefaults(e);
                this.unhighlight();
            }, false);
        });

        // 处理文件拖拽放置
        dropZone.addEventListener('drop', (e) => {
            this.preventDefaults(e);
            this.handleDrop(e);
        }, false);

        // 阻止整个页面的默认拖拽行为
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        }, false);
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
        }, false);
    }

    // 防止默认行为 - 移动到类内部
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 拖拽高亮效果 - 移动到类内部
    highlight() {
        // 添加拖拽状态的视觉反馈
        document.body.classList.add('drag-over');

        // 如果没有拖拽提示，创建一个
        if (!document.querySelector('.drag-overlay')) {
            this.createDragOverlay();
        }
    }

    // 移除拖拽高亮效果 - 移动到类内部
    unhighlight() {
        document.body.classList.remove('drag-over');

        // 移除拖拽提示
        const overlay = document.querySelector('.drag-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // 创建拖拽提示覆盖层 - 移动到类内部
    createDragOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'drag-overlay';
        overlay.innerHTML = `
            <div class="drag-content">
                <div class="drag-icon">📁</div>
                <h3>拖拽图片到这里上传</h3>
                <p>支持 JPG、PNG、GIF、WebP 等格式</p>
            </div>
        `;

        // 添加样式
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(102, 126, 234, 0.9);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const dragContent = overlay.querySelector('.drag-content');
        dragContent.style.cssText = `
            text-align: center;
            color: white;
            padding: 40px;
            border: 3px dashed rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.1);
            max-width: 400px;
        `;

        const dragIcon = overlay.querySelector('.drag-icon');
        dragIcon.style.cssText = `
            font-size: 64px;
            margin-bottom: 20px;
            animation: bounce 1s infinite;
        `;

        // 添加动画样式
        if (!document.querySelector('#drag-animations')) {
            const style = document.createElement('style');
            style.id = 'drag-animations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }
                .drag-over {
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(overlay);
    }

    // 处理拖拽放置的文件 - 移动到类内部
    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files);

        // 过滤出图片文件
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            alert('请拖拽图片文件！支持 JPG、PNG、GIF、WebP 等格式。');
            return;
        }

        // 显示上传反馈
        this.showUploadFeedback(imageFiles.length);

        // 处理文件（复用现有的文件处理逻辑）
        this.processFiles(imageFiles);
    }

    // 显示上传反馈 - 移动到类内部
    showUploadFeedback(count) {
        const feedback = document.createElement('div');
        feedback.className = 'upload-feedback';
        feedback.innerHTML = `
            <div class="feedback-content">
                <div class="feedback-icon">✅</div>
                <p>成功上传 ${count} 张图片！</p>
            </div>
        `;

        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(34, 197, 94, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10001;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease;
        `;

        const feedbackContent = feedback.querySelector('.feedback-content');
        feedbackContent.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        // 添加滑入动画
        if (!document.querySelector('#feedback-animations')) {
            const style = document.createElement('style');
            style.id = 'feedback-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(feedback);

        // 3秒后自动移除
        setTimeout(() => {
            feedback.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }

    // 处理文件（复用现有逻辑） - 移动到类内部
    processFiles(files) {
        // 如果是第一次添加图片，隐藏空状态
        if (this.images.length === 0) {
            this.hideEmptyState();
        }

        // 显示清空按钮
        if (files.length > 0) {
            this.clearAllBtn.style.display = 'inline-block';
        }

        // 处理文件，累积添加而不是覆盖
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
                        index: this.images.length,
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
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ImagePreviewer();
    new ThemeManager(); // 添加这行
});
