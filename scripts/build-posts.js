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
const outDir = './src/pages/blog'

// 博客模板文件路径
// 每篇文章都会使用这个模板
const template = fs.readFileSync('./src/layouts/post-template.html', 'utf-8')

/**
 * ========================================
 * 主处理逻辑
 * ========================================
 */

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
     * 步骤 1: 读取 Markdown 文件
     * 
     * fs.readFileSync(filePath, encoding)
     * - filePath: 文件完整路径（通过 path.join 构建）
     * - encoding: 文件编码，'utf-8' 表示 Unicode 编码
     * 
     * 返回值：文件内容字符串
     * 
     * 示例：
     * '# 我的第一篇文章\n\n这是文章内容'
     */
    const md = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    
    /**
     * 步骤 2: 将 Markdown 转换为 HTML
     * 
     * marked.parse(markdown) 是 marked 库的主要 API
     * - 输入：Markdown 格式的字符串
     * - 输出：HTML 格式的字符串
     * 
     * 转换示例：
     * 输入：'# 标题\n段落内容'
     * 输出：'<h1>标题</h1>\n<p>段落内容</p>'
     * 
     * marked 支持的 Markdown 特性：
     * - 标题（# - ######）
     * - 列表（有序和无序）
     * - 代码块和内联代码
     * - 粗体和斜体
     * - 链接和图片
     * - 块引用
     * - 表格
     * 等等...
     */
    const html = marked.parse(md)
    
    /**
     * 步骤 3: 将 HTML 内容注入到模板中
     * 
     * template.replace(searchValue, replaceValue)
     * - 在模板中查找 {{content}} 占位符
     * - 替换为生成的 HTML 内容
     * 
     * 模板假设：
     * post-template.html 中包含 {{content}} 占位符
     * 例如：
     * <article>
     *   <header>...</header>
     *   <div class="content">
     *     {{content}}
     *   </div>
     *   <footer>...</footer>
     * </article>
     * 
     * 替换后变成：
     * <article>
     *   <header>...</header>
     *   <div class="content">
     *     <h1>标题</h1>
     *     <p>文章内容</p>
     *   </div>
     *   <footer>...</footer>
     * </article>
     */
    const fullHtml = template.replace('{{content}}', html)
    
    /**
     * 步骤 4: 将完整的 HTML 写入到文件
     * 
     * fs.writeFileSync(filePath, data, encoding)
     * - filePath: 输出文件路径
     * - data: 要写入的内容
     * - encoding: 编码方式
     * 
     * 文件名转换：
     * 输入：'first-post.md'
     * 过程：
     * 1. file.replace('.md', '.html') → 'first-post.html'
     * 2. path.join(outDir, 'first-post.html') → './src/pages/blog/first-post.html'
     * 输出：生成 HTML 文件
     * 
     * 如果输出目录不存在，这一行会报错
     * 确保 ./src/pages/blog 目录已创建
     */
    fs.writeFileSync(path.join(outDir, file.replace('.md', '.html')), fullHtml)
  }
})

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