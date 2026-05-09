# 项目完整文档

## 📋 目录

1. [Vite 构建工具](#vite-构建工具)
2. [Tailwind CSS](#tailwind-css)
3. [PostCSS](#postcss)
4. [npm 脚本](#npm-脚本)
5. [项目结构](#项目结构)
6. [构建流程](#构建流程)

---

## 🚀 Vite 构建工具

### 什么是 Vite？

Vite 是一个现代化的前端构建工具，具有以下特点：

- **极速冷启动**：使用原生 ES Modules 和 esbuild 实现毫秒级启动
- **热模块替换 (HMR)**：修改代码后立即看到变化，无需刷新页面
- **生产构建优化**：使用 Rollup 进行代码分割、压缩和优化
- **零配置开发体验**：开箱即用的开发服务器

### vite.config.js 关键配置

```javascript
{
  root: 'src/pages',           // 项目根目录 - Vite 从这里提供文件
  publicDir: '../../public',   // 静态资源目录 - 直接复制到输出目录

  server: {                     // 开发服务器配置
    port: 3000,                 // 监听端口 3000
    open: true,                 // 启动时自动打开浏览器
  },

  build: {                      // 生产构建配置
    outDir: '../../dist',       // 输出目录
    emptyOutDir: true,          // 构建前清空输出目录
    rollupOptions: {            // Rollup 打包配置
      input: {                  // 指定多个入口文件
        main: 'src/pages/index.html',
        about: 'src/pages/about.html',
      }
    }
  },

  plugins: [                    // 自定义插件
    layoutInjectPlugin(),       // 自定义插件：在构建时注入页眉和页脚
  ]
}
```

### 自定义插件：layoutInjectPlugin()

**功能**：在 HTML 构建过程中自动注入页眉和页脚

**工作原理**：

1. 识别 HTML 中的占位符 `<!--header-->` 和 `<!--footer-->`
2. 用实际的布局内容替换这些占位符
3. 在开发和生产构建中都会执行

**优势**：

- 避免在每个 HTML 文件中重复页眉和页脚代码
- 集中管理网站的公共部分
- 修改布局时自动应用到所有页面

### 开发 vs 生产构建

#### 开发模式 (`npm run dev`)

```bash
$ npm run dev
```

- 启动本地开发服务器（http://localhost:3000）
- 自动打开浏览器
- 支持 HMR - 修改代码立即看到效果
- 代码未压缩，便于调试

#### 生产构建 (`npm run build`)

```bash
$ npm run build
```

执行顺序：

1. `node scripts/build-posts.js` - 生成博客 HTML 文件
2. `vite build` - 执行 Vite 生产构建
3. `npm run sitemap` - 生成网站地图

输出结果：

- `dist/` 目录包含优化后的网站
- 代码压缩并去除未使用的 CSS
- 静态资源由 Rollup 处理和优化

---

## 🎨 Tailwind CSS

### 什么是 Tailwind CSS？

Tailwind 是一个实用优先 (Utility-First) 的 CSS 框架：

- 提供丰富的预定义类名
- 无需编写自定义 CSS，直接在 HTML 中组合使用
- 自动清除未使用的 CSS，显著减小文件大小
- 完全可定制的配置系统

### 核心概念

#### 工具类 (Utility Classes)

```html
<!-- 直接在 HTML 中使用 Tailwind 类 -->
<div class="bg-blue-500 text-white p-4 rounded-lg">
  蓝色背景、白色文字、内边距、圆角
</div>
```

#### @layer 指令

Tailwind 将样式分为三层，优先级递增：

**1. base 层 - 基础样式**

```css
@layer base {
  body { ... }  /* 重置浏览器默认样式 */
  html { ... }  /* 全局 HTML 样式 */
}
```

- 用于重置浏览器默认样式
- 定义基础元素的外观
- 优先级最低

**2. components 层 - 组件样式**

```css
@layer components {
  .btn-primary { ... }      /* 按钮组件 */
  .card-surface { ... }     /* 卡片组件 */
  .section-title { ... }    /* 标题组件 */
}
```

- 定义可复用的 UI 组件
- 由多个工具类组成
- 减少 HTML 中的类名数量

**3. utilities 层 - 工具类**

```css
@layer utilities {
  .text-shadow-soft { ... }  /* 自定义工具类 */
}
```

- 单一用途的类
- 优先级最高
- 在 HTML 中最后使用

### tailwind.config.js 配置说明

```javascript
{
  content: [
    "./src/pages/**/*.{html,js}",    // 扫描的页面文件
    "./src/layouts/**/*.html",        // 扫描的布局文件
    "./src/js/**/*.js",               // 扫描的 JavaScript 文件
  ],

  theme: {
    extend: {                         // 扩展而不是覆盖默认主题
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // 定义使用的字体
      }
    }
  },

  plugins: []                          // 第三方插件（当前未使用）
}
```

### 内容路径配置的重要性

**为什么需要明确指定？**

- Tailwind 需要知道从哪些文件中提取类名
- 只有在这些文件中使用过的类才会被生成
- 未被扫描的文件中的样式会被忽略
- 减少不必要的扫描可以加快构建速度

**如果遗漏了某个文件**

```html
<!-- 如果 src/components/widget.html 没有在 content 中列出 -->
<!-- 这些样式可能不会被生成 -->
<div class="bg-red-500 hover:bg-red-600">...</div>
```

### 响应式设计

Tailwind 使用 mobile-first 断点系统：

```html
<!-- 手机优先：默认样式应用于手机 -->
<div class="text-sm md:text-base lg:text-lg xl:text-xl">
  <!-- 手机: 小 -->
  <!-- 平板 (md): 中 -->
  <!-- 桌面 (lg): 大 -->
  <!-- 超大屏 (xl): 超大 -->
</div>
```

常见断点：

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 自定义样式

#### 通过 theme.extend 添加

```javascript
theme: {
  extend: {
    colors: {
      brand: '#FF5733',  // 添加自定义颜色
    }
  }
}
```

#### 通过 @layer components 添加

```css
@layer components {
  .btn-custom {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600;
  }
}
```

这样可以在 HTML 中简单使用：

```html
<button class="btn-custom">点击我</button>
```

---

## 🔧 PostCSS

### 什么是 PostCSS？

PostCSS 是使用 JavaScript 插件转换 CSS 的工具：

- 处理 `@import` 和 `@layer` 指令
- 应用 Tailwind 插件生成工具类
- 应用 Autoprefixer 添加浏览器前缀
- 优化和压缩 CSS

### CSS 处理流程

```
源文件 (main.css)
    ↓
PostCSS 读取
    ↓
Tailwind 插件处理
  - 识别 @import "tailwindcss"
  - 扫描 content 配置中的文件
  - 生成所有使用过的工具类
    ↓
Autoprefixer 插件处理
  - 添加浏览器前缀 (-webkit-, -moz- 等)
  - 确保跨浏览器兼容性
    ↓
输出 CSS
    ↓
注入到 HTML 或外部文件
```

### postcss.config.js 详细说明

```javascript
{
  plugins: {
    '@tailwindcss/postcss': {
      // Tailwind CSS 核心插件
      // 注册 @import "tailwindcss" 指令的处理
      // 生成所有预定义的工具类
    },

    autoprefixer: {
      // 自动添加浏览器前缀
      // 根据 .browserslistrc 配置的浏览器范围
      // 示例转换:
      // 输入:  display: flex;
      // 输出:  display: -webkit-flex;  /* Chrome, Safari */
      //        display: flex;
    }
  }
}
```

### 浏览器兼容性配置

项目可以添加 `.browserslistrc` 文件指定目标浏览器：

```
> 1%              # 全球市场份额大于 1% 的浏览器
last 2 versions   # 每个浏览器的最后两个版本
not dead          # 仍在积极维护的浏览器
```

Autoprefixer 会根据此配置添加必要的前缀。

---

## 📦 npm 脚本

### package.json 脚本说明

```json
{
  "scripts": {
    "dev": "vite",
    "build": "node scripts/build-posts.js && vite build && npm run sitemap",
    "preview": "vite preview",
    "sitemap": "node scripts/generate-sitemap.js"
  }
}
```

### 各脚本详解

#### 1. `npm run dev` - 开发模式

```bash
$ npm run dev
```

- 启动 Vite 开发服务器
- 监听 localhost:3000
- 自动打开浏览器
- 支持热模块替换 (HMR)
- 修改代码立即生效

**适用场景**：日常开发，需要快速反馈

#### 2. `npm run build` - 生产构建

```bash
$ npm run build
```

执行三个步骤（按顺序）：

**步骤 1: 生成博客 HTML**

```bash
node scripts/build-posts.js
```

- 读取 `src/content/posts` 中的所有 Markdown 文件
- 使用 marked 库转换为 HTML
- 注入到博客模板中
- 生成 `src/pages/blog/*.html` 文件

**步骤 2: Vite 生产构建**

```bash
vite build
```

- 执行多页面应用构建
- 调用自定义 `layoutInjectPlugin` 注入布局
- 代码压缩和优化
- 生成 `dist/` 目录中的最终文件

**步骤 3: 生成网站地图**

```bash
npm run sitemap
```

- 生成 `public/sitemap.xml`
- 列出网站所有页面的 URL
- 供搜索引擎使用

**适用场景**：准备发布到生产环境

#### 3. `npm run preview` - 预览生产构建

```bash
$ npm run preview
```

- 本地预览生产构建的结果
- 启动静态服务器供应 `dist/` 目录
- 验证生产构建是否正常

**适用场景**：发布前验证生产版本效果

#### 4. `npm run sitemap` - 单独生成网站地图

```bash
$ npm run sitemap
```

- 单独执行网站地图生成脚本
- 扫描 `src/pages` 目录中的所有 HTML
- 生成标准的 sitemap.xml
- 放在 `public/sitemap.xml`

**适用场景**：添加新页面后单独更新地图

---

## 🗂️ 项目结构

```
my-site/
├── public/                      # 静态资源（直接复制到输出）
│   ├── robots.txt              # SEO 配置
│   ├── sitemap.xml             # 网站地图
│   ├── images/                 # 图片资源
│   ├── js/                     # 静态 JavaScript
│   └── styles/                 # 静态样式
│
├── scripts/                    # 构建脚本
│   ├── build-posts.js          # Markdown 转 HTML
│   └── generate-sitemap.js     # 生成 sitemap.xml
│
├── src/                        # 源文件
│   ├── content/                # 内容
│   │   ├── convert.js          # 内容转换（预留）
│   │   └── posts/              # Markdown 文章
│   │       └── first-post.md
│   │
│   ├── js/                     # JavaScript 源文件
│   │   ├── main.js             # 主入口
│   │   └── contact.js          # 联系表单逻辑
│   │
│   ├── layouts/                # 页面布局模板
│   │   ├── head.html           # <head> 内容
│   │   ├── header.html         # 页眉
│   │   ├── footer.html         # 页脚
│   │   └── post-template.html  # 博客文章模板
│   │
│   ├── pages/                  # 页面源文件（Vite root）
│   │   ├── index.html          # 主页
│   │   ├── about.html          # 关于页面
│   │   ├── contact.html        # 联系页面
│   │   ├── blog/               # 博客目录
│   │   │   └── first-post.html # （自动生成）
│   │   ├── js/                 # 页面特定 JS
│   │   └── styles/             # 页面特定样式
│   │
│   └── styles/                 # 全局样式
│       └── main.css            # Tailwind 入口
│
├── ui/                         # UI 组件库（预留）
│
├── dist/                       # 生产输出（构建后生成）
│
├── vite.config.js              # Vite 配置
├── tailwind.config.js          # Tailwind CSS 配置
├── postcss.config.js           # PostCSS 配置
├── package.json                # 项目元数据和依赖
└── README.md                   # 项目说明
```

### 关键目录说明

| 目录                | 用途        | 注意事项             |
| ------------------- | ----------- | -------------------- |
| `src/pages`         | Vite 项目根 | Vite 从这里提供文件  |
| `public`            | 静态资源    | 直接复制，不经过处理 |
| `src/content/posts` | Markdown 源 | 自动转换为 HTML      |
| `src/layouts`       | 页面模板    | 由自定义插件注入     |
| `dist`              | 生产输出    | 包含优化后的网站     |

---

## 🔄 构建流程

### 完整的开发到发布流程

```
1. 开发阶段
   └─ npm run dev
      ├─ 启动开发服务器
      ├─ 支持 HMR
      └─ 文件修改立即生效

2. 编写内容
   └─ 创建 Markdown 文章
      └─ src/content/posts/*.md

3. 生产构建
   └─ npm run build
      ├─ Step 1: build-posts.js
      │  ├─ 读取 Markdown 文件
      │  ├─ marked 转换为 HTML
      │  └─ 生成 src/pages/blog/*.html
      │
      ├─ Step 2: vite build
      │  ├─ layoutInjectPlugin 注入布局
      │  ├─ 代码压缩和优化
      │  ├─ CSS 清除未使用类
      │  └─ 生成 dist/
      │
      └─ Step 3: npm run sitemap
         ├─ 扫描所有 HTML 文件
         ├─ 生成网站地图
         └─ 创建 public/sitemap.xml

4. 预览和发布
   ├─ npm run preview  # 验证生产版本
   └─ 上传 dist/ 到服务器
```

### 关键流程的工作原理

#### Markdown 到 HTML 的转换流程

```
first-post.md (Markdown)
    ↓
build-posts.js 读取
    ↓
marked 库转换
    ↓
HTML 内容
    ↓
插入 post-template.html
    ↓
first-post.html (生成)
```

#### 页面构建流程

```
src/pages/index.html
    ↓
Vite 处理
    ↓
layoutInjectPlugin 注入布局
    ↓
- 替换 <!--header-->
- 替换 <!--footer-->
    ↓
Tailwind 处理 CSS
    ↓
Autoprefixer 添加前缀
    ↓
dist/index.html (最终)
```

---

## 💡 常见任务和命令

### 任务 1: 添加新页面

```bash
# 1. 创建新的 HTML 文件
src/pages/services.html

# 2. 使用布局占位符
<body>
  <!--header-->
  <!-- 页面内容 -->
  <!--footer-->
</body>

# 3. 更新 vite.config.js 的 rollupOptions.input
{
  services: resolve(__dirname, 'src/pages/services.html'),
}

# 4. 开发模式测试
npm run dev

# 5. 生产构建
npm run build
```

### 任务 2: 添加新博客文章

```bash
# 1. 创建 Markdown 文件
src/content/posts/my-article.md

# 2. 编写内容（标准 Markdown 格式）
# 我的新文章

这是文章内容...

# 3. 运行构建命令
npm run build

# 此时会自动：
# - 将 my-article.md 转换为 HTML
# - 生成 src/pages/blog/my-article.html
# - 更新 sitemap.xml
```

### 任务 3: 修改全局样式

```bash
# 编辑 src/styles/main.css

# 可以：
# 1. 修改 @layer base 中的全局样式
# 2. 在 @layer components 中定义新组件
# 3. 在 @layer utilities 中添加工具类

# 开发模式会立即看到效果（HMR）
npm run dev
```

### 任务 4: 自定义 Tailwind 主题

```bash
# 编辑 tailwind.config.js

# 例如添加自定义颜色
theme: {
  extend: {
    colors: {
      brand: '#3B82F6',
    }
  }
}

# 然后在 HTML 中使用
<div class="bg-brand">品牌颜色</div>
```

---

## 🎯 最佳实践

### 1. 开发工作流

- 使用 `npm run dev` 进行本地开发
- 充分利用 HMR 快速反馈
- 定期提交代码

### 2. CSS 编写

- 优先使用 Tailwind 工具类
- 只在 `@layer components` 中定义复杂组件
- 避免写在 HTML 中的重复类

### 3. Markdown 编写

- 使用标准 Markdown 语法
- 合理组织文章结构（使用 #、##、### 等）
- 包含相关元数据（可在前置事项中添加）

### 4. 性能优化

- Tailwind 自动清除未使用的 CSS
- 确保 content 配置包含所有文件
- 生产构建时代码会自动压缩

### 5. SEO 优化

- 定期运行 `npm run build` 更新 sitemap
- 使用语义化 HTML 标签
- 包含合理的元标签和描述

---

## 🐛 常见问题排查

### 问题 1: 样式不生效

**可能原因**：

- 文件路径不在 `content` 配置中
- 使用了动态生成的类名

**解决方案**：

- 检查 `tailwind.config.js` 的 `content` 配置
- 确保文件被包含在扫描路径中

### 问题 2: 布局没有注入

**可能原因**：

- HTML 中的占位符格式错误
- 布局文件为空或包含特殊字符

**解决方案**：

- 确保使用正确的占位符格式：`<!--header-->` 和 `<!--footer-->`
- 检查布局文件是否存在且包含内容
- 查看 Vite 控制台的错误信息

### 问题 3: Markdown 转换失败

**可能原因**：

- Markdown 文件格式错误
- 文件编码不是 UTF-8

**解决方案**：

- 使用标准 Markdown 语法
- 确保文件使用 UTF-8 编码
- 检查是否有特殊字符问题

---

## 📚 参考资源

### 官方文档

- [Vite 官方文档](https://vitejs.dev/)
- [Tailwind CSS 官方文档](https://tailwindcss.com/)
- [PostCSS 官方文档](https://postcss.org/)

### 有用的工具

- [Tailwind 配置编辑器](https://tailwindcss.com/docs/configuration)
- [Marked 文档](https://marked.js.org/)
- [Can I Use](https://caniuse.com/) - 浏览器兼容性查询

---

**最后更新**: 2025 年 5 月 9 日
