import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

// 读取布局片段（可缓存）
const header = fs.readFileSync(resolve(__dirname, 'src/layouts/header.html'), 'utf-8')
const footer = fs.readFileSync(resolve(__dirname, 'src/layouts/footer.html'), 'utf-8')
const head = fs.readFileSync(resolve(__dirname, 'src/layouts/head.html'), 'utf-8')

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
    {
      name: 'inject-layout',
      transformIndexHtml(html) {
        // 将 head、header、footer 注入到每个 HTML 中
        // 约定：页面 HTML 中需包含 <!--head-->、<!--header-->、<!--footer--> 占位符
        return html
          .replace('<!--head-->', head)
          .replace('<!--header-->', header)
          .replace('<!--footer-->', footer)
      }
    }
  ]
})