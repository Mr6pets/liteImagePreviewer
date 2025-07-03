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
        
        // 裁剪相关属性
        this.cropMode = false;
        this.cropBox = null;
        this.cropHandles = [];
        this.activeCropHandle = null;
        this.cropStartX = 0;
        this.cropStartY = 0;
        this.cropStartWidth = 0;
        this.cropStartHeight = 0;
        this.cropStartLeft = 0;
        this.cropStartTop = 0;
        
        // 水印相关属性
        this.watermarkMode = false;
        this.watermarkText = null;
        this.watermarkStartX = 0;
        this.watermarkStartY = 0;
        this.watermarkStartLeft = 0;
        this.watermarkStartTop = 0;
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
        } else {
            // 确保退出裁剪和水印模式
            if (this.cropMode) this.toggleCropMode(false);
            if (this.watermarkMode) this.toggleWatermarkMode(false);
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
    
    // 切换裁剪模式
    toggleCropMode(enable = true) {
        this.cropMode = enable;
        this.core.ui.elements.cropOverlay.style.display = enable ? 'block' : 'none';
        this.core.ui.elements.startCrop.style.display = enable ? 'none' : 'block';
        this.core.ui.elements.applyCrop.style.display = enable ? 'block' : 'none';
        this.core.ui.elements.cancelCrop.style.display = enable ? 'block' : 'none';
        
        if (enable) {
            // 初始化裁剪框
            this.initCropBox();
            // 添加裁剪事件监听
            this.addCropEventListeners();
        } else {
            // 移除裁剪事件监听
            this.removeCropEventListeners();
        }
    }
    
    // 初始化裁剪框
    initCropBox() {
        this.cropBox = this.core.ui.elements.cropOverlay.querySelector('.crop-box');
        this.cropHandles = this.core.ui.elements.cropOverlay.querySelectorAll('.crop-handle');
        
        // 获取图片的实际显示尺寸和位置
        const img = this.core.ui.elements.viewerImage;
        const imgRect = img.getBoundingClientRect();
        const containerRect = this.core.ui.elements.imageContainer.getBoundingClientRect();
        
        // 计算裁剪框的初始位置和大小（默认为图片的60%）
        const cropWidth = imgRect.width * 0.6;
        const cropHeight = imgRect.height * 0.6;
        const cropLeft = (imgRect.width - cropWidth) / 2;
        const cropTop = (imgRect.height - cropHeight) / 2;
        
        // 设置裁剪框的位置和大小
        this.cropBox.style.width = `${cropWidth}px`;
        this.cropBox.style.height = `${cropHeight}px`;
        this.cropBox.style.left = `${cropLeft}px`;
        this.cropBox.style.top = `${cropTop}px`;
    }
    
    // 添加裁剪事件监听
    addCropEventListeners() {
        // 移动裁剪框
        this.cropBox.addEventListener('mousedown', this.startCropBoxDrag.bind(this));
        document.addEventListener('mousemove', this.cropBoxDrag.bind(this));
        document.addEventListener('mouseup', this.endCropBoxDrag.bind(this));
        
        // 调整裁剪框大小
        this.cropHandles.forEach(handle => {
            handle.addEventListener('mousedown', this.startCropResize.bind(this));
        });
    }
    
    // 移除裁剪事件监听
    removeCropEventListeners() {
        this.cropBox.removeEventListener('mousedown', this.startCropBoxDrag.bind(this));
        document.removeEventListener('mousemove', this.cropBoxDrag.bind(this));
        document.removeEventListener('mouseup', this.endCropBoxDrag.bind(this));
        
        this.cropHandles.forEach(handle => {
            handle.removeEventListener('mousedown', this.startCropResize.bind(this));
        });
    }
    
    // 开始拖动裁剪框
    startCropBoxDrag(e) {
        if (e.target === this.cropBox) {
            e.preventDefault();
            this.cropStartX = e.clientX;
            this.cropStartY = e.clientY;
            this.cropStartLeft = parseFloat(this.cropBox.style.left) || 0;
            this.cropStartTop = parseFloat(this.cropBox.style.top) || 0;
            this.cropBox.style.cursor = 'grabbing';
        }
    }
    
    // 拖动裁剪框
    cropBoxDrag(e) {
        if (this.cropStartX && this.cropStartY) {
            e.preventDefault();
            
            // 计算移动距离
            const deltaX = e.clientX - this.cropStartX;
            const deltaY = e.clientY - this.cropStartY;
            
            // 获取图片容器的边界
            const containerRect = this.core.ui.elements.imageContainer.getBoundingClientRect();
            const imgRect = this.core.ui.elements.viewerImage.getBoundingClientRect();
            
            // 计算新位置，确保不超出图片边界
            let newLeft = this.cropStartLeft + deltaX;
            let newTop = this.cropStartTop + deltaY;
            
            // 限制裁剪框不超出图片边界
            const cropWidth = parseFloat(this.cropBox.style.width);
            const cropHeight = parseFloat(this.cropBox.style.height);
            
            newLeft = Math.max(0, Math.min(newLeft, imgRect.width - cropWidth));
            newTop = Math.max(0, Math.min(newTop, imgRect.height - cropHeight));
            
            // 更新裁剪框位置
            this.cropBox.style.left = `${newLeft}px`;
            this.cropBox.style.top = `${newTop}px`;
        }
    }
    
    // 结束拖动裁剪框
    endCropBoxDrag() {
        this.cropStartX = 0;
        this.cropStartY = 0;
        this.cropBox.style.cursor = 'move';
    }
    
    // 开始调整裁剪框大小
    startCropResize(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.activeCropHandle = e.target;
        this.cropStartX = e.clientX;
        this.cropStartY = e.clientY;
        this.cropStartWidth = parseFloat(this.cropBox.style.width) || 0;
        this.cropStartHeight = parseFloat(this.cropBox.style.height) || 0;
        this.cropStartLeft = parseFloat(this.cropBox.style.left) || 0;
        this.cropStartTop = parseFloat(this.cropBox.style.top) || 0;
        
        document.addEventListener('mousemove', this.cropResize.bind(this));
        document.addEventListener('mouseup', this.endCropResize.bind(this));
    }
    
    // 调整裁剪框大小
    cropResize(e) {
        if (!this.activeCropHandle) return;
        
        e.preventDefault();
        
        // 计算移动距离
        const deltaX = e.clientX - this.cropStartX;
        const deltaY = e.clientY - this.cropStartY;
        
        // 获取图片容器的边界
        const imgRect = this.core.ui.elements.viewerImage.getBoundingClientRect();
        
        // 根据不同的调整柄计算新的尺寸和位置
        let newWidth = this.cropStartWidth;
        let newHeight = this.cropStartHeight;
        let newLeft = this.cropStartLeft;
        let newTop = this.cropStartTop;
        
        if (this.activeCropHandle.classList.contains('top-left')) {
            newWidth = this.cropStartWidth - deltaX;
            newHeight = this.cropStartHeight - deltaY;
            newLeft = this.cropStartLeft + deltaX;
            newTop = this.cropStartTop + deltaY;
        } else if (this.activeCropHandle.classList.contains('top-right')) {
            newWidth = this.cropStartWidth + deltaX;
            newHeight = this.cropStartHeight - deltaY;
            newTop = this.cropStartTop + deltaY;
        } else if (this.activeCropHandle.classList.contains('bottom-left')) {
            newWidth = this.cropStartWidth - deltaX;
            newHeight = this.cropStartHeight + deltaY;
            newLeft = this.cropStartLeft + deltaX;
        } else if (this.activeCropHandle.classList.contains('bottom-right')) {
            newWidth = this.cropStartWidth + deltaX;
            newHeight = this.cropStartHeight + deltaY;
        }
        
        // 确保裁剪框不小于最小尺寸
        const minSize = 50;
        newWidth = Math.max(minSize, newWidth);
        newHeight = Math.max(minSize, newHeight);
        
        // 确保裁剪框不超出图片边界
        if (newLeft < 0) {
            newWidth += newLeft;
            newLeft = 0;
        }
        if (newTop < 0) {
            newHeight += newTop;
            newTop = 0;
        }
        if (newLeft + newWidth > imgRect.width) {
            newWidth = imgRect.width - newLeft;
        }
        if (newTop + newHeight > imgRect.height) {
            newHeight = imgRect.height - newTop;
        }
        
        // 更新裁剪框尺寸和位置
        this.cropBox.style.width = `${newWidth}px`;
        this.cropBox.style.height = `${newHeight}px`;
        this.cropBox.style.left = `${newLeft}px`;
        this.cropBox.style.top = `${newTop}px`;
    }
    
    // 结束调整裁剪框大小
    endCropResize() {
        this.activeCropHandle = null;
        document.removeEventListener('mousemove', this.cropResize.bind(this));
        document.removeEventListener('mouseup', this.endCropResize.bind(this));
    }
    
    // 应用裁剪
    applyCrop() {
        // 获取裁剪框的位置和尺寸
        const cropLeft = parseFloat(this.cropBox.style.left) || 0;
        const cropTop = parseFloat(this.cropBox.style.top) || 0;
        const cropWidth = parseFloat(this.cropBox.style.width) || 0;
        const cropHeight = parseFloat(this.cropBox.style.height) || 0;
        
        // 获取图片元素
        const img = this.core.ui.elements.viewerImage;
        const imgRect = img.getBoundingClientRect();
        
        // 创建Canvas进行裁剪
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算裁剪比例（考虑图片的实际尺寸和显示尺寸的比例）
        const scaleX = img.naturalWidth / imgRect.width;
        const scaleY = img.naturalHeight / imgRect.height;
        
        // 设置Canvas尺寸为裁剪后的尺寸
        canvas.width = cropWidth * scaleX;
        canvas.height = cropHeight * scaleY;
        
        // 在Canvas上绘制裁剪后的图片
        ctx.drawImage(
            img,
            cropLeft * scaleX,
            cropTop * scaleY,
            cropWidth * scaleX,
            cropHeight * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );
        
        // 将Canvas转换为图片数据
        const croppedImageData = canvas.toDataURL(this.core.imageManager.images[this.core.imageManager.currentIndex].type || 'image/png');
        
        // 更新当前图片
        const currentImage = this.core.imageManager.images[this.core.imageManager.currentIndex];
        currentImage.src = croppedImageData;
        
        // 更新预览图
        this.core.ui.elements.viewerImage.src = croppedImageData;
        
        // 更新缩略图
        const thumbnailImg = this.core.ui.elements.imageList.children[this.core.imageManager.currentIndex].querySelector('img');
        if (thumbnailImg) {
            thumbnailImg.src = croppedImageData;
        }
        
        // 退出裁剪模式
        this.toggleCropMode(false);
        
        // 重置变换
        this.core.viewer.resetTransform();
    }
    
    // 切换水印模式
    toggleWatermarkMode(enable = true) {
        this.watermarkMode = enable;
        this.core.ui.elements.watermarkOverlay.style.display = enable ? 'block' : 'none';
        this.core.ui.elements.addWatermark.style.display = enable ? 'none' : 'block';
        this.core.ui.elements.applyWatermark.style.display = enable ? 'block' : 'none';
        this.core.ui.elements.cancelWatermark.style.display = enable ? 'block' : 'none';
        
        if (enable) {
            // 初始化水印
            this.initWatermark();
            // 添加水印事件监听
            this.addWatermarkEventListeners();
        } else {
            // 移除水印事件监听
            this.removeWatermarkEventListeners();
        }
    }
    
    // 初始化水印
    initWatermark() {
        this.watermarkText = this.core.ui.elements.watermarkOverlay.querySelector('.watermark-text');
        
        // 设置水印文字
        const watermarkInput = this.core.ui.elements.watermarkInput.value.trim();
        this.watermarkText.textContent = watermarkInput || '水印文字';
        
        // 设置水印样式
        this.updateWatermarkStyle();
    }
    
    // 更新水印样式
    updateWatermarkStyle() {
        const style = this.core.ui.elements.watermarkStyle.value;
        const color = this.core.ui.elements.watermarkColor.value;
        const size = this.core.ui.elements.watermarkSize.value;
        
        // 重置样式
        this.watermarkText.style.color = color;
        this.watermarkText.style.fontSize = `${size}px`;
        this.watermarkText.style.textShadow = 'none';
        this.watermarkText.style.webkitTextStroke = 'none';
        this.watermarkText.style.opacity = '1';
        
        // 应用选择的样式
        switch (style) {
            case 'shadow':
                this.watermarkText.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
                break;
            case 'outline':
                this.watermarkText.style.webkitTextStroke = '1px black';
                break;
            case 'transparent':
                this.watermarkText.style.opacity = '0.5';
                break;
        }
    }
    
    // 添加水印事件监听
    addWatermarkEventListeners() {
        // 水印拖动
        this.watermarkText.addEventListener('mousedown', this.startWatermarkDrag.bind(this));
        document.addEventListener('mousemove', this.watermarkDrag.bind(this));
        document.addEventListener('mouseup', this.endWatermarkDrag.bind(this));
        
        // 水印样式更新
        this.core.ui.elements.watermarkInput.addEventListener('input', this.updateWatermarkText.bind(this));
        this.core.ui.elements.watermarkStyle.addEventListener('change', this.updateWatermarkStyle.bind(this));
        this.core.ui.elements.watermarkColor.addEventListener('input', this.updateWatermarkStyle.bind(this));
        this.core.ui.elements.watermarkSize.addEventListener('input', this.updateWatermarkSize.bind(this));
    }
    
    // 移除水印事件监听
    removeWatermarkEventListeners() {
        this.watermarkText.removeEventListener('mousedown', this.startWatermarkDrag.bind(this));
        document.removeEventListener('mousemove', this.watermarkDrag.bind(this));
        document.removeEventListener('mouseup', this.endWatermarkDrag.bind(this));
        
        this.core.ui.elements.watermarkInput.removeEventListener('input', this.updateWatermarkText.bind(this));
        this.core.ui.elements.watermarkStyle.removeEventListener('change', this.updateWatermarkStyle.bind(this));
        this.core.ui.elements.watermarkColor.removeEventListener('input', this.updateWatermarkStyle.bind(this));
        this.core.ui.elements.watermarkSize.removeEventListener('input', this.updateWatermarkSize.bind(this));
    }
    
    // 更新水印文字
    updateWatermarkText() {
        const watermarkInput = this.core.ui.elements.watermarkInput.value.trim();
        this.watermarkText.textContent = watermarkInput || '水印文字';
    }
    
    // 更新水印大小
    updateWatermarkSize() {
        const size = this.core.ui.elements.watermarkSize.value;
        this.watermarkText.style.fontSize = `${size}px`;
        
        // 更新滑块值显示
        const valueDisplay = this.core.ui.elements.watermarkSize.nextElementSibling;
        if (valueDisplay) {
            valueDisplay.textContent = `${size}px`;
        }
    }
    
    // 开始拖动水印
    startWatermarkDrag(e) {
        e.preventDefault();
        this.watermarkStartX = e.clientX;
        this.watermarkStartY = e.clientY;
        
        // 获取水印当前位置
        const style = window.getComputedStyle(this.watermarkText);
        this.watermarkStartLeft = parseFloat(style.left) || 0;
        this.watermarkStartTop = parseFloat(style.top) || 0;
        
        this.watermarkText.style.cursor = 'grabbing';
    }
    
    // 拖动水印
    watermarkDrag(e) {
        if (this.watermarkStartX && this.watermarkStartY) {
            e.preventDefault();
            
            // 计算移动距离
            const deltaX = e.clientX - this.watermarkStartX;
            const deltaY = e.clientY - this.watermarkStartY;
            
            // 更新水印位置
            const newLeft = this.watermarkStartLeft + deltaX;
            const newTop = this.watermarkStartTop + deltaY;
            
            this.watermarkText.style.left = `${newLeft}px`;
            this.watermarkText.style.top = `${newTop}px`;
            this.watermarkText.style.transform = 'none';
        }
    }
    
    // 结束拖动水印
    endWatermarkDrag() {
        this.watermarkStartX = 0;
        this.watermarkStartY = 0;
        this.watermarkText.style.cursor = 'move';
    }
    
    // 应用水印
    applyWatermark() {
        // 获取图片元素
        const img = this.core.ui.elements.viewerImage;
        const imgRect = img.getBoundingClientRect();
        
        // 创建Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置Canvas尺寸为图片的实际尺寸
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // 在Canvas上绘制原图
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 获取水印样式
        const watermarkStyle = window.getComputedStyle(this.watermarkText);
        const watermarkRect = this.watermarkText.getBoundingClientRect();
        
        // 计算水印在原图上的位置和大小比例
        const scaleX = img.naturalWidth / imgRect.width;
        const scaleY = img.naturalHeight / imgRect.height;
        
        // 计算水印在Canvas上的位置
        let watermarkLeft, watermarkTop;
        
        if (this.watermarkText.style.transform === 'none') {
            // 如果水印已被拖动（transform被设置为none）
            watermarkLeft = parseFloat(this.watermarkText.style.left) * scaleX;
            watermarkTop = parseFloat(this.watermarkText.style.top) * scaleY;
        } else {
            // 如果水印在默认位置（居中）
            watermarkLeft = (imgRect.width / 2 - watermarkRect.width / 2) * scaleX;
            watermarkTop = (imgRect.height / 2 - watermarkRect.height / 2) * scaleY;
        }
        
        // 设置Canvas文字样式
        ctx.font = `${parseFloat(watermarkStyle.fontSize) * scaleX}px ${watermarkStyle.fontFamily}`;
        ctx.fillStyle = watermarkStyle.color;
        
        // 应用透明度
        ctx.globalAlpha = parseFloat(watermarkStyle.opacity);
        
        // 绘制水印文字
        ctx.fillText(this.watermarkText.textContent, watermarkLeft, watermarkTop + parseFloat(watermarkStyle.fontSize) * scaleY);
        
        // 如果有描边效果
        if (watermarkStyle.webkitTextStroke !== 'none') {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1 * scaleX;
            ctx.strokeText(this.watermarkText.textContent, watermarkLeft, watermarkTop + parseFloat(watermarkStyle.fontSize) * scaleY);
        }
        
        // 如果有阴影效果
        if (watermarkStyle.textShadow !== 'none') {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4 * scaleX;
            ctx.shadowOffsetX = 2 * scaleX;
            ctx.shadowOffsetY = 2 * scaleY;
        }
        
        // 将Canvas转换为图片数据
        const watermarkedImageData = canvas.toDataURL(this.core.imageManager.images[this.core.imageManager.currentIndex].type || 'image/png');
        
        // 更新当前图片
        const currentImage = this.core.imageManager.images[this.core.imageManager.currentIndex];
        currentImage.src = watermarkedImageData;
        
        // 更新预览图
        this.core.ui.elements.viewerImage.src = watermarkedImageData;
        
        // 更新缩略图
        const thumbnailImg = this.core.ui.elements.imageList.children[this.core.imageManager.currentIndex].querySelector('img');
        if (thumbnailImg) {
            thumbnailImg.src = watermarkedImageData;
        }
        
        // 退出水印模式
        this.toggleWatermarkMode(false);
    }
}