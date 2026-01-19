// 动态加载导航栏
function loadNavbar() {
  fetch('/navbar.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load navbar');
      }
      return response.text();
    })
    .then(html => {
      const navbarContainer = document.getElementById('navbar');
      if (navbarContainer) {
        navbarContainer.innerHTML = html;
        console.log('Navbar loaded successfully');

        // 延迟触发事件绑定，确保 menu.js 已加载
        setTimeout(() => {
          if (typeof bindMenuEvents === 'function') {
            bindMenuEvents();
          }
        }, 50);
      }
    })
    .catch(error => {
      console.error('Error loading navbar:', error);
    });
}

// 页面加载完成后立即加载导航栏
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
  loadNavbar();
}
