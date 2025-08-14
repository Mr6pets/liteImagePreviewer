class UIManager {
    constructor(core) {
        this.core = core;
        this.elements = {};
    }
    
    init() {
        this.initElements();
        this.addClearAllButton();
    }
    
    initElements() {
        // 初始化所有DOM元素引用
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            imageList: document.getElementById('imageList'),
            viewer: document.getElementById('viewer'),
            viewerImage: document.getElementById('viewerImage'),
            imageCounter: document.getElementById('imageCounter'),
            imageName: document.getElementById('imageName'),
            emptyState: document.getElementById('emptyState'),
            imageContainer: document.querySelector('.image-container'),
            // 控制按钮
            zoomInBtn: document.getElementById('zoomIn'),
            zoomOutBtn: document.getElementById('zoomOut'),
            rotateLeftBtn: document.getElementById('rotateLeft'),
            rotateRightBtn: document.getElementById('rotateRight'),
            fullscreenBtn: document.getElementById('fullscreen'),
            resetBtn: document.getElementById('reset'),
            downloadBtn: document.getElementById('downloadImage'),
            closeBtn: document.getElementById('closeViewer'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            // 图像编辑相关元素
            editBtn: document.getElementById('editImage'),
            editPanel: document.getElementById('editPanel'),
            closeEditBtn: document.getElementById('closeEditPanel'),
            brightnessSlider: document.getElementById('brightness'),
            contrastSlider: document.getElementById('contrast'),
            saturationSlider: document.getElementById('saturation'),
            applyChangesBtn: document.getElementById('applyChanges'),
            cancelChangesBtn: document.getElementById('cancelChanges'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            resetBtns: document.querySelectorAll('.reset-btn'),
            // 裁剪相关元素
            cropOverlay: document.getElementById('cropOverlay'),
            startCrop: document.getElementById('startCrop'),
            applyCrop: document.getElementById('applyCrop'),
            cancelCrop: document.getElementById('cancelCrop'),
            // 水印相关元素
            watermarkOverlay: document.getElementById('watermarkOverlay'),
            watermarkInput: document.getElementById('watermarkInput'),
            watermarkStyle: document.getElementById('watermarkStyle'),
            watermarkColor: document.getElementById('watermarkColor'),
            watermarkSize: document.getElementById('watermarkSize'),
            addWatermark: document.getElementById('addWatermark'),
            applyWatermark: document.getElementById('applyWatermark'),
            cancelWatermark: document.getElementById('cancelWatermark')
        };
    }
    
    // 显示空状态
    showEmptyState() {
        if (this.core.imageManager.images.length === 0) {
            this.elements.imageList.innerHTML = `
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

        clearBtn.addEventListener('click', () => this.core.imageManager.clearAllImages());
        clearBtn.addEventListener('mouseenter', () => {
            clearBtn.style.background = 'rgba(229, 62, 62, 0.1)';
            clearBtn.style.transform = 'translateY(-2px)';
        });
        clearBtn.addEventListener('mouseleave', () => {
            clearBtn.style.background = 'rgba(255, 255, 255, 0.9)';
            clearBtn.style.transform = 'translateY(0)';
        });

        header.appendChild(clearBtn);
        this.elements.clearAllBtn = clearBtn;
    }
    
    // 更新预览器UI
    updateViewerUI(currentImage, currentIndex, totalImages) {
        this.elements.viewerImage.src = currentImage.src;
        this.elements.imageCounter.textContent = `${currentIndex + 1} / ${totalImages}`;
        this.elements.imageName.textContent = currentImage.name;
        
        // 更新导航按钮状态
        this.elements.prevBtn.disabled = currentIndex === 0;
        this.elements.nextBtn.disabled = currentIndex === totalImages - 1;
    }
}