# LeeU2 项目优化总结

本文档记录 LeeU2 作品集网站从原始静态页面逐步优化到“数据化作品集管理”的过程。

## 当前完成状态

已完成三类优化：

1. 公共资源统一管理。
2. 作品集内容数据化。
3. 本地可视化编辑器。

项目仍保持纯静态网站形态，适合继续使用 GitHub Pages 等静态托管方式。

## 第一阶段：公共资源整理

### 完成内容

- 将公共 CSS、JS、字体统一归档到 `assets/`。
- 删除多目录重复脚本的维护模式。
- 页面统一引用：

```html
<link rel="stylesheet" href="/assets/css/styles.css" />
<script src="/assets/js/loadNavbar.js"></script>
<script src="/assets/js/navunderline.js"></script>
<script src="/assets/js/menu.js"></script>
```

### 结果

- 公共样式一处修改，全站生效。
- 公共脚本一处维护，避免版本不一致。
- 页面结构更轻。

## 第二阶段：图片集管理数据化

### 完成内容

新增内容数据目录：

```text
assets/data/
├── projects.json
├── films.json
├── blogs.json
└── README.md
```

新增统一渲染脚本：

```text
assets/js/galleryRenderer.js
```

新增内容校验脚本：

```text
scripts/validate-content.js
```

### 数据化后的展示逻辑

| 页面 | 内容来源 |
| --- | --- |
| 首页 | `projects.json` 中 `featured = true` 的作品 |
| Makeup&Hair | `category = makeup` 的作品 |
| Photo | `category = photo` 的作品 |
| Secret | `category = secret` 的作品 |
| 详情页 | 对应作品的 `images` 列表 |
| Video | `films.json` |
| Blog | `blogs.json` |

### 页面改造结果

原先每个 HTML 页面中手写的图片列表，已改为数据挂载点：

```html
<section id="home" data-gallery="category" data-category="photo"></section>
```

详情页示例：

```html
<section id="home" data-project-detail="photo9"></section>
```

### 内容管理能力

现在可以通过数据控制：

- 作品标题。
- 所属分类。
- 首页是否展示。
- 分类页是否展示。
- 作品封面。
- 详情页图片顺序。
- 单张图片是否隐藏。
- 旧详情页路径。

### 校验能力

运行：

```bash
node scripts/validate-content.js
```

会检查：

- JSON 是否有效。
- 作品 ID 是否重复。
- 分类是否合法。
- 页面路径是否存在。
- 图片目录是否存在。
- 封面和图片路径是否存在。
- 是否存在未登记的图片目录。

### 当前数据规模

当前已纳入管理：

- 妆发作品集。
- 摄影作品集。
- Secret 作品集。
- Video 视频封面与播放链接。
- Blog 文章索引。

其中历史上没有页面入口的资源，也作为隐藏存档作品纳入数据，避免图片资源游离在管理体系之外。

## 第三阶段：本地可视化编辑器

### 完成内容

新增编辑器：

```text
admin/gallery-editor.html
admin/gallery-editor.js
assets/css/gallery-editor.css
```

### 编辑器能力

编辑器支持：

- 按分类浏览作品集。
- 修改作品标题。
- 设置公开展示。
- 设置分类页展示。
- 设置首页展示。
- 点击图片设为封面。
- 隐藏或显示单张图片。
- 拖拽调整详情页图片顺序。
- 实时预览。
- 导出新的 `projects.json`。

### 使用方式

启动本地服务器：

```bash
python3 -m http.server 8000
```

访问：

```text
http://localhost:8000/admin/gallery-editor.html
```

编辑完成后导出 JSON，并替换：

```text
assets/data/projects.json
```

## 兼容策略

为了避免破坏旧链接，当前仍保留：

```text
makeupproj/*.html
photoproj/*.html
secretproj/*.html
```

这些详情页不再手写图片列表，只负责声明对应作品 ID。

例如：

```html
<section id="home" data-project-detail="photo9"></section>
```

这样原有 URL 可以继续访问，同时内容由数据统一管理。

## 优化前后对比

| 项目 | 优化前 | 优化后 |
| --- | --- | --- |
| 首页内容 | 手写图片链接 | 读取 `featured` 作品 |
| 分类页内容 | 手写封面链接 | 按分类读取作品数据 |
| 详情页内容 | 手写所有图片 | 按作品 ID 读取图片列表 |
| 隐藏图片 | HTML 注释 | `visible` 字段 |
| 更换封面 | 修改 HTML 路径 | 修改 `cover` 或编辑器选择 |
| 调整排序 | 移动 HTML 代码 | 修改 `order` 或拖拽 |
| 新增作品 | 多处修改 HTML | 新增数据记录 |
| 数据检查 | 依靠人工浏览 | 脚本校验 |
| 前端排版 | 手动改代码 | 编辑器辅助调整内容顺序 |

## 当前维护流程

### 更新作品内容

1. 修改 `assets/data/projects.json`，或使用编辑器导出。
2. 运行：

   ```bash
   node scripts/validate-content.js
   ```

3. 本地打开首页、分类页、详情页检查展示。

### 新增作品集

1. 新建图片目录。
2. 放入图片。
3. 新增作品数据。
4. 创建兼容详情页。
5. 用编辑器调整封面和顺序。
6. 运行校验。

## 后续建议

下一步可继续推进：

- 图片多尺寸管理：`full`、`display`、`thumb`。
- 更完整的新作品创建工具。
- 编辑器直接生成新作品数据模板。
- 分类页加入标题/短描述等更丰富的视觉信息。
- 图片资源压缩和缩略图自动生成。

当前阶段已经完成核心转变：项目从“手写页面维护”进入“作品资料库维护”。
