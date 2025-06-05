function bindMenuEvents() {
    const hamburger = document.getElementById("hamburger");
    const closeBtn = document.getElementById("closeBtn");
    const menu = document.getElementById("menu");
    // 检查元素是否存在
    if (!hamburger || !closeBtn || !menu) {
      console.error("元素未找到！");
      return;
    }
    // 添加点击事件
    function closeMenu() {
      menu.classList.remove("open");
      closeBtn.style.display = "none";
      document.body.classList.remove("no-scroll");
    }
    hamburger.addEventListener("click", () => {
      menu.classList.add("open");
      closeBtn.style.display = "block"; // 直接控制
      document.body.classList.add("no-scroll");
    });
    
  
    closeBtn.addEventListener("click", closeMenu);
  
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
    // 确保 DOM 加载后执行
    document.addEventListener("DOMContentLoaded", bindMenuEvents);
  
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
  