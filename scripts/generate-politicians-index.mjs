/**
 * Gera public/politicians-index.json com todos os políticos disponíveis,
 * organizados por tipo (deputados-federais, senadores).

 * rodado de forma independente via `pnpm generate:politicians`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ATENÇÃO: ao integrar uma nova fonte de dados com listagem de políticos,
 * adicione um novo grupo aqui seguindo o padrão existente e registre a URL
 * da API na documentação correspondente em documentacao/.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Grupos atuais:
 *   - deputados-federais  → https://dadosabertos.camara.leg.br/api/v2/deputados
 *   - senadores           → https://legis.senado.leg.br/dadosabertos/senador/lista/atual


 * Grupos atuais:
 *   - deputados-federais   → https://dadosabertos.camara.leg.br/api/v2/deputados
 *   - senadores            → https://legis.senado.leg.br/dadosabertos/senador/lista/atual
 *   - deputados-estaduais  → RS: https://ww4.al.rs.gov.br:5000/listarDestaqueDeputados
 *                            SC: https://www.alesc.sc.gov.br/post_team-sitemap.xml (HTML scraping)
 *                            PR: https://www.assembleia.pr.leg.br (indisponível — lista vazia)
 */

import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const outputPath = path.join(projectRoot, 'public', 'politicians-index.json')

const CAMARA_API = 'https://dadosabertos.camara.leg.br/api/v2'
const SENADO_API = 'https://legis.senado.leg.br/dadosabertos'
const ALRS_API = 'https://ww4.al.rs.gov.br:5000'
const ALESC_BASE = 'https://www.alesc.sc.gov.br'
const ALESP_BASE = 'https://www.al.sp.gov.br'
const ALESP_API = 'https://legis-api-portal.pub.al.sp.gov.br'
const ALERJ_BASE = 'https://www.alerj.rj.gov.br'
const ALMG_BASE = 'https://www.almg.gov.br'
const ALES_BASE = 'https://www.al.es.gov.br'
const ALES_FETCH_BASE = 'http://www.al.es.gov.br'
const SC_SITEMAP_TIMEOUT_MS = 12000
const SC_DEPUTY_REQUEST_TIMEOUT_MS = 10000
const SC_MAX_DURATION_MS = 120000
const SC_RETRY_ATTEMPTS = 2

const STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB',
  'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

/**
 * @typedef {{
 *   id: string | number
 *   nome: string
 *   estado: string
 *   partido: string
 *   email?: string
 *   urlFoto?: string
 *   telefone?: string
 *   urlPerfil?: string
 * }} PoliticianEntry
 */

/**
 * Faz uma requisição GET e retorna o JSON da resposta.
 * @param {string} url
 * @returns {Promise<unknown>}
 */
async function fetchJson(url) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000)

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ao buscar ${url}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Faz uma requisição GET e retorna o texto da resposta.
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchText(url, timeoutMs = 30000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MandatoTransparente-bot/1.0)' },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ao buscar ${url}`)
    }

    return await response.text()
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Decodifica entidades HTML básicas e numéricas.
 * @param {string} value
 * @returns {string}
 */
function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/**
 * Busca deputados federais de uma UF com uma única retentativa em caso de falha.
 * @param {string} uf
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosFederaisByUf(uf) {
  const url = `${CAMARA_API}/deputados?siglaUf=${uf}&ordem=ASC&ordenarPor=nome&itens=100`

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const data = await fetchJson(url)
      const deputies = Array.isArray(data?.dados) ? data.dados : []

      return deputies
        .filter((d) => d?.id && d?.nome)
        .map((d) => ({
          id: String(d.id),
          nome: String(d.nome),
          estado: String(d.siglaUf ?? uf),
          partido: String(d.siglaPartido ?? ''),
        }))
    } catch (error) {
      if (attempt === 2) {
        throw new Error(
          `Falha ao buscar deputados federais da UF ${uf}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }

  return []
}

/**
 * Busca todos os deputados federais de todas as UFs e retorna lista consolidada.
 * Fonte: GET /deputados?siglaUf={UF}&ordem=ASC&ordenarPor=nome&itens=100
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosFederais() {
  /** @type {PoliticianEntry[]} */
  const all = []

  let failureCount = 0

  for (const uf of STATES) {
    try {
      const entries = await loadDeputadosFederaisByUf(uf)
      all.push(...entries)
    } catch (error) {
      failureCount += 1
      console.log(`⚠️  ${error instanceof Error ? error.message : `Falha ao buscar deputados federais da UF ${uf}.`}`)
    }

    await new Promise((resolve) => setTimeout(resolve, 120))
  }

  if (failureCount > 0) {
    console.log(`⚠️  ${failureCount} UF(s) com falha ao buscar deputados federais.`)
  }

  return all.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/**
 * Busca todos os senadores em exercício e retorna lista consolidada.
 * Fonte: GET /senador/lista/atual
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadSenadores() {
  const data = await fetchJson(`${SENADO_API}/senador/lista/atual.json`)

  const raw = data?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar
  const entries = Array.isArray(raw) ? raw : raw ? [raw] : []

  return entries
    .map((entry) => {
      const ident = entry?.IdentificacaoParlamentar
      const id = ident?.CodigoParlamentar?.trim()
      const nome = ident?.NomeParlamentar?.trim() ?? ident?.NomeCompletoParlamentar?.trim()
      const estado = ident?.UfParlamentar?.trim()
      const partido = ident?.SiglaPartidoParlamentar?.trim() ?? ''

      if (!id || !nome) return null

      return { id, nome, estado: estado ?? '', partido }
    })
    .filter(
      /** @param {PoliticianEntry | null} e @returns {e is PoliticianEntry} */
      (e) => e !== null,
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

// ─────────────────────────────────────────────────────────────────────────────
// Deputados Estaduais
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Busca deputados estaduais do RS via API JSON da ALRS.
 * Fonte: GET https://ww4.al.rs.gov.br:5000/listarDestaqueDeputados
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosEstaduaisRS() {
  const data = await fetchJson(`${ALRS_API}/listarDestaqueDeputados`)
  const lista = Array.isArray(data?.lista) ? data.lista : []

  return lista
    .filter((d) => d?.idDeputado && d?.nomeDeputado)
    .map((d) => ({
      id: String(d.idDeputado),
      nome: String(d.nomeDeputado),
      estado: 'RS',
      partido: String(d.siglaPartido ?? ''),
      email: d.emailDeputado ? String(d.emailDeputado).trim() : undefined,
      telefone: d.telefoneDeputado ? String(d.telefoneDeputado).trim() : undefined,
      urlFoto: d.fotoGrandeDeputado ? String(d.fotoGrandeDeputado).trim() : undefined,
      urlPerfil: `https://ww4.al.rs.gov.br/deputados/${String(d.idDeputado)}`,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/**
 * Extrai slugs de deputados do sitemap da ALESC (SC).
 * @returns {Promise<string[]>}
 */
async function fetchScSlugs() {
  const xml = await fetchText(`${ALESC_BASE}/post_team-sitemap.xml`, SC_SITEMAP_TIMEOUT_MS)
  const matches = [...xml.matchAll(/<loc>(https:\/\/www\.alesc\.sc\.gov\.br\/deputado\/([^/]+)\/)<\/loc>/g)]
  return matches.map((m) => m[2])
}

/**
 * Faz scraping da página de um deputado da ALESC.
 * @param {string} slug
 * @returns {Promise<PoliticianEntry | null>}
 */
async function fetchScDeputyData(slug) {
  for (let attempt = 1; attempt <= SC_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const html = await fetchText(`${ALESC_BASE}/deputado/${slug}/`, SC_DEPUTY_REQUEST_TIMEOUT_MS)
      const nameMatch = html.match(/<h1[^>]*class="[^"]*lab-title-big[^"]*"[^>]*>\s*([^<]+)\s*<\/h1>/)
      const nome = nameMatch ? nameMatch[1].trim() : null
      if (!nome) return null
      const partyMatch = html.match(/class="lab-team-cat[^"]*"[^>]*>\s*([^<]+)\s*<\//) ??
                         html.match(/class="partido[^"]*"[^>]*>\s*([^<]+)\s*<\//)
      const photoMatch = html.match(/<img[^>]*class="[^"]*lab-team-img[^"]*"[^>]*src="([^"]+)"/i)
      const emailMatch = html.match(/mailto:([^"'\s<]+)/i)
      const phoneMatch = html.match(/href="tel:([^"'\s<]+)"/i)
      const partido = partyMatch ? partyMatch[1].trim() : ''
      return {
        id: `sc-${slug}`,
        nome,
        estado: 'SC',
        partido,
        email: emailMatch ? emailMatch[1].trim() : undefined,
        telefone: phoneMatch ? phoneMatch[1].trim() : undefined,
        urlFoto: photoMatch ? photoMatch[1].trim() : undefined,
        urlPerfil: `${ALESC_BASE}/deputado/${slug}/`,
      }
    } catch {
      if (attempt === SC_RETRY_ATTEMPTS) {
        console.log(`⚠️  Falha ao buscar deputado SC: ${slug}`)
        return null
      }

      await new Promise((resolve) => setTimeout(resolve, 400 * attempt))
    }
  }

  return null
}

/**
 * Busca deputados estaduais de SC via scraping do site da ALESC.
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosEstaduaisSC() {
  let slugs = []

  try {
    slugs = await fetchScSlugs()
  } catch (error) {
    console.log(
      `⚠️  SC (ALESC): sitemap indisponível no momento (${error instanceof Error ? error.message : 'erro desconhecido'}). Retornando lista parcial/vazia.`,
    )
    return []
  }

  console.log(`   SC: ${slugs.length} slugs encontrados no sitemap`)
  const startedAt = Date.now()

  /** @type {PoliticianEntry[]} */
  const entries = []

  for (const slug of slugs) {
    if (Date.now() - startedAt >= SC_MAX_DURATION_MS) {
      console.log(`⚠️  Limite de tempo atingido no scraping SC (${Math.round(SC_MAX_DURATION_MS / 1000)}s).`) 
      break
    }

    const deputy = await fetchScDeputyData(slug)
    if (deputy) {
      entries.push(deputy)
    }

    await new Promise((resolve) => setTimeout(resolve, 120))
  }

  return entries.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/**
 * Retorna lista de deputados do PR.
 * O site da ALEP (assembleia.pr.leg.br) frequentemente está inacessível.
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosEstaduaisPR() {
  console.log('⚠️  PR (ALEP): site indisponível via script. Retornando lista vazia.')
  return []
}

/**
 * Retorna lista de deputados de SP.
 * Fonte: GET https://legis-api-portal.pub.al.sp.gov.br/parlamentar-portal/?filtroLegislatura=20&filtroEmExercicioPesquisa=S
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosEstaduaisSP() {
  const query = new URLSearchParams({
    filtroLegislatura: '20',
    filtroEmExercicioPesquisa: 'S',
  })

  const data = await fetchJson(`${ALESP_API}/parlamentar-portal/?${query.toString()}`)
  const content = Array.isArray(data?.content) ? data.content : []

  return content
    .filter((item) => item?.txNomeParlamentar && (item?.nuMatricula || item?.idParlamentar))
    .map((item) => {
      const matricula = item.nuMatricula ? String(item.nuMatricula).trim() : ''
      const foto = item.txFoto ? String(item.txFoto).trim() : ''
      const fotoUrl = foto
        ? (foto.startsWith('http://') || foto.startsWith('https://') ? foto : `${ALESP_BASE}${foto}`)
        : undefined

      return {
        id: matricula || String(item.idParlamentar),
        nome: String(item.txNomeParlamentar).trim(),
        estado: 'SP',
        partido: item.txPartido ? String(item.txPartido).trim() : '',
        email: item.txEmail ? String(item.txEmail).trim() : undefined,
        telefone: item.txTelefone ? String(item.txTelefone).trim() : undefined,
        urlFoto: fotoUrl,
        urlPerfil: matricula ? `${ALESP_BASE}/deputado/?matricula=${matricula}` : undefined,
      }
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/**
 * Retorna lista de deputados de RJ.
 * Fonte: GET https://www.alerj.rj.gov.br/Deputados/QuemSao
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosEstaduaisRJ() {
  const html = await fetchText(`${ALERJ_BASE}/Deputados/QuemSao`)
  const matches = [
    ...html.matchAll(
      /<div class="controle_deputado[^"]*">[\s\S]*?<a href="\/Deputados\/PerfilDeputado\/(\d+)\?Legislatura=\d+">[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<div class="partido">([^<]*)<\/div>[\s\S]*?<div class="nome"><a href="[^"]*">([^<]*)<\/a>/gi,
    ),
  ]

  return matches
    .map((match) => {
      const id = String(match[1]).trim()
      const foto = String(match[2] || '').trim()
      const partido = decodeHtml(String(match[3] || ''))
      const nome = decodeHtml(String(match[4] || ''))

      if (!id || !nome) {
        return null
      }

      return {
        id,
        nome,
        estado: 'RJ',
        partido,
        urlFoto: foto ? `${ALERJ_BASE}${foto}` : undefined,
        urlPerfil: `${ALERJ_BASE}/Deputados/PerfilDeputado/${id}?Legislatura=20`,
      }
    })
    .filter((item) => item !== null)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/**
 * Retorna lista de deputados de MG.
 * Fonte: GET https://www.almg.gov.br/a-assembleia/deputados/inicial/
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosEstaduaisMG() {
  const html = await fetchText(`${ALMG_BASE}/a-assembleia/deputados/inicial/`)
  const matches = [
    ...html.matchAll(
      /<a title="([^"]+)" href="(\/deputados\/[^"?#]+\/(\d+))"[^>]*>[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<div class="badge[^>]*">([^<]+)<\/div>/gi,
    ),
  ]

  return matches
    .map((match) => {
      const nome = decodeHtml(String(match[1] || ''))
      const href = String(match[2] || '').trim()
      const id = String(match[3] || '').trim()
      const foto = String(match[4] || '').trim()
      const partido = decodeHtml(String(match[5] || ''))

      if (!id || !nome || !href) {
        return null
      }

      return {
        id,
        nome,
        estado: 'MG',
        partido,
        urlFoto: foto ? `${ALMG_BASE}${foto}` : undefined,
        urlPerfil: `${ALMG_BASE}${href}`,
      }
    })
    .filter((item) => item !== null)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/**
 * Retorna lista de deputados de ES.
 * Fonte: GET https://www.al.es.gov.br/Deputado/Lista
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosEstaduaisES() {
  const html = await fetchText(`${ALES_FETCH_BASE}/Deputado/Lista`)
  const matches = [
    ...html.matchAll(
      /<a href="\/Deputado\/([^"?#]+)" class="linkLimpo">[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<div class="nomeDeputadoLista">([^<]+)<\/div>[\s\S]*?<div id="telefoneDeputado">([^<]*)<\/div>[\s\S]*?<div class="lead" id="emailDeputado">([^<]*)<\/div>/gi,
    ),
  ]

  return matches
    .map((match) => {
      const slug = String(match[1] || '').trim()
      const foto = String(match[2] || '').trim()
      const nome = decodeHtml(String(match[3] || ''))
      const telefone = decodeHtml(String(match[4] || ''))
      const email = decodeHtml(String(match[5] || ''))

      if (!slug || !nome) {
        return null
      }

      return {
        id: `es-${slug.toLowerCase()}`,
        nome,
        estado: 'ES',
        partido: '',
        telefone: telefone || undefined,
        email: email || undefined,
        urlFoto: foto ? `${ALES_BASE}${foto}` : undefined,
        urlPerfil: `${ALES_BASE}/Deputado/${slug}`,
      }
    })
    .filter((item) => item !== null)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

/**
 * Consolida deputados estaduais (Sul + Sudeste).
 * @returns {Promise<PoliticianEntry[]>}
 */
async function loadDeputadosEstaduais() {
  const [rs, sc, pr, sp, rj, mg, es] = await Promise.allSettled([
    loadDeputadosEstaduaisRS(),
    loadDeputadosEstaduaisSC(),
    loadDeputadosEstaduaisPR(),
    loadDeputadosEstaduaisSP(),
    loadDeputadosEstaduaisRJ(),
    loadDeputadosEstaduaisMG(),
    loadDeputadosEstaduaisES(),
  ])
  if (rs.status === 'rejected') console.error('❌ Falha ao carregar deputados RS:', rs.reason)
  if (sc.status === 'rejected') console.error('❌ Falha ao carregar deputados SC:', sc.reason)
  if (pr.status === 'rejected') console.error('❌ Falha ao carregar deputados PR:', pr.reason)
  if (sp.status === 'rejected') console.error('❌ Falha ao carregar deputados SP:', sp.reason)
  if (rj.status === 'rejected') console.error('❌ Falha ao carregar deputados RJ:', rj.reason)
  if (mg.status === 'rejected') console.error('❌ Falha ao carregar deputados MG:', mg.reason)
  if (es.status === 'rejected') console.error('❌ Falha ao carregar deputados ES:', es.reason)
  return [
    ...(rs.status === 'fulfilled' ? rs.value : []),
    ...(sc.status === 'fulfilled' ? sc.value : []),
    ...(pr.status === 'fulfilled' ? pr.value : []),
    ...(sp.status === 'fulfilled' ? sp.value : []),
    ...(rj.status === 'fulfilled' ? rj.value : []),
    ...(mg.status === 'fulfilled' ? mg.value : []),
    ...(es.status === 'fulfilled' ? es.value : []),
  ].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

async function main() {
  console.log('🔄 Gerando índice de políticos...')

  const [deputadosFederais, senadores, deputadosEstaduais] = await Promise.allSettled([
    loadDeputadosFederais(),
    loadSenadores(),
    loadDeputadosEstaduais(),
  ])

  const index = {
    geradoEm: new Date().toISOString(),
    'deputados-federais':
      deputadosFederais.status === 'fulfilled' ? deputadosFederais.value : [],
    senadores: senadores.status === 'fulfilled' ? senadores.value : [],
    'deputados-estaduais':
      deputadosEstaduais.status === 'fulfilled' ? deputadosEstaduais.value : [],
  }

  if (deputadosFederais.status === 'rejected') {
    console.error('❌ Falha ao carregar deputados federais:', deputadosFederais.reason)
  }
  if (senadores.status === 'rejected') {
    console.error('❌ Falha ao carregar senadores:', senadores.reason)
  }
  if (deputadosEstaduais.status === 'rejected') {
    console.error('❌ Falha ao carregar deputados estaduais:', deputadosEstaduais.reason)
  }

  const json = JSON.stringify(index, null, 2)
  await writeFile(outputPath, json, 'utf-8')

  const totalDeputados = index['deputados-federais'].length
  const totalSenadores = index.senadores.length
  const totalEstaduais = index['deputados-estaduais'].length

  console.log(`✅ Índice gerado em ${outputPath}`)
  console.log(`   • Deputados federais: ${totalDeputados}`)
  console.log(`   • Senadores: ${totalSenadores}`)
  console.log(`   • Deputados estaduais (PR/SC/RS/SP/RJ/MG/ES): ${totalEstaduais}`)
}

void main().catch((error) => {
  console.error('Falha ao gerar índice de políticos:', error)
  process.exitCode = 1
})
