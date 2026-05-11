/**
 * ========================================
 * Vite 配置文件 - 静态网站生成器
 * ========================================
 * 
 * 本项目使用 Vite 作为前端构建工具，具有以下特点：
 * 1. 超快的冷启动和热更新 (HMR) - 使用 ES Module 和 esbuild
 * 2. 自定义插件系统 - 支持灵活的构建流程定制
 * 3. 优化的生产构建 - 使用 Rollup 进行代码打包和压缩
 * 4. 零配置开发服务器 - 开箱即用的本地开发环境
 * 
 * 关键概念：
 * - root: 项目根目录，Vite 将从这里提供文件
 * - publicDir: 静态资源目录，会被直接复制到输出目录
 * - build.outDir: 生产构建输出目录
 * - plugins: 自定义插件数组，用于扩展 Vite 功能
 */

import {
  defineConfig      // Vite 的类型感知配置函数
} from 'vite'
import {
  resolve,          // Node.js 路径解析工具
  relative
} from 'path'
import fs from 'fs'

// ========================================
// 布局文件预加载
// ========================================
// 在构建时预先读取布局模板文件，避免重复 I/O 操作
// 这些文件会被注入到所有 HTML 页面中
const headerPath = resolve(__dirname, 'src/layouts/header.html')
const footerPath = resolve(__dirname, 'src/layouts/footer.html')
const whatsappFloatPath = resolve(__dirname, 'src/layouts/whatsapp-float.html')

// 使用 fs.readFileSync 同步读取文件内容
// 注：这在构建时发生，不会影响开发服务器性能
const header = fs.readFileSync(resolve(__dirname, 'src/layouts/header.html'), 'utf-8')
const footer = fs.readFileSync(resolve(__dirname, 'src/layouts/footer.html'), 'utf-8')
const head = fs.readFileSync(resolve(__dirname, 'src/layouts/head.html'), 'utf-8')

// 初始化布局变量
let headerHtml = ''
let footerHtml = ''
let whatsappFloatHtml = ''

// ========================================
// 异常处理 - 布局文件读取
// ========================================
// 使用 try-catch 确保文件读取错误不会中断构建过程
try {
  headerHtml = fs.readFileSync(headerPath, 'utf-8')
  footerHtml = fs.readFileSync(footerPath, 'utf-8')
  whatsappFloatHtml = fs.readFileSync(whatsappFloatPath, 'utf-8')
  console.log('✅ 成功读取布局文件，长度：header', headerHtml.length, 'footer', footerHtml.length, 'whatsapp-float', whatsappFloatHtml.length)
} catch (err) {
  console.error('❌ 读取布局文件失败:', err.message)
}

/**
 * ========================================
 * 自定义 Vite 插件：布局注入器
 * ========================================
 * 
 * 这是一个 Vite 插件，用于在 HTML 构建过程中注入页眉和页脚
 * 
 * 工作原理：
 * 1. 识别 HTML 中的占位符注释 (<!--header-->、<!--footer-->、<!--whatsapp-float-->)
 * 2. 用实际的布局内容替换这些占位符
 * 3. 在开发和生产构建中都会执行
 * 
 * Vite 插件 API：
 * - name: 插件的唯一标识符
 * - transformIndexHtml: 钩子函数，在 HTML 处理前被调用
 */
function layoutInjectPlugin() {
  return {
    name: 'layout-inject',  // 插件名称
    
    /**
     * transformIndexHtml 钩子
     * 
     * 在 Vite 处理 HTML 文件前被调用，可以修改 HTML 内容
     * 这个钩子的执行顺序：
     * 1. 插件的 pre 钩子
     * 2. core 钩子 (Vite 内置)
     * 3. 插件的 normal 钩子 (默认)
     * 4. 插件的 post 钩子
     * 
     * @param {string} html - 原始 HTML 内容
     * @returns {string} - 处理后的 HTML 内容
     */
    transformIndexHtml(html) {
      // 调试日志：监控 HTML 处理过程
      console.log('开始处理 HTML，原始长度:', html.length)

      // 验证占位符是否存在
      // 占位符格式：HTML 注释，例如 <!--header--> 和 <!--footer-->
      const hasHeaderPlaceholder = html.includes('<!--header-->')
      const hasFooterPlaceholder = html.includes('<!--footer-->')
      const hasWhatsappFloatPlaceholder = html.includes('<!--whatsapp-float-->')
      console.log('占位符存在状态：header=', hasHeaderPlaceholder, 'footer=', hasFooterPlaceholder, 'whatsapp-float=', hasWhatsappFloatPlaceholder)

      // 如果没有找到占位符，直接返回原始 HTML（早期退出优化）
      if (!hasHeaderPlaceholder && !hasFooterPlaceholder && !hasWhatsappFloatPlaceholder) {
        console.warn('未找到任何占位符，跳过替换')
        return html
      }

      // ========================================
      // 执行占位符替换
      // ========================================
      // 使用全局正则表达式 /g 确保替换 HTML 中所有出现的占位符
      // 这允许一个页面中有多个相同的占位符
      let result = html
        .replace(/<!--header-->/g, headerHtml)   // 替换所有页眉占位符
        .replace(/<!--footer-->/g, footerHtml)   // 替换所有页脚占位符
        .replace(/<!--whatsapp-float-->/g, whatsappFloatHtml) // WhatsApp 浮动按钮

      // ========================================
      // 验证替换是否成功
      // ========================================
      // 检查替换后是否还有残留的占位符
      const stillHasHeader = result.includes('<!--header-->')
      const stillHasFooter = result.includes('<!--footer-->')
      const stillHasWhatsappFloat = result.includes('<!--whatsapp-float-->')

      if (stillHasHeader || stillHasFooter || stillHasWhatsappFloat) {
        // 如果仍有占位符，说明正则替换可能失败
        console.error('替换后仍有占位符残留！header=', stillHasHeader, 'footer=', stillHasFooter, 'whatsapp-float=', stillHasWhatsappFloat)
        console.log('headerHtml 内容预览:', headerHtml.substring(0, 100))
        console.log('footerHtml 内容预览:', footerHtml.substring(0, 100))

        // 降级方案：使用字符串分割和连接方法（处理某些 edge cases）
        // 这种方法在某些特殊字符导致正则匹配失败时更可靠
        result = html.split('<!--header-->').join(headerHtml)
        result = result.split('<!--footer-->').join(footerHtml)
        result = result.split('<!--whatsapp-float-->').join(whatsappFloatHtml)

        // 最终验证
        if (result.includes('<!--header-->') || result.includes('<!--footer-->') || result.includes('<!--whatsapp-float-->')) {
          console.error('强制替换仍然失败，请检查布局文件是否为空或包含非法字符')
        } else {
          console.log('强制替换成功')
        }
      } else {
        console.log('✅ 替换成功，新 HTML 长度:', result.length)
      }

      return result
    }
  }
}

/**
 * ========================================
 * Vite 主配置对象
 * ========================================
 */

function scanHtmlInputs(pageDir) {
  const inputs = {}
  const baseDir = resolve(__dirname, pageDir)

  function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const fullPath = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        const relativePath = relative(baseDir, fullPath).replace(/\\/g, '/')
        const key = relativePath.replace(/\.html$/, '')
        inputs[key] = fullPath
      }
    })
  }

  walk(baseDir)
  return inputs
}

export default defineConfig({
  /**
   * root: 项目根目录
   * 
   * 设置为 'src/pages' 意味着 Vite 将：
   * - 将此目录视为项目根目录
   * - 从这里提供文件给开发服务器
   * - 解析导入和资源相对于此路径
   * 
   * 好处：
   * - 开发时不需要在 URL 中添加 /src/pages 前缀
   * - 简化相对路径的管理
   *
   * 注意：脚本与样式实际在 src/js、src/styles（在 pages 之外）。
   * 浏览器会把页面里的 ../js/… 解析成 /js/…，需在 resolve.alias 里映射到真实目录。
   */
  root: 'src/pages',

  resolve: {
    alias: [
      {
        find: /^\/js\/(.+)$/,
        replacement: resolve(__dirname, 'src/js/$1'),
      },
    ],
  },
  
  /**
   * publicDir: 静态资源目录
   * 
   * Vite 会将此目录中的所有文件复制到输出目录中
   * 这些文件不会经过任何处理或变换，直接复制
   * 
   * 示例用途：
   * - robots.txt (SEO)
   * - sitemap.xml (SEO)
   * - favicon.ico
   * - 不需要构建的静态资源
   *
   * 相对路径以「含 vite.config 的项目根」为准，不能用 ../../public。
   */
  publicDir: resolve(__dirname, 'public'),
  
  /**
   * server: 开发服务器配置
   */
  server: {
    port: 3000,      // 开发服务器监听端口
    open: true,      // 启动时自动打开浏览器
  },
  
  /**
   * build: 生产构建配置
   * 
   * Vite 在执行 npm run build 时会使用这些配置
   */
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    
    /**
     * rollupOptions: Rollup 打包配置
     * 
     * Rollup 是 Vite 用于生产构建的底层打包工具
     * 它负责代码分割、压缩、优化等工作
     */
    rollupOptions: {
      /**
       * input: 自动扫描 src/pages 目录下的所有 HTML 页面
       * 
       * 这样可以确保 products.html、categories.html、solutions.html
       * contact.html 以及 blog 文章页面都被正确打包到 dist
       */
      input: scanHtmlInputs('src/pages'),
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'styles/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  
  /**
   * plugins: Vite 插件数组
   * 
   * 插件可以扩展 Vite 的功能，自定义构建过程
   * 执行顺序：pre → normal → post
   */
  plugins: [
    layoutInjectPlugin(),  // 自定义插件：在构建时注入页眉和页脚
  ]
})