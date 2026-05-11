/**
 * ========================================
 * Markdown 文章构建脚本
 * ========================================
 * 
 * 这个脚本在 npm run build 时执行，功能包括：
 * 1. 扫描 src/content/posts 目录中所有 .md 文件
 * 2. 使用 marked 库将 Markdown 转换为 HTML
 * 3. 将转换后的 HTML 注入到博客模板中
 * 4. 生成对应的 .html 文件到 src/pages/blog 目录
 * 
 * 工作流程：
 * .md 文件 → marked 转换 → HTML 内容 → 注入模板 → .html 文件
 * 
 * 这样做的好处：
 * - 使用 Markdown 编写内容，易于维护
 * - 自动生成 HTML，无需手动编辑
 * - 与 Vite 的多页面应用集成
 * - SEO 友好（生成的是真实 HTML 文件）
 * 
 * 使用 npm 脚本:
 * "build": "node scripts/build-posts.js && vite build && npm run sitemap"
 * build-posts.js 是构建流程的第一步
 */

import fs from 'fs'          // 文件系统模块 - 读写文件
import path from 'path'      // 路径模块 - 处理文件路径
import { marked } from 'marked'  // Markdown 解析库 - 将 Markdown 转换为 HTML
import matter from 'gray-matter' // Frontmatter 解析库

/**
 * ========================================
 * 配置常量
 * ========================================
 */

// Markdown 源文件目录
// 这里存放所有的博客文章 .md 文件
const postsDir = './src/content/posts'

// HTML 输出目录
// 转换后的 HTML 文件将被放在这里
// 这样 Vite 可以找到并处理这些 HTML 文件
const outDir = './src/pages'

// 确保输出目录存在
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

// 博客模板文件路径
// 每篇文章都会使用这个模板
const template = fs.readFileSync('./src/layouts/solutions-blog-template.html', 'utf-8')

/**
 * ========================================
 * 主处理逻辑
 * ========================================
 */

// 收集所有帖子信息用于生成索引
const posts = []

/**
 * fs.readdirSync(postsDir)
 * 
 * 同步读取目录中的所有文件
 * 返回文件名数组
 * 
 * 注：使用同步方法是因为这是在构建时执行的脚本
 * 构建过程通常是单次执行，同步不会影响性能
 * 
 * 如果是在运行时的服务器中，应该使用异步 fs.readdir()
 */
fs.readdirSync(postsDir).forEach(file => {
  // 只处理 .md 文件，跳过其他文件（如 .DS_Store 等）
  if (file.endsWith('.md')) {
    /**
     * 步骤 1: 读取 Markdown 文件并解析 frontmatter
     * 
     * matter(md) 解析 frontmatter 和内容
     * 返回 { data: frontmatter对象, content: markdown内容 }
     */
    const filePath = path.join(postsDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    
    // 生成 slug（文件名去掉 .md）
    const slug = file.replace('.md', '')
    
    // 设置默认值
    const postData = {
      title: data.title || '无标题',
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || '未分类',
      excerpt: data.excerpt || content.substring(0, 150).replace(/[#*`]/g, '').trim() + '...',
      slug: slug,
      fileName: file
    }
    
    posts.push(postData)
    
    /**
     * 步骤 2: 将 Markdown 转换为 HTML
     * 
     * marked.parse(markdown) 是 marked 库的主要 API
     * - 输入：Markdown 格式的字符串
     * - 输出：HTML 格式的字符串
     */
    const html = marked.parse(content)
    
    /**
     * 步骤 3: 将 HTML 内容和元数据注入到模板中
     * 
     * 替换模板中的占位符
     */
    let fullHtml = template
      .replace(/{{title}}/g, postData.title)
      .replace(/{{excerpt}}/g, postData.excerpt)
      .replace(/{{date}}/g, postData.date)
      .replace(/{{category}}/g, postData.category)
      .replace(/{{slug}}/g, postData.slug)
      .replace(/{{formattedDate}}/g, formatDate(postData.date))
      .replace('{{content}}', html)
    
    /**
     * 步骤 4: 将完整的 HTML 写入到文件
     * 
     * 输出到 src/pages/solutions/ 目录
     */
    const outputPath = path.join(outDir, `${slug}.html`)
    fs.writeFileSync(outputPath, fullHtml)
  }
})

// 生成博客索引页面
generateIndexPage(posts)

/**
 * 格式化日期为中文格式
 */
function formatDate(dateString) {
  const date = new Date(dateString)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 生成博客索引页面
 */
function generateIndexPage(posts) {
  // 按日期排序，最新的在前
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  const indexTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>解决方案 - LUMINA | 简约设计，点亮美好生活</title>
  <meta name="description" content="LUMINA 为不同场景提供专业的照明与生活解决方案，从家庭到办公，从室内到户外，满足您的全方位需求。">
  <meta name="keywords" content="照明解决方案,生活方案,LUMINA服务,专业咨询">
  <link rel="canonical" href="https://lumina.com/solutions">
  <script type="module" src="/js/main.js"></script>
  <style>
    @import '../styles/main.css';
  </style>
</head>
<body class="bg-slate-50 text-slate-950">
  <!--header-->

  <main class="min-h-screen py-24 px-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center">解决方案</h1>
      <p class="text-lg text-slate-600 mb-12 text-center">我们提供专业的照明与生活解决方案</p>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${posts.map(post => `
        <div class="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
          <h3 class="text-xl font-semibold mb-2">${post.title}</h3>
          <p class="text-slate-600 mb-4">${post.excerpt}</p>
          <div class="text-sm text-slate-500 mb-4">
            <span>${formatDate(post.date)}</span>
            <span class="mx-2">•</span>
            <span>${post.category}</span>
          </div>
          <a href="${post.slug}.html" class="text-blue-600 hover:text-blue-800 font-medium">阅读更多 →</a>
        </div>
        `).join('')}
      </div>
    </div>
  </main>

  <!--footer-->
</body>
</html>`

  fs.writeFileSync(path.join(outDir, 'solutions.html'), indexTemplate)
}

/**
 * ========================================
 * 脚本执行流程总结
 * ========================================
 * 
 * 1. 读取 post-template.html 内容到 template 变量
 * 2. 遍历 src/content/posts 目录中的所有文件
 * 3. 对于每个 .md 文件：
 *    a. 读取 Markdown 内容
 *    b. 转换为 HTML
 *    c. 注入到模板中
 *    d. 写入到对应的 .html 文件
 * 4. 脚本完成，Vite 随后处理这些新生成的 HTML 文件
 * 
 * 集成到构建流程：
 * npm run build 会执行：
 * 1. node scripts/build-posts.js    （本脚本）
 * 2. vite build                      （Vite 构建）
 * 3. npm run sitemap                 （生成站点地图）
 * 
 * 这确保了在 Vite 处理 HTML 时，所有博客文章都已经生成
 */