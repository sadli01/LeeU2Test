# LeeU2 内容数据说明

这个目录是第二阶段优化后的内容资料库。页面展示不再直接维护图片 HTML，而是读取这里的数据。

## 文件说明

```text
projects.json  # 妆发、摄影、Portrait、Secret 作品集
films.json     # 视频封面和播放链接
blogs.json     # 博客文章索引
```

## projects.json

每个作品集是一张资料卡。

| 字段 | 说明 |
| --- | --- |
| `id` | 作品集唯一 ID，尽量不要修改 |
| `title` | 展示标题 |
| `category` | 所属分类：`makeup`、`photo`、`portrait`、`secret` |
| `page` | 保留的详情页路径 |
| `mediaDir` | 图片目录 |
| `cover` | 首页/分类页封面 |
| `coverOrientation` | 封面方向：`portrait` 或 `landscape` |
| `coverAspectRatio` | 封面画框比例：竖图 `2 / 3`，横图 `3 / 2` |
| `visible` | 是否公开展示 |
| `showInCategory` | 是否出现在分类页 |
| `featured` | 是否出现在首页 |
| `homeOrder` | 首页排序 |
| `categoryOrder` | 分类页排序 |
| `layout` | 展示模式，目前主要使用 `single-column` |
| `images` | 详情页图片列表 |

`images` 中每张图片包含：

| 字段 | 说明 |
| --- | --- |
| `src` | 图片路径 |
| `alt` | 图片替代文字 |
| `visible` | 单张图片是否展示 |
| `order` | 详情页排序 |
| `orientation` | 图片方向：`portrait` 或 `landscape` |
| `aspectRatio` | 展示画框比例：竖图 `2 / 3`，横图 `3 / 2` |

## 展示规则

- 首页读取 `visible = true` 且 `featured = true` 的作品。
- 分类页读取 `visible = true` 且 `showInCategory = true` 且分类匹配的作品。
- 详情页读取对应作品的 `images`，只展示 `visible = true` 的图片。
- 隐藏图片仍保留在数据中，方便以后重新打开。

## 更新后检查

修改数据后运行：

```bash
node scripts/validate-content.js
```

这个脚本会检查：

- JSON 是否能解析。
- 作品 ID 是否重复。
- 分类是否合法。
- 页面路径是否存在。
- 封面和图片路径是否存在。
- 图片目录中是否有未登记图片。
- 是否有未登记的作品图片目录。

## 编辑器

本地可视化编辑器：

```text
/admin/gallery-editor.html
```

它可以调整标题、封面、首页展示、分类页展示、单张图片显隐和详情页排序，并导出新的 `projects.json`。

如需使用“保存到本地项目”按钮直接写回 JSON，请用编辑服务器启动项目：

```bash
python3 scripts/admin_server.py
```

如果只用 `python3 -m http.server 8000`，编辑器仍可打开，但只能导出或复制 JSON，不能直接写回本地文件。
