document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.fullscreenImage');
    let overlay = null;
  
    function closeEnlarged() {
      if (overlay) {
        overlay.remove();
        overlay = null;
        document.body.style.overflow = 'auto';
      }
    }
  
    images.forEach(img => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        closeEnlarged(); // 先关闭任何已有的
  
        overlay = document.createElement('div');
        overlay.className = 'image-overlay';
  
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';
        imgContainer.addEventListener('click', e => e.stopPropagation()); // 防止点击图片关闭
  
        const imgElement = document.createElement('img');
        imgElement.src = img.src;
        imgElement.alt = img.alt;
  
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', closeEnlarged);
  
        imgContainer.appendChild(imgElement);
        imgContainer.appendChild(closeBtn);
        overlay.appendChild(imgContainer);
        document.body.appendChild(overlay);
  
        document.body.style.overflow = 'hidden';
  
        overlay.addEventListener('click', () => {
          closeEnlarged();
        });
      });
    });
  });
  