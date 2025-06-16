document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const preview = document.getElementById('preview');
    const downloadBtn = document.getElementById('downloadBtn');
    const ctx = preview.getContext('2d');
    const particlesContainer = document.getElementById('particles');
    const loader = document.getElementById('loader');
    const toast = document.getElementById('toast');
    let originalImage = null;
    let watermarkPosition = null;
    let userImageMinSide = 0; // 用户图片较小边尺寸
    let isDraggingWatermark = false;
    
    // 创建粒子背景
    function createParticles() {
        particlesContainer.innerHTML = '';
        const particleCount = 30;
        const colors = ['rgba(0, 120, 215, 0.4)', 'rgba(16, 110, 190, 0.3)', 'rgba(106, 168, 230, 0.2)'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // 随机属性
            const size = Math.random() * 120 + 30; // 30-150px
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const animationDuration = Math.random() * 20 + 15; // 15-35秒
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.top = `${top}%`;
            particle.style.background = color;
            particle.style.animationDuration = `${animationDuration}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // 显示提示信息
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // 预加载水印图片
    const watermarkImg = new Image();
    watermarkImg.src = './material.png';
    let watermarkAspectRatio = 1;

    watermarkImg.onload = function() {
        watermarkAspectRatio = watermarkImg.width / watermarkImg.height;
    };
    
    // 获取控件元素
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const sizeInput = document.getElementById('sizeInput');
    let watermarkSizePercent = 100; // 默认100%

    if (!sizeSlider || !sizeValue || !sizeInput) {
        console.error("滑块或输入框控件元素未找到");
        const errorMsg = document.createElement('p');
        errorMsg.style.color = 'red';
        errorMsg.textContent = '错误：控件未正确加载';
        document.querySelector('.container').appendChild(errorMsg);
    }
    
    // 设置Canvas尺寸
    function setCanvasSize(width, height) {
        preview.width = width;
        preview.height = height;
        preview.style.display = 'block';
        // 计算用户图片较小边
        userImageMinSide = Math.min(width, height);
    }
    
    // 更新滑块值显示（百分比）
    function updateSizeValue() {
        if (!sizeSlider || !sizeValue || !sizeInput) return;
        const value = parseInt(sizeSlider.value);
        sizeInput.value = value;
        watermarkSizePercent = value;
    }
    
    // 初始化滑块和输入框
    if (sizeSlider && sizeValue && sizeInput) {
        sizeSlider.min = 10;
        sizeSlider.max = 200;
        sizeSlider.value = 100;
        sizeInput.min = 10;
        sizeInput.max = 200;
        sizeInput.value = 100;
        updateSizeValue();
    }
    
    // 绘制合成图片
    function drawCompositeImage() {
        if (!originalImage) return;
        
        ctx.clearRect(0, 0, preview.width, preview.height);
        ctx.drawImage(originalImage, 0, 0);
        
        if (watermarkPosition && watermarkImg.complete) {
            // 计算水印较小边尺寸（基于用户图片较小边的百分比）
            const watermarkMinSide = (watermarkSizePercent / 100) * userImageMinSide;
            
            // 计算实际尺寸（保持宽高比）
            let width, height;
            if (watermarkImg.width <= watermarkImg.height) {
                width = watermarkMinSide;
                height = width / watermarkAspectRatio;
            } else {
                height = watermarkMinSide;
                width = height * watermarkAspectRatio;
            }
            
            ctx.drawImage(
                watermarkImg,
                watermarkPosition.x - width/2,
                watermarkPosition.y - height/2,
                width,
                height
            );
        }
    }
    
    // 点击canvas添加水印
    preview.addEventListener('click', (e) => {
        if (!originalImage) return;
        
        const rect = preview.getBoundingClientRect();
        const scaleX = preview.width / rect.width;
        const scaleY = preview.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        watermarkPosition = {x, y};
        drawCompositeImage();
    });
    
    // 水印拖拽功能
    preview.addEventListener('mousedown', (e) => {
        if (!watermarkPosition || !originalImage) return;
        
        const rect = preview.getBoundingClientRect();
        const scaleX = preview.width / rect.width;
        const scaleY = preview.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        // 检查是否点击在水印上
        const watermarkMinSide = (watermarkSizePercent / 100) * userImageMinSide;
        const width = watermarkImg.width <= watermarkImg.height ?
            watermarkMinSide : watermarkMinSide * watermarkAspectRatio;
        const height = watermarkImg.width <= watermarkImg.height ?
            watermarkMinSide / watermarkAspectRatio : watermarkMinSide;
        
        if (x > watermarkPosition.x - width/2 && x < watermarkPosition.x + width/2 &&
            y > watermarkPosition.y - height/2 && y < watermarkPosition.y + height/2) {
            isDraggingWatermark = true;
            preview.style.cursor = 'grabbing';
        }
    });
    
    preview.addEventListener('mousemove', (e) => {
        if (!isDraggingWatermark || !originalImage) return;
        
        const rect = preview.getBoundingClientRect();
        const scaleX = preview.width / rect.width;
        const scaleY = preview.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        watermarkPosition = {x, y};
        drawCompositeImage();
    });
    
    preview.addEventListener('mouseup', () => {
        isDraggingWatermark = false;
        preview.style.cursor = 'default';
    });
    
    preview.addEventListener('mouseleave', () => {
        isDraggingWatermark = false;
        preview.style.cursor = 'default';
    });
    
    // 滑块事件监听
    if (sizeSlider) {
        sizeSlider.addEventListener('input', () => {
            updateSizeValue();
            if (watermarkPosition) {
                drawCompositeImage();
            }
        });
    }

    // 数字输入框事件监听
    if (sizeInput) {
        sizeInput.addEventListener('input', () => {
            let value = parseInt(sizeInput.value);
            
            // 验证输入范围
            if (isNaN(value)) {
                value = 100; // 默认值
            } else if (value < 10) {
                value = 10;
            } else if (value > 200) {
                value = 200;
            }
            
            // 更新滑块
            sizeSlider.value = value;
            watermarkSizePercent = value;
            
            if (watermarkPosition) {
                drawCompositeImage();
            }
        });
    }
    
    // 文件处理
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            showToast('请选择有效的图片文件！');
            return;
        }

        // 显示加载动画
        loader.style.display = 'block';
        showToast('图片加载中...');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.onload = function() {
                setCanvasSize(originalImage.width, originalImage.height);
                watermarkPosition = {
                    x: originalImage.width / 2,
                    y: originalImage.height / 2
                };
                downloadBtn.disabled = false;
                drawCompositeImage();
                
                // 隐藏加载动画
                loader.style.display = 'none';
                showToast('图片加载完成！');
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // 事件监听
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // 增强拖拽交互效果
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
        // 添加悬停缩放效果
        dropZone.style.transform = 'scale(1.02)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
        // 恢复原始大小
        dropZone.style.transform = 'scale(1)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        dropZone.style.transform = 'scale(1)';
        
        // 添加成功反馈动画
        dropZone.animate([
            { backgroundColor: 'rgba(240, 255, 244, 0.8)' },
            { backgroundColor: 'rgba(255, 255, 255, 0.4)' }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // 增强下载按钮交互
    downloadBtn.addEventListener('click', () => {
        // 添加点击反馈动画
        downloadBtn.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.95)' },
            { transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: 'ease-in-out'
        });
        
        setTimeout(() => {
            const link = document.createElement('a');
            link.download = '合成图片.png';
            link.href = preview.toDataURL('image/png');
            link.click();
            showToast('图片下载成功！');
        }, 300);
    });
    
    // 初始化粒子背景
    createParticles();
});