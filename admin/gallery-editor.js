(function () {
  const PROJECT_SECTIONS = new Set(["makeup", "photo", "portrait", "secret"]);

  const state = {
    projectsData: null,
    filmsData: null,
    blogsData: null,
    section: "home",
    selectedId: null,
    showHidden: false,
    dragIndex: null,
    itemDragId: null,
    syncTimer: null,
    mediaCache: {},
  };

  const els = {
    itemList: document.getElementById("itemList"),
    projectWorkspace: document.getElementById("projectWorkspace"),
    filmWorkspace: document.getElementById("filmWorkspace"),
    blogWorkspace: document.getElementById("blogWorkspace"),
    sectionLabel: document.getElementById("sectionLabel"),
    itemTitle: document.getElementById("itemTitle"),
    titleInput: document.getElementById("titleInput"),
    idInput: document.getElementById("idInput"),
    visibleInput: document.getElementById("visibleInput"),
    categoryInput: document.getElementById("categoryInput"),
    featuredInput: document.getElementById("featuredInput"),
    imageGrid: document.getElementById("imageGrid"),
    preview: document.getElementById("preview"),
    jsonOutput: document.getElementById("jsonOutput"),
    showHidden: document.getElementById("showHidden"),
    saveLocalJson: document.getElementById("saveLocalJson"),
    downloadJson: document.getElementById("downloadJson"),
    copyJson: document.getElementById("copyJson"),
    filmTitleInput: document.getElementById("filmTitleInput"),
    filmIdInput: document.getElementById("filmIdInput"),
    filmCoverInput: document.getElementById("filmCoverInput"),
    filmPlayerInput: document.getElementById("filmPlayerInput"),
    filmOrderInput: document.getElementById("filmOrderInput"),
    filmFeaturedInput: document.getElementById("filmFeaturedInput"),
    blogTitleInput: document.getElementById("blogTitleInput"),
    blogIdInput: document.getElementById("blogIdInput"),
    blogDateInput: document.getElementById("blogDateInput"),
    blogHrefInput: document.getElementById("blogHrefInput"),
    blogOrderInput: document.getElementById("blogOrderInput"),
    blogVisibleInput: document.getElementById("blogVisibleInput"),
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

  function thumbUrl(src, size = 160) {
    return `/admin/thumb?size=${size}&src=${encodeURIComponent(src)}`;
  }

  function imageAttrs(src, alt, size = 160) {
    return `src="${escapeText(thumbUrl(src, size))}" alt="${escapeText(alt)}" loading="lazy" decoding="async"`;
  }

  async function readJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return response.json();
  }

  async function readProjectMedia(project) {
    if (!project || !project.mediaDir) return [];

    const cached = state.mediaCache[project.mediaDir];
    if (cached?.images) return cached.images;
    if (cached?.promise) return cached.promise;

    const promise = fetch(`/admin/list-images?dir=${encodeURIComponent(project.mediaDir)}`)
      .then((response) => {
        if (!response.ok) throw new Error("图片目录读取失败");
        return response.json();
      })
      .then((data) => {
        const images = data.images || [];
        state.mediaCache[project.mediaDir] = { images };
        return images;
      })
      .catch((error) => {
        state.mediaCache[project.mediaDir] = { images: null, error };
        throw error;
      });

    state.mediaCache[project.mediaDir] = { promise };
    return promise;
  }

  function mergeProjectMedia(project, files) {
    if (!project || !Array.isArray(files)) return;

    const fileBySrc = new Map(files.map((image) => [image.src, image]));
    const used = new Set();
    const orderedExisting = (project.images || [])
      .slice()
      .sort(byOrder("order"))
      .filter((image) => fileBySrc.has(image.src))
      .map((image) => {
        const file = fileBySrc.get(image.src);
        used.add(image.src);
        return {
          ...file,
          alt: image.alt || file.alt,
          visible: image.visible !== false,
          order: image.order ?? 999,
        };
      });

    const newImages = files
      .filter((image) => !used.has(image.src))
      .map((image) => ({
        ...image,
        visible: true,
        order: 999,
      }));

    project.images = [...orderedExisting, ...newImages];
    normalizeImageOrder(project);

    const coverFile = fileBySrc.get(project.cover);
    if (coverFile) {
      project.coverOrientation = coverFile.orientation;
      project.coverAspectRatio = coverFile.aspectRatio;
      return;
    }

    if (project.images[0]) {
      project.cover = project.images[0].src;
      project.coverOrientation = project.images[0].orientation;
      project.coverAspectRatio = project.images[0].aspectRatio;
    }
  }

  function syncProjectMedia(project) {
    return readProjectMedia(project).then((files) => {
      mergeProjectMedia(project, files);
      return project.images || [];
    });
  }

  function isProjectSection() {
    return PROJECT_SECTIONS.has(state.section);
  }

  function isHomeSection() {
    return state.section === "home";
  }

  function activeData() {
    if (isHomeSection()) {
      return {
        projects: state.projectsData,
        films: state.filmsData,
      };
    }
    if (isProjectSection()) return state.projectsData;
    if (state.section === "films") return state.filmsData;
    return state.blogsData;
  }

  function activeFilename() {
    if (isHomeSection()) return "home.json";
    if (isProjectSection()) return "projects.json";
    if (state.section === "films") return "films.json";
    return "blogs.json";
  }

  function activeItems() {
    if (isHomeSection()) {
      return [
        ...state.projectsData.projects.slice().sort(byOrder("homeOrder")),
        ...state.filmsData.films.slice().sort(byOrder("order")),
      ];
    }

    if (isProjectSection()) {
      return state.projectsData.projects
        .filter((item) => item.category === state.section)
        .sort(byOrder("categoryOrder"));
    }

    if (state.section === "films") {
      return state.filmsData.films.slice().sort(byOrder("order"));
    }

    return state.blogsData.posts.slice().sort(byOrder("order"));
  }

  function selectedProject() {
    return state.projectsData.projects.find((item) => item.id === state.selectedId);
  }

  function selectedFilm() {
    return state.filmsData.films.find((item) => item.id === state.selectedId);
  }

  function selectedBlog() {
    return state.blogsData.posts.find((item) => item.id === state.selectedId);
  }

  function selectedItem() {
    if (isHomeSection()) {
      return state.projectsData.projects.find((item) => item.id === state.selectedId)
        || state.filmsData.films.find((item) => item.id === state.selectedId);
    }
    if (isProjectSection()) return selectedProject();
    if (state.section === "films") return selectedFilm();
    return selectedBlog();
  }

  function updateJsonOutput() {
    els.jsonOutput.value = JSON.stringify(activeData(), null, 2);
    els.downloadJson.textContent = `导出 ${activeFilename()}`;
  }

  function syncPreviewAndJsonSoon() {
    window.clearTimeout(state.syncTimer);
    state.syncTimer = window.setTimeout(() => {
      renderPreview();
      updateJsonOutput();
    }, 80);
  }

  function syncPreviewAndJsonNow() {
    window.clearTimeout(state.syncTimer);
    renderPreview();
    updateJsonOutput();
  }

  function normalizeImageOrder(currentProject) {
    currentProject.images.forEach((image, index) => {
      image.order = index;
    });
  }

  function orderedImages(currentProject) {
    return currentProject.images.slice().sort(byOrder("order"));
  }

  function findImageBySrc(currentProject, src) {
    return currentProject.images.find((image) => image.src === src);
  }

  function updateCoverFromImage(currentProject, image, previewImage) {
    if (previewImage && previewImage.naturalWidth && previewImage.naturalHeight) {
      image.orientation = previewImage.naturalWidth >= previewImage.naturalHeight ? "landscape" : "portrait";
      image.aspectRatio = image.orientation === "landscape" ? "3 / 2" : "2 / 3";
    }

    currentProject.cover = image.src;
    const orientation = image.orientation === "landscape" ? "landscape" : "portrait";
    currentProject.coverOrientation = orientation;
    currentProject.coverAspectRatio = image.aspectRatio || (orientation === "landscape" ? "3 / 2" : "2 / 3");
  }

  function moveImage(currentProject, src, direction) {
    const image = findImageBySrc(currentProject, src);
    if (!image) return;

    const ordered = orderedImages(currentProject);
    const currentIndex = ordered.findIndex((item) => item.src === image.src);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;

    ordered.splice(currentIndex, 1);
    ordered.splice(nextIndex, 0, image);
    currentProject.images = ordered;
    normalizeImageOrder(currentProject);
    return true;
  }

  function isFilmItem(item) {
    return !!item && "player" in item;
  }

  function isProjectItem(item) {
    return !!item && "category" in item && "images" in item;
  }

  function itemOrderField(item) {
    if (isHomeSection() && isProjectItem(item)) return "homeOrder";
    if (isProjectSection()) return "categoryOrder";
    return "order";
  }

  function orderField() {
    if (isProjectSection()) return "categoryOrder";
    return "order";
  }

  function normalizeItemOrder(items) {
    items.forEach((item, index) => {
      item[itemOrderField(item)] = index;
    });
  }

  function sameOrderGroup(item) {
    if (!isHomeSection()) return activeItems();
    if (isProjectItem(item)) return state.projectsData.projects.slice().sort(byOrder("homeOrder"));
    if (isFilmItem(item)) return state.filmsData.films.slice().sort(byOrder("order"));
    return activeItems();
  }

  function moveActiveItem(id, direction) {
    const currentItem = selectedItemById(id);
    const items = sameOrderGroup(currentItem);
    const currentIndex = items.findIndex((item) => item.id === id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) return false;

    const [item] = items.splice(currentIndex, 1);
    items.splice(nextIndex, 0, item);
    normalizeItemOrder(items);
    return true;
  }

  function moveActiveItemTo(id, targetId) {
    const currentItem = selectedItemById(id);
    const targetItem = selectedItemById(targetId);
    if (isHomeSection() && ((isProjectItem(currentItem) && !isProjectItem(targetItem)) || (isFilmItem(currentItem) && !isFilmItem(targetItem)))) {
      return false;
    }

    const items = sameOrderGroup(currentItem);
    const from = items.findIndex((item) => item.id === id);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0 || from === to) return false;

    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    normalizeItemOrder(items);
    return true;
  }

  function selectedItemById(id) {
    if (isHomeSection()) {
      return state.projectsData.projects.find((item) => item.id === id)
        || state.filmsData.films.find((item) => item.id === id);
    }
    return activeItems().find((item) => item.id === id);
  }

  function setItemVisibility(item, visible) {
    if (!item) return;
    if (isHomeSection()) {
      item.featured = visible;
      if (item.homeOrder === undefined && isProjectItem(item)) item.homeOrder = 999;
      if (item.order === undefined && isFilmItem(item)) item.order = 999;
      return;
    }
    item.visible = visible;
  }

  function itemIsVisibleInCurrentSection(item) {
    if (isHomeSection()) return !!item.featured;
    return item.visible !== false;
  }

  function itemThumb(item) {
    if (isHomeSection()) return item.cover;
    if (isProjectSection()) return item.cover;
    if (state.section === "films") return item.cover;
    return "";
  }

  function itemSubline(item) {
    if (isHomeSection()) {
      const type = isFilmItem(item) ? "Video" : item.category || "Project";
      return `${type} · ${item.featured ? "Home" : "hidden"}`;
    }
    if (isProjectSection()) return item.id;
    if (state.section === "films") {
      if (item.visible === false) return "hidden";
      return item.featured ? "Home + Video" : "Video only";
    }
    return `${item.date || "no date"} · ${item.visible === false ? "hidden" : "visible"}`;
  }

  function updateItemCardState(item) {
    const card = els.itemList.querySelector(`[data-item-id="${CSS.escape(item.id)}"]`);
    if (!card) return;

    const title = card.querySelector("[data-item-title]");
    if (title) title.textContent = item.title;

    const subline = card.querySelector("[data-item-subline]");
    if (subline) subline.textContent = itemSubline(item);

    const visibility = card.querySelector("[data-item-visible-id]");
    if (visibility) {
      const visible = itemIsVisibleInCurrentSection(item);
      visibility.textContent = visible ? "显" : "隐";
      visibility.title = visible ? "隐藏该页面" : "显示该页面";
    }

    const thumb = card.querySelector("img");
    if (thumb && item.cover && thumb.getAttribute("src") !== item.cover) {
      thumb.src = thumbUrl(item.cover, 80);
    }
  }

  function updateImageCoverState(currentProject) {
    els.imageGrid.querySelectorAll(".editor-image-item").forEach((card) => {
      card.classList.toggle("is-cover", card.dataset.imageSrc === currentProject.cover);
    });
  }

  function updateImageVisibilityState(src, visible) {
    const card = els.imageGrid.querySelector(`[data-image-src="${CSS.escape(src)}"]`);
    if (card) card.classList.toggle("is-hidden", !visible);
  }

  function renderItemList() {
    const items = activeItems();
    els.itemList.innerHTML = items
      .map(function (item) {
        const thumb = itemThumb(item);
        return [
          `<div class="editor-project-button ${item.id === state.selectedId ? "is-active" : ""}" role="button" tabindex="0" data-item-id="${escapeText(item.id)}">`,
          thumb ? `<img ${imageAttrs(thumb, item.title, 80)}>` : '<span class="editor-list-placeholder"></span>',
          '<span class="editor-project-meta">',
          `<strong data-item-title>${escapeText(item.title)}</strong>`,
          `<span data-item-subline>${escapeText(itemSubline(item))}</span>`,
          "</span>",
          '<span class="editor-project-order" aria-label="排序">',
          `<span class="editor-icon-button" role="button" tabindex="0" title="${itemIsVisibleInCurrentSection(item) ? "隐藏该页面" : "显示该页面"}" data-item-visible-id="${escapeText(item.id)}">${itemIsVisibleInCurrentSection(item) ? "显" : "隐"}</span>`,
          `<span class="editor-icon-button" role="button" tabindex="0" title="前移一位" data-item-move-id="${escapeText(item.id)}" data-item-move-direction="-1">↑</span>`,
          `<span class="editor-icon-button" role="button" tabindex="0" title="后移一位" data-item-move-id="${escapeText(item.id)}" data-item-move-direction="1">↓</span>`,
          `<span class="editor-icon-button editor-item-drag-handle" role="button" tabindex="0" draggable="true" title="拖拽排序" data-item-drag-id="${escapeText(item.id)}">↕</span>`,
          "</span>",
          "</div>",
        ].join("");
      })
      .join("");

    els.itemList.querySelectorAll("[data-item-id]").forEach((button) => {
      button.addEventListener("click", function () {
        state.selectedId = button.dataset.itemId;
        renderFast();
      });
      button.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        state.selectedId = button.dataset.itemId;
        renderFast();
      });
    });

    els.itemList.querySelectorAll("[data-item-move-id]").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        const id = button.dataset.itemMoveId;
        if (!moveActiveItem(id, Number(button.dataset.itemMoveDirection))) return;
        state.selectedId = id;
        renderItemList();
        syncPreviewAndJsonSoon();
      });
      button.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        button.click();
      });
    });

    els.itemList.querySelectorAll("[data-item-visible-id]").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        const item = selectedItemById(button.dataset.itemVisibleId);
        if (!item) return;
        setItemVisibility(item, !itemIsVisibleInCurrentSection(item));
        updateItemCardState(item);
        renderProjectForm(isHomeSection() ? null : selectedProject());
        renderFilmForm(isHomeSection() ? null : selectedFilm());
        renderBlogForm(isHomeSection() ? null : selectedBlog());
        renderHomeSelection(isHomeSection() ? selectedItem() : null);
        syncPreviewAndJsonSoon();
      });
      button.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        button.click();
      });
    });

    els.itemList.querySelectorAll(".editor-item-drag-handle").forEach((handle) => {
      handle.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
      handle.addEventListener("dragstart", function (event) {
        event.stopPropagation();
        state.itemDragId = handle.dataset.itemDragId;
      });
    });

    els.itemList.querySelectorAll("[data-item-id]").forEach((itemCard) => {
      itemCard.addEventListener("dragover", function (event) {
        event.preventDefault();
      });
      itemCard.addEventListener("drop", function (event) {
        event.preventDefault();
        event.stopPropagation();
        const targetId = itemCard.dataset.itemId;
        if (!state.itemDragId || state.itemDragId === targetId) return;
        if (!moveActiveItemTo(state.itemDragId, targetId)) return;
        state.selectedId = state.itemDragId;
        state.itemDragId = null;
        renderItemList();
        syncPreviewAndJsonSoon();
      });
    });
  }

  function renderWorkspaceVisibility() {
    els.projectWorkspace.hidden = !isProjectSection() || !selectedProject();
    els.filmWorkspace.hidden = state.section !== "films" || !selectedFilm();
    els.blogWorkspace.hidden = state.section !== "blogs" || !selectedBlog();
  }

  function renderProjectForm(currentProject) {
    if (!currentProject) return;

    els.itemTitle.textContent = currentProject.title;
    els.titleInput.value = currentProject.title;
    els.idInput.value = currentProject.id;
    els.visibleInput.checked = currentProject.visible !== false;
    els.categoryInput.checked = currentProject.showInCategory !== false;
    els.featuredInput.checked = !!currentProject.featured;
  }

  function renderFilmForm(film) {
    if (!film) return;

    els.itemTitle.textContent = film.title;
    els.filmTitleInput.value = film.title;
    els.filmIdInput.value = film.id;
    els.filmCoverInput.value = film.cover;
    els.filmPlayerInput.value = film.player;
    els.filmOrderInput.value = film.order ?? 999;
    els.filmFeaturedInput.checked = !!film.featured;
  }

  function renderBlogForm(post) {
    if (!post) return;

    els.itemTitle.textContent = post.title;
    els.blogTitleInput.value = post.title;
    els.blogIdInput.value = post.id;
    els.blogDateInput.value = post.date || "";
    els.blogHrefInput.value = post.href || "";
    els.blogOrderInput.value = post.order ?? 999;
    els.blogVisibleInput.checked = post.visible !== false;
  }

  function renderHomeSelection(item) {
    if (!item) return;
    els.itemTitle.textContent = item.title;
  }

  function renderImages(currentProject) {
    if (!currentProject) {
      els.imageGrid.innerHTML = "";
      return;
    }

    const cachedMedia = state.mediaCache[currentProject.mediaDir];
    if (!cachedMedia?.images) {
      els.imageGrid.innerHTML = '<div class="editor-loading">读取图片文件...</div>';
      syncProjectMedia(currentProject)
        .then(() => {
          if (selectedProject()?.id !== currentProject.id) return;
          updateItemCardState(currentProject);
          renderImages(currentProject);
          syncPreviewAndJsonSoon();
        })
        .catch((error) => {
          els.imageGrid.innerHTML = `<div class="editor-loading">${escapeText(error.message)}</div>`;
        });
      return;
    }

    mergeProjectMedia(currentProject, cachedMedia.images);

    const images = orderedImages(currentProject)
      .filter((image) => state.showHidden || image.visible !== false);

    els.imageGrid.innerHTML = images
      .map(function (image) {
        return [
          `<div class="editor-image-item ${image.src === currentProject.cover ? "is-cover" : ""} ${image.visible === false ? "is-hidden" : ""}" data-image-src="${escapeText(image.src)}">`,
          `<img ${imageAttrs(image.src, image.alt, 180)}>` ,
          `<div class="editor-image-name">${escapeText(image.src.split("/").pop())}</div>`,
          '<div class="editor-image-row">',
          `<label><input type="checkbox" data-visible-src="${escapeText(image.src)}" ${image.visible !== false ? "checked" : ""}> 显示</label>`,
          `<button class="editor-image-action" data-cover-src="${escapeText(image.src)}" type="button">设为封面</button>`,
          "</div>",
          '<div class="editor-image-row editor-image-row--compact">',
          `<button class="editor-icon-button editor-image-icon" data-move-src="${escapeText(image.src)}" data-move-direction="-1" type="button" title="前移一位" aria-label="前移一位">↑</button>`,
          `<button class="editor-icon-button editor-image-icon" data-move-src="${escapeText(image.src)}" data-move-direction="1" type="button" title="后移一位" aria-label="后移一位">↓</button>`,
          `<button class="editor-icon-button editor-image-icon editor-drag-handle" draggable="true" type="button" title="拖拽排序" aria-label="拖拽排序">↕</button>`,
          "</div>",
          "</div>",
        ].join("");
      })
      .join("");

    els.imageGrid.querySelectorAll("[data-visible-src]").forEach((input) => {
      input.addEventListener("change", function () {
        const image = findImageBySrc(currentProject, input.dataset.visibleSrc);
        if (!image) return;
        image.visible = input.checked;
        updateImageVisibilityState(image.src, image.visible !== false);
        syncPreviewAndJsonSoon();
      });
    });

    els.imageGrid.querySelectorAll("[data-cover-src]").forEach((button) => {
      button.addEventListener("click", function () {
        const image = findImageBySrc(currentProject, button.dataset.coverSrc);
        if (!image) return;
        updateCoverFromImage(
          currentProject,
          image,
          button.closest(".editor-image-item")?.querySelector("img")
        );
        updateImageCoverState(currentProject);
        updateItemCardState(currentProject);
        syncPreviewAndJsonSoon();
      });
    });

    els.imageGrid.querySelectorAll("[data-move-src]").forEach((button) => {
      button.addEventListener("click", function () {
        const direction = Number(button.dataset.moveDirection);
        if (!moveImage(currentProject, button.dataset.moveSrc, direction)) return;

        const card = button.closest(".editor-image-item");
        if (card) {
          const sibling = direction < 0 ? card.previousElementSibling : card.nextElementSibling;
          if (sibling) {
            if (direction < 0) {
              els.imageGrid.insertBefore(card, sibling);
            } else {
              els.imageGrid.insertBefore(sibling, card);
            }
          }
        }
        syncPreviewAndJsonSoon();
      });
    });

    els.imageGrid.querySelectorAll(".editor-drag-handle").forEach((handle) => {
      handle.addEventListener("dragstart", function () {
        state.dragIndex = handle.closest(".editor-image-item")?.dataset.imageSrc || null;
      });
    });

    els.imageGrid.querySelectorAll(".editor-image-item").forEach((item) => {
      item.addEventListener("dragover", function (event) {
        event.preventDefault();
      });
      item.addEventListener("drop", function () {
        const dropSrc = item.dataset.imageSrc;
        if (state.dragIndex === null || state.dragIndex === dropSrc) return;

        const ordered = currentProject.images.slice().sort(byOrder("order"));
        const dragged = findImageBySrc(currentProject, state.dragIndex);
        const target = findImageBySrc(currentProject, dropSrc);
        if (!dragged || !target) return;
        const from = ordered.findIndex((image) => image.src === dragged.src);
        const to = ordered.findIndex((image) => image.src === target.src);

        ordered.splice(from, 1);
        ordered.splice(to, 0, dragged);
        currentProject.images = ordered;
        normalizeImageOrder(currentProject);

        const draggedCard = els.imageGrid.querySelector(`[data-image-src="${CSS.escape(dragged.src)}"]`);
        if (draggedCard && draggedCard !== item) {
          if (from < to) {
            item.after(draggedCard);
          } else {
            item.before(draggedCard);
          }
        }
        state.dragIndex = null;
        syncPreviewAndJsonSoon();
      });
    });
  }

  function renderPreview() {
    const item = selectedItem();
    if (!item) {
      els.preview.innerHTML = "";
      return;
    }

    if (isProjectSection()) {
      const images = item.images
        .filter((image) => image.visible !== false)
        .sort(byOrder("order"))
        .slice(0, 3);
      els.preview.innerHTML = [
        `<div class="editor-preview-title">${escapeText(item.title)}</div>`,
        `<img ${imageAttrs(item.cover, item.title, 220)}>`,
        ...images.map((image) => `<img ${imageAttrs(image.src, image.alt, 220)}>`),
      ].join("");
      return;
    }

    if (isHomeSection()) {
      if (isProjectItem(item)) {
        els.preview.innerHTML = [
          `<div class="editor-preview-title">${escapeText(item.title)}</div>`,
          `<p>${escapeText(item.category || "Project")} · ${item.featured ? "Home cover" : "hidden"}</p>`,
          `<img ${imageAttrs(item.cover, item.title, 220)}>`,
        ].join("");
        return;
      }

      els.preview.innerHTML = [
        `<div class="editor-preview-title">${escapeText(item.title)}</div>`,
        `<p>Video · ${item.featured ? "Home cover" : "hidden"}</p>`,
        `<img ${imageAttrs(item.cover, item.title, 220)}>`,
      ].join("");
      return;
    }

    if (state.section === "films") {
      els.preview.innerHTML = [
        `<div class="editor-preview-title">${escapeText(item.title)}</div>`,
        `<img ${imageAttrs(item.cover, item.title, 220)}>`,
        `<p>${escapeText(item.player)}</p>`,
      ].join("");
      return;
    }

    els.preview.innerHTML = [
      `<div class="editor-preview-title">${escapeText(item.title)}</div>`,
      `<p>${escapeText(item.date || "")}</p>`,
      `<p>${escapeText(item.href || "")}</p>`,
    ].join("");
  }

  function renderLabels() {
    const labels = {
      makeup: "Makeup&Hair 作品管理",
      home: "Home 首页封面管理",
      photo: "Photo 作品管理",
      portrait: "Portrait 作品管理",
      secret: "Secret 作品管理",
      films: "Video 视频管理",
      blogs: "Blog 文章管理",
    };
    els.sectionLabel.textContent = labels[state.section] || "内容管理";
  }

  function render() {
    renderLabels();
    renderItemList();
    renderWorkspaceVisibility();
    renderProjectForm(isHomeSection() ? null : selectedProject());
    renderFilmForm(isHomeSection() ? null : selectedFilm());
    renderBlogForm(isHomeSection() ? null : selectedBlog());
    renderHomeSelection(isHomeSection() ? selectedItem() : null);
    renderImages(isHomeSection() ? null : selectedProject());
    renderPreview();
    updateJsonOutput();
  }

  function renderFast() {
    renderLabels();
    renderItemList();
    renderWorkspaceVisibility();
    renderProjectForm(isHomeSection() ? null : selectedProject());
    renderFilmForm(isHomeSection() ? null : selectedFilm());
    renderBlogForm(isHomeSection() ? null : selectedBlog());
    renderHomeSelection(isHomeSection() ? selectedItem() : null);
    renderImages(isHomeSection() ? null : selectedProject());
    syncPreviewAndJsonSoon();
  }

  function selectFirstItem() {
    const first = activeItems()[0];
    state.selectedId = first ? first.id : null;
  }

  function bindSectionTabs() {
    document.querySelectorAll("[data-section-tab]").forEach((button) => {
      button.addEventListener("click", function () {
        state.section = button.dataset.sectionTab;
        state.showHidden = false;
        els.showHidden.textContent = "显示隐藏图片";
        document.querySelectorAll("[data-section-tab]").forEach((tab) => tab.classList.remove("is-active"));
        button.classList.add("is-active");
        selectFirstItem();
        renderFast();
      });
    });
  }

  function bindProjectControls() {
    els.titleInput.addEventListener("input", function () {
      const project = selectedProject();
      project.title = els.titleInput.value;
      els.itemTitle.textContent = project.title;
      updateItemCardState(project);
      syncPreviewAndJsonSoon();
    });

    els.visibleInput.addEventListener("change", function () {
      const project = selectedProject();
      project.visible = els.visibleInput.checked;
      updateItemCardState(project);
      syncPreviewAndJsonSoon();
    });

    els.categoryInput.addEventListener("change", function () {
      selectedProject().showInCategory = els.categoryInput.checked;
      syncPreviewAndJsonSoon();
    });

    els.featuredInput.addEventListener("change", function () {
      selectedProject().featured = els.featuredInput.checked;
      syncPreviewAndJsonSoon();
    });

    els.showHidden.addEventListener("click", function () {
      state.showHidden = !state.showHidden;
      els.showHidden.setAttribute("aria-pressed", String(state.showHidden));
      els.showHidden.textContent = state.showHidden ? "隐藏未展示图片" : "显示隐藏图片";
      renderImages(selectedProject());
      syncPreviewAndJsonSoon();
    });
  }

  function bindFilmControls() {
    els.filmTitleInput.addEventListener("input", function () {
      const film = selectedFilm();
      film.title = els.filmTitleInput.value;
      els.itemTitle.textContent = film.title;
      updateItemCardState(film);
      syncPreviewAndJsonSoon();
    });
    els.filmCoverInput.addEventListener("input", function () {
      const film = selectedFilm();
      film.cover = els.filmCoverInput.value;
      updateItemCardState(film);
      syncPreviewAndJsonSoon();
    });
    els.filmPlayerInput.addEventListener("input", function () {
      selectedFilm().player = els.filmPlayerInput.value;
      syncPreviewAndJsonSoon();
    });
    els.filmOrderInput.addEventListener("input", function () {
      selectedFilm().order = Number(els.filmOrderInput.value);
      renderItemList();
      syncPreviewAndJsonSoon();
    });
    els.filmFeaturedInput.addEventListener("change", function () {
      const film = selectedFilm();
      film.featured = els.filmFeaturedInput.checked;
      updateItemCardState(film);
      syncPreviewAndJsonSoon();
    });
  }

  function bindBlogControls() {
    els.blogTitleInput.addEventListener("input", function () {
      const post = selectedBlog();
      post.title = els.blogTitleInput.value;
      els.itemTitle.textContent = post.title;
      updateItemCardState(post);
      syncPreviewAndJsonSoon();
    });
    els.blogDateInput.addEventListener("input", function () {
      const post = selectedBlog();
      post.date = els.blogDateInput.value;
      updateItemCardState(post);
      syncPreviewAndJsonSoon();
    });
    els.blogHrefInput.addEventListener("input", function () {
      selectedBlog().href = els.blogHrefInput.value;
      syncPreviewAndJsonSoon();
    });
    els.blogOrderInput.addEventListener("input", function () {
      selectedBlog().order = Number(els.blogOrderInput.value);
      renderItemList();
      syncPreviewAndJsonSoon();
    });
    els.blogVisibleInput.addEventListener("change", function () {
      const post = selectedBlog();
      post.visible = els.blogVisibleInput.checked;
      updateItemCardState(post);
      syncPreviewAndJsonSoon();
    });
  }

  function bindExportControls() {
    els.saveLocalJson.addEventListener("click", async function () {
      syncPreviewAndJsonNow();
      const originalText = els.saveLocalJson.textContent;
      els.saveLocalJson.disabled = true;
      els.saveLocalJson.textContent = "保存中...";

      try {
        const saves = isHomeSection()
          ? [
              { filename: "projects.json", content: state.projectsData },
              { filename: "films.json", content: state.filmsData },
            ]
          : [{ filename: activeFilename(), content: JSON.parse(els.jsonOutput.value) }];

        for (const save of saves) {
          const response = await fetch("/admin/save-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(save),
          });

          const result = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(result.error || "保存失败");
          }
        }

        els.saveLocalJson.textContent = "已保存";
        setTimeout(() => {
          els.saveLocalJson.textContent = originalText;
          els.saveLocalJson.disabled = false;
        }, 1200);
      } catch (error) {
        els.saveLocalJson.textContent = "保存失败";
        window.alert(`无法直接保存到本地项目：${error.message}\n请使用 scripts/admin_server.py 启动本地编辑服务器。`);
        setTimeout(() => {
          els.saveLocalJson.textContent = originalText;
          els.saveLocalJson.disabled = false;
        }, 1200);
      }
    });

    els.downloadJson.addEventListener("click", function () {
      syncPreviewAndJsonNow();
      const blob = new Blob([els.jsonOutput.value + "\n"], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = activeFilename();
      link.click();
      URL.revokeObjectURL(url);
    });

    els.copyJson.addEventListener("click", async function () {
      syncPreviewAndJsonNow();
      await navigator.clipboard.writeText(els.jsonOutput.value);
      els.copyJson.textContent = "已复制";
      setTimeout(() => {
        els.copyJson.textContent = "复制 JSON";
      }, 1200);
    });
  }

  function bindControls() {
    bindSectionTabs();
    bindProjectControls();
    bindFilmControls();
    bindBlogControls();
    bindExportControls();
  }

  async function init() {
    const [projectsData, filmsData, blogsData] = await Promise.all([
      readJson("/assets/data/projects.json"),
      readJson("/assets/data/films.json"),
      readJson("/assets/data/blogs.json"),
    ]);

    state.projectsData = projectsData;
    state.filmsData = filmsData;
    state.blogsData = blogsData;
    selectFirstItem();
    bindControls();
    renderFast();
  }

  init().catch(function (error) {
    els.itemTitle.textContent = "加载失败";
    els.preview.textContent = error.message;
  });
})();
