# 开发指南

## 项目概述

LeeU2 作品集网站采用纯静态 HTML/CSS/JavaScript 技术栈，托管在 GitHub Pages 上。

## 技术栈

- **前端框架**: 原生 HTML5/CSS3/JavaScript
- **字体**: Google Fonts (Dancing Script, Roboto)
- **视频**: B站播放器嵌入
- **托管**: GitHub Pages

## 资源管理

### 目录结构

```
assets/
├── css/          # 样式表
├── js/           # JavaScript 脚本
└── fonts/        # 字体文件
```

### 资源引用规范

所有 HTML 文件统一使用绝对路径引用资源：

```html
<!-- CSS -->
<link rel="stylesheet" href="/assets/css/styles.css" />

<!-- JavaScript -->
<script src="/assets/js/menu.js"></script>
<script src="/assets/js/navunderline.js"></script>
<script src="/assets/js/fullscreen.js"></script>
```

### 优势

- **一处修改，全站生效**：更新 `assets/` 中的文件即可应用到所有页面
- **版本一致性**：消除了多个副本导致的版本不一致问题
- **便于维护**：集中管理所有静态资源

## 核心脚本说明

### loadNavbar.js

动态加载导航栏：
- 使用 fetch API 异步加载 navbar.html
- 将导航栏内容插入到页面中
- 确保所有页面都显示统一的导航栏

### menu.js

负责导航栏的交互功能：
- 响应式汉堡菜单
- 移动端菜单展开/收起
- 页面滚动时固定导航栏
- 绑定导航栏的点击事件

### navunderline.js

负责导航栏当前页面高亮：
- 自动识别当前页面
- 为当前导航项添加下划线样式

### fullscreen.js

图片全屏查看功能：
- 点击图片放大显示
- 遮罩层背景
- ESC 键或点击关闭

## 添加新页面

### 1. 创建 HTML 文件

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>页面标题</title>
  <link rel="stylesheet" href="/assets/css/styles.css" />
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet">
</head>
<body>
  <!-- 导航栏占位符 -->
  <div id="navbar"></div>
  <!-- 加载导航栏 -->
  <script src="/assets/js/loadNavbar.js"></script>
  <script src="/assets/js/navunderline.js"></script>

  <!-- 页面内容 -->
  <section id="content">
    <!-- 内容区域 -->
  </section>

  <!-- 底部脚本 -->
  <script src="/assets/js/menu.js"></script>
</body>
</html>
```

**重要提示**：
- 必须包含 `<div id="navbar"></div>` 作为导航栏占位符
- `loadNavbar.js` 必须在 `navunderline.js` 之前加载
- `menu.js` 必须在页面底部加载（确保导航栏已插入）
- 所有路径使用绝对路径（以 `/` 开头）

### 2. 添加图片

将图片文件放置在 `pic/` 对应的分类目录中。

### 3. 更新导航

在 `navbar.html` 中添加导航链接（如需要）。

## 样式定制

### 全局颜色

主要颜色定义在 `assets/css/styles.css` 中：
- 背景色：`#000` (黑色)
- 主色调：`red` (红色)

### 响应式断点

- 桌面端：默认
- 移动端：`@media (max-width: 768px)`
- 小屏幕：`@media (max-width: 480px)`

## 性能优化建议

### 图片优化

1. 使用 WebP 格式
2. 添加 `loading="lazy"` 属性实现懒加载
3. 生成不同尺寸的缩略图

```html
<img src="/pic/makeup/example.webp" alt="描述" loading="lazy" class="fullscreenImage"/>
```

### 视频优化

使用预览图 + 点击加载的方式：

```html
<div class="video-placeholder" data-src="视频URL">
  <img src="预览图URL" alt="预览">
</div>
```

## 部署

### GitHub Pages 部署

1. 推送代码到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择部署分支（通常是 `main`）
4. 网站将自动部署到 `https://username.github.io/repo-name/`

### 自定义域名

在项目根目录创建 `CNAME` 文件，内容为自定义域名：

```
yourdomain.com
```

## 调试技巧

### 本地测试

```bash
# 启动本地服务器
python3 -m http.server 8000

# 在浏览器访问
http://localhost:8000
```

### 浏览器开发者工具

- **Console**: 查看 JavaScript 错误
- **Network**: 检查资源加载
- **Elements**: 调试 CSS 样式

## 常见问题

### 资源加载 404

确保所有资源路径使用绝对路径（以 `/` 开头）：
```html
<!-- 正确 -->
<link rel="stylesheet" href="/assets/css/styles.css" />

<!-- 错误 -->
<link rel="stylesheet" href="assets/css/styles.css" />
```

### 导航栏不显示

检查以下几点：
1. `menu.js` 和 `navunderline.js` 是否正确加载
2. `navbar.html` 是否存在
3. 浏览器控制台是否有 JavaScript 错误

### 图片不显示

1. 检查图片路径是否正确
2. 确认图片文件已上传到 `pic/` 目录
3. 验证图片文件格式和扩展名

## 版本控制

### Git 工作流

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 提交更改
git add .
git commit -m "描述更改内容"

# 推送到远程
git push origin feature/new-feature

# 合并到主分支
git checkout main
git merge feature/new-feature
```

## 后续优化计划

参考 [skills.md](skills.md) 中的完整优化方案：

- 第二阶段：模板化和图片优化
- 第三阶段：构建流程和 CDN 集成

## 联系与支持

如有问题或建议，请通过网站 Contact 页面联系。
