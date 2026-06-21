# GitHub 推送约定

当用户说“推送到 GitHub”或表达同类意思时，默认目标是：

1. 只提交网站正常运行、内容管理和后续维护所必需的源码、配置、内容数据与文档。
2. 不提交原始图片、生成图片、缓存、编辑器配置、系统文件、临时文件、构建产物、密钥或个人工具。
3. 推送前必须验证网站与内容数据，不能为了减少文件而破坏页面、导航、样式、脚本、字体、内容 JSON、域名配置或线上图片引用。
4. 检查工作区中的改动，只暂存本次任务相关文件；不得直接把不明改动全部加入提交。
5. 默认在功能分支提交并推送，创建草稿 PR；除非用户明确要求，否则不直接合并到 `main`。

## 文件边界

应提交：

- 网站页面：根目录 HTML，以及 `home/`、`makeup/`、`photo/`、`portrait/`、`secret/`、`films/`、`video/`、`blog/`、`blogs/`、`contact/` 和各类 `*proj/`。
- 网站运行资源：`assets/css/`、`assets/js/`、`assets/fonts/`、`assets/data/`。
- 内容管理和校验工具：`admin/`、`scripts/`。
- 部署与维护文件：`CNAME`、`.gitignore`、`README.md`、`docs/`、本文件。

不得提交：

- `local/`：原图、响应式衍生图和个人工具。
- `.cache/`、`dist/`、`.vscode/`、`.DS_Store`、`__pycache__/`、`*.pyc`。
- `.env*`、访问令牌、R2/rclone 凭据、私钥及其他敏感信息。
- 与当前网站运行或本次任务无关的临时文件。

## 每次推送前检查

```bash
git status -sb
git diff --check
node scripts/validate-content.js
node scripts/sync-project-media.js --dry-run
```

还应启动本地服务器，抽查首页、主要分类页、项目详情页、Contact 页面及静态资源加载。确认 `git status --ignored` 中的本地媒体和缓存仍处于忽略状态，并检查暂存内容中没有大体积媒体或敏感信息，再提交和推送。

更详细的媒体边界与恢复方式见 `docs/PROJECT_FILE_LAYOUT.md` 和 `docs/IMAGE_STORAGE_AND_R2.md`。
