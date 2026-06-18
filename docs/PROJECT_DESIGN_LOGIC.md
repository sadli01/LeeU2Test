# LeeU2 原有项目设计逻辑说明

本文档用于记录当前 LeeU2 作品集网站的原有设计逻辑、版块划分、目录规范、命名习惯和维护方式。它描述的是项目现状，便于后续继续维护、重构为数据驱动结构，或引入可视化图片集编辑工具。

## 1. 项目定位

LeeU2 是一个静态个人作品集网站，核心内容是创作者的妆发、摄影、私人项目、影像视频、博客和联系方式。

项目当前采用纯静态 HTML + CSS + JavaScript 的方式组织，不依赖前端框架或构建工具。页面通过 GitHub Pages 或类似静态服务器直接访问。

整体视觉语言偏个人作品展示：

- 黑色背景作为主基调。
- 红色作为主要强调色，用于文字、边框、导航和图片描边。
- 页面内容以图片为核心，文字说明较少。
- 图片展示采用纵向排列，强调单张作品的完整观看。
- 导航固定在顶部，保证不同页面之间快速切换。

## 2. 整体版块划分

网站按照内容类型划分为多个一级版块，对应顶部导航栏中的菜单项。

| 导航名称 | URL | 目录 | 作用 |
| --- | --- | --- | --- |
| Home | `/index.html` | 根目录 | 首页，混合展示精选妆发、摄影、秘密项目和电影视频 |
| Makeup&Hair | `/makeup/` | `makeup/` | 妆发作品总览页 |
| Photo | `/photo/` | `photo/` | 摄影作品总览页 |
| Secret | `/secret/` | `secret/` | 私人/特别项目总览页 |
| Films | `/films/` | `films/` | 电影/视频作品页 |
| Blog | `/blogs/` | `blogs/` | 博客文章列表和文章页 |
| Contact | `/contact/` | `contact/` | 个人介绍和联系方式 |

除一级版块外，项目还使用详情页目录承载具体作品集：

| 详情目录 | 对应版块 | 用途 |
| --- | --- | --- |
| `makeupproj/` | Makeup&Hair | 妆发作品详情页 |
| `photoproj/` | Photo | 摄影作品详情页 |
| `secretproj/` | Secret | 私人/特别项目详情页 |

当前设计逻辑是：

1. 一级版块页面负责展示作品封面。
2. 每个封面通过 `<a>` 链接跳转到对应详情页。
3. 详情页展示该作品集的多张图片。
4. 首页从不同版块中挑选代表作品混合展示。

## 3. 目录规范

当前项目目录结构大致如下：

```text
LeeU2Test/
├── index.html
├── navbar.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── loadNavbar.js
│   │   ├── menu.js
│   │   ├── navunderline.js
│   │   └── fullscreen.js
│   └── fonts/
├── pic/
│   ├── makeup/
│   ├── photo/
│   ├── secret/
│   ├── film/
│   └── contact/
├── makeup/
├── makeupproj/
├── photo/
├── photoproj/
├── secret/
├── secretproj/
├── films/
├── blogs/
└── contact/
```

### 3.1 根目录

根目录主要放置全站入口和公共文件：

- `index.html`：网站首页。
- `navbar.html`：全站共用导航栏 HTML 片段。
- `CNAME`：自定义域名配置。
- `README.md`、`DEVELOPMENT.md` 等：项目文档。

### 3.2 `assets/` 公共资源目录

`assets/` 用于存放全站共享资源：

- `assets/css/styles.css`：全站统一样式。
- `assets/js/loadNavbar.js`：动态加载导航栏。
- `assets/js/menu.js`：移动端菜单展开/关闭逻辑。
- `assets/js/navunderline.js`：根据当前路径设置导航 active 状态。
- `assets/js/fullscreen.js`：图片点击放大逻辑，目前部分页面注释未启用。
- `assets/fonts/`：字体文件。

当前项目已经完成第一阶段资源归档，旧的重复 CSS/JS 已基本迁移到 `assets/` 下。

### 3.3 `pic/` 媒体资源目录

`pic/` 是图片和视频封面资源的核心目录，按内容类型分组：

```text
pic/
├── makeup/
├── photo/
├── secret/
├── film/
└── contact/
```

其中：

- `pic/makeup/` 存放妆发作品图片。
- `pic/photo/` 存放摄影作品图片。
- `pic/secret/` 存放秘密项目图片。
- `pic/film/` 存放视频封面图。
- `pic/contact/` 存放联系页/个人介绍相关图片。

## 4. 页面组织逻辑

### 4.1 首页

文件：`index.html`

首页是混合精选页，直接从多个分类中挑选图片展示。它包含：

- 妆发精选作品入口。
- 摄影精选作品入口。
- Secret 精选作品入口。
- Films 视频封面入口。

首页不是自动读取分类页内容，而是手动维护 `<a>` 和 `<img>` 列表。某些作品是否展示在首页，通过手动添加、删除或注释 HTML 控制。

### 4.2 分类总览页

分类总览页包括：

- `makeup/index.html`
- `photo/index.html`
- `secret/index.html`

这些页面的主要结构类似：

```html
<section id="home">
  <div class="gallery">
    <a href="/photoproj/photo9.html">
      <img src="/pic/photo/photo9_manchengRoom/photo9_0.webp" alt="photo9" loading="lazy" class="fullscreenImage"/>
    </a>
  </div>
</section>
```

设计逻辑：

1. 每个 `<a>` 表示一个作品集入口。
2. `<img>` 是该作品集封面图。
3. `href` 指向对应详情页。
4. `loading="lazy"` 用于浏览器原生懒加载。
5. `fullscreenImage` 用于图片放大功能的绑定类名。

### 4.3 作品详情页

详情页目录包括：

- `makeupproj/`
- `photoproj/`
- `secretproj/`

详情页用于展示单个作品集的多张图片，通常结构如下：

```html
<section id="home">
  <div class="gallery">
    <img src="../pic/photo/photo9_manchengRoom/photo9_0.webp" alt="photo9_0" loading="lazy" class="fullscreenImage"/>
    <img src="../pic/photo/photo9_manchengRoom/photo9_1.webp" alt="photo9_1" loading="lazy" class="fullscreenImage"/>
  </div>
</section>
```

设计逻辑：

1. 详情页不再使用 `<a>` 包裹图片，图片本身就是展示对象。
2. 图片按希望观看的顺序手动排列。
3. 若某张图片暂不展示，通常通过 HTML 注释隐藏。
4. 部分详情页会拆成多个 `.gallery`，用于人为分段或控制视觉节奏。

### 4.4 Films 页面

文件：

- `films/index.html`
- 首页中的 Films 区块也有类似结构。

Films 页面使用本地封面图加 B 站播放器地址：

```html
<div class="video-placeholder" data-src="https://player.bilibili.com/player.html?bvid=...">
  <img src="/pic/film/film_fog.webp" alt="fog">
</div>
```

设计逻辑：

1. 初始只展示封面图，避免页面一开始加载多个 iframe。
2. 用户点击封面后，JavaScript 创建 `<iframe>`。
3. 原封面容器被 iframe 替换。
4. 视频封面统一放在 `pic/film/`。

### 4.5 Blog 页面

博客列表页为 `blogs/index.html`，文章以单独 HTML 文件形式存放，例如：

```text
blogs/blog250604.html
```

当前命名方式使用 `blog + 日期`，如 `blog250604.html` 表示 2025-06-04 的文章。

博客入口目前是手动维护链接：

```html
<a href="/blogs/blog250604.html">
  <span>2025-06-04</span>
  <span>红</span>
</a>
```

### 4.6 Contact 页面

文件：`contact/index.html`

Contact 页面包含：

- 个人介绍文字。
- 联系页图片。
- 邮箱和微信信息。
- 部分页面内联样式。

该页面因为布局独立，存在较多 `<style>` 内联 CSS。后续如需统一维护，可逐步迁移到 `assets/css/styles.css`。

## 5. 命名规范

当前项目命名以“内容类型 + 编号 + 描述”为主，整体具有一定规律，但仍有部分历史命名不完全统一。

### 5.1 一级目录命名

一级目录采用小写英文单词：

```text
makeup/
photo/
secret/
films/
blogs/
contact/
```

详情页目录采用“分类名 + proj”的形式：

```text
makeupproj/
photoproj/
secretproj/
```

### 5.2 作品集图片目录命名

图片目录通常采用：

```text
分类前缀 + 编号 + "_" + 英文描述
```

示例：

```text
pic/makeup/makeup4_Chongsheng/
pic/makeup/makeup9_ManchengRoom/
pic/photo/photo9_manchengRoom/
pic/secret/secret8_Mountain/
```

其中：

- `makeup4`、`photo9`、`secret8` 表示分类和编号。
- `_Chongsheng`、`_ManchengRoom`、`_Mountain` 表示项目描述。
- 英文描述有大小写混用情况，这是当前历史命名现状。

### 5.3 图片文件命名

图片文件通常采用：

```text
分类前缀 + 编号 + "_" + 图片序号 + ".webp"
```

示例：

```text
makeup9_0.webp
makeup9_1.webp
photo5_6.webp
secret8_4.webp
```

少数特殊摄影项目保留原始导出式命名：

```text
photo1_1.13.1.webp
photo2_1.4.1.webp
```

这些文件名可读性较弱，但能保留原始拍摄/导出顺序信息。后续如需统一，可建立映射表，而不是直接重命名破坏现有引用。

### 5.4 HTML 页面命名

分类详情页命名通常对应作品编号：

```text
makeupproj/makeup5.html
photoproj/photo9.html
secretproj/secret8.html
```

特殊情况：

- `makeupproj/makeup1and2.html` 表示两个相关妆发项目合并展示。
- `makeupproj/hair1.html` 表示 hair practice 类内容。
- `photoproj/photo4_1.html` 和 `photoproj/photo4_2.html` 表示同一大项目下拆分出的两个详情页。

### 5.5 CSS 类名命名

常用类名包括：

| 类名 | 用途 |
| --- | --- |
| `.navbar` | 顶部固定导航 |
| `.logo` | 中央品牌文字 |
| `.menu` | 导航菜单 |
| `.hamburger` | 移动端菜单按钮 |
| `.close-btn` | 菜单关闭按钮/图片放大关闭按钮 |
| `.gallery` | 图片画廊容器 |
| `.fullscreenImage` | 可点击放大的图片 |
| `.video-container` | 视频列表容器 |
| `.video-placeholder` | 视频封面占位容器 |
| `.blog-list` | 博客列表 |
| `.contact-gallery` | 联系页图片容器 |

需要注意：`.close-btn` 同时被移动端菜单和图片放大层使用，后续维护时应避免样式互相影响。

## 6. 公共导航设计

导航栏单独存放在 `navbar.html`，各页面通过：

```html
<div id="navbar"></div>
<script src="/assets/js/loadNavbar.js"></script>
<script src="/assets/js/navunderline.js"></script>
```

动态加载导航 HTML。

导航结构：

```text
LeeU2
Home | Makeup&Hair | Photo | Secret | Films | Blog | Contact
```

桌面端：

- 导航固定在页面顶部。
- Logo 居中。
- 菜单横向排列。

移动端：

- 显示 hamburger 按钮。
- 点击后全屏展开菜单。
- 点击关闭按钮或窗口变宽后收起菜单。

active 状态逻辑由路径判断：

- 路径包含 `blogs` 或 `blog`，高亮 Blog。
- 路径包含 `films` 或 `film`，高亮 Films。
- 路径包含 `secret` 或 `secretproj`，高亮 Secret。
- 路径包含 `photo` 或 `photoproj`，高亮 Photo。
- 路径包含 `contact`，高亮 Contact。
- 路径包含 `makeup`，高亮 Makeup&Hair。
- 否则高亮 Home。

## 7. 样式设计逻辑

全站主要样式集中在 `assets/css/styles.css`。

### 7.1 视觉基调

主要规则：

- `body` 背景为黑色。
- 全局文字强制为红色。
- 图片使用红色边框。
- hover 时图片轻微放大，边框变白。

```css
body {
  background-color: #000;
  color: red;
}

* {
  color: red !important;
}
```

这种写法保证视觉统一，但也会让局部页面很难单独设置其他文字颜色。后续如果需要更精细设计，可逐步移除全局 `!important`。

### 7.2 画廊布局

`.gallery` 使用纵向 flex 布局：

- 图片居中。
- 图片之间使用 `gap` 留白。
- 最大宽高受视口限制。
- 适合逐张观看作品。

当前不是瀑布流，也不是多列缩略图网格，而是偏沉浸式的单列作品展示。

### 7.3 响应式逻辑

主要断点：

- `max-width: 768px`：移动端导航和视频布局适配。
- `max-width: 480px`：更小屏幕的视频间距和宽度调整。

移动端重点处理：

- 导航菜单全屏展开。
- 图片和视频宽度接近屏幕宽度。
- 图片放大层尺寸调整。

## 8. JavaScript 设计逻辑

当前 JavaScript 较轻量，主要用于增强交互。

### 8.1 `loadNavbar.js`

职责：

- 请求 `/navbar.html`。
- 将导航 HTML 注入 `#navbar`。
- 导航加载完成后调用 `bindMenuEvents()` 绑定移动端菜单事件。

### 8.2 `menu.js`

职责：

- 绑定 hamburger 打开菜单。
- 绑定 close 按钮关闭菜单。
- 菜单打开时给 `body` 添加 `no-scroll`，禁止页面滚动。
- 屏幕宽度大于 768px 时自动关闭移动端菜单。

### 8.3 `navunderline.js`

职责：

- 根据当前 URL 路径判断所属版块。
- 给对应导航链接添加 `active` 类。

注意：该文件中也包含一次 `fetch('navbar.html')` 的逻辑，和 `loadNavbar.js` 在职责上有重叠。当前页面通常两个脚本都引用，后续优化时建议合并导航加载与 active 状态设置，避免重复请求和时序问题。

### 8.4 `fullscreen.js`

职责：

- 给 `.fullscreenImage` 图片绑定点击事件。
- 点击后创建全屏遮罩层。
- 在遮罩中展示放大的图片。
- 点击关闭按钮或遮罩关闭。

注意：当前很多页面对 `fullscreen.js` 的引用处于注释状态，因此 `.fullscreenImage` 类名虽然存在，但放大功能不一定在所有页面启用。

## 9. 内容维护流程

### 9.1 新增妆发/摄影/Secret 图片集

当前推荐按现有模式操作：

1. 在 `pic/` 对应分类下创建图片目录。

   ```text
   pic/photo/photo10_ProjectName/
   ```

2. 将图片转为 `.webp` 后放入目录。

   ```text
   photo10_0.webp
   photo10_1.webp
   photo10_2.webp
   ```

3. 在对应详情页目录创建 HTML。

   ```text
   photoproj/photo10.html
   ```

4. 在详情页中按展示顺序手写 `<img>`。

5. 在分类总览页添加封面入口。

   ```text
   photo/index.html
   ```

6. 如需在首页展示，再修改 `index.html`。

### 9.2 新增电影视频

1. 将视频封面放入 `pic/film/`。
2. 在 `films/index.html` 中新增 `.video-placeholder`。
3. 在 `data-src` 中填入 B 站播放器地址。
4. 如需首页展示，同步修改 `index.html` 的 Films 区块。

### 9.3 新增博客

1. 在 `blogs/` 下新增文章 HTML。

   ```text
   blogs/blogYYMMDD.html
   ```

2. 在 `blogs/index.html` 中新增文章链接。

## 10. 当前规范中的不一致点

这些不是错误，而是原有项目自然演进留下的差异。后续优化时可以逐步统一。

1. 图片目录英文描述大小写不完全统一。

   示例：`makeup9_ManchengRoom` 与 `photo9_manchengRoom`。

2. 部分图片文件保留原始复杂编号。

   示例：`photo1_1.13.1.webp`。

3. `navunderline.js` 和 `loadNavbar.js` 职责有重叠。

4. 部分页面有内联 CSS 或内联 JavaScript。

   示例：`contact/index.html`、`films/index.html`。

5. 是否展示某张图片主要依赖 HTML 注释。

6. 首页、分类页、详情页的数据重复维护。

   同一个作品可能同时出现在：

   - `index.html`
   - 分类页 `index.html`
   - 详情页 HTML

7. `.close-btn` 类名被不同功能复用。

8. `fullscreen.js` 文件存在，但很多页面当前未启用。

## 11. 后续演进方向

在保持现有视觉和目录关系的基础上，后续最自然的优化方向是内容数据化：

```text
assets/data/projects.json
```

将以下信息从 HTML 中抽离：

- 项目 ID。
- 所属分类。
- 项目标题。
- 封面图。
- 详情页图片列表。
- 首页是否展示。
- 分类页是否展示。
- 单张图片是否隐藏。
- 图片排序。
- 视频封面和 B 站地址。

然后由统一 JS 渲染：

- 首页精选区。
- 分类总览页。
- 作品详情页。
- Films 视频列表。

这样可以保留当前静态网站的部署方式，同时显著降低图片集更新成本。

## 12. 建议的新内容命名约定

为了让后续更新更稳定，建议新增内容尽量遵循以下命名：

### 12.1 作品目录

```text
pic/{category}/{category}{number}_{ProjectName}/
```

示例：

```text
pic/photo/photo10_NightGarden/
pic/makeup/makeup10_SilverLine/
pic/secret/secret9_RedRoom/
```

### 12.2 图片文件

```text
{category}{number}_{index}.webp
```

示例：

```text
photo10_0.webp
photo10_1.webp
makeup10_0.webp
secret9_0.webp
```

### 12.3 详情页

```text
{category}proj/{category}{number}.html
```

示例：

```text
photoproj/photo10.html
makeupproj/makeup10.html
secretproj/secret9.html
```

### 12.4 博客文章

```text
blogs/blogYYMMDD.html
```

示例：

```text
blogs/blog260430.html
```

如果一日多篇，可追加短标题：

```text
blogs/blog260430-red.html
```

## 13. 总结

当前项目的核心设计逻辑是：

1. 用静态 HTML 组织不同内容版块。
2. 用 `pic/` 按类型管理媒体资源。
3. 用 `assets/` 管理全站公共样式和脚本。
4. 用分类页展示作品封面。
5. 用 `*proj/` 详情页展示完整图片集。
6. 用统一导航连接所有版块。

它的优点是结构直观、部署简单、对静态托管友好。主要维护成本来自图片和页面内容没有数据化，导致新增作品时需要同步修改多个 HTML 文件。后续若要支持图片集频繁更新，建议以本文件记录的现有结构为基础，逐步引入 `projects.json`、通用渲染脚本和本地可视化编辑页面。
