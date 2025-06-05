// fullscreen.js
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.fullscreenImage'); // 获取所有图片
  images.forEach(img => {
      img.addEventListener('click', () => {
          if (document.fullscreenElement) {
              document.exitFullscreen();
          } else {
              img.requestFullscreen(); // 使当前点击的图片全屏
          }
      });
  });
});