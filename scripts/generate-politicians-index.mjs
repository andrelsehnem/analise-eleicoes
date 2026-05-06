/**
 * Gera public/politicians-index.json com todos os políticos disponíveis,
 * organizados por tipo (deputados-federais, senadores).
 *
 * Este script é executado durante o build (pnpm build) e também pode ser
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

const STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB',
  'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

/**
 * @typedef {{ id: string | number; nome: string; estado: string; partido: string }} PoliticianEntry
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

  const results = await Promise.allSettled(
    STATES.map(async (uf) => loadDeputadosFederaisByUf(uf)),
  )

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      all.push(...result.value)
      return
    }

    console.warn(`⚠️  ${result.reason instanceof Error ? result.reason.message : `Falha ao buscar deputados federais da UF ${STATES[index]}.`}`)
  })

  const rejected = results.filter((r) => r.status === 'rejected')
  if (rejected.length > 0) {
    console.warn(`⚠️  ${rejected.length} UF(s) com falha ao buscar deputados federais.`)
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

async function main() {
  console.log('🔄 Gerando índice de políticos...')

  const [deputadosFederais, senadores] = await Promise.allSettled([
    loadDeputadosFederais(),
    loadSenadores(),
  ])

  const index = {
    geradoEm: new Date().toISOString(),
    'deputados-federais':
      deputadosFederais.status === 'fulfilled' ? deputadosFederais.value : [],
    senadores: senadores.status === 'fulfilled' ? senadores.value : [],
  }

  if (deputadosFederais.status === 'rejected') {
    console.error('❌ Falha ao carregar deputados federais:', deputadosFederais.reason)
  }
  if (senadores.status === 'rejected') {
    console.error('❌ Falha ao carregar senadores:', senadores.reason)
  }

  const json = JSON.stringify(index, null, 2)
  await writeFile(outputPath, json, 'utf-8')

  const totalDeputados = index['deputados-federais'].length
  const totalSenadores = index.senadores.length

  console.log(`✅ Índice gerado em ${outputPath}`)
  console.log(`   • Deputados federais: ${totalDeputados}`)
  console.log(`   • Senadores: ${totalSenadores}`)
}

void main().catch((error) => {
  console.error('Falha ao gerar índice de políticos:', error)
  process.exitCode = 1
})
