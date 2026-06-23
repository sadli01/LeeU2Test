# LeeU2 Portfolio

LeeU2 is a static portfolio website for Makeup&Hair, Photo, Portrait, Secret,
Video, Blog, and Contact content.

The website is data-driven. Gallery content, covers, visibility, and ordering
are managed through JSON files in `assets/data/` and the local visual editor.

## Local Preview

```bash
python3 scripts/admin_server.py
```

默认使用 8000 端口。如果该端口已被其他项目占用，服务器会自动选择下一个
可用端口，并在终端打印实际地址。也可手动指定端口：

```bash
python3 scripts/admin_server.py --port 8001
```

根据终端输出打开：

- Website: `http://localhost:<实际端口>/`
- Editor: `http://localhost:<实际端口>/admin/gallery-editor.html`

Stop the server with `Ctrl + C`.

### 编辑器显示 `{"detail":"Not Found"}`

这通常不是编辑器文件丢失，而是 8000 端口正被 FastAPI、Uvicorn 或其他
项目占用，浏览器访问到了错误的服务。

检查端口：

```bash
lsof -nP -iTCP:8000 -sTCP:LISTEN
```

重新启动 LeeU2：

```bash
python3 scripts/admin_server.py
```

如果 8000 已占用，脚本会自动使用 8001、8002 等空闲端口。请打开终端打印
的完整编辑器地址，例如：

```text
http://localhost:8001/admin/gallery-editor.html
```

不要仅因为 8000 已有服务运行，就直接访问该端口；该服务可能属于其他项目。
如需强制指定端口：

```bash
python3 scripts/admin_server.py --port 8001
```

## Validation

```bash
node scripts/validate-content.js
node scripts/sync-project-media.js --dry-run
```

## Image Storage and Cloudflare R2

Local files in `local/original-images/` are the image source of truth and
retain the complete directory tree. This directory is ignored by Git. Images
are synchronized to the Cloudflare R2 bucket
`leeu2-images`, while the website loads public images from
`https://img.leeu2.com`.

- `mediaDir` keeps the logical `/pic/...` path; local tools map it to `local/original-images/...`.
- Covers, project images, film covers, and the Contact image use R2 URLs.
- Use `rclone copy` for normal additions and replacements; it does not delete remote files.
- Use `rclone sync` only when R2 must exactly mirror local files, after checking a dry run.

## 新增或更新作品集

现在可以直接把 `.jpg` 或 `.jpeg` 图片放进本地作品目录，不需要手动转换
WebP。例如：

```text
local/original-images/photo/photo10_ProjectName/
├── photo10_0.jpg
├── photo10_1.jpg
└── photo10_2.jpg
```

先预览将要执行的操作：

```bash
bash scripts/update-portfolio.sh --dry-run
```

确认后执行完整更新：

```bash
bash scripts/update-portfolio.sh
```

如需在更新图片与图床后，同时发布到 GitHub 并合并进 `main`：

```bash
bash scripts/update-portfolio.sh --github
```

### 完整发布命令

日常新增作品集时，推荐先预览，再执行完整发布：

```bash
# 1. 预览 JPG→WebP、内容同步、R2 上传和 GitHub 发布
bash scripts/update-portfolio.sh --dry-run --github

# 2. 正式执行完整流程并合并到 main
bash scripts/update-portfolio.sh \
  --github \
  --commit-message="Add new portfolio"
```

如果命令提示工作区不干净，而当前所有改动都确定属于本次发布（例如首次发布
新增的自动化脚本和 README），可以显式包含这些改动：

```bash
bash scripts/update-portfolio.sh \
  --github \
  --include-existing-changes \
  --commit-message="Add new portfolio"
```

`--include-existing-changes` 会把运行命令前已经存在的 Git 改动一并提交。
使用前应先运行 `git status --short`，确认没有其他项目或无关文件。

完整流程包括：

```text
更新 local/original-images/
→ JPG/JPEG 转为 WebP
→ 创建或更新作品数据与详情页
→ 生成 Small/Large 响应式图片
→ 校验内容
→ 增量上传 Cloudflare R2
→ 创建 GitHub 发布分支并提交
→ 创建 Pull Request
→ 合并到 main
```

也可以指定提交和 Pull Request 标题：

```bash
bash scripts/update-portfolio.sh \
  --github \
  --commit-message="Add new photo portfolio"
```

该命令会依次完成：

1. 扫描 `local/original-images/`，将 JPG/JPEG 转成同名 WebP。只有 WebP
   成功生成后才会删除对应 JPG/JPEG。
2. 自动创建缺失的作品记录和详情页，并同步已有作品的图片增删。
3. 生成 `optimized/small/`（1280px）和 `optimized/large/`（2560px）
   响应式 WebP。
4. 校验内容数据。
5. 使用 `rclone copy` 增量上传原图和响应式图片到
   `r2:leeu2-images`。该操作不会删除远端已有文件。
6. 使用 `--github` 时，创建临时 `codex/portfolio-update-*` 分支，提交并
   推送改动，创建 Pull Request，然后通过 merge commit 合并到 `main`。

已有图片从 `.jpg` 迁移为 `.webp` 时，会保留其排序、显示状态和封面设置。
如只想更新本地、不上传图床：

```bash
bash scripts/update-portfolio.sh --no-upload
```

如需更新本地并发布 GitHub，但跳过 R2 上传：

```bash
bash scripts/update-portfolio.sh \
  --no-upload \
  --github \
  --commit-message="Update portfolio content"
```

运行前需要：

- 安装 ImageMagick：`brew install imagemagick`
- 安装并配置 `rclone`
- rclone 中存在名为 `r2` 的 remote，并可访问 Bucket `leeu2-images`
- 如使用 `--github`：安装 GitHub CLI（`brew install gh`），并运行
  `gh auth login`
- GitHub 发布必须从干净的 `main` 工作区开始，以防把无关改动提交进去
- 首次启用或明确需要包含现有改动时，可使用 `--include-existing-changes`

GitHub 发布采用 Pull Request，不会直接强推 `main`。如果仓库的分支保护、
审批或 CI 检查阻止合并，脚本会停止并保留已创建的 Pull Request，供后续处理。

完成后可启动编辑器，调整封面、排序、首页展示和图片显隐：

```bash
python3 scripts/admin_server.py
```

请使用终端打印的编辑器地址；8000 被占用时会自动改用 8001 等空闲端口。

### 分步执行

一键命令内部对应以下步骤：

```bash
# Convert JPG/JPEG to WebP
node scripts/convert-jpg-to-webp.js

# Create missing portfolios and synchronize media
node scripts/sync-project-media.js --create-missing

# Generate responsive 1280px and 2560px image variants
node scripts/generate-image-variants.js

# Validate content
node scripts/validate-content.js

# Upload original WebP images
rclone copy local/original-images r2:leeu2-images \
  --exclude '.DS_Store' \
  --exclude '**/.DS_Store' \
  --exclude '*.jpg' \
  --exclude '*.jpeg' \
  --progress

# Upload variants with long-lived browser/CDN cache metadata
bash scripts/upload-image-variants.sh
```

See [docs/IMAGE_STORAGE_AND_R2.md](docs/IMAGE_STORAGE_AND_R2.md) for the full
path mapping, update workflow, deletion procedure, checks, and security notes.

See [docs/PROJECT_FILE_LAYOUT.md](docs/PROJECT_FILE_LAYOUT.md) for the boundary
between GitHub-published source files and local-only assets.

Full project structure, content-management instructions, and editor usage are
documented in [docs/README.md](docs/README.md).
