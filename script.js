document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const preview = document.getElementById('preview');
    const downloadBtn = document.getElementById('downloadBtn');
    const ctx = preview.getContext('2d');
    let originalImage = null;
    let watermarkPosition = null;
    let userImageMinSide = 0; // 用户图片较小边尺寸
    
    // 预加载水印图片
    const watermarkImg = new Image();
    watermarkImg.src = './material.png';
    let watermarkAspectRatio = 1;

    watermarkImg.onload = function() {
        watermarkAspectRatio = watermarkImg.width / watermarkImg.height;
        watermarkMinDimension = Math.min(watermarkImg.width, watermarkImg.height);
    };
    
    // 获取控件元素
    const sizeSlider = document.getElementById('sizeSlider') || document.querySelector('.size-control input[type="range"]');
    const sizeValue = document.getElementById('sizeValue') || document.querySelector('.size-control span');
    let watermarkSizePercent = 50; // 默认50%

    if (!sizeSlider || !sizeValue) {
        console.error("滑块控件元素未找到");
        const errorMsg = document.createElement('p');
        errorMsg.style.color = 'red';
        errorMsg.textContent = '错误：滑块控件未正确加载';
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
        if (!sizeSlider || !sizeValue) return;
        sizeValue.textContent = `${sizeSlider.value}%`;
        watermarkSizePercent = parseInt(sizeSlider.value);
    }
    
    // 初始化滑块
    if (sizeSlider && sizeValue) {
        sizeSlider.min = 10;
        sizeSlider.max = 200;
        sizeSlider.value = 50;
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
    
    // 滑块事件监听
    if (sizeSlider) {
        sizeSlider.addEventListener('input', () => {
            updateSizeValue();
            if (watermarkPosition) {
                drawCompositeImage();
            }
        });
    }
    
    // 文件处理
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('请选择图片文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.onload = function() {
                setCanvasSize(originalImage.width, originalImage.height);
                watermarkPosition = null;
                downloadBtn.disabled = false;
                drawCompositeImage(); // 初始化绘制
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

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = '合成图片.png';
        link.href = preview.toDataURL('image/png');
        link.click();
    });
});