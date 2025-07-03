class ImageEditor {
    constructor(core) {
        this.core = core;
        this.editMode = false;
        this.imageFilters = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            filter: 'none'
        };
        this.originalImageData = null;
    }
    
    // 切换编辑面板显示
    toggleEditPanel(show = true) {
        this.editMode = show;
        this.core.ui.elements.editPanel.style.display = show ? 'block' : 'none';
        
        if (show) {
            // 保存当前图片的原始滤镜设置
            this.saveOriginalImageData();
            
            // 更新滑块值为当前图片的滤镜设置
            const currentImage = this.core.imageManager.images[this.core.imageManager.currentIndex];
            if (currentImage.filters) {
                this.imageFilters = { ...currentImage.filters };
                this.core.ui.elements.brightnessSlider.value = currentImage.filters.brightness;
                this.core.ui.elements.contrastSlider.value = currentImage.filters.contrast;
                this.core.ui.elements.saturationSlider.value = currentImage.filters.saturation;
                
                // 更新滤镜按钮状态
                this.core.ui.elements.filterBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === currentImage.filters.filter);
                });
            }
        }
    }
    
    // 保存当前图片的原始滤镜设置
    saveOriginalImageData() {
        const currentImage = this.core.imageManager.images[this.core.imageManager.currentIndex];
        this.originalImageData = { ...currentImage.filters } || { 
            brightness: 100, 
            contrast: 100, 
            saturation: 100, 
            filter: 'none' 
        };
    }
    
    // 更新滤镜值
    updateFilter(type, value) {
        this.imageFilters[type] = value;
        
        // 更新滑块值显示
        if (type !== 'filter') {
            const valueDisplay = document.querySelector(`#${type}`).nextElementSibling;
            if (valueDisplay) {
                valueDisplay.textContent = `${value}%`;
            }
        }
        
        // 应用滤镜
        this.applyFilters();
    }
    
    // 应用滤镜
    applyFilters() {
        if (!this.core.ui.elements.viewerImage) return;
        
        const currentImage = this.core.imageManager.images[this.core.imageManager.currentIndex];
        const filters = this.editMode ? this.imageFilters : currentImage.filters;
        
        if (!filters) return;
        
        const { brightness, contrast, saturation, filter } = filters;
        let filterString = ``;
        
        // 添加基础调整
        filterString += `brightness(${brightness}%) `;
        filterString += `contrast(${contrast}%) `;
        filterString += `saturate(${saturation}%) `;
        
        // 添加滤镜效果
        switch (filter) {
            case 'grayscale':
                filterString += `grayscale(100%) `;
                break;
            case 'sepia':
                filterString += `sepia(100%) `;
                break;
            case 'invert':
                filterString += `invert(100%) `;
                break;
            case 'blur':
                filterString += `blur(5px) `;
                break;
        }
        
        this.core.ui.elements.viewerImage.style.filter = filterString;
    }
    
    // 应用图像更改
    applyImageChanges() {
        // 保存当前滤镜设置到图片数据
        const currentImage = this.core.imageManager.images[this.core.imageManager.currentIndex];
        currentImage.filters = { ...this.imageFilters };
        
        // 关闭编辑面板
        this.toggleEditPanel(false);
    }
    
    // 取消图像更改
    cancelImageChanges() {
        // 恢复原始滤镜设置
        if (this.originalImageData) {
            this.imageFilters = { ...this.originalImageData };
            this.applyFilters();
        }
        
        // 关闭编辑面板
        this.toggleEditPanel(false);
    }
}