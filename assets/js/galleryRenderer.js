(function () {
  const PROJECTS_URL = "/assets/data/projects.json";
  const FILMS_URL = "/assets/data/films.json";
  const BLOGS_URL = "/assets/data/blogs.json";
  const IMAGE_ORIGIN = "https://img.leeu2.com";
  const OPTIMIZED_IMAGE_PATH = "/optimized";
  const CATEGORY_PATHS = {
    makeup: "/makeup/",
    photo: "/photo/",
    portrait: "/portrait/",
    secret: "/secret/",
  };

  function byOrder(field) {
    return function (a, b) {
      return (a[field] ?? 999) - (b[field] ?? 999);
    };
  }

  function escapeText(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function readJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}`);
    }
    return response.json();
  }

  function optimizedImageUrl(src, size) {
    if (!src || !src.startsWith(`${IMAGE_ORIGIN}/`)) return src;
    const relativePath = src.slice(IMAGE_ORIGIN.length);
    return `${IMAGE_ORIGIN}${OPTIMIZED_IMAGE_PATH}/${size}${relativePath.replace(/\.[^./]+$/, ".webp")}`;
  }

  function imageTag(src, alt, usage, isPriority) {
    const small = optimizedImageUrl(src, "small");
    const large = optimizedImageUrl(src, "large");
    const sizes = usage === "cover" ? "(max-width: 640px) 96vw, 70vw" : "(max-width: 640px) 96vw, 1200px";
    const loading = isPriority ? "eager" : "lazy";
    const priority = isPriority ? ' fetchpriority="high"' : "";
    return [
      `<img src="${escapeText(small)}"`,
      ` srcset="${escapeText(small)} 1280w, ${escapeText(large)} 2560w"`,
      ` sizes="${escapeText(sizes)}"`,
      ` data-large-src="${escapeText(large)}"`,
      ` alt="${escapeText(alt)}"`,
      ` loading="${loading}"${priority} decoding="async" class="fullscreenImage"/>`,
    ].join("");
  }

  function frameClass(orientation) {
    return orientation === "landscape" ? "project-frame--landscape" : "project-frame--portrait";
  }

  function renderProjectCard(project, index) {
    const orientation = project.coverOrientation === "landscape" ? "landscape" : "portrait";
    const aspectRatio = project.coverAspectRatio || (orientation === "landscape" ? "3 / 2" : "2 / 3");
    const categoryPath = CATEGORY_PATHS[project.category] || "/home/";
    return [
      `<a class="project-frame project-card ${frameClass(orientation)}" style="--project-frame-ratio: ${escapeText(aspectRatio)};" href="${escapeText(categoryPath)}" data-detail-url="${escapeText(project.page)}">`,
      imageTag(project.cover, project.title, "cover", index === 0),
      "</a>",
    ].join("");
  }

  function renderDetailImage(image, project, index) {
    const orientation = image.orientation === "landscape" ? "landscape" : "portrait";
    const aspectRatio = image.aspectRatio || (orientation === "landscape" ? "3 / 2" : "2 / 3");
    return [
      `<div class="project-frame project-detail-frame ${frameClass(orientation)}" style="--project-frame-ratio: ${escapeText(aspectRatio)};">`,
      imageTag(image.src, image.alt || project.title, "detail", index === 0),
      "</div>",
    ].join("");
  }

  function renderProjectGallery(container, projects) {
    container.innerHTML = `<div class="gallery gallery--frames">${projects.map(renderProjectCard).join("")}</div>`;
  }

  function renderProjectDetail(container, project) {
    if (!project) {
      container.innerHTML = '<div class="gallery"><p>Project data not found.</p></div>';
      return;
    }

    const visibleImages = (project.images || [])
      .filter((image) => image.visible !== false)
      .sort(byOrder("order"));

    container.innerHTML = `<div class="gallery gallery--frames">${visibleImages
      .map((image, index) => renderDetailImage(image, project, index))
      .join("")}</div>`;

    document.title = "";
    const categoryPath = CATEGORY_PATHS[project.category];
    if (categoryPath && window.location.pathname !== categoryPath) {
      window.history.replaceState({ projectId: project.id }, "", categoryPath);
    }
  }

  function findProject(projects, projectId) {
    if (projectId) {
      return projects.find((project) => project.id === projectId);
    }

    const pathname = window.location.pathname;
    return projects.find((project) => project.page === pathname);
  }

  function renderVideoPlaceholder(film) {
    return [
      `<div class="video-placeholder" data-src="${escapeText(film.player)}">`,
      `<img src="${escapeText(optimizedImageUrl(film.cover, "small"))}" alt="${escapeText(film.title)}" loading="lazy" decoding="async">`,
      "</div>",
    ].join("");
  }

  function bindVideoPlayback(root) {
    root.querySelectorAll(".video-placeholder").forEach(function (placeholder) {
      placeholder.addEventListener("click", function () {
        const src = placeholder.getAttribute("data-src");
        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.frameBorder = "0";
        iframe.allowFullscreen = true;
        iframe.width = "80vw";
        iframe.style.maxWidth = "960px";
        iframe.height = "540";
        iframe.style.border = "0";
        iframe.style.borderRadius = "0";
        iframe.style.backgroundColor = "#f5f5f5";
        placeholder.parentNode.replaceChild(iframe, placeholder);
      });
    });
  }

  function renderFilms(container, films, mode) {
    const items = films
      .filter((film) => film.visible !== false)
      .filter((film) => mode !== "featured" || film.featured)
      .sort(byOrder("order"));
    container.innerHTML = `<div class="video-container">${items.map(renderVideoPlaceholder).join("")}</div>`;
    bindVideoPlayback(container);
  }

  function renderBlogs(container, posts) {
    const visiblePosts = posts.filter((post) => post.visible !== false).sort(byOrder("order"));
    container.innerHTML = visiblePosts
      .map(function (post) {
        return [
          `<a href="/blog/" data-detail-url="${escapeText(post.href)}">`,
          `<span style="color:#333;">${escapeText(post.date)}</span> `,
          `<span style="color:#000;">${escapeText(post.title)}</span>`,
          "</a>",
        ].join("");
      })
      .join("");
  }

  function bindDetailNavigation() {
    if (window.__leeu2DetailNavigationBound) return;
    window.__leeu2DetailNavigationBound = true;

    document.addEventListener("click", function (event) {
      const link = event.target.closest("a[data-detail-url]");
      if (!link) return;

      event.preventDefault();
      window.location.assign(link.dataset.detailUrl);
    });
  }

  function bindFullscreenImages() {
    if (window.__leeu2FullscreenBound) return;
    window.__leeu2FullscreenBound = true;

    document.addEventListener("click", function (event) {
      const image = event.target.closest(".fullscreenImage");
      if (!image) return;
      if (image.closest("a")) return;

      event.preventDefault();
      event.stopPropagation();

      const overlay = document.createElement("div");
      overlay.className = "image-overlay";

      const container = document.createElement("div");
      container.className = "image-container";

      const enlarged = document.createElement("img");
      enlarged.src = image.dataset.largeSrc || image.currentSrc || image.src;
      enlarged.alt = image.alt;
      enlarged.decoding = "async";
      enlarged.addEventListener("click", function (innerEvent) {
        innerEvent.stopPropagation();
      });

      const closeBtn = document.createElement("button");
      closeBtn.className = "close-btn";
      closeBtn.innerHTML = "x";

      function close() {
        overlay.remove();
        document.body.style.overflow = "auto";
      }

      closeBtn.addEventListener("click", function (innerEvent) {
        innerEvent.stopPropagation();
        close();
      });
      container.addEventListener("click", close);
      overlay.addEventListener("click", close);

      container.appendChild(enlarged);
      container.appendChild(closeBtn);
      overlay.appendChild(container);
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
    });
  }

  async function initProjectAreas() {
    const galleryAreas = document.querySelectorAll("[data-gallery], [data-project-detail]");
    if (!galleryAreas.length) return;

    const data = await readJson(PROJECTS_URL);
    const projects = data.projects || [];

    galleryAreas.forEach(function (container) {
      const galleryMode = container.dataset.gallery;
      if (galleryMode === "home") {
        renderProjectGallery(
          container,
          projects.filter((project) => project.visible !== false && project.featured).sort(byOrder("homeOrder"))
        );
        return;
      }

      if (galleryMode === "category") {
        const category = container.dataset.category;
        renderProjectGallery(
          container,
          projects
            .filter((project) => project.visible !== false && project.showInCategory !== false && project.category === category)
            .sort(byOrder("categoryOrder"))
        );
        return;
      }

      if ("projectDetail" in container.dataset) {
        renderProjectDetail(container, findProject(projects, container.dataset.projectDetail));
      }
    });
  }

  async function initFilmAreas() {
    const areas = document.querySelectorAll("[data-videos]");
    if (!areas.length) return;

    const data = await readJson(FILMS_URL);
    areas.forEach(function (container) {
      renderFilms(container, data.films || [], container.dataset.videos);
    });
  }

  async function initBlogAreas() {
    const areas = document.querySelectorAll("[data-blog-list]");
    if (!areas.length) return;

    const data = await readJson(BLOGS_URL);
    areas.forEach(function (container) {
      renderBlogs(container, data.posts || []);
    });
  }

  async function init() {
    bindDetailNavigation();
    bindFullscreenImages();
    try {
      await Promise.all([initProjectAreas(), initFilmAreas(), initBlogAreas()]);
    } catch (error) {
      console.error(error);
      document.querySelectorAll("[data-gallery], [data-project-detail], [data-videos], [data-blog-list]").forEach((container) => {
        container.innerHTML = '<div class="gallery"><p>Content data failed to load.</p></div>';
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
