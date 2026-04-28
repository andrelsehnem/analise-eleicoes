import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const distIndexPath = path.join(distDir, 'index.html')
const routeManifestPath = path.join(projectRoot, 'public', 'prerender-routes.json')

const SITE_NAME = 'Mandato Transparente'
const SITE_URL = 'https://www.mandatotransparente.com.br'
const DEFAULT_DESCRIPTION =
  'Consulte deputados federais e presidência com dados públicos oficiais para votar com mais informação.'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.svg`
const CAMARA_API = 'https://dadosabertos.camara.leg.br/api/v2'
const SENADO_API = 'https://legis.senado.leg.br/dadosabertos'

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizePath(routePath) {
  if (!routePath || routePath === '/') {
    return '/'
  }

  return routePath.startsWith('/') ? routePath : `/${routePath}`
}

function toAbsoluteUrl(routePath) {
  return `${SITE_URL}${normalizePath(routePath)}`
}

function ensureTitleSuffix(title) {
  if (title === SITE_NAME || title.endsWith(`| ${SITE_NAME}`)) {
    return title
  }

  return `${title} | ${SITE_NAME}`
}

function buildFallbackMarkup(title, description, routePath) {
  const normalizedTitle = escapeHtml(title)
  const normalizedDescription = escapeHtml(description)
  const absoluteUrl = escapeHtml(toAbsoluteUrl(routePath))

  return [
    '<main style="max-width:980px;margin:0 auto;padding:24px 16px;font-family:IBM Plex Sans,sans-serif;color:#f0f4ff;background:#0a1628;min-height:100vh;">',
    `<h1 style="margin-bottom:12px;font-size:1.8rem;line-height:1.2;">${normalizedTitle}</h1>`,
    `<p style="margin-bottom:10px;color:#c8d4ee;line-height:1.6;">${normalizedDescription}</p>`,
    `<p style="margin-bottom:18px;color:#8899bb;line-height:1.6;">Página: ${absoluteUrl}</p>`,
    '<p style="color:#c8d4ee;line-height:1.6;">Esta página possui conteúdo dinâmico com dados públicos oficiais. Se necessário, ative o JavaScript para a experiência completa.</p>',
    '</main>',
  ].join('')
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

async function buildDeputyNameMap(routes) {
  const byUf = new Map()
  const ufSet = new Set(
    routes
      .map((route) => route.match(/^\/por-estado\/([a-z]{2})\/deputado-federal\/\d+$/i)?.[1]?.toUpperCase())
      .filter(Boolean),
  )

  await Promise.all(
    [...ufSet].map(async (uf) => {
      try {
        const data = await fetchJson(
          `${CAMARA_API}/deputados?siglaUf=${uf}&ordem=ASC&ordenarPor=nome&itens=100`,
        )
        const items = Array.isArray(data?.dados) ? data.dados : []
        const ufMap = new Map()

        items.forEach((item) => {
          if (item?.id) {
            ufMap.set(String(item.id), item.nome || `Deputado ${item.id}`)
          }
        })

        byUf.set(uf, ufMap)
      } catch {
        byUf.set(uf, new Map())
      }
    }),
  )

  return byUf
}

async function buildSenatorNameMap() {
  try {
    const data = await fetchJson(`${SENADO_API}/senador/lista/atual.json`)
    const allItems = data?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar
    const items = Array.isArray(allItems) ? allItems : allItems ? [allItems] : []
    const map = new Map()

    items.forEach((entry) => {
      const identification = entry?.IdentificacaoParlamentar
      const id = identification?.CodigoParlamentar?.trim()
      const name = identification?.NomeParlamentar?.trim()

      if (id) {
        map.set(id, name || `Senador ${id}`)
      }
    })

    return map
  } catch {
    return new Map()
  }
}

function buildMetaForRoute(routePath, deputyNameByUf, senatorNameById) {
  const normalizedPath = normalizePath(routePath)
  const deputyDetailMatch = normalizedPath.match(/^\/por-estado\/([a-z]{2})\/deputado-federal\/(\d+)$/i)
  const deputyListMatch = normalizedPath.match(/^\/por-estado\/([a-z]{2})\/deputado-federal$/i)
  const senatorDetailMatch = normalizedPath.match(/^\/senador\/(\d+)$/i)
  const senatorListMatch = normalizedPath.match(/^\/senadores\/([a-z]{2})$/i)
  const presidentDetailMatch = normalizedPath.match(/^\/presidente\/([a-z0-9-]+)$/i)

  if (deputyDetailMatch) {
    const uf = deputyDetailMatch[1].toUpperCase()
    const deputyId = deputyDetailMatch[2]
    const name = deputyNameByUf.get(uf)?.get(deputyId) || `Deputado federal ${deputyId}`
    const title = `Perfil de ${name}`

    return {
      title,
      description: `Acompanhe dados públicos, proposições e votações de ${name}, deputado federal por ${uf}.`,
    }
  }

  if (deputyListMatch) {
    const uf = deputyListMatch[1].toUpperCase()

    return {
      title: `Deputados federais de ${uf}`,
      description: `Veja a lista de deputados federais de ${uf}, filtre por nome ou partido e abra o histórico de atuação parlamentar.`,
    }
  }

  if (senatorDetailMatch) {
    const senatorId = senatorDetailMatch[1]
    const name = senatorNameById.get(senatorId) || `Senador ${senatorId}`

    return {
      title: `Perfil de ${name}`,
      description: `Veja dados públicos, mandatos e comissões de ${name} no Senado Federal.`,
    }
  }

  if (senatorListMatch) {
    const uf = senatorListMatch[1].toUpperCase()

    return {
      title: `Senadores de ${uf}`,
      description: `Veja a lista de senadores de ${uf}, filtre por nome ou partido e abra o perfil público de cada parlamentar.`,
    }
  }

  if (presidentDetailMatch) {
    const presidentId = presidentDetailMatch[1]
    const name = presidentId
      .split('-')
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
      .join(' ')

    return {
      title: `Perfil de ${name}`,
      description: `Veja dados públicos, resumo e mandatos de ${name} na Presidência da República.`,
    }
  }

  if (normalizedPath === '/presidente') {
    return {
      title: 'Presidente e vice-presidente',
      description:
        'Consulte presidente e vice-presidente atuais, com dados públicos sobre mandato, trajetória e fontes oficiais.',
    }
  }

  if (normalizedPath === '/por-estado') {
    return {
      title: 'Seleção por estado e cargo',
      description:
        'Selecione o cargo e o estado para consultar deputados federais e senadores com dados públicos oficiais.',
    }
  }

  if (normalizedPath === '/sobre') {
    return {
      title: 'Sobre o projeto',
      description:
        'Conheça o Mandato Transparente, projeto de consulta pública para acompanhar o histórico de atuação política no Brasil.',
    }
  }

  if (normalizedPath === '/sugestoes') {
    return {
      title: 'Sugestões',
      description:
        'Envie sugestões para melhorar o Mandato Transparente e fortalecer a consulta de dados públicos para eleitores.',
    }
  }

  return {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  }
}

function replaceSingle(html, matcher, replacement) {
  const result = html.replace(matcher, replacement)
  return result
}

function applyHeadMeta(htmlTemplate, routePath, title, description) {
  const canonicalUrl = toAbsoluteUrl(routePath)
  const finalTitle = ensureTitleSuffix(title)

  let html = htmlTemplate
  html = replaceSingle(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(finalTitle)}</title>`)
  html = replaceSingle(
    html,
    /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  )
  html = replaceSingle(
    html,
    /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/>/i,
    `<meta property="og:title" content="${escapeHtml(finalTitle)}" />`,
  )
  html = replaceSingle(
    html,
    /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  )
  html = replaceSingle(
    html,
    /<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/>/i,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
  )

  if (/<meta\s+property="og:image"/i.test(html)) {
    html = replaceSingle(
      html,
      /<meta\s+property="og:image"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta property="og:image" content="${escapeHtml(DEFAULT_OG_IMAGE)}" />`,
    )

    if (/<meta\s+property="og:image:alt"/i.test(html)) {
      html = replaceSingle(
        html,
        /<meta\s+property="og:image:alt"\s+content="[\s\S]*?"\s*\/>/i,
        `<meta property="og:image:alt" content="${escapeHtml(finalTitle)}" />`,
      )
    } else {
      html = html.replace(
        /<meta\s+property="og:image"\s+content="[\s\S]*?"\s*\/>/i,
        `<meta property="og:image" content="${escapeHtml(DEFAULT_OG_IMAGE)}" />\n    <meta property="og:image:alt" content="${escapeHtml(finalTitle)}" />`,
      )
    }
  } else {
    html = html.replace(
      /<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />\n    <meta property="og:image" content="${escapeHtml(DEFAULT_OG_IMAGE)}" />\n    <meta property="og:image:alt" content="${escapeHtml(finalTitle)}" />`,
    )
  }

  html = replaceSingle(
    html,
    /<meta\s+name="twitter:card"\s+content="[\s\S]*?"\s*\/>/i,
    '<meta name="twitter:card" content="summary_large_image" />',
  )
  html = replaceSingle(
    html,
    /<meta\s+name="twitter:title"\s+content="[\s\S]*?"\s*\/>/i,
    `<meta name="twitter:title" content="${escapeHtml(finalTitle)}" />`,
  )
  html = replaceSingle(
    html,
    /<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  )

  if (/<meta\s+name="twitter:image"/i.test(html)) {
    html = replaceSingle(
      html,
      /<meta\s+name="twitter:image"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta name="twitter:image" content="${escapeHtml(DEFAULT_OG_IMAGE)}" />`,
    )
  } else {
    html = html.replace(
      /<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />\n    <meta name="twitter:image" content="${escapeHtml(DEFAULT_OG_IMAGE)}" />`,
    )
  }

  if (/<meta\s+name="twitter:url"/i.test(html)) {
    html = replaceSingle(
      html,
      /<meta\s+name="twitter:url"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />`,
    )
  } else {
    html = html.replace(
      /<meta\s+name="twitter:image"\s+content="[\s\S]*?"\s*\/>/i,
      `<meta name="twitter:image" content="${escapeHtml(DEFAULT_OG_IMAGE)}" />\n    <meta name="twitter:url" content="${escapeHtml(canonicalUrl)}" />`,
    )
  }

  html = replaceSingle(
    html,
    /<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/>/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
  )

  const fallbackMarkup = buildFallbackMarkup(title, description, routePath)
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${fallbackMarkup}</div>`)

  return html
}

async function writeRouteHtml(routePath, html) {
  const normalizedPath = normalizePath(routePath)

  if (normalizedPath === '/') {
    await writeFile(distIndexPath, html, 'utf-8')
    return
  }

  const routeDir = path.join(distDir, normalizedPath.slice(1))
  await mkdir(routeDir, { recursive: true })
  await writeFile(path.join(routeDir, 'index.html'), html, 'utf-8')
}

async function main() {
  const [distHtml, routeManifestRaw] = await Promise.all([
    readFile(distIndexPath, 'utf-8'),
    readFile(routeManifestPath, 'utf-8'),
  ])
  const routeManifest = JSON.parse(routeManifestRaw)
  const routes = Array.isArray(routeManifest?.paths) ? routeManifest.paths : ['/']

  const [deputyNameByUf, senatorNameById] = await Promise.all([
    buildDeputyNameMap(routes),
    buildSenatorNameMap(),
  ])

  await Promise.all(
    routes.map(async (routePath) => {
      const meta = buildMetaForRoute(routePath, deputyNameByUf, senatorNameById)
      const html = applyHeadMeta(distHtml, routePath, meta.title, meta.description)
      await writeRouteHtml(routePath, html)
    }),
  )

  console.log(`Prerender estático concluído para ${routes.length} rotas em ${distDir}`)
}

void main().catch((error) => {
  console.error('Falha ao gerar páginas prerenderizadas:', error)
  process.exitCode = 1
})
