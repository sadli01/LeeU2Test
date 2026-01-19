# LeeU2 作品集网站

这是一个展示 LeeU2 创作作品的个人作品集网站，包括化妆发型、摄影、秘密项目、电影视频、博客等内容。

## 项目结构

```
/LeeU2Test/
├── assets/              # 统一资源目录
│   ├── css/             # 样式文件
│   │   └── styles.css
│   ├── js/              # JavaScript 脚本
│   │   ├── menu.js
│   │   ├── navunderline.js
│   │   └── fullscreen.js
│   └── fonts/           # 字体文件
│       └── aalaowaiyuguoti.ttf
├── pic/                 # 媒体资源
│   ├── makeup/
│   ├── photo/
│   ├── secret/
│   └── film/
├── makeup/              # 化妆作品总览
├── makeupproj/          # 化妆作品详情页
├── photo/               # 摄影作品总览
├── photoproj/           # 摄影作品详情页
├── secret/              # 秘密项目总览
├── secretproj/          # 秘密项目详情页
├── films/               # 电影视频页面
├── blogs/               # 博客文章
├── contact/             # 联系方式
└── index.html           # 网站首页
```

## 本地开发

启动本地服务器：
```bash
python3 -m http.server 8000
```

然后在浏览器访问：`http://localhost:8000`

停止服务器：
```bash
ps aux | grep http.server
kill -9 [进程ID]
```

## 网站内容

### 导航栏结构

- **Home** (`index.html`) - 网站首页，精选展示来自各个分类的优秀作品
- **Makeup&Hair** (`makeup/`) - 化妆发型作品总览，详情页在 `makeupproj/` 目录
- **Photo** (`photo/`) - 摄影作品总览，详情页在 `photoproj/` 目录
- **Secrets** (`secret/`) - 私人/特别项目总览，详情页在 `secretproj/` 目录
- **Films** (`films/`) - 电影视频作品，通过 B站播放器展示
- **Blogs** (`blogs/`) - 博客文章列表
- **Contact** (`contact/`) - 联系方式页面

## 更新内容

### 添加新作品

1. 将媒体文件上传到 `pic/` 对应的子目录
2. 在对应的 `*proj/` 目录创建详情页 HTML
3. 在总览页（如 `makeup/index.html`）添加作品链接和缩略图

### 修改样式或脚本

- CSS 样式：编辑 `assets/css/styles.css`
- JavaScript：编辑 `assets/js/` 目录中的对应文件
- 所有页面会自动应用更改，无需逐个修改

## 优化改进

### 第一阶段（已完成）

✅ 统一资源文件到 `/assets/` 目录
✅ 消除脚本文件重复
✅ 创建项目文档

### 第二阶段（计划中）

- 引入静态网站生成器
- 实现 HTML 模板化
- 优化图片加载策略

详细优化方案请参考 [skills.md](skills.md)
