import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const outputPath = path.join(projectRoot, 'public', 'sitemap.xml')
const politiciansIndexPath = path.join(projectRoot, 'public', 'politicians-index.json')

const SITE_URL = 'https://www.mandatotransparente.com.br'
const CAMARA_API = 'https://dadosabertos.camara.leg.br/api/v2'
const SENADO_API = 'https://legis.senado.leg.br/dadosabertos'

const STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB',
  'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

const PRESIDENT_IDS = ['luiz-inacio-lula-da-silva', 'geraldo-alckmin']

const CORE_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/por-estado', changefreq: 'weekly', priority: '0.9' },
  { path: '/por-estado/deputado-federal', changefreq: 'weekly', priority: '0.8' },
  { path: '/por-estado/deputado-estadual', changefreq: 'weekly', priority: '0.8' },
  { path: '/por-estado/senador', changefreq: 'weekly', priority: '0.8' },
  { path: '/presidente', changefreq: 'weekly', priority: '0.9' },
  { path: '/informacoes-gerais', changefreq: 'weekly', priority: '0.8' },
  { path: '/sobre', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacidade', changefreq: 'monthly', priority: '0.5' },
  { path: '/termos', changefreq: 'monthly', priority: '0.5' },
  { path: '/sugestoes', changefreq: 'monthly', priority: '0.5' },
]

function toUrl(pathname) {
  return `${SITE_URL}${pathname}`
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function mapUrlEntry({ path, changefreq, priority, lastmod }) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const finalLastmod = lastmod || new Date().toISOString().slice(0, 10)

  return [
    '  <url>',
    `    <loc>${escapeXml(toUrl(normalizedPath))}</loc>`,
    `    <lastmod>${finalLastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

async function fetchJson(url) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

async function loadDeputyDetailPaths() {
  const paths = []

  await Promise.all(
    STATES.map(async (uf) => {
      try {
        const response = await fetchJson(
          `${CAMARA_API}/deputados?siglaUf=${uf}&ordem=ASC&ordenarPor=nome&itens=100`,
        )
        const deputies = Array.isArray(response?.dados) ? response.dados : []

        paths.push({
          path: `/por-estado/${uf.toLowerCase()}/deputado-federal`,
          changefreq: 'daily',
          priority: '0.8',
        })

        deputies.forEach((deputy) => {
          if (!deputy?.id) {
            return
          }

          paths.push({
            path: `/por-estado/${uf.toLowerCase()}/deputado-federal/${deputy.id}`,
            changefreq: 'daily',
            priority: '0.8',
          })
        })
      } catch {
        paths.push({
          path: `/por-estado/${uf.toLowerCase()}/deputado-federal`,
          changefreq: 'daily',
          priority: '0.8',
        })
      }
    }),
  )

  return paths
}

async function loadSenatorPaths() {
  const paths = STATES.map((uf) => ({
    path: `/senadores/${uf.toLowerCase()}`,
    changefreq: 'daily',
    priority: '0.8',
  }))

  try {
    const response = await fetchJson(`${SENADO_API}/senador/lista/atual.json`)
    const allSenators = response?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar

    const senators = Array.isArray(allSenators) ? allSenators : allSenators ? [allSenators] : []

    senators.forEach((entry) => {
      const identification = entry?.IdentificacaoParlamentar
      const id = identification?.CodigoParlamentar?.trim()

      if (!id) {
        return
      }

      paths.push({
        path: `/senador/${id}`,
        changefreq: 'daily',
        priority: '0.8',
      })
    })
  } catch {
    return paths
  }

  return paths
}

function loadPresidentPaths() {
  return PRESIDENT_IDS.map((id) => ({
    path: `/presidente/${id}`,
    changefreq: 'weekly',
    priority: '0.8',
  }))
}

function loadGeneralInfoPaths() {
  return STATES.map((uf) => ({
    path: `/informacoes-gerais/${uf.toLowerCase()}`,
    changefreq: 'weekly',
    priority: '0.8',
  }))
}

async function loadStateDeputyPaths() {
  try {
    const raw = await readFile(politiciansIndexPath, 'utf-8')
    const json = JSON.parse(raw)
    const items = Array.isArray(json?.['deputados-estaduais']) ? json['deputados-estaduais'] : []
    const ufs = [...new Set(items.map((item) => String(item?.estado || '').toUpperCase()).filter(Boolean))]

    const paths = ufs.map((uf) => ({
      path: `/por-estado/${uf.toLowerCase()}/deputado-estadual`,
      changefreq: 'daily',
      priority: '0.8',
    }))

    items.forEach((item) => {
      const uf = String(item?.estado || '').toLowerCase()
      const id = String(item?.id || '')

      if (!uf || !id) {
        return
      }

      paths.push({
        path: `/por-estado/${uf}/deputado-estadual/${id}`,
        changefreq: 'daily',
        priority: '0.8',
      })
    })

    return paths
  } catch {
    return []
  }
}

async function main() {
  const [deputyPaths, senatorPaths, stateDeputyPaths] = await Promise.all([
    loadDeputyDetailPaths(),
    loadSenatorPaths(),
    loadStateDeputyPaths(),
  ])

  const entries = [
    ...CORE_PAGES,
    ...deputyPaths,
    ...senatorPaths,
    ...stateDeputyPaths,
    ...loadPresidentPaths(),
    ...loadGeneralInfoPaths(),
  ]
  const uniqueByPath = new Map(entries.map((entry) => [entry.path, entry]))
  const normalizedEntries = [...uniqueByPath.values()].sort((a, b) => a.path.localeCompare(b.path))

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...normalizedEntries.map((entry) => mapUrlEntry(entry)),
    '</urlset>',
    '',
  ].join('\n')

  await writeFile(outputPath, xml, 'utf-8')

  console.log(`Sitemap atualizado com ${normalizedEntries.length} URLs em ${outputPath}`)
}

void main().catch((error) => {
  console.error('Falha ao gerar sitemap:', error)
  process.exitCode = 1
})
