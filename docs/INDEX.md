# LeeU2 文档索引

这个目录集中存放项目说明、设计逻辑、内容管理和优化方案。

## 推荐阅读顺序

1. [README.md](README.md)

   项目当前结构、版块划分、本地运行和内容更新入口。

2. [PROJECT_DESIGN_LOGIC.md](PROJECT_DESIGN_LOGIC.md)

   原有项目的整体设计逻辑、版块划分、命名规范和目录规范。

3. [DESIGN_RESOURCE_OPTIMIZATION_PLAN.md](DESIGN_RESOURCE_OPTIMIZATION_PLAN.md)

   面向设计和资源管理的完整优化蓝图，说明最终网站应该是什么样。

4. [CONTENT_MANAGEMENT_GUIDE.md](CONTENT_MANAGEMENT_GUIDE.md)

   当前如何管理作品集、封面、排序、首页展示和隐藏图片。

5. [DEVELOPMENT.md](DEVELOPMENT.md)

   开发视角的页面挂载点、脚本职责、数据格式和校验方式。

6. [IMAGE_STORAGE_AND_R2.md](IMAGE_STORAGE_AND_R2.md)

   当前图片在本地与 Cloudflare R2 中的保存、引用、同步和校验方案。

7. [PROJECT_FILE_LAYOUT.md](PROJECT_FILE_LAYOUT.md)

   GitHub 发布源码与本地图片、缓存、个人工具之间的目录边界。

8. [OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md)

   已完成优化阶段总结。

## 历史文档

以下文档记录了导航栏和第一阶段资源整理时的历史过程，通常不需要日常阅读：

- [NAVBAR_FIX.md](NAVBAR_FIX.md)
- [NAVBAR_IMPLEMENTATION.md](NAVBAR_IMPLEMENTATION.md)
- [TEST_NAVBAR.md](TEST_NAVBAR.md)

## 当前关键入口

内容数据：

```text
assets/data/projects.json
assets/data/films.json
assets/data/blogs.json
```

本地编辑器：

```text
admin/gallery-editor.html
```

内容校验：

```bash
node scripts/validate-content.js
```
