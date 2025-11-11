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
      document.body.classList.remove("no-scroll");
      // 强制隐藏关闭按钮
      closeBtn.style.display = "none";
      console.log("菜单已关闭，关闭按钮应该隐藏");
    }
    hamburger.addEventListener("click", () => {
      menu.classList.add("open");
      document.body.classList.add("no-scroll");
      // 强制显示关闭按钮
      closeBtn.style.display = "block";
      console.log("菜单已打开，关闭按钮应该显示");
    });
    
    closeBtn.addEventListener("click", closeMenu);
  
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  
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
  document.addEventListener("DOMContentLoaded", bindMenuEvents);
  