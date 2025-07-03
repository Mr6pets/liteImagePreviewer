class DragUploadManager {
    constructor(core) {
        this.core = core;
    }
    
    // 设置拖拽上传功能
    setupDragAndDrop() {
        // 获取拖拽区域（整个页面或特定区域）
        const dropZone = document.body;

        // 防止默认拖拽行为
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

    // 防止默认行为
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 拖拽高亮效果
    highlight() {
        // 添加拖拽状态的视觉反馈
        document.body.classList.add('drag-over');

        // 如果没有拖拽提示，创建一个
        if (!document.querySelector('.drag-overlay')) {
            this.createDragOverlay();
        }
    }

    // 移除拖拽高亮效果
    unhighlight() {
        document.body.classList.remove('drag-over');

        // 移除拖拽提示
        const overlay = document.querySelector('.drag-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // 创建拖拽提示覆盖层
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

    // 处理拖拽放置的文件
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

        // 处理文件
        this.core.imageManager.processFiles(imageFiles);
    }

    // 显示上传反馈
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
}