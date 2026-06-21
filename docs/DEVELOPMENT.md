# 开发指南

## 项目概述

LeeU2 作品集网站采用原生 HTML/CSS/JavaScript。当前项目不依赖前端框架，仍可直接部署到 GitHub Pages 或任意静态服务器。

现在的核心开发原则是：

- 页面负责结构和挂载点。
- 作品内容由 `assets/data/` 管理。
- 公共展示逻辑由 `assets/js/galleryRenderer.js` 管理。
- 原始图片只保存在 `local/original-images/`，网页通过 Cloudflare R2 URL 加载。

## 技术栈

- HTML5
- CSS3
- 原生 JavaScript
- JSON 内容数据
- B 站播放器嵌入
- GitHub Pages / 静态托管

## 核心目录

```text
assets/css/styles.css          # 全站样式
assets/css/gallery-editor.css  # 编辑器样式
assets/js/loadNavbar.js        # 导航加载与 active 状态
assets/js/menu.js              # 移动端菜单交互
assets/js/navunderline.js      # 兼容文件
assets/js/galleryRenderer.js   # 首页/分类页/详情页渲染
assets/data/projects.json      # 作品集数据
assets/data/films.json         # 视频数据
assets/data/blogs.json         # 博客索引
admin/gallery-editor.html      # 本地可视化编辑器
scripts/validate-content.js    # 内容数据校验
```

## 页面结构规范

### 首页

首页只保留挂载点：

```html
<section id="home" data-gallery="home"></section>
<section id="films" data-videos="featured"></section>
```

`data-gallery="home"` 表示读取 `projects.json` 中首页精选作品。

### 分类页

分类页使用：

```html
<section id="home" data-gallery="category" data-category="photo"></section>
```

`data-category` 可选：

```text
makeup
photo
secret
```

### 详情页

详情页使用：

```html
<section id="home" data-project-detail="photo9"></section>
```

`data-project-detail` 对应 `projects.json` 中的 `id`。如果该值为空，渲染脚本会尝试用当前 URL 匹配 `page` 字段。

### Video 页面

```html
<section id="films" data-videos="all"></section>
```

首页精选视频使用：

```html
<section id="films" data-videos="featured"></section>
```

### Blog 页面

```html
<section class="blog-list" data-blog-list></section>
```

## 脚本说明

### galleryRenderer.js

负责：

- 读取 `projects.json`、`films.json`、`blogs.json`。
- 渲染首页精选作品。
- 渲染分类页作品封面。
- 渲染详情页图片列表。
- 渲染 Video 和 Blog。
- 绑定详情页图片放大查看。
- 处理内容数据加载失败的轻量提示。

### loadNavbar.js

负责：

- 加载 `/navbar.html`。
- 设置当前导航 active 状态。
- 导航加载后触发移动端菜单绑定。

### navunderline.js

当前作为兼容文件保留。导航 active 状态已经转移到 `loadNavbar.js`。

### menu.js

负责移动端菜单打开、关闭，以及菜单打开时禁止页面滚动。

## 内容数据开发规则

### projects.json

每个作品集至少需要：

```json
{
  "id": "photo10",
  "title": "Project Name",
  "category": "photo",
  "page": "/photoproj/photo10.html",
  "mediaDir": "/pic/photo/photo10_ProjectName",
  "cover": "https://img.leeu2.com/photo/photo10_ProjectName/photo10_0.webp",
  "visible": true,
  "showInCategory": true,
  "featured": false,
  "homeOrder": 999,
  "categoryOrder": 999,
  "layout": "single-column",
  "images": []
}
```

图片对象格式：

```json
{
  "src": "https://img.leeu2.com/photo/photo10_ProjectName/photo10_0.webp",
  "alt": "photo10_0",
  "visible": true,
  "order": 0
}
```

### 显示规则

- 首页：`visible = true` 且 `featured = true`。
- 分类页：`visible = true` 且 `showInCategory = true` 且分类匹配。
- 详情页：只显示 `images` 中 `visible = true` 的图片。

## 本地编辑器

访问：

```text
http://localhost:8000/admin/gallery-editor.html
```

用途：

- 修改作品标题。
- 更换封面。
- 调整详情页图片顺序。
- 设置首页展示。
- 设置分类页展示。
- 隐藏/显示单张图片。
- 导出新的 `projects.json`。

注意：浏览器不能直接写入项目文件，所以编辑器采用导出 JSON 的方式。导出后需要替换 `assets/data/projects.json`。

## 校验

修改数据后运行：

```bash
node scripts/validate-content.js
```

再检查 JS 语法：

```bash
node --check assets/js/galleryRenderer.js
node --check admin/gallery-editor.js
node --check scripts/validate-content.js
```

## 本地测试

启动服务器：

```bash
python3 -m http.server 8000
```

访问：

```text
http://localhost:8000
```

因为页面使用 `fetch()` 读取 JSON，不建议直接用文件方式打开 HTML。

## 新增作品推荐流程

1. 新建图片目录。
2. 放入 `.webp` 图片。
3. 在 `projects.json` 新增作品记录。
4. 新建兼容详情页，或复制现有详情页并修改 `data-project-detail`。
5. 打开编辑器调整封面、排序和显示状态。
6. 运行 `node scripts/validate-content.js`。
7. 本地浏览器检查首页、分类页、详情页。

## 命名建议

作品目录：

```text
local/original-images/{category}/{category}{number}_{ProjectName}/
```

图片文件：

```text
{category}{number}_{index}.webp
```

示例：

```text
local/original-images/photo/photo10_NightGarden/photo10_0.webp
```

已有旧命名无需强制修改。
