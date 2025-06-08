document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.fullscreenImage');
    const pageContent = document.getElementById('page-content');
  
    images.forEach(img => {
      img.addEventListener('click', () => {
        // 创建放大图片层
        const enlargedImg = document.createElement('img');
        enlargedImg.src = img.src;
        enlargedImg.className = 'image-overlay';
  
        // 添加到页面
        document.body.appendChild(enlargedImg);
  
        // 背景变灰
        pageContent.classList.add('dimmed');
  
        // 点击图片关闭放大
        enlargedImg.addEventListener('click', () => {
          enlargedImg.remove();
          pageContent.classList.remove('dimmed');
        });
      });
    });
  });
  