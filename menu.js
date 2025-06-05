function bindMenuEvents() {
    const hamburger = document.getElementById("hamburger");
    const closeBtn = document.getElementById("closeBtn");
    const menu = document.getElementById("menu");
  
    function closeMenu() {
      menu.classList.remove("open");
      closeBtn.classList.remove("show");
      document.body.classList.remove("no-scroll");
    }
  
    hamburger.addEventListener("click", () => {
      menu.classList.add("open");
      closeBtn.classList.add("show");
      document.body.classList.add("no-scroll");
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
  