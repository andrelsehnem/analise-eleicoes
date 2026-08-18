import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const distIndexPath = path.join(distDir, 'index.html')
const routeManifestPath = path.join(projectRoot, 'public', 'prerender-routes.json')
const politiciansIndexPath = path.join(projectRoot, 'public', 'politicians-index.json')

const SITE_NAME = 'Mandato Transparente'
const SITE_URL = 'https://www.mandatotransparente.com.br'
const DEFAULT_DESCRIPTION =
  'Consulte senadores, deputados federais, deputados estaduais e presidência com dados públicos oficiais para votar com mais informação.'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.svg`
const CAMARA_API = 'https://dadosabertos.camara.leg.br/api/v2'
const SENADO_API = 'https://legis.senado.leg.br/dadosabertos'

const STATE_NAME_BY_UF = new Map([
  ['AC', 'Acre'],
  ['AL', 'Alagoas'],
  ['AM', 'Amazonas'],
  ['AP', 'Amapá'],
  ['BA', 'Bahia'],
  ['CE', 'Ceará'],
  ['DF', 'Distrito Federal'],
  ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'],
  ['MA', 'Maranhão'],
  ['MG', 'Minas Gerais'],
  ['MS', 'Mato Grosso do Sul'],
  ['MT', 'Mato Grosso'],
  ['PA', 'Pará'],
  ['PB', 'Paraíba'],
  ['PE', 'Pernambuco'],
  ['PI', 'Piauí'],
  ['PR', 'Paraná'],
  ['RJ', 'Rio de Janeiro'],
  ['RN', 'Rio Grande do Norte'],
  ['RO', 'Rondônia'],
  ['RR', 'Roraima'],
  ['RS', 'Rio Grande do Sul'],
  ['SC', 'Santa Catarina'],
  ['SE', 'Sergipe'],
  ['SP', 'São Paulo'],
  ['TO', 'Tocantins'],
])

function getStateNameByUf(uf) {
  return STATE_NAME_BY_UF.get(String(uf || '').toUpperCase()) || String(uf || '').toUpperCase()
}

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

function buildFallbackMarkup({ title, description, routePath, summary, highlights = [] }) {
  const normalizedTitle = escapeHtml(title)
  const normalizedDescription = escapeHtml(description)
  const normalizedSummary = summary ? escapeHtml(summary) : ''
  const absoluteUrl = escapeHtml(toAbsoluteUrl(routePath))
  const normalizedHighlights = highlights
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .map((item) => `<li style="margin:6px 0;color:#c8d4ee;line-height:1.6;">${escapeHtml(item)}</li>`)
    .join('')

  return [
    '<main style="max-width:980px;margin:0 auto;padding:24px 16px;font-family:IBM Plex Sans,sans-serif;color:#f0f4ff;background:#0a1628;min-height:100vh;">',
    `<h1 style="margin-bottom:12px;font-size:1.8rem;line-height:1.2;">${normalizedTitle}</h1>`,
    `<p style="margin-bottom:10px;color:#c8d4ee;line-height:1.6;">${normalizedDescription}</p>`,
    normalizedSummary
      ? `<p style="margin-bottom:16px;color:#dbe6ff;line-height:1.6;">${normalizedSummary}</p>`
      : '',
    normalizedHighlights
      ? '<section aria-label="Conteúdo disponível sem JavaScript" style="margin-bottom:16px;">'
        + '<h2 style="margin:0 0 8px 0;font-size:1.15rem;color:#f0f4ff;line-height:1.4;">O que você encontra nesta página</h2>'
        + `<ul style="margin:0;padding-left:20px;">${normalizedHighlights}</ul>`
        + '</section>'
      : '',
    '<section aria-label="Fontes de dados públicas" style="margin-bottom:16px;">',
    '<h2 style="margin:0 0 8px 0;font-size:1.15rem;color:#f0f4ff;line-height:1.4;">Fontes oficiais</h2>',
    '<p style="margin:0;color:#c8d4ee;line-height:1.6;">Os dados exibidos são consolidados a partir de fontes públicas oficiais, como Câmara dos Deputados, Senado Federal e portais institucionais estaduais.</p>',
    '</section>',
    `<p style="margin-bottom:12px;color:#8899bb;line-height:1.6;">Página: ${absoluteUrl}</p>`,
    '<p style="color:#c8d4ee;line-height:1.6;">Recursos interativos podem depender de JavaScript, mas as informações essenciais desta página permanecem acessíveis neste HTML.</p>',
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

async function buildStateDeputyNameMap() {
  try {
    const data = await readFile(politiciansIndexPath, 'utf-8')
    const json = JSON.parse(data)
    const items = Array.isArray(json?.['deputados-estaduais']) ? json['deputados-estaduais'] : []
    const map = new Map()

    items.forEach((item) => {
      const uf = String(item?.estado || '').toUpperCase()
      const id = String(item?.id || '')
      const name = String(item?.nome || '').trim()

      if (uf && id && name) {
        map.set(`${uf}:${id}`, name)
      }
    })

    return map
  } catch {
    return new Map()
  }
}

function buildMetaForRoute(routePath, deputyNameByUf, senatorNameById, stateDeputyNameByKey) {
  const normalizedPath = normalizePath(routePath)
  const deputyDetailMatch = normalizedPath.match(/^\/por-estado\/([a-z]{2})\/deputado-federal\/(\d+)$/i)
  const deputyListMatch = normalizedPath.match(/^\/por-estado\/([a-z]{2})\/deputado-federal$/i)
  const stateDeputyDetailMatch = normalizedPath.match(/^\/por-estado\/([a-z]{2})\/deputado-estadual\/([a-z0-9-]+)$/i)
  const stateDeputyListMatch = normalizedPath.match(/^\/por-estado\/([a-z]{2})\/deputado-estadual$/i)
  const senatorDetailMatch = normalizedPath.match(/^\/senador\/(\d+)$/i)
  const senatorListMatch = normalizedPath.match(/^\/senadores\/([a-z]{2})$/i)
  const presidentDetailMatch = normalizedPath.match(/^\/presidente\/([a-z0-9-]+)$/i)
  const generalInfoStateMatch = normalizedPath.match(/^\/informacoes-gerais\/([a-z]{2})$/i)

  if (deputyDetailMatch) {
    const uf = deputyDetailMatch[1].toUpperCase()
    const deputyId = deputyDetailMatch[2]
    const name = deputyNameByUf.get(uf)?.get(deputyId) || `Deputado federal ${deputyId}`
    const title = `Perfil de ${name}`

    return {
      title,
      description: `Acompanhe dados públicos, proposições e votações de ${name}, deputado federal por ${uf}.`,
      summary:
        'Este perfil reúne informações institucionais do parlamentar e facilita a consulta da atuação legislativa em um único lugar.',
      highlights: [
        `Parlamentar: ${name}`,
        `Cargo: Deputado federal por ${uf}`,
        'Histórico de proposições e votações públicas',
      ],
    }
  }

  if (deputyListMatch) {
    const uf = deputyListMatch[1].toUpperCase()
    const stateName = getStateNameByUf(uf)

    return {
      title: `Deputados federais de ${stateName} (${uf}): lista por nome e partido`,
      description: `Veja quais são os deputados federais de ${stateName} (${uf}), filtre por nome ou partido e abra o histórico de atuação parlamentar.`,
      summary:
        'A listagem apresenta os representantes federais do estado para facilitar pesquisa por nome, partido e acesso ao perfil completo.',
      highlights: [
        `UF consultada: ${uf} (${stateName})`,
        'Busca por nome e sigla partidária',
        'Acesso ao perfil individual de cada deputado federal',
      ],
    }
  }

  if (stateDeputyDetailMatch) {
    const uf = stateDeputyDetailMatch[1].toUpperCase()
    const deputyId = stateDeputyDetailMatch[2]
    const name = stateDeputyNameByKey.get(`${uf}:${deputyId}`) || `Deputado estadual ${deputyId}`

    return {
      title: `Perfil de ${name}`,
      description: `Acompanhe dados públicos de ${name}, deputado estadual por ${uf}.`,
      summary:
        'Este perfil consolida informações públicas do representante estadual para apoiar análise eleitoral com base em dados oficiais.',
      highlights: [
        `Parlamentar: ${name}`,
        `Cargo: Deputado estadual por ${uf}`,
        'Consulta de dados públicos e identificação partidária',
      ],
    }
  }

  if (stateDeputyListMatch) {
    const uf = stateDeputyListMatch[1].toUpperCase()

    return {
      title: `Deputados estaduais de ${uf}`,
      description: `Veja a lista de deputados estaduais de ${uf}, filtre por nome ou partido e acesse os perfis oficiais.`,
      summary: 'A página lista os deputados estaduais por UF com foco em navegação simples para o perfil de cada representante.',
      highlights: [
        `UF consultada: ${uf}`,
        'Filtragem por nome ou partido',
        'Links para detalhes individuais dos parlamentares estaduais',
      ],
    }
  }

  if (senatorDetailMatch) {
    const senatorId = senatorDetailMatch[1]
    const name = senatorNameById.get(senatorId) || `Senador ${senatorId}`

    return {
      title: `Perfil de ${name}`,
      description: `Veja dados públicos, mandatos e comissões de ${name} no Senado Federal.`,
      summary:
        'Este perfil oferece um resumo objetivo da atuação no Senado, com informações públicas para acompanhamento do mandato.',
      highlights: [
        `Parlamentar: ${name}`,
        'Cargo: Senador(a) da República',
        'Informações públicas sobre mandatos e comissões',
      ],
    }
  }

  if (senatorListMatch) {
    const uf = senatorListMatch[1].toUpperCase()
    const stateName = getStateNameByUf(uf)

    return {
      title: `Senadores do ${stateName} (${uf}): quem são e quantos são`,
      description: `Veja quais são os senadores do ${stateName} (${uf}). Cada estado e o Distrito Federal elegem 3 senadores. Filtre por nome ou partido e abra o perfil de cada parlamentar.`,
      summary:
        'A listagem apresenta os senadores vinculados ao estado com atalho para consulta individual de cada perfil parlamentar.',
      highlights: [
        `UF consultada: ${uf} (${stateName})`,
        'Relação de senadores com navegação para perfil detalhado',
        'Contexto institucional sobre representação no Senado',
      ],
    }
  }

  if (generalInfoStateMatch) {
    const uf = generalInfoStateMatch[1].toUpperCase()
    const stateName = getStateNameByUf(uf)

    return {
      title: `Quantos senadores e deputados têm em ${stateName} (${uf})`,
      description: `Consulte quantos senadores, deputados federais e deputados estaduais têm em ${stateName} (${uf}), com distribuição por cargo e partido.`,
      summary:
        'A página resume a composição política do estado por cargo eletivo, ajudando a entender a distribuição de representação.',
      highlights: [
        `UF consultada: ${uf} (${stateName})`,
        'Totais por cargo: Senado, Câmara Federal e Assembleia Legislativa',
        'Distribuição por partido com base em fontes públicas',
      ],
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
      summary:
        'O perfil reúne dados institucionais da Presidência para consulta pública e comparação de trajetória governamental.',
      highlights: [
        `Autoridade: ${name}`,
        'Cargo: Presidência ou Vice-Presidência da República',
        'Resumo público de mandatos e histórico político',
      ],
    }
  }

  if (normalizedPath === '/presidente') {
    return {
      title: 'Presidente e vice-presidente',
      description:
        'Consulte presidente e vice-presidente atuais, com dados públicos sobre mandato, trajetória e fontes oficiais.',
      summary: 'A página centraliza o acesso aos perfis da chapa presidencial atual com contexto institucional e histórico resumido.',
      highlights: [
        'Lista de presidente e vice-presidente em exercício',
        'Acesso ao perfil detalhado de cada autoridade',
        'Referências baseadas em fontes oficiais públicas',
      ],
    }
  }

  if (normalizedPath === '/por-estado') {
    return {
      title: 'Seleção por estado e cargo',
      description:
        'Selecione o cargo e o estado para consultar deputados federais e senadores com dados públicos oficiais.',
      summary:
        'Esta etapa orienta a navegação por UF e cargo para abrir listagens de representantes com base em dados oficiais.',
      highlights: [
        'Escolha de estado da federação',
        'Seleção de cargo político para consulta',
        'Atalho para listas e perfis de parlamentares',
      ],
    }
  }

  if (normalizedPath === '/candidatos-2026') {
    return {
      title: 'Candidatos 2026',
      description:
        'Conheça a futura consulta de candidatos das Eleições 2026 por cargo e estado, baseada nos registros oficiais da Justiça Eleitoral.',
      summary:
        'A área apresenta a estrutura planejada para consultar candidaturas por cargo e unidade da federação quando os dados oficiais estiverem disponíveis.',
      highlights: [
        'Prévia da consulta por cargo eleitoral',
        'Seleção futura por estado',
        'Dados condicionados à publicação das candidaturas oficiais',
      ],
    }
  }

  if (normalizedPath === '/candidatos-2026/presidente') {
    return {
      title: 'Candidatos à Presidência em 2026',
      description:
        'Consulte a lista de candidatos à Presidência nas Eleições 2026 com dados publicados pelo Tribunal Superior Eleitoral.',
      summary:
        'Lista de candidaturas à Presidência com nome de urna, número, partido e situação publicada pela Justiça Eleitoral.',
      highlights: [
        'Dados do Tribunal Superior Eleitoral',
        'Busca por nome, número, partido ou coligação',
        'Acesso ao perfil oficial de cada candidatura',
      ],
    }
  }

  const stateCandidateMatch = normalizedPath.match(/^\/candidatos-2026\/(governador|senador|deputado-federal|deputado-estadual)\/([a-z]{2})$/)
  if (stateCandidateMatch) {
    const officeLabels = { governador: 'Governador', senador: 'Senador',
      'deputado-federal': 'Deputado Federal', 'deputado-estadual': 'Deputado Estadual' }
    const uf = stateCandidateMatch[2].toUpperCase()
    const officeLabel = stateCandidateMatch[1] === 'deputado-estadual' && uf === 'DF'
      ? 'Deputado Distrital' : officeLabels[stateCandidateMatch[1]]
    return {
      title: `Candidatos a ${officeLabel} de ${uf} em 2026`,
      description:
        `Consulte os candidatos a ${officeLabel} de ${uf} nas Eleições 2026 com dados publicados pelo Tribunal Superior Eleitoral.`,
      summary:
        `Lista de candidaturas a ${officeLabel} de ${uf} com nome de urna, número, partido e situação publicada pela Justiça Eleitoral.`,
      highlights: [
        'Dados do Tribunal Superior Eleitoral',
        'Busca por nome, número, partido ou coligação',
        'Acesso ao perfil oficial de cada candidatura',
      ],
    }
  }

  if (normalizedPath === '/candidatos-2026/guia-eleicoes') {
    return {
      title: 'Eleições 2026: datas, cargos, ordem de votação e como votar',
      description:
        'Confira as datas das Eleições 2026, os cargos em disputa, a ordem dos seis votos na urna e orientações simples sobre como votar.',
      summary:
        'Guia informativo sobre as Eleições Gerais de 2026, sem antecipar candidaturas antes da publicação dos registros oficiais.',
      highlights: [
        'Primeiro turno em 4 de outubro e eventual segundo turno em 25 de outubro',
        'Ordem das seis escolhas na urna eletrônica',
        'Orientações para conferir os dados e confirmar o voto',
      ],
    }
  }

  if (normalizedPath === '/informacoes-gerais') {
    return {
      title: 'Informações gerais por estado e cargo',
      description:
        'Consulte quantos senadores, deputados federais e deputados estaduais existem por estado, com distribuição por cargo e partido.',
      summary:
        'A visão geral permite identificar rapidamente o volume de representantes por estado e cargo em uma única consulta.',
      highlights: [
        'Panorama de representatividade por UF',
        'Totais por cargo político',
        'Distribuição por partidos com base em dados públicos',
      ],
    }
  }

  if (normalizedPath === '/sobre') {
    return {
      title: 'Sobre o projeto',
      description:
        'Conheça o Mandato Transparente, projeto de consulta pública para acompanhar o histórico de atuação política no Brasil.',
      summary:
        'Esta seção explica o propósito da plataforma, metodologia de consolidação de dados e compromisso com transparência.',
      highlights: [
        'Objetivo e escopo do projeto',
        'Como os dados públicos são reunidos',
        'Diretrizes de uso responsável da informação',
      ],
    }
  }

  if (normalizedPath === '/privacidade') {
    return {
      title: 'Política de Privacidade e Cookies',
      description:
        'Entenda como o Mandato Transparente trata consentimento de cookies e o carregamento de scripts de rastreamento.',
      summary:
        'A política descreve como o consentimento é coletado e como tecnologias de rastreamento são aplicadas no site.',
      highlights: [
        'Regras de consentimento de cookies',
        'Uso de scripts de medição e publicidade',
        'Direitos do usuário sobre preferências de rastreamento',
      ],
    }
  }

  if (normalizedPath === '/termos') {
    return {
      title: 'Termos de Uso',
      description:
        'Consulte os termos de uso do Mandato Transparente, incluindo responsabilidades, limites e condições de acesso ao serviço.',
      summary:
        'Os termos de uso definem as condições para utilização da plataforma e a responsabilidade sobre interpretação dos dados públicos.',
      highlights: [
        'Condições de uso da plataforma',
        'Limites de responsabilidade e natureza informativa dos dados',
        'Diretrizes de conduta para navegação e uso do conteúdo',
      ],
    }
  }

  if (normalizedPath === '/sugestoes') {
    return {
      title: 'Sugestões',
      description:
        'Envie sugestões para melhorar o Mandato Transparente e fortalecer a consulta de dados públicos para eleitores.',
      summary:
        'Este canal permite enviar melhorias e reportar oportunidades para evoluir a experiência de consulta pública.',
      highlights: [
        'Envio de propostas de melhoria',
        'Comunicação de ajustes de conteúdo e usabilidade',
        'Aprimoramento contínuo com participação da comunidade',
      ],
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

function applyHeadMeta(htmlTemplate, routePath, meta) {
  const { title, description } = meta
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

  const fallbackMarkup = buildFallbackMarkup({
    title,
    description,
    routePath,
    summary: meta.summary,
    highlights: meta.highlights,
  })
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

  const [deputyNameByUf, senatorNameById, stateDeputyNameByKey] = await Promise.all([
    buildDeputyNameMap(routes),
    buildSenatorNameMap(),
    buildStateDeputyNameMap(),
  ])

  await Promise.all(
    routes.map(async (routePath) => {
      const meta = buildMetaForRoute(routePath, deputyNameByUf, senatorNameById, stateDeputyNameByKey)
      const html = applyHeadMeta(distHtml, routePath, meta)
      await writeRouteHtml(routePath, html)
    }),
  )

  console.log(`Prerender estático concluído para ${routes.length} rotas em ${distDir}`)
}

void main().catch((error) => {
  console.error('Falha ao gerar páginas prerenderizadas:', error)
  process.exitCode = 1
})
