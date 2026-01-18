* LeeU2
** 环境

** 本地测试
python3 -m http.server 8000  -->  然后访问浏览器 http://localhost:8000
ps aux | grep http.server
kill -9 xxxxx

* prompt
依次往下分析每个子文件夹下目录结构，然后从全局的角度分析整个项目，怎么修改可以方便项目内容可以更高效地更新。

* 网页设计
** 导航栏
*** Home
对应 index.html，分别从 Makeup&hair、Photo、Secrets、Films、Blogs、Contact 自主挑选html嵌入当前页面（封面在pic文件夹中选择），网页的顺序排版根据自己的喜好决定。
*** Makeup&hair
对应 makeup/ 文件夹，包含 index.html 作为化妆发型作品总览页，展示各作品的缩略图。详情页位于 makeupproj/ 文件夹中，包含多个独立的项目页面（makeup1and2.html、makeup3.html、makeup4.html、makeup5.html、makeup6.html、makeup7.html、makeup8.html、makeup9.html、hair1.html）。
*** Photo
对应 photo/ 文件夹，包含 index.html 作为摄影作品总览页。详情页位于 photoproj/ 文件夹中，包含多个摄影项目页面（photo1.html、photo2.html、photo3.html、photo4.html、photo5.html）。
*** Secrets
对应 secret/ 文件夹，包含 index.html 作为私人/特别项目作品总览页。详情页位于 secretproj/ 文件夹中，包含多个秘密项目页面（secret1.html、secret2.html、secret3.html、secret4.html、secret6.html、secret7.html、secret8.html）。
*** Films
对应 films/ 文件夹，包含 index.html 作为电影/视频作品展示页，通过嵌入B站播放器展示作品视频，支持点击播放功能。
*** Blogs
对应 blogs/ 文件夹，包含 index.html 作为博客文章列表页，以及具体的博客文章页面（blog250604.html）。
*** Contact
对应 contact/ 文件夹，包含 index.html 作为联系方式页面。

* 目录概述
/LeeU2/
├── assets/           # 统一资源文件夹
│   ├── css/
│   ├── js/
│   ├── images/       # 按板块分类的图片
│   │   ├── makeup/
│   │   ├── photo/
│   │   ├── secret/
│   │   └── films/
│   └── fonts/
├── templates/        # HTML模板
│   ├── layout.html   # 基础布局模板
│   ├── gallery.html  # 画廊页面模板
│   └── project.html  # 项目详情模板
├── content/          # 内容文件夹
│   ├── makeup/
│   │   ├── index.html    # 总览页
│   │   └── projects/     # 所有makeup项目
│   ├── photo/
│   │   ├── index.html    # 总览页
│   │   └── projects/     # 所有photo项目
│   ├── secret/
│   │   ├── index.html    # 总览页
│   │   └── projects/     # 所有secret项目
│   ├── films/
│   │   ├── index.html    # 总览页
│   │   └── projects/     # 所有films项目
│   ├── blogs/
│   │   ├── index.html    # 总览页
│   │   └── projects/     # 所有blogs项目
│   └── contact/
├── index.html        # 首页
├── styles.css        # 主样式文件
└── scripts.js        # 主脚本文件
