# 图片保存与使用方案

本文说明 LeeU2 当前图片文件的保存位置、Cloudflare R2 同步方式、网页引用规则，以及后续批量更新流程。

## 1. 当前架构

```text
本地 local/original-images/（源文件与目录结构）
          │
          │ rclone copy / sync
          ▼
Cloudflare R2：leeu2-images
          │
          │ 自定义公开域名
          ▼
https://img.leeu2.com
          │
          │ projects.json / films.json / HTML
          ▼
网页与内容编辑器加载图片
```

当前约定：

- 本地 `local/original-images/` 是图片源文件和目录结构的基准，并且不提交到 Git。
- R2 Bucket 名称为 `leeu2-images`。
- 图片公开域名为 `https://img.leeu2.com`。
- 同步时保留 `local/original-images/` 下的相对目录树，但不会把本地目录前缀放进 R2 Object Key。
- `.DS_Store` 不上传。
- R2 访问凭据只保存在本机 rclone 配置中，不能提交到 Git。
- 网页不会直接下载几十 MB 的原图，而是根据屏幕选择 `optimized/small` 或 `optimized/large`。

## 2. 网页图片版本

每张源图片保留三个用途：

| 版本 | 路径 | 最大边长 | 用途 |
| --- | --- | ---: | --- |
| 原图 | 原有 R2 路径 | 原始尺寸 | 本地归档、内容数据兼容，不作为普通网页首选 |
| Small | `optimized/small/...` | 1280px | 手机、列表封面和较小屏幕 |
| Large | `optimized/large/...` | 2560px | 电脑详情页和全屏查看 |

衍生图保存在本地 `local/image-variants/`，整个 `local/` 已加入 `.gitignore`，不会提交到 Git。

生成或增量更新衍生图：

```bash
node scripts/generate-image-variants.js
```

脚本只重新处理不存在或比源文件旧的版本。上传到 R2：

```bash
bash scripts/upload-image-variants.sh
```

上传脚本会为衍生图设置长期缓存元数据：

```text
Cache-Control: public, max-age=31536000, immutable
```

该响应头可以让浏览器长期缓存图片。若要让 Cloudflare 边缘节点也缓存 R2 图片，还需在 Cloudflare Dashboard 为网站创建 Cache Rule：

```text
Hostname equals img.leeu2.com
URI Path starts with /optimized/
Cache eligibility: Eligible for cache
Edge TTL: 1 year
Browser TTL: Respect existing headers
```

规则生效并完成首次回源后，响应中的 `CF-Cache-Status` 应从 `DYNAMIC` 变为 `MISS`，后续请求通常为 `HIT`。

## 3. 路径映射

例如本地文件：

```text
local/original-images/secret/DuskByTheSea/1.webp
```

对应的 R2 Object Key：

```text
secret/DuskByTheSea/1.webp
```

网页访问地址：

```text
https://img.leeu2.com/secret/DuskByTheSea/1.webp
```

Small 版本：

```text
https://img.leeu2.com/optimized/small/secret/DuskByTheSea/1.webp
```

Large 版本：

```text
https://img.leeu2.com/optimized/large/secret/DuskByTheSea/1.webp
```

主要目录保持如下结构：

```text
local/original-images/
├── contact/
├── film/
├── makeup/
├── photo/
├── portrait/
└── secret/
```

## 4. 项目文件如何使用图片

| 文件 | 用途 |
| --- | --- |
| `assets/data/projects.json` | 项目封面和项目图片使用 R2 URL；`mediaDir` 保留本地 `/pic/...` 路径 |
| `assets/data/films.json` | 影片封面使用 R2 URL |
| `contact/index.html` | Contact 页面图片使用 R2 URL |
| `assets/js/galleryRenderer.js` | 将内容数据中的原图 URL 转换为响应式 Small/Large URL，并按屏幕加载 |
| `scripts/generate-image-variants.js` | 增量生成 1280px 和 2560px WebP 衍生图 |
| `scripts/upload-image-variants.sh` | 上传衍生图并设置长期缓存元数据 |
| `scripts/sync-project-media.js` | 将逻辑 `/pic/...` 映射到本地原图目录，并生成对应的 R2 图片 URL |
| `scripts/validate-content.js` | 将 R2 URL 映射回本地文件，检查文件、封面和内容数据 |
| `scripts/admin_server.py` | 内容编辑器使用 R2 URL，同时从本地文件生成预览缩略图 |

本地 `local/original-images/` 不能直接删除，内容同步、校验和编辑器预览仍然依赖它；但该目录已经与 GitHub 源码分离。

## 5. 日常新增或替换图片

在项目根目录执行：

```bash
cd /Users/yuli/code_proj/code/LeeU2/LeeU2Test
```

先把图片放入 `local/original-images/` 下的对应项目目录，然后预览上传变化：

```bash
rclone copy local/original-images r2:leeu2-images \
  --exclude '**/.DS_Store' \
  --dry-run
```

确认无误后上传：

```bash
rclone copy local/original-images r2:leeu2-images \
  --exclude '**/.DS_Store' \
  --progress
```

随后生成并上传网页版本：

```bash
node scripts/generate-image-variants.js
bash scripts/upload-image-variants.sh
```

`rclone copy` 的行为：

- 上传新增文件。
- 上传内容发生变化的文件。
- 跳过无需更新的文件。
- 不删除 R2 中已有但本地已不存在的文件。

如果项目图片列表发生新增、删除或重命名，再更新内容数据：

```bash
node scripts/sync-project-media.js --dry-run
node scripts/sync-project-media.js
node scripts/validate-content.js
```

如需调整图片顺序、显示状态或封面，可在内容编辑器中完成，最后再次运行：

```bash
node scripts/validate-content.js
```

## 6. 删除图片及完全镜像

仅执行 `rclone copy` 不会删除云端旧文件。需要让 R2 与本地原图完全一致时，必须先预览：

```bash
rclone sync local/original-images r2:leeu2-images \
  --exclude '**/.DS_Store' \
  --dry-run
```

仔细确认待删除对象后再执行：

```bash
rclone sync local/original-images r2:leeu2-images \
  --exclude '**/.DS_Store' \
  --progress
```

注意：`rclone sync` 会删除 R2 中本地不存在的对象。日常更新优先使用 `copy`，只有明确需要云端完全镜像本地时才使用 `sync`。

删除或重命名图片后，还应运行内容同步和校验脚本，避免 JSON 中继续引用旧地址：

```bash
node scripts/sync-project-media.js
node scripts/validate-content.js
```

## 7. 检查 R2 状态

直接检查 Bucket 顶层目录：

```bash
rclone lsf r2:leeu2-images --max-depth 1
```

查看云端文件数量和总大小：

```bash
rclone size r2:leeu2-images \
  --exclude '**/.DS_Store'
```

检查本地文件是否都已存在于 R2：

```bash
rclone check local/original-images r2:leeu2-images \
  --one-way \
  --size-only \
  --exclude '**/.DS_Store'
```

当前 R2 Token 可能没有列出所有 Bucket 的权限，因此 `rclone lsd r2:` 返回权限错误时，不代表目标 Bucket 不可用。应直接测试 `r2:leeu2-images`。

## 8. 文件名与缓存

- 目录名和文件名会直接成为公开 URL 的一部分。
- 空格、`&` 等字符可以使用，浏览器会自动进行 URL 编码，但推荐后续使用简洁的英文、数字、连字符或下划线命名。
- 衍生图使用一年 `immutable` 缓存。同名覆盖后，浏览器可能继续显示旧版本。
- 替换图片时推荐使用新文件名；如果必须同名覆盖，需要在 Cloudflare 中清理 Small 和 Large URL 的缓存。

## 9. 安全规则

- 不要把 Access Key ID、Secret Access Key、Account ID 或完整凭据写入 README、脚本或 Git。
- rclone 配置默认保存在 `~/.config/rclone/rclone.conf`，文件权限应限制为当前用户可读写：

```bash
chmod 600 ~/.config/rclone/rclone.conf
```

- 如果密钥曾在聊天、日志、截图或代码中明文出现，应在 Cloudflare 中立即撤销并重新创建。
- `img.leeu2.com` 是公开图片域名，适合网站公开作品；私密内容需要单独采用鉴权或签名 URL 方案。

## 10. 推荐发布顺序

1. 在本地 `local/original-images/` 新增、替换、删除或重命名图片。
2. 使用 `rclone copy --dry-run` 预览。
3. 使用 `rclone copy` 上传新增和更新的原图。
4. 运行 `generate-image-variants.js` 生成网页图片。
5. 运行 `upload-image-variants.sh` 上传 Small/Large 图片并设置缓存。
6. 图片成员发生变化时，运行 `sync-project-media.js`。
7. 使用内容编辑器调整封面、顺序和显示状态。
8. 运行 `validate-content.js`。
9. 本地预览网页，确认图片正常加载。
10. 提交代码并推送到 GitHub，随后部署网站。
11. 只有需要删除云端多余对象时，才使用 `rclone sync --dry-run` 和 `rclone sync`。
