function applySavedColorMode() {
  const savedTheme = localStorage.getItem("leeu2-color-mode");
  document.body.classList.toggle("dark-mode", savedTheme === "dark");
}

function setActiveNavLink() {
  const path = window.location.pathname;
  const navMap = [
    { match: ["blog"], id: "nav-blogs" },
    { match: ["video", "films", "film"], id: "nav-films" },
    { match: ["secret", "secretproj"], id: "nav-secrets" },
    { match: ["portrait", "portraitproj"], id: "nav-portrait" },
    { match: ["photo", "photoproj"], id: "nav-photo" },
    { match: ["contact"], id: "nav-contact" },
    { match: ["makeup", "makeupproj"], id: "nav-makeup" },
    { match: ["home"], id: "nav-home" },
  ];

  const active = navMap.find((item) => item.match.some((segment) => path.includes(segment)));
  const activeId = active ? active.id : "nav-home";

  document.querySelectorAll("#menu a").forEach((link) => link.classList.remove("active"));
  document.getElementById(activeId)?.classList.add("active");
}

applySavedColorMode();

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
        setActiveNavLink();

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
