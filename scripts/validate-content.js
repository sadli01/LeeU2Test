#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const localMediaRoot = path.join(root, "local", "original-images");
const imageOrigin = "https://img.leeu2.com";
const errors = [];
const warnings = [];

function readJson(file) {
  const fullPath = path.join(root, file);
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    return null;
  }
}

function toLocalSitePath(value) {
  if (value?.startsWith(`${imageOrigin}/`)) {
    return `/pic/${value.slice(imageOrigin.length + 1)}`;
  }
  return value;
}

function exists(sitePath) {
  const localPath = toLocalSitePath(sitePath);
  if (localPath?.startsWith("/pic/")) {
    return fs.existsSync(path.join(localMediaRoot, localPath.slice("/pic/".length)));
  }
  return fs.existsSync(path.join(root, localPath.replace(/^\//, "")));
}

function listImageFiles(dir) {
  const fullDir = dir.startsWith("/pic/")
    ? path.join(localMediaRoot, dir.slice("/pic/".length))
    : path.join(root, dir.replace(/^\//, ""));
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir)
    .filter((name) => /\.(webp|jpe?g|png|gif)$/i.test(name))
    .map((name) => `${dir}/${name}`);
}

function collectMediaDirs(baseDir) {
  const fullBase = baseDir.startsWith("pic/")
    ? path.join(localMediaRoot, baseDir.slice("pic/".length))
    : path.join(root, baseDir);
  if (!fs.existsSync(fullBase)) return [];

  const result = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const imageCount = entries.filter((entry) => entry.isFile() && /\.(webp|jpe?g|png|gif)$/i.test(entry.name)).length;
    if (imageCount) {
      result.push(`/pic/${path.relative(localMediaRoot, dir).replace(/\\/g, "/")}`);
    }
    entries.filter((entry) => entry.isDirectory()).forEach((entry) => walk(path.join(dir, entry.name)));
  }

  walk(fullBase);
  return result;
}

function validateProjects(data) {
  if (!data) return;

  const categoryIds = new Set((data.categories || []).map((category) => category.id));
  const projectIds = new Set();
  const registeredMediaDirs = new Set();

  for (const project of data.projects || []) {
    if (!project.id) errors.push("A project is missing id");
    if (projectIds.has(project.id)) errors.push(`Duplicate project id: ${project.id}`);
    projectIds.add(project.id);

    if (!categoryIds.has(project.category)) {
      errors.push(`${project.id}: unknown category "${project.category}"`);
    }

    ["title", "page", "mediaDir", "cover"].forEach((field) => {
      if (!project[field]) errors.push(`${project.id}: missing ${field}`);
    });

    if (project.page && !exists(project.page)) errors.push(`${project.id}: page not found ${project.page}`);
    if (project.mediaDir && !exists(project.mediaDir)) errors.push(`${project.id}: mediaDir not found ${project.mediaDir}`);
    if (project.cover && !exists(project.cover)) errors.push(`${project.id}: cover not found ${project.cover}`);

    registeredMediaDirs.add(project.mediaDir);

    const images = project.images || [];
    if (!images.length) warnings.push(`${project.id}: no images registered`);

    const imageSources = new Set();
    const orders = new Set();

    for (const image of images) {
      if (!image.src) {
        errors.push(`${project.id}: image missing src`);
        continue;
      }
      const localImageSrc = toLocalSitePath(image.src);
      if (imageSources.has(localImageSrc)) errors.push(`${project.id}: duplicate image ${image.src}`);
      imageSources.add(localImageSrc);

      if (!exists(image.src)) errors.push(`${project.id}: image not found ${image.src}`);
      if (orders.has(image.order)) warnings.push(`${project.id}: duplicate image order ${image.order}`);
      orders.add(image.order);
    }

    if (project.cover && images.length && !imageSources.has(toLocalSitePath(project.cover))) {
      warnings.push(`${project.id}: cover is not listed in images`);
    }

    const filesInDir = listImageFiles(project.mediaDir || "");
    const missingFromData = filesInDir.filter((src) => !imageSources.has(src));
    if (missingFromData.length) {
      warnings.push(`${project.id}: ${missingFromData.length} image(s) in mediaDir are not registered`);
    }
  }

  for (const base of ["pic/makeup", "pic/photo", "pic/portrait", "pic/secret"]) {
    for (const dir of collectMediaDirs(base)) {
      if (!registeredMediaDirs.has(dir)) {
        warnings.push(`Unregistered media directory: ${dir}`);
      }
    }
  }
}

function validateFilms(data) {
  if (!data) return;
  const ids = new Set();
  for (const film of data.films || []) {
    if (!film.id) errors.push("A film is missing id");
    if (ids.has(film.id)) errors.push(`Duplicate film id: ${film.id}`);
    ids.add(film.id);
    if (film.cover && !exists(film.cover)) errors.push(`${film.id}: cover not found ${film.cover}`);
    if (!film.player) warnings.push(`${film.id}: missing player url`);
  }
}

function validateBlogs(data) {
  if (!data) return;
  const ids = new Set();
  for (const post of data.posts || []) {
    if (!post.id) errors.push("A blog post is missing id");
    if (ids.has(post.id)) errors.push(`Duplicate blog post id: ${post.id}`);
    ids.add(post.id);
    if (post.href && !exists(post.href)) errors.push(`${post.id}: page not found ${post.href}`);
  }
}

validateProjects(readJson("assets/data/projects.json"));
validateFilms(readJson("assets/data/films.json"));
validateBlogs(readJson("assets/data/blogs.json"));

if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length) {
  console.error("Errors:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Content data is valid.");
