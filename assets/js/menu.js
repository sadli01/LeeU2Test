function applyColorMode(mode) {
    const isDark = mode === "dark";
    const themeToggle = document.getElementById("themeToggle");
    document.body.classList.toggle("dark-mode", isDark);

    if (themeToggle) {
      themeToggle.querySelector("span").textContent = isDark ? "☾" : "☀";
      themeToggle.setAttribute("aria-label", isDark ? "Switch to day mode" : "Switch to night mode");
      themeToggle.setAttribute("title", isDark ? "Day mode" : "Night mode");
    }
}

function bindThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle || themeToggle.dataset.bound === "true") return;

    themeToggle.dataset.bound = "true";
    applyColorMode(localStorage.getItem("leeu2-color-mode") === "dark" ? "dark" : "light");
    themeToggle.addEventListener("click", () => {
      const nextMode = document.body.classList.contains("dark-mode") ? "light" : "dark";
      localStorage.setItem("leeu2-color-mode", nextMode);
      applyColorMode(nextMode);
    });
}

function bindMenuEvents() {
    bindThemeToggle();
    if (window.__leeu2MenuBound) return;
    const hamburger = document.getElementById("hamburger");
    const closeBtn = document.getElementById("closeBtn");
    const menu = document.getElementById("menu");
    const navbar = menu?.closest(".navbar");
    const logo = navbar?.querySelector(".logo");
    // 检查元素是否存在
    if (!hamburger || !closeBtn || !menu) {
      console.error("元素未找到！");
      return;
    }
    window.__leeu2MenuBound = true;
    function updateNavCollapse() {
      if (!navbar || !logo || !menu) return;

      navbar.classList.remove("nav-collapsed");
      const menuRect = menu.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const isOverlapping = menuRect.right + 16 > logoRect.left;

      if (isOverlapping) {
        navbar.classList.add("nav-collapsed");
      } else {
        navbar.classList.remove("nav-collapsed");
        closeMenu();
      }
    }

    // 添加点击事件
    function closeMenu() {
      menu.classList.remove("open");
      document.body.classList.remove("no-scroll");
      // 强制隐藏关闭按钮
      closeBtn.style.display = "none";
    }
    hamburger.addEventListener("click", () => {
      menu.classList.add("open");
      document.body.classList.add("no-scroll");
      // 强制显示关闭按钮
      closeBtn.style.display = "block";
    });
    
    closeBtn.addEventListener("click", closeMenu);
  
    window.addEventListener("resize", () => {
      updateNavCollapse();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateNavCollapse);
    }
    updateNavCollapse();
  
    // 自动设置当前菜单项为 active
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const menuLinks = document.querySelectorAll("#menu a");
  
    menuLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (href === currentPage) {
        link.classList.add("active");
      }
    });
  }
  
  // 确保 DOM 加载后执行
  // 注意：如果使用 loadNavbar.js，事件将由它触发
  // 否则在 DOMContentLoaded 时自动执行
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", bindMenuEvents);
  } else if (document.getElementById('menu')) {
    // 如果 menu 已经存在，直接绑定
    bindMenuEvents();
  }
  
