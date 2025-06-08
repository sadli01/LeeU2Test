
fetch('navbar.html')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.text();
  })
  .then(html => {
    document.getElementById('navbar').innerHTML = html;
    
    // 这里是动态添加 active 类
    const path = window.location.pathname;

    if (path.includes('blogs') || path.includes('blog')) {
      document.getElementById('nav-blogs')?.classList.add('active');
    } else if (path.includes('films') || path.includes('film')) {
      document.getElementById('nav-films')?.classList.add('active');
    } else if (path.includes('pics') || path.includes('picproj') || path.includes('pic')) {
      document.getElementById('nav-pics')?.classList.add('active');
    } else if (path.includes('contact')) {
      document.getElementById('nav-contact')?.classList.add('active');
    } else if (path.includes('makeup')) {
      document.getElementById('nav-makeup')?.classList.add('active');
    } else {
      document.getElementById('nav-home')?.classList.add('active');
    }

    // 如果你有这个函数也可以保留
    if (typeof bindMenuEvents === 'function') {
      bindMenuEvents();
    }
  })
  .catch(console.error);