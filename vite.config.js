import {
  defineConfig
} from 'vite'
import {
  resolve
} from 'path'
import fs from 'fs'


// 读取布局文件（使用绝对路径）
const headerPath = resolve(__dirname, 'src/layouts/header.html')
const footerPath = resolve(__dirname, 'src/layouts/footer.html')
// 读取布局片段（可缓存）
const header = fs.readFileSync(resolve(__dirname, 'src/layouts/header.html'), 'utf-8')
const footer = fs.readFileSync(resolve(__dirname, 'src/layouts/footer.html'), 'utf-8')
const head = fs.readFileSync(resolve(__dirname, 'src/layouts/head.html'), 'utf-8')

let headerHtml = ''
let footerHtml = ''

try {
  headerHtml = fs.readFileSync(headerPath, 'utf-8')
  footerHtml = fs.readFileSync(footerPath, 'utf-8')
  console.log('✅ 成功读取布局文件，长度：header', headerHtml.length, 'footer', footerHtml.length)
} catch (err) {
  console.error('❌ 读取布局文件失败:', err.message)
}

function layoutInjectPlugin() {
  return {
    name: 'layout-inject',
    transformIndexHtml(html) {
      console.log('开始处理 HTML，原始长度:', html.length)

      // 检查占位符是否存在
      const hasHeaderPlaceholder = html.includes('<!--header-->')
      const hasFooterPlaceholder = html.includes('<!--footer-->')
      console.log('占位符存在状态：header=', hasHeaderPlaceholder, 'footer=', hasFooterPlaceholder)

      if (!hasHeaderPlaceholder && !hasFooterPlaceholder) {
        console.warn('未找到任何占位符，跳过替换')
        return html
      }

      // 执行全局替换（使用正则，确保替换所有出现）
      let result = html
        .replace(/<!--header-->/g, headerHtml)
        .replace(/<!--footer-->/g, footerHtml)

      // 验证替换结果
      const stillHasHeader = result.includes('<!--header-->')
      const stillHasFooter = result.includes('<!--footer-->')

      if (stillHasHeader || stillHasFooter) {
        console.error('替换后仍有占位符残留！header=', stillHasHeader, 'footer=', stillHasFooter)
        console.log('headerHtml 内容预览:', headerHtml.substring(0, 100))
        console.log('footerHtml 内容预览:', footerHtml.substring(0, 100))

        // 尝试强制替换：如果普通 replace 无效，可能是占位符被 HTML 注释破坏？这里再做一次直接字符串替换
        result = html.split('<!--header-->').join(headerHtml)
        result = result.split('<!--footer-->').join(footerHtml)

        // 再次验证
        if (result.includes('<!--header-->') || result.includes('<!--footer-->')) {
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

export default defineConfig({
  root: 'src/pages',
  publicDir: '../../public',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/pages/index.html'),
        about: resolve(__dirname, 'src/pages/about.html'),
        // 动态添加其他页面
      }
    }
  },
  plugins: [
    layoutInjectPlugin(),
  ]
})