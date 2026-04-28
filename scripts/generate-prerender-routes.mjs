import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml')
const outputPath = path.join(projectRoot, 'public', 'prerender-routes.json')

const SITE_URL = 'https://www.mandatotransparente.com.br'

function parseLocEntries(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
  return matches.map((match) => match[1]).filter(Boolean)
}

function normalizeToPath(urlValue) {
  if (urlValue.startsWith('/')) {
    return urlValue
  }

  if (urlValue.startsWith(SITE_URL)) {
    return urlValue.slice(SITE_URL.length) || '/'
  }

  return '/'
}

async function main() {
  const xml = await readFile(sitemapPath, 'utf-8')
  const urls = parseLocEntries(xml)
  const paths = [...new Set(urls.map((urlValue) => normalizeToPath(urlValue)))]

  await writeFile(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), paths }, null, 2), 'utf-8')

  console.log(`Arquivo de rotas de prerender atualizado com ${paths.length} rotas em ${outputPath}`)
}

void main().catch((error) => {
  console.error('Falha ao gerar rotas de prerender:', error)
  process.exitCode = 1
})
