# LeeU2 作品集网站

LeeU2 是一个静态个人作品集网站，用于展示妆发、摄影、Portrait、Secret、Video、Blog 和 Contact 内容。

当前项目已经从“手写 HTML 图片列表”升级为“作品数据 + 统一渲染”的结构：页面路径和视觉风格保持原有状态，但作品集、封面、排序、隐藏状态等内容集中由数据文件管理。

## 当前状态

已完成：

- 公共资源归档到 `assets/`。
- 首页、分类页、详情页改为数据驱动。
- 作品图片集统一登记到 `assets/data/projects.json`。
- Video 和 Blog 分别由独立数据文件管理。
- 新增本地可视化编辑器。
- 编辑器已覆盖作品集、Video、Blog 三类内容。
- 新增内容数据校验脚本。
- 保留原有 `makeupproj/`、`photoproj/`、`portraitproj/`、`secretproj/` 详情页路径，旧链接不失效。

## 项目结构

```text
LeeU2Test/
├── index.html                  # 首页挂载点
├── navbar.html                 # 公共导航
├── admin/
│   ├── gallery-editor.html     # 本地作品集可视化编辑器
│   └── gallery-editor.js
├── assets/
│   ├── css/
│   │   ├── styles.css          # 全站样式
│   │   └── gallery-editor.css  # 编辑器样式
│   ├── data/
│   │   ├── projects.json       # 妆发/摄影/Portrait/Secret 作品集数据
│   │   ├── films.json          # 视频数据
│   │   ├── blogs.json          # 博客索引
│   │   └── README.md           # 数据字段说明
│   ├── js/
│   │   ├── loadNavbar.js       # 导航加载与 active 状态
│   │   ├── menu.js             # 移动端菜单
│   │   ├── navunderline.js     # 兼容文件
│   │   └── galleryRenderer.js  # 数据渲染脚本
│   └── fonts/
├── local/                      # 仅本地保存，整个目录不提交 Git
│   ├── original-images/        # 原始图片和视频封面资源
│   ├── image-variants/         # 1280px / 2560px 网页衍生图
│   └── tools/                  # 个人临时图片处理脚本
├── makeup/                     # 妆发分类页
├── photo/                      # 摄影分类页
├── portrait/                   # Portrait 分类页
├── secret/                     # Secret 分类页
├── films/                      # 视频页
├── blogs/                      # 博客页
├── contact/                    # 联系页
├── makeupproj/                 # 妆发详情页兼容入口
├── photoproj/                  # 摄影详情页兼容入口
├── portraitproj/               # Portrait 详情页兼容入口
├── secretproj/                 # Secret 详情页兼容入口
├── scripts/
│   ├── admin_server.py         # 支持编辑器直接保存 JSON 的本地服务器
│   ├── sync-project-media.js   # 同步 pic 图片增删到 projects.json
│   └── validate-content.js     # 内容数据校验
└── docs/                       # 项目文档
```

## 版块划分

| 版块 | 路径 | 内容来源 |
| --- | --- | --- |
| Home | `/index.html` | `projects.json` 中 `featured = true` 的作品 + `films.json` 精选视频 |
| Makeup&Hair | `/makeup/` | `category = makeup` 的作品 |
| Photo | `/photo/` | `category = photo` 的作品 |
| Portrait | `/portrait/` | `category = portrait` 的作品 |
| Secret | `/secret/` | `category = secret` 的作品 |
| Video | `/films/` | `assets/data/films.json` |
| Blog | `/blogs/` | `assets/data/blogs.json` |
| Contact | `/contact/` | 静态页面内容 |

## 本地开发

### 只预览网站

如果只是浏览网站，可以启动普通静态服务器：

```bash
python3 -m http.server 8000
```

访问网站：

```text
http://localhost:8000
```

普通静态服务器可以打开编辑器页面，但不能使用“保存到本地项目”按钮。需要直接保存 JSON 时，请使用下面的编辑服务器。

### 打开编辑服务器

编辑服务器用于本地内容管理，支持编辑器直接写回 `assets/data/projects.json`、`assets/data/films.json` 和 `assets/data/blogs.json`。

```bash
python3 scripts/admin_server.py
```

打开编辑器：

```text
http://localhost:8000/admin/gallery-editor.html
```

编辑器中可以使用：

- `保存到本地项目`：直接把当前板块的数据写回本地 JSON 文件。
- `导出 JSON`：下载当前板块 JSON，适合手动备份或对比。
- `复制 JSON`：复制当前板块 JSON。

### 关闭本地服务器

如果服务器是在当前终端里启动的，按：

```text
Ctrl + C
```

如果终端已关闭、端口仍被占用，可以用下面命令关闭 8000 端口上的服务：

```bash
lsof -tiTCP:8000 -sTCP:LISTEN | xargs kill
```

查看 8000 端口当前被谁占用：

```bash
lsof -iTCP:8000 -sTCP:LISTEN -n -P
```

如果运行 `python3 scripts/admin_server.py` 时看到 `Address already in use`，说明 8000 端口已经有服务器在运行。可以直接访问 `http://localhost:8000/admin/gallery-editor.html`，或者先关闭旧服务再重新启动。

## 内容更新

### 修改现有作品

推荐使用本地编辑器：

1. 启动编辑服务器：`python3 scripts/admin_server.py`。
2. 打开 `/admin/gallery-editor.html`。
3. 选择分类和作品集。
4. 调整标题、封面、首页展示、分类页展示、单张图片显隐、详情页顺序。
5. 左侧列表可以调整作品/视频/文章顺序，也可以控制是否显示该页面。
6. 如在 Video 或 Blog 板块，可调整视频/文章的标题、链接、排序和展示状态。
7. 点击 `保存到本地项目`，直接写回对应 JSON。
8. 运行校验。

Home 标签页只管理首页封面：可调整封面的显示/隐藏和首页顺序，不调整各子页面内部图片顺序。子页面图片顺序请在 Makeup&Hair、Photo、Portrait 或 Secret 对应板块中编辑；这些板块更换封面后，Home 会读取同一个封面字段并同步显示最新封面。

如果使用普通静态服务器，`保存到本地项目` 不可用，可以使用 `导出 JSON`，再手动替换 `assets/data/` 中对应文件。

### 新增作品集

1. 在 `local/original-images/` 对应分类下创建作品目录。

   ```text
   local/original-images/photo/photo10_ProjectName/
   ```

2. 放入 `.webp` 图片。
3. 运行自动创建命令。

   ```bash
   node scripts/sync-project-media.js --create-missing
   node scripts/validate-content.js
   ```

4. 使用编辑器调整封面、排序、首页展示和展示状态。

脚本会自动完成：

- 在 `assets/data/projects.json` 中新增作品记录。
- 在对应详情页目录中创建子页面，例如 `/photoproj/photo10-projectname.html`。
- 根据图片尺寸生成横竖图配置。
- 默认让新作品显示在分类页，但不默认显示在首页。是否放到 Home 可以在编辑器中打开 `featured`。

### 同步图片文件夹增删

已有作品集的图片文件夹发生新增、删除或改名时，不需要手动逐张修改 `assets/data/projects.json`，可以运行同步脚本：

```bash
node scripts/sync-project-media.js
node scripts/validate-content.js
```

同步脚本会根据 `projects.json` 中每个作品的 `mediaDir` 扫描对应图片目录，例如：

```text
local/original-images/portrait/hiking/
local/original-images/secret/Mountain/
```

它会自动完成：

- 新增图片：追加到对应作品的 `images` 列表末尾。
- 删除图片：从对应作品的 `images` 列表中移除不存在的路径。
- 图片方向：通过图片尺寸自动判断 `portrait` 或 `landscape`。
- 图片比例：竖图写入 `2 / 3`，横图写入 `3 / 2`。
- 保留设置：已有图片的排序、显示/隐藏、封面等手动设置会保留。
- 封面修复：如果当前封面图片已不存在，会自动换成第一张可用图片。

只预览变化、不写入文件：

```bash
node scripts/sync-project-media.js --dry-run
```

只同步某一个作品：

```bash
node scripts/sync-project-media.js --project=secret8
node scripts/sync-project-media.js --project=portrait-hiking
```

也可以按图片目录同步：

```bash
node scripts/sync-project-media.js --media-dir=/pic/secret/Mountain
```

自动创建新作品文件夹对应的项目和子页面：

```bash
node scripts/sync-project-media.js --create-missing
```

只预览会创建哪些项目和页面、不写入文件：

```bash
node scripts/sync-project-media.js --create-missing --dry-run
```

推荐操作顺序：

1. 把图片放入或移出对应 `local/original-images/` 子目录。
2. 如果是新增文件夹，运行 `node scripts/sync-project-media.js --create-missing --dry-run` 预览变化。
3. 如果只是已有文件夹图片增删，运行 `node scripts/sync-project-media.js --dry-run` 预览变化。
4. 确认无误后运行 `node scripts/sync-project-media.js --create-missing` 或 `node scripts/sync-project-media.js` 写入。
5. 运行 `node scripts/validate-content.js` 校验。
6. 如需调整封面、显隐或顺序，再打开 `/admin/gallery-editor.html` 微调。

注意：自动创建只处理 `local/original-images/makeup/`、`photo/`、`portrait/`、`secret/` 下含图片的文件夹。`film/` 和 `contact/` 不会自动创建作品集页面。JSON 中的 `mediaDir` 仍使用逻辑路径 `/pic/...`。

### 校验内容数据

```bash
node scripts/validate-content.js
```

校验内容包括：

- JSON 是否能解析。
- 作品 ID 是否重复。
- 分类是否合法。
- 页面路径是否存在。
- 图片目录、封面、图片路径是否存在。
- 是否有未登记图片目录。

## 文档入口

- [项目设计逻辑](PROJECT_DESIGN_LOGIC.md)
- [设计与资源管理优化方案](DESIGN_RESOURCE_OPTIMIZATION_PLAN.md)
- [内容与图片集管理指南](CONTENT_MANAGEMENT_GUIDE.md)
- [项目文件分区](PROJECT_FILE_LAYOUT.md)
- [图片与 R2 方案](IMAGE_STORAGE_AND_R2.md)
- [开发指南](DEVELOPMENT.md)
- [优化总结](OPTIMIZATION_SUMMARY.md)
