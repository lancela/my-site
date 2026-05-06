import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pagesDir = path.resolve(__dirname, '../src/pages')
const siteUrl = process.env.SITE_URL || 'https://example.com'

const getAllHtmlFiles = (dir) => {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(filePath))
    } else if (file.endsWith('.html')) {
      results.push(filePath)
    }
  })
  return results
}

const files = getAllHtmlFiles(pagesDir)
const urls = files.map(file => {
  let relative = path.relative(pagesDir, file).replace(/\\/g, '/')
  if (relative === 'index.html') relative = ''
  return `${siteUrl}/${relative}`
})

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`

fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), sitemap)
console.log('Sitemap generated')