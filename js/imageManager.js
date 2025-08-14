class ImageManager {
    constructor(core) {
        this.core = core;
        this.images = [];
        this.currentIndex = 0;
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);

        // 如果是第一次添加图片，隐藏空状态
        if (this.images.length === 0) {
            this.core.ui.hideEmptyState();
        }

        // 显示清空按钮
        if (files.length > 0) {
            this.core.ui.elements.clearAllBtn.style.display = 'inline-block';
        }

        this.processFiles(files);
    }

    processFiles(files) {
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
                        originalSrc: e.target.result, // 确保这行存在
                        name: file.name,
                        index: this.images.length,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified,
                        filters: {
                            brightness: 100,
                            contrast: 100,
                            saturation: 100,
                            filter: 'none'
                        }
                    };

                    this.images.push(imageData);
                    this.createImageItem(imageData);
                };
                reader.readAsDataURL(file);
            }
        });

        // 清空文件输入，允许重复选择相同文件
        this.core.ui.elements.fileInput.value = '';
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

        // 使用data-src属性存储图片URL，稍后通过Intersection Observer加载
        item.innerHTML = `
            <img data-src="${imageData.src}" alt="${imageData.name}" class="lazy">
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
            const currentIndex = Array.from(this.core.ui.elements.imageList.children).indexOf(item);
            this.core.viewer.openViewer(currentIndex);
        });

        // 删除单张图片
        const removeBtn = item.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentIndex = Array.from(this.core.ui.elements.imageList.children).indexOf(item);
            this.removeImage(currentIndex);
        });

        // 添加Intersection Observer来懒加载图片
        this.setupLazyLoad(item);

        this.core.ui.elements.imageList.appendChild(item);
    }

    // 设置懒加载
    setupLazyLoad(item) {
        const img = item.querySelector('img');
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove('lazy');

                    // 图片加载完成后添加loaded类
                    lazyImage.addEventListener('load', () => {
                        lazyImage.classList.add('loaded');
                    });

                    observer.unobserve(lazyImage);
                }
            });
        });

        observer.observe(img);
    }

    // 删除单张图片
    removeImage(index) {
        if (confirm('确定要删除这张图片吗？')) {
            // 获取要删除的图片
            const removedImage = this.images[index];

            // 撤销对象URL以释放内存
            if (removedImage && removedImage.src && removedImage.src.startsWith('blob:')) {
                URL.revokeObjectURL(removedImage.src);
            }

            // 从数组中移除
            this.images.splice(index, 1);

            // 从DOM中移除
            const items = this.core.ui.elements.imageList.querySelectorAll('.image-item');
            if (items[index]) {
                items[index].remove();
            }

            // 如果删除的是当前预览的图片，调整当前索引
            if (this.currentIndex >= this.images.length) {
                this.currentIndex = Math.max(0, this.images.length - 1);
            }

            // 如果没有图片了，显示空状态
            if (this.images.length === 0) {
                this.core.ui.showEmptyState();
                this.core.ui.elements.clearAllBtn.style.display = 'none';
                if (this.core.ui.elements.viewer.style.display === 'flex') {
                    this.core.viewer.closeViewer();
                }
            } else {
                // 更新预览器
                if (this.core.ui.elements.viewer.style.display === 'flex') {
                    this.core.viewer.updateViewer();
                }
            }
        }
    }

    // 清空所有图片
    clearAllImages() {
        if (confirm('确定要清空所有图片吗？')) {
            // 撤销所有对象URL以释放内存
            this.images.forEach(image => {
                if (image.src && image.src.startsWith('blob:')) {
                    URL.revokeObjectURL(image.src);
                }
            });

            this.images = [];
            this.currentIndex = 0;
            this.core.ui.elements.imageList.innerHTML = '';
            this.core.ui.showEmptyState();
            this.core.ui.elements.clearAllBtn.style.display = 'none';
            this.core.ui.elements.fileInput.value = ''; // 清空文件输入
        }
    }
}
