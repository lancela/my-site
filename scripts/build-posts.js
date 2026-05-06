import fs from 'fs'
import path from 'path'
import { marked } from 'marked'

const postsDir = './src/content/posts'
const outDir = './src/pages/blog'
const template = fs.readFileSync('./src/layouts/post-template.html', 'utf-8')

fs.readdirSync(postsDir).forEach(file => {
  if (file.endsWith('.md')) {
    const md = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    const html = marked.parse(md)
    const fullHtml = template.replace('{{content}}', html)
    fs.writeFileSync(path.join(outDir, file.replace('.md', '.html')), fullHtml)
  }
})