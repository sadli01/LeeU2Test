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
          closeEnlarged();

          overlay = document.createElement('div');
          overlay.className = 'image-overlay';

          const imgContainer = document.createElement('div');
          imgContainer.className = 'image-container';

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

          overlay.addEventListener('click', (e) => {
              if (e.target === overlay) {
                  closeEnlarged();
              }
          });
      });
  });
});
