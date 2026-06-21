#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const localMediaRoot = path.join(root, "local", "original-images");
const projectsFile = path.join(root, "assets/data/projects.json");
const imagePattern = /\.(webp|jpe?g|png|gif)$/i;
const imageOrigin = "https://img.leeu2.com";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const createMissing = args.has("--create-missing");
const projectArg = readArg("--project");
const mediaDirArg = readArg("--media-dir");

const categoryConfig = {
  makeup: { pageDir: "makeupproj" },
  photo: { pageDir: "photoproj" },
  portrait: { pageDir: "portraitproj" },
  secret: { pageDir: "secretproj" },
};

function readArg(name) {
  const prefix = `${name}=`;
  const item = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return item ? item.slice(prefix.length) : null;
}

function sitePathToFull(sitePath) {
  if (sitePath.startsWith("/pic/")) {
    return path.join(localMediaRoot, sitePath.slice("/pic/".length));
  }
  return path.join(root, sitePath.replace(/^\//, ""));
}

function toSitePath(fullPath) {
  if (fullPath === localMediaRoot || fullPath.startsWith(`${localMediaRoot}${path.sep}`)) {
    return `/pic/${path.relative(localMediaRoot, fullPath).replace(/\\/g, "/")}`;
  }
  return `/${path.relative(root, fullPath).replace(/\\/g, "/")}`;
}

function toPublicImageUrl(sitePath) {
  return sitePath.startsWith("/pic/") ? `${imageOrigin}${sitePath.slice(4)}` : sitePath;
}

function toLocalSitePath(value) {
  return value?.startsWith(`${imageOrigin}/`) ? `/pic/${value.slice(imageOrigin.length + 1)}` : value;
}

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function listImageFiles(mediaDir) {
  const fullDir = sitePathToFull(mediaDir);
  if (!fs.existsSync(fullDir)) return [];

  return fs
    .readdirSync(fullDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && imagePattern.test(entry.name))
    .map((entry) => toSitePath(path.join(fullDir, entry.name)))
    .sort(naturalCompare);
}

function readImageMeta(src) {
  const fullPath = sitePathToFull(src);
  try {
    const output = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", fullPath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const width = Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]);
    const height = Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]);
    const orientation = width >= height ? "landscape" : "portrait";
    return {
      orientation,
      aspectRatio: orientation === "landscape" ? "3 / 2" : "2 / 3",
    };
  } catch (error) {
    return {
      orientation: "portrait",
      aspectRatio: "2 / 3",
    };
  }
}

function basenameWithoutExt(src) {
  return path.basename(src).replace(/\.[^.]+$/, "");
}

function slugify(value) {
  return String(value)
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromDirName(dirName, category) {
  const withoutPrefix = dirName.replace(new RegExp(`^${category}\\d*[_-]?`, "i"), "");
  const spaced = withoutPrefix
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  if (!spaced) return dirName;
  return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
}

function nextOrder(projects, category, field) {
  const values = projects
    .filter((project) => project.category === category)
    .map((project) => Number(project[field]))
    .filter(Number.isFinite);
  return values.length ? Math.max(...values) + 1 : 0;
}

function uniqueProjectId(projects, baseId) {
  const ids = new Set(projects.map((project) => project.id));
  if (!ids.has(baseId)) return baseId;

  let index = 2;
  while (ids.has(`${baseId}-${index}`)) index += 1;
  return `${baseId}-${index}`;
}

function detailPageHtml(title, projectId) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title></title>
  <link rel="stylesheet" href="/assets/css/styles.css" />
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet">
</head>
<body>
  <div id="navbar"></div>
  <script src="/assets/js/loadNavbar.js"></script>
  <script src="/assets/js/navunderline.js"></script>
  <section id="home" data-project-detail="${projectId}"></section>
  <script src="/assets/js/galleryRenderer.js"></script>
  <div id="site-footer"></div>
  <script src="/assets/js/loadFooter.js"></script>
  <script src="/assets/js/menu.js"></script>
</body>
</html>
`;
}

function collectImageDirs(baseDir) {
  const fullBase = sitePathToFull(`/${baseDir.replace(/^\//, "")}`);
  if (!fs.existsSync(fullBase)) return [];

  const result = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile() && imagePattern.test(entry.name))) {
      result.push(toSitePath(dir));
    }
    entries.filter((entry) => entry.isDirectory()).forEach((entry) => walk(path.join(dir, entry.name)));
  }

  walk(fullBase);
  return result.sort(naturalCompare);
}

function discoverMissingMediaDirs(projects) {
  const registered = new Set(projects.map((project) => project.mediaDir).filter(Boolean));
  return Object.keys(categoryConfig)
    .flatMap((category) => collectImageDirs(`pic/${category}`).map((mediaDir) => ({ category, mediaDir })))
    .filter((item) => !registered.has(item.mediaDir))
    .filter((item) => !mediaDirArg || item.mediaDir === mediaDirArg);
}

function createProjectForMediaDir(projects, category, mediaDir) {
  const dirName = path.basename(mediaDir);
  const slug = slugify(dirName) || `${category}-project`;
  const id = uniqueProjectId(projects, `${category}-${slug}`);
  const title = titleFromDirName(dirName, category);
  const page = `/${categoryConfig[category].pageDir}/${slug}/`;
  const localImages = listImageFiles(mediaDir);
  const images = localImages.map((localSrc, order) => {
    const meta = readImageMeta(localSrc);
    return {
      src: toPublicImageUrl(localSrc),
      alt: basenameWithoutExt(localSrc),
      orientation: meta.orientation,
      aspectRatio: meta.aspectRatio,
      visible: true,
      order,
    };
  });
  const cover = images[0]?.src || "";
  const coverMeta = localImages[0]
    ? readImageMeta(localImages[0])
    : { orientation: "portrait", aspectRatio: "2 / 3" };

  return {
    id,
    title,
    category,
    page,
    mediaDir,
    cover,
    visible: true,
    showInCategory: true,
    featured: false,
    homeOrder: nextOrder(projects, category, "homeOrder"),
    categoryOrder: nextOrder(projects, category, "categoryOrder"),
    layout: "single-column",
    coverOrientation: coverMeta.orientation,
    coverAspectRatio: coverMeta.aspectRatio,
    images,
  };
}

function writeDetailPage(project) {
  const pagePath = sitePathToFull(`${project.page.replace(/\/?$/, "/")}index.html`);
  if (fs.existsSync(pagePath)) return false;

  fs.mkdirSync(path.dirname(pagePath), { recursive: true });
  fs.writeFileSync(pagePath, detailPageHtml(project.title, project.id));
  return true;
}

function syncProject(project) {
  const files = listImageFiles(project.mediaDir);
  const filesSet = new Set(files);
  const existingImages = Array.isArray(project.images) ? project.images : [];
  const existingBySrc = new Map(existingImages.map((image) => [toLocalSitePath(image.src), image]));
  const removed = existingImages.filter((image) => image.src && !filesSet.has(toLocalSitePath(image.src)));
  const kept = existingImages
    .filter((image) => image.src && filesSet.has(toLocalSitePath(image.src)))
    .map((image) => ({ ...image, src: toPublicImageUrl(toLocalSitePath(image.src)) }));
  const keptSources = new Set(kept.map((image) => toLocalSitePath(image.src)));
  const addedSources = files.filter((src) => !keptSources.has(src));

  const usedOrders = kept.map((image) => Number(image.order)).filter(Number.isFinite);
  let nextOrder = usedOrders.length ? Math.max(...usedOrders) + 1 : 0;

  const added = addedSources.map((localSrc) => {
    const meta = readImageMeta(localSrc);
    return {
      src: toPublicImageUrl(localSrc),
      alt: basenameWithoutExt(localSrc),
      orientation: meta.orientation,
      aspectRatio: meta.aspectRatio,
      visible: true,
      order: nextOrder++,
    };
  });

  project.images = kept.concat(added);

  const localCover = toLocalSitePath(project.cover);
  if (!project.cover || !filesSet.has(localCover)) {
    project.cover = project.images.find((image) => image.visible !== false)?.src || project.images[0]?.src || project.cover;
  } else {
    project.cover = toPublicImageUrl(localCover);
  }

  const updatedLocalCover = toLocalSitePath(project.cover);
  if (project.cover && filesSet.has(updatedLocalCover)) {
    const coverImage =
      existingBySrc.get(updatedLocalCover) ||
      project.images.find((image) => toLocalSitePath(image.src) === updatedLocalCover);
    const meta = coverImage?.orientation && coverImage?.aspectRatio ? coverImage : readImageMeta(updatedLocalCover);
    project.coverOrientation = meta.orientation;
    project.coverAspectRatio = meta.aspectRatio;
  }

  return {
    id: project.id,
    title: project.title,
    mediaDir: project.mediaDir,
    added: added.map((image) => image.src),
    removed: removed.map((image) => image.src),
    total: project.images.length,
  };
}

const data = JSON.parse(fs.readFileSync(projectsFile, "utf8"));
const projects = data.projects || [];
const createdProjects = [];

if (createMissing) {
  discoverMissingMediaDirs(projects).forEach(({ category, mediaDir }) => {
    const project = createProjectForMediaDir(projects, category, mediaDir);
    projects.push(project);
    createdProjects.push(project);
  });
}

const selectedProjects = projects.filter((project) => {
  if (projectArg && project.id !== projectArg) return false;
  if (mediaDirArg && project.mediaDir !== mediaDirArg) return false;
  return project.mediaDir && project.mediaDir.startsWith("/pic/");
});

const summaries = selectedProjects.map(syncProject).filter((summary) => summary.added.length || summary.removed.length);
const createdPageSummaries = createdProjects.map((project) => ({
  id: project.id,
  title: project.title,
  page: project.page,
  mediaDir: project.mediaDir,
  images: project.images.length,
  pageCreated: dryRun
    ? !fs.existsSync(sitePathToFull(`${project.page.replace(/\/?$/, "/")}index.html`))
    : writeDetailPage(project),
}));

if (!dryRun && (summaries.length || createdProjects.length)) {
  fs.writeFileSync(projectsFile, `${JSON.stringify(data, null, 2)}\n`);
}

if (!summaries.length && !createdPageSummaries.length) {
  console.log("No media changes found.");
} else {
  createdPageSummaries.forEach((summary) => {
    console.log(`${summary.id} (${summary.mediaDir})`);
    console.log(`  created project: ${summary.title}`);
    console.log(`  page: ${summary.page}${summary.pageCreated ? "" : " (already existed)"}`);
    console.log(`  images: ${summary.images}`);
  });

  summaries.forEach((summary) => {
    if (createdProjects.some((project) => project.id === summary.id) && !summary.added.length && !summary.removed.length) {
      return;
    }
    console.log(`${summary.id} (${summary.mediaDir})`);
    console.log(`  total: ${summary.total}`);
    if (summary.added.length) {
      console.log(`  added: ${summary.added.length}`);
      summary.added.forEach((src) => console.log(`    + ${src}`));
    }
    if (summary.removed.length) {
      console.log(`  removed: ${summary.removed.length}`);
      summary.removed.forEach((src) => console.log(`    - ${src}`));
    }
  });
}

if (dryRun && (summaries.length || createdPageSummaries.length)) {
  console.log("Dry run only. projects.json was not changed.");
}
