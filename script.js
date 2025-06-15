document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const preview = document.getElementById('preview');
    const downloadBtn = document.getElementById('downloadBtn');
    const ctx = preview.getContext('2d');
    let originalImage = null;

    // 设置Canvas尺寸
    function setCanvasSize(width, height) {
        preview.width = width;
        preview.height = height;
        preview.style.display = 'block';
    }

    // 处理文件选择
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
                drawCompositeImage();
                downloadBtn.disabled = false;
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 绘制合成图片（原始图片 + 水印）
    function drawCompositeImage() {
        ctx.clearRect(0, 0, preview.width, preview.height);
        ctx.drawImage(originalImage, 0, 0);
        
        const watermark = new Image();
        watermark.onload = function() {
            // 计算缩放比例（水印宽度=原图宽度50%）
            const scale = originalImage.width * 0.5 / watermark.width;
            const scaledWidth = watermark.width * scale;
            const scaledHeight = watermark.height * scale;
            
            // 居中位置
            const x = (preview.width - scaledWidth) / 2;
            const y = (preview.height - scaledHeight) / 2;
            
            // 绘制缩放后的水印
            ctx.drawImage(
                watermark,
                x, y,
                scaledWidth,
                scaledHeight
            );
        };
        watermark.src = 'mdl.png';
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