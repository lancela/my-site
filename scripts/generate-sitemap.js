/**
 * ========================================
 * 网站地图生成脚本
 * ========================================
 * 
 * 这个脚本在 npm run build 后执行，功能包括：
 * 1. 扫描 src/pages 目录中所有 .html 文件
 * 2. 生成相对于网站根目录的 URL
 * 3. 生成标准的 sitemap.xml 文件
 * 
 * 什么是 sitemap.xml？
 * - XML 格式的文件，列出网站所有页面的 URL
 * - 帮助搜索引擎（Google, Bing 等）发现和索引网站页面
 * - 是 SEO 的重要组成部分
 * - 通常放在 public/ 或网站根目录
 * - 在 robots.txt 中引用
 * 
 * 标准 sitemap.xml 格式：
 * <?xml version="1.0" encoding="UTF-8"?>
 * <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 *   <url><loc>https://example.com/</loc></url>
 *   <url><loc>https://example.com/about</loc></url>
 *   <url><loc>https://example.com/blog/post1</loc></url>
 * </urlset>
 * 
 * 集成到构建流程：
 * npm run build 会执行：
 * 1. node scripts/build-posts.js    （生成博客 HTML）
 * 2. vite build                      （Vite 构建）
 * 3. npm run sitemap                 （本脚本 - 生成地图）
 */

import fs from 'fs'                    // 文件系统模块
import path from 'path'                // 路径模块
import { fileURLToPath } from 'url'    // 获取当前文件路径

/**
 * ========================================
 * 获取脚本所在目录
 * ========================================
 * 
 * 在 ES Module 中没有 __dirname 全局变量（CommonJS 有）
 * 需要通过以下方式手动获取：
 * 
 * import.meta.url 返回当前模块的完整 URL
 * 例如：'file:///path/to/scripts/generate-sitemap.js'
 * 
 * fileURLToPath() 将 file:// URL 转换为本地文件路径
 * path.dirname() 获取文件所在目录
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * ========================================
 * 配置常量
 * ========================================
 */

// 源页面目录（包含所有 .html 文件）
const pagesDir = path.resolve(__dirname, '../src/pages')

// 网站基础 URL
// 从环境变量 SITE_URL 读取，如果没有则使用默认值
// 在构建流程中可以这样设置：
// SITE_URL=https://mywebsite.com npm run build
const siteUrl = process.env.SITE_URL || 'https://example.com'

/**
 * ========================================
 * 递归函数：获取所有 HTML 文件
 * ========================================
 * 
 * 这个函数的目的：
 * - 递归遍历目录树
 * - 找到所有 .html 文件
 * - 返回完整的文件路径数组
 * 
 * 参数：
 * - dir: 要扫描的目录路径
 * 
 * 返回：
 * - results: 找到的所有 .html 文件的完整路径数组
 * 
 * 为什么需要递归？
 * - 网站可能有多层目录结构（如 src/pages/blog/, src/pages/products/ 等）
 * - 递归确保能找到所有嵌套的 HTML 文件
 */
const getAllHtmlFiles = (dir) => {
  let results = []  // 存储找到的文件路径
  
  // fs.readdirSync(dir) - 同步读取目录中的所有项目（文件和目录）
  // 返回一个字符串数组，包含目录中所有项的名称
  const list = fs.readdirSync(dir)
  
  // 遍历目录中的每一项
  list.forEach(file => {
    // 构造完整的项目路径
    const filePath = path.join(dir, file)
    
    // 获取项目的文件统计信息（大小、类型、修改时间等）
    const stat = fs.statSync(filePath)
    
    // 判断这一项是目录还是文件
    if (stat && stat.isDirectory()) {
      /**
       * 如果是目录，递归处理
       * 
       * results.concat() 将递归调用的结果合并到主结果数组中
       * 这样可以平展嵌套的目录结构
       * 
       * 示例：
       * getAllHtmlFiles('src/pages') 可能会调用：
       * - getAllHtmlFiles('src/pages/blog')
       * - getAllHtmlFiles('src/pages/products')
       * 等等
       */
      results = results.concat(getAllHtmlFiles(filePath))
    } else if (file.endsWith('.html')) {
      /**
       * 如果是 .html 文件，添加到结果数组
       * 
       * 只收集 HTML 文件，忽略其他类型的文件
       * 例如 .css, .js, .map 等都会被忽略
       */
      results.push(filePath)
    }
  })
  
  return results
}

/**
 * ========================================
 * 获取所有 HTML 文件
 * ========================================
 * 
 * 调用递归函数，扫描 pagesDir 及其所有子目录
 * 返回所有 .html 文件的完整路径
 * 
 * 示例结果：
 * [
 *   '/absolute/path/to/src/pages/index.html',
 *   '/absolute/path/to/src/pages/about.html',
 *   '/absolute/path/to/src/pages/blog/first-post.html',
 *   '/absolute/path/to/src/pages/blog/second-post.html',
 *   ...
 * ]
 */
const files = getAllHtmlFiles(pagesDir)

/**
 * ========================================
 * 转换文件路径为网站 URL
 * ========================================
 * 
 * 需要进行的转换：
 * 
 * 输入（文件路径）：
 * /absolute/path/to/src/pages/blog/first-post.html
 * 
 * 输出（网站 URL）：
 * https://example.com/blog/first-post.html
 * 
 * 转换步骤：
 * 1. path.relative() 获取相对于 pagesDir 的相对路径
 *    → blog/first-post.html (使用系统路径分隔符)
 * 2. .replace(/\\/g, '/') 将 Windows 反斜杠替换为正斜杠
 *    → blog/first-post.html (确保使用 / 而不是 \\)
 * 3. 处理特殊情况：index.html 应该显示为目录 URL
 * 4. 拼接成完整的网站 URL
 */
const urls = files.map(file => {
  // 获取相对路径
  // 示例：blog/first-post.html 或 about.html 或 index.html
  let relative = path.relative(pagesDir, file)
  
  // 将 Windows 反斜杠替换为正斜杠（确保 URL 兼容性）
  // Windows: blog\\first-post.html → blog/first-post.html
  // Unix: 无变化
  relative = relative.replace(/\\/g, '/')
  
  /**
   * 处理 index.html 特殊情况
   * 
   * index.html 在网址中通常省略
   * https://example.com/index.html 等价于 https://example.com/
   * 
   * sitemap 应该使用目录 URL 而不是 index.html
   */
  if (relative === 'index.html') relative = ''
  
  /**
   * 拼接完整的网站 URL
   * 
   * 示例：
   * - '' → 'https://example.com/'
   * - 'about.html' → 'https://example.com/about.html'
   * - 'blog/first-post.html' → 'https://example.com/blog/first-post.html'
   */
  return `${siteUrl}/${relative}`
})

/**
 * ========================================
 * 生成 sitemap.xml 内容
 * ========================================
 * 
 * sitemap.xml 是一个标准的 XML 文件
 * 搜索引擎爬虫会读取这个文件来发现网站页面
 * 
 * 标准格式：
 * - XML 声明行
 * - <urlset> 根元素
 * - 多个 <url> 元素
 * - 每个 <url> 包含 <loc> 子元素（页面 URL）
 * 
 * 可选元素（这个脚本暂未使用）：
 * - <lastmod>: 页面最后修改时间
 * - <changefreq>: 建议爬虫多久抓取一次（never, yearly, monthly, weekly, daily, hourly, always）
 * - <priority>: 页面优先级 (0.0 - 1.0)
 * 
 * 生成过程：
 * 1. 开始标签：XML 声明和 urlset 开始
 * 2. 循环：为每个 URL 生成 <url><loc>...</loc></url>
 * 3. 结束标签：urlset 结束
 */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`

/**
 * ========================================
 * 写入 sitemap.xml 文件
 * ========================================
 * 
 * fs.writeFileSync(filePath, data)
 * - filePath: 输出文件路径
 * - data: 要写入的内容（sitemap 字符串）
 * 
 * 文件位置：
 * path.resolve(__dirname, '../public/sitemap.xml')
 * → 项目根目录的 public/sitemap.xml
 * 
 * 为什么放在 public？
 * - public 目录中的文件会被直接复制到网站根目录
 * - 这样 sitemap.xml 就在网站根目录，搜索引擎可以轻易找到
 * - 标准做法是把 sitemap.xml 放在 domain.com/sitemap.xml
 * 
 * 谁会读取这个文件？
 * - Google Search Console: 用户手动提交
 * - robots.txt: 'Sitemap: https://example.com/sitemap.xml'
 * - 搜索引擎爬虫: 直接访问 /sitemap.xml
 */
fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), sitemap)

/**
 * ========================================
 * 脚本执行流程总结
 * ========================================
 * 
 * 1. 递归扫描 src/pages 目录
 * 2. 收集所有 .html 文件的完整路径
 * 3. 将文件路径转换为网站 URL
 * 4. 处理 index.html 的特殊情况
 * 5. 生成标准 sitemap.xml 格式
 * 6. 写入 public/sitemap.xml 文件
 * 
 * 输出示例：
 * public/sitemap.xml 会包含：
 * <?xml version="1.0" encoding="UTF-8"?>
 * <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 *   <url><loc>https://example.com/</loc></url>
 *   <url><loc>https://example.com/about.html</loc></url>
 *   <url><loc>https://example.com/blog/first-post.html</loc></url>
 * </urlset>
 * 
 * 调试技巧：
 * 运行此脚本后，检查生成的 sitemap.xml：
 * node scripts/generate-sitemap.js
 * 
 * 验证 sitemap：
 * - 用文本编辑器打开 public/sitemap.xml
 * - 确保所有页面都被列出
 * - 确保 URL 格式正确
 * - 上传到 Google Search Console 验证
 */
console.log('Sitemap generated')