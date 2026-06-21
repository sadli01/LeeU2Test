# 项目文件分区

项目分成两部分：需要提交到 GitHub 的网站源码，以及只保存在当前电脑和 Cloudflare R2 中的媒体资产。

## GitHub 发布部分

以下目录和文件属于网站源码，应提交到 GitHub：

```text
LeeU2Test/
├── admin/                 # 本地内容编辑器前端
├── assets/                # CSS、JavaScript、字体和内容 JSON
├── blog/ blogs/           # Blog 页面
├── contact/               # Contact 页面
├── films/ video/          # Video 页面及兼容入口
├── home/                  # 首页
├── makeup/ photo/         # 分类页面
├── portrait/ secret/
├── makeupproj/            # 各分类作品详情页
├── photoproj/
├── portraitproj/
├── secretproj/
├── scripts/               # 内容校验、图片生成和 R2 上传脚本
├── docs/                  # 项目文档
├── index.html
├── navbar.html
├── footer.html
├── CNAME
├── README.md
└── .gitignore
```

这些文件决定网站结构、页面表现、图片 URL、内容排序和本地管理流程。

## 仅保存在本地的部分

所有不应上传 GitHub 的内容统一放在 `local/`：

```text
local/
├── original-images/       # 333 张原始图片，约 6.6 GB
│   ├── contact/
│   ├── film/
│   ├── makeup/
│   ├── photo/
│   ├── portrait/
│   └── secret/
├── image-variants/        # 自动生成的 1280px / 2560px 网页图片
│   ├── small/
│   └── large/
└── tools/                 # 个人临时图片转换、改名脚本
```

此外，以下目录也不提交：

```text
.cache/                    # 编辑器缩略图缓存
dist/                      # 本地构建输出
.vscode/                   # 编辑器个人配置
```

`local/` 已由 `.gitignore` 完整忽略。R2 密钥保存在 `~/.config/rclone/rclone.conf`，不属于项目文件。

## 逻辑路径兼容

`assets/data/projects.json` 中的 `mediaDir` 继续使用：

```text
/pic/photo/ProjectName
```

这是内容数据中的逻辑路径。项目脚本会自动映射到实际本地目录：

```text
local/original-images/photo/ProjectName
```

这样可以保留已有内容数据和 R2 Object Key，无需重命名线上图片地址。

## 新电脑恢复本地媒体目录

从 GitHub 克隆项目后，需要自行创建或恢复以下目录：

```bash
mkdir -p local/original-images local/image-variants local/tools
```

原图可以从个人备份恢复，也可以从 R2 下载：

```bash
rclone copy r2:leeu2-images local/original-images \
  --exclude 'optimized/**' \
  --exclude '**/.DS_Store' \
  --progress
```

然后重新生成网页衍生图：

```bash
node scripts/generate-image-variants.js
```

## 提交前检查

```bash
git status --short
node scripts/validate-content.js
node scripts/sync-project-media.js --dry-run
```

`git status` 中不应出现 `local/`、原图、衍生图、R2 配置或密钥。
