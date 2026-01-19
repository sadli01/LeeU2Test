# 导航栏测试指南

## 快速测试

1. 启动本地服务器：
```bash
cd /Users/yuli/code_proj/code/LeeU2/LeeU2Test
python3 -m http.server 8000
```

2. 在浏览器打开以下页面进行测试：

### 主要页面
- ✅ 首页: http://localhost:8000/
- ✅ 化妆总览: http://localhost:8000/makeup/
- ✅ 摄影总览: http://localhost:8000/photo/
- ✅ 秘密总览: http://localhost:8000/secret/
- ✅ 电影: http://localhost:8000/films/
- ✅ 博客: http://localhost:8000/blogs/
- ✅ 联系: http://localhost:8000/contact/

### 详情页（重点测试）
- ✅ 化妆详情: http://localhost:8000/makeupproj/makeup1and2.html
- ✅ 化妆详情: http://localhost:8000/makeupproj/makeup4.html
- ✅ 摄影详情: http://localhost:8000/photoproj/photo4_1.html
- ✅ 秘密详情: http://localhost:8000/secretproj/secret1.html

## 检查项目

### 导航栏显示
- [ ] 导航栏正确显示在页面顶部
- [ ] Logo "LeeU2" 居中显示
- [ ] 所有导航链接显示正常
- [ ] 导航栏固定在顶部（滚动时不消失）

### 导航功能
- [ ] 点击导航链接可以正常跳转
- [ ] 当前页面的导航项有下划线高亮
- [ ] 从详情页点击导航可以返回总览页

### 移动端测试（窗口宽度 < 768px）
- [ ] 汉堡菜单图标显示
- [ ] 点击汉堡菜单，全屏菜单打开
- [ ] 点击 X 按钮，菜单关闭
- [ ] 菜单打开时，页面禁止滚动

### 浏览器控制台
- [ ] 无 JavaScript 错误
- [ ] 无 404 错误
- [ ] 看到 "Navbar loaded successfully" 日志

## 调试技巧

### 如果导航栏不显示

1. 打开浏览器开发者工具（F12）
2. 检查 Console 选项卡是否有错误
3. 检查 Network 选项卡，确认：
   - `/navbar.html` 请求成功（状态码 200）
   - `/assets/js/loadNavbar.js` 加载成功
   - `/assets/js/menu.js` 加载成功

### 如果菜单事件不响应

1. 在控制台输入：
```javascript
document.getElementById('menu')
```
应该返回菜单元素，而不是 null

2. 检查是否有 JavaScript 错误阻止了事件绑定

### 如果路径错误

确保使用本地服务器访问，而不是直接打开 HTML 文件（file:// 协议）。
fetch API 需要 HTTP 协议才能正常工作。

## 预期结果

所有页面都应该：
1. 在顶部显示导航栏
2. 可以通过导航栏跳转到其他页面
3. 当前页面的导航项有下划线高亮
4. 移动端可以使用汉堡菜单

## 问题报告

如果遇到问题，请检查：
- 浏览器控制台的错误信息
- Network 选项卡的请求状态
- 确认所有文件路径正确

成功测试后，即可部署到 GitHub Pages！
