# LeeU2 内容与图片集管理指南

本指南对应当前已落地的前三阶段优化：内容规范、图片集数据化、本地可视化编辑。

## 1. 当前管理方式

网站现在保留原有页面路径和视觉风格，但作品内容已集中到数据文件中：

```text
assets/data/projects.json
assets/data/films.json
assets/data/blogs.json
```

页面不再手写每一张图片，而是通过这些数据自动渲染：

- 首页：读取 `featured = true` 的作品。
- 分类页：读取对应 `category` 的作品。
- 详情页：读取对应 `id` 的图片列表。
- Video：读取 `films.json`。
- Blog：读取 `blogs.json`。

## 2. 作品集字段含义

每个作品集包含以下核心信息：

| 字段 | 含义 |
| --- | --- |
| `id` | 作品集唯一标识，不建议频繁修改 |
| `title` | 页面和编辑器中显示的作品标题 |
| `category` | 所属分类：`makeup`、`photo`、`secret` |
| `page` | 旧有详情页路径，继续保持可访问 |
| `mediaDir` | 图片所在目录 |
| `cover` | 首页和分类页使用的封面 |
| `visible` | 是否公开展示 |
| `showInCategory` | 是否显示在分类页 |
| `featured` | 是否显示在首页 |
| `homeOrder` | 首页排序 |
| `categoryOrder` | 分类页排序 |
| `images` | 详情页图片列表 |

图片对象中的 `visible` 控制单张图片是否在详情页展示。

## 3. 本地编辑器

编辑器路径：

```text
/admin/gallery-editor.html
```

本地启动服务器后访问：

```text
http://localhost:8000/admin/gallery-editor.html
```

编辑器可以完成：

- 按分类浏览作品集。
- 修改作品标题。
- 设置是否公开展示。
- 设置是否显示在分类页。
- 设置是否显示在首页。
- 点击图片设为封面。
- 隐藏或显示单张图片。
- 拖拽调整详情页图片顺序。
- 导出更新后的 `projects.json`。
- 管理 Video 视频标题、封面、B站播放器地址、首页展示和排序。
- 管理 Blog 文章标题、日期、链接、显示状态和排序。
- 根据当前板块分别导出 `projects.json`、`films.json` 或 `blogs.json`。

## 4. 新增作品集建议流程

1. 在 `pic/` 下创建对应分类的作品目录。

   ```text
   pic/photo/photo10_ProjectName/
   ```

2. 将图片放入目录，并尽量使用统一命名。

   ```text
   photo10_0.webp
   photo10_1.webp
   photo10_2.webp
   ```

3. 在 `assets/data/projects.json` 中新增一条作品记录。

4. 打开本地编辑器，调整封面、排序和展示状态。

5. 导出新的 `projects.json`，替换原文件。

## 5. 命名建议

后续新增内容建议使用：

```text
{category}{number}_{ProjectName}
```

示例：

```text
photo10_NightGarden
makeup10_SilverLine
secret9_RedRoom
```

图片建议使用：

```text
{category}{number}_{index}.webp
```

示例：

```text
photo10_0.webp
photo10_1.webp
```

已有旧命名无需强行迁移，避免破坏历史路径。

## 6. 常见调整

### 更换首页展示

在编辑器中选择作品，打开或关闭“显示在首页”。

### 更换封面

进入作品集，点击目标图片的“设为封面”。

### 隐藏单张图片

进入作品集，关闭图片下方的“显示”。

### 调整详情页顺序

进入作品集，拖拽图片改变顺序。

### 同步图片文件夹增删与新增文件夹

当已有作品目录里的图片有新增、删除或改名时，可以直接运行：

```bash
node scripts/sync-project-media.js
node scripts/validate-content.js
```

当 `pic/makeup/`、`pic/photo/`、`pic/portrait/` 或 `pic/secret/` 下新增了一个作品文件夹，并且希望自动生成对应项目和子页面时，运行：

```bash
node scripts/sync-project-media.js --create-missing
node scripts/validate-content.js
```

同步脚本会：

- 根据每个作品的 `mediaDir` 扫描图片文件。
- 自动追加新增图片。
- 自动移除已经不存在的图片路径。
- 保留已有图片的排序、显隐、封面等手动设置。
- 用图片尺寸自动判断横图/竖图。
- 使用 `--create-missing` 时，为新图片文件夹创建 `projects.json` 条目和对应详情页。

只同步单个作品：

```bash
node scripts/sync-project-media.js --project=secret8
```

只预览变更、不写入：

```bash
node scripts/sync-project-media.js --dry-run
node scripts/sync-project-media.js --create-missing --dry-run
```

## 7. 当前保留的兼容策略

为了不破坏原有访问路径，目前仍保留：

```text
makeupproj/*.html
photoproj/*.html
secretproj/*.html
```

这些页面现在只负责声明自己对应哪个作品集，具体图片内容来自 `projects.json`。

后续如果想进一步简化，可以逐步合并为一个通用详情页，但当前阶段不需要这么做。
