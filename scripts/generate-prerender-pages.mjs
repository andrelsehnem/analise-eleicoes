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

function renderSection(section) {
  const heading = `<h2 style="margin:0 0 8px 0;font-size:1.15rem;color:#f0f4ff;line-height:1.4;">${escapeHtml(section.heading)}</h2>`
  const paragraphs = (section.paragraphs || [])
    .map((text) => `<p style="margin:0 0 10px 0;color:#c8d4ee;line-height:1.6;">${escapeHtml(text)}</p>`)
    .join('')
  const items = (section.items || [])
    .map((item) => {
      const label = escapeHtml(item.text)
      const content = item.href
        ? `<a href="${escapeHtml(item.href)}" style="color:#e8c96d;">${label}</a>`
        : label
      return `<li style="margin:4px 0;color:#c8d4ee;line-height:1.5;">${content}</li>`
    })
    .join('')
  const list = items ? `<ul style="margin:0;padding-left:20px;">${items}</ul>` : ''
  return `<section style="margin-bottom:20px;">${heading}${paragraphs}${list}</section>`
}

function buildFallbackMarkup({ title, description, routePath, summary, highlights = [], sections = [] }) {
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
    sections.map(renderSection).join(''),
    '<section aria-label="Fontes de dados públicas" style="margin-bottom:16px;">',
    '<h2 style="margin:0 0 8px 0;font-size:1.15rem;color:#f0f4ff;line-height:1.4;">Fontes oficiais</h2>',
    '<p style="margin:0;color:#c8d4ee;line-height:1.6;">Os dados exibidos são consolidados a partir de fontes públicas oficiais, como Câmara dos Deputados, Senado Federal e portais institucionais estaduais.</p>',
    '</section>',
    `<p style="margin-bottom:12px;color:#8899bb;line-height:1.6;">Página: ${absoluteUrl}</p>`,
    '<p style="color:#c8d4ee;line-height:1.6;">Recursos interativos podem depender de JavaScript, mas as informações essenciais desta página permanecem acessíveis neste HTML.</p>',
    '</main>',
  ].join('')
}

async function loadPoliticiansIndex() {
  try {
    const json = JSON.parse(await readFile(politiciansIndexPath, 'utf-8'))
    const pick = (key) => (Array.isArray(json?.[key]) ? json[key] : [])
    return {
      federais: pick('deputados-federais'),
      senadores: pick('senadores'),
      estaduais: pick('deputados-estaduais'),
    }
  } catch {
    return { federais: [], senadores: [], estaduais: [] }
  }
}

function buildNameMapsFromIndex(index) {
  const deputyNameByUf = new Map()
  index.federais.forEach((item) => {
    const uf = String(item.estado || '').toUpperCase()
    if (!deputyNameByUf.has(uf)) deputyNameByUf.set(uf, new Map())
    deputyNameByUf.get(uf).set(String(item.id), item.nome)
  })
  const senatorNameById = new Map(index.senadores.map((item) => [String(item.id), item.nome]))
  const stateDeputyNameByKey = new Map(
    index.estaduais.map((item) => [`${String(item.estado).toUpperCase()}:${item.id}`, item.nome]),
  )
  return { deputyNameByUf, senatorNameById, stateDeputyNameByKey }
}

const OFFICE_INFO = {
  'deputado-federal': {
    label: 'Deputado federal',
    plural: 'Deputados federais',
    house: 'na Câmara dos Deputados',
    paragraphs: [
      'Os deputados federais representam a população na Câmara dos Deputados. Eles apresentam e votam projetos de lei, propostas de emenda à Constituição e medidas provisórias, além de fiscalizar o Poder Executivo e aprovar o orçamento da União.',
      'O mandato é de quatro anos e a eleição é proporcional: as vagas de cada estado são distribuídas entre partidos e federações conforme a votação total recebida e depois preenchidas pelos candidatos mais votados de cada legenda. O número de deputados por estado varia de 8 a 70, de acordo com a população.',
      'Ao avaliar um deputado federal, vale observar as proposições de sua autoria, como votou em temas relevantes, a presença nas sessões e as comissões de que participa.',
    ],
  },
  'deputado-estadual': {
    label: 'Deputado estadual',
    plural: 'Deputados estaduais',
    house: 'na Assembleia Legislativa',
    paragraphs: [
      'Os deputados estaduais (distritais, no Distrito Federal) atuam na Assembleia Legislativa. Eles criam e votam leis estaduais, aprovam o orçamento do estado e fiscalizam as ações do governador e das secretarias.',
      'Assim como os deputados federais, são eleitos pelo sistema proporcional para mandatos de quatro anos. O tamanho de cada Assembleia é definido a partir do número de deputados federais do estado.',
      'Temas como segurança pública, educação estadual, saúde regional e tributos estaduais, como o ICMS, passam pela Assembleia, o que torna o acompanhamento desses parlamentares importante para o dia a dia do eleitor.',
    ],
  },
  senador: {
    label: 'Senador',
    plural: 'Senadores',
    house: 'no Senado Federal',
    paragraphs: [
      'Os senadores representam os estados e o Distrito Federal no Senado Federal. Cada unidade da federação tem três senadores, independentemente do tamanho da população, o que garante equilíbrio entre os estados.',
      'O mandato é de oito anos e a renovação é alternada: em uma eleição é renovado um terço das cadeiras e, na seguinte, dois terços. A eleição é majoritária, ou seja, vence quem recebe mais votos.',
      'Além de votar leis e emendas constitucionais, o Senado tem competências exclusivas, como aprovar indicações de ministros do STF e de embaixadores, autorizar operações financeiras externas e julgar o presidente da República em processos de impeachment.',
    ],
  },
}

function partyBreakdown(items) {
  const counts = new Map()
  items.forEach((item) => {
    const party = item.partido || 'Sem partido'
    counts.set(party, (counts.get(party) || 0) + 1)
  })
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function memberLink(office, item) {
  if (office === 'senador') return `/senador/${item.id}`
  return `/por-estado/${String(item.estado).toLowerCase()}/${office}/${item.id}`
}

function membersSection(office, heading, items) {
  return {
    heading,
    items: [...items]
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      .map((item) => ({ text: `${item.nome} (${item.partido || 'sem partido'})`, href: memberLink(office, item) })),
  }
}

function partySection(stateName, groupLabel, items) {
  const breakdown = partyBreakdown(items)
  if (breakdown.length === 0) return null
  const [topParty, topCount] = breakdown[0]
  return {
    heading: 'Distribuição por partido',
    paragraphs: [
      `${stateName} tem ${items.length} ${groupLabel} em exercício, de ${breakdown.length} partidos diferentes. O partido com mais representantes é o ${topParty}, com ${topCount}.`,
    ],
    items: breakdown.map(([party, count]) => ({ text: `${party}: ${count}` })),
  }
}

function officeSection(info) {
  return { heading: `O que faz um ${info.label.toLowerCase()}`, paragraphs: info.paragraphs }
}

function buildEnrichedSections(routePath, index) {
  const routeKey = normalizePath(routePath)
  const byOffice = {
    'deputado-federal': index.federais,
    'deputado-estadual': index.estaduais,
    senador: index.senadores,
  }
  const ofState = (office, uf) => byOffice[office].filter((item) => String(item.estado).toUpperCase() === uf)

  const detail = routeKey.match(/^\/por-estado\/([a-z]{2})\/(deputado-federal|deputado-estadual)\/([a-z0-9-]+)$/i)
  const list = routeKey.match(/^\/por-estado\/([a-z]{2})\/(deputado-federal|deputado-estadual)$/i)
  const senatorDetail = routeKey.match(/^\/senador\/(\d+)$/i)
  const senatorList = routeKey.match(/^\/senadores\/([a-z]{2})$/i)
  const generalState = routeKey.match(/^\/informacoes-gerais\/([a-z]{2})$/i)

  if (detail || senatorDetail) {
    const office = senatorDetail ? 'senador' : detail[2]
    const id = senatorDetail ? senatorDetail[1] : detail[3]
    const person = byOffice[office].find((item) => String(item.id) === id)
    if (!person) return []
    const uf = String(person.estado).toUpperCase()
    const stateName = getStateNameByUf(uf)
    const info = OFFICE_INFO[office]
    const peers = ofState(office, uf)
    const sameParty = peers.filter((item) => item.partido === person.partido && item.id !== person.id)
    const party = person.partido || 'partido não informado'

    return [
      {
        heading: `Quem é ${person.nome}`,
        paragraphs: [
          `${person.nome} é ${info.label.toLowerCase()} por ${stateName} (${uf}), filiado(a) ao ${party}, com mandato em exercício ${info.house}.`,
          `${stateName} tem ${peers.length} ${info.plural.toLowerCase()} em exercício. ${
            sameParty.length > 0
              ? `Além de ${person.nome}, ${sameParty.length === 1 ? "outro parlamentar também é" : `outros ${sameParty.length} também são`} do ${party}.`
              : `${person.nome} é o(a) único(a) representante do ${party} neste cargo no estado.`
          }`,
        ],
        items: [
          { text: `Cargo: ${info.label}` },
          { text: `Partido: ${party}` },
          { text: `Estado: ${stateName} (${uf})` },
        ],
      },
      officeSection(info),
      membersSection(
        office,
        `Outros ${info.plural.toLowerCase()} de ${stateName}`,
        peers.filter((item) => item.id !== person.id),
      ),
    ]
  }

  if (list || senatorList) {
    const office = senatorList ? 'senador' : list[2]
    const uf = (senatorList ? senatorList[1] : list[1]).toUpperCase()
    const stateName = getStateNameByUf(uf)
    const info = OFFICE_INFO[office]
    const members = ofState(office, uf)
    const sections = [officeSection(info)]
    const parties = partySection(stateName, info.plural.toLowerCase(), members)
    if (parties) sections.push(parties)
    if (members.length > 0) sections.push(membersSection(office, `${info.plural} de ${stateName} (${uf})`, members))
    return sections
  }

  if (generalState) {
    const uf = generalState[1].toUpperCase()
    const ufLower = uf.toLowerCase()
    const stateName = getStateNameByUf(uf)
    const federais = ofState('deputado-federal', uf)
    const estaduais = ofState('deputado-estadual', uf)
    const senadores = ofState('senador', uf)
    const sections = [
      {
        heading: `Representação política de ${stateName}`,
        paragraphs: [
          `${stateName} é representado no Congresso Nacional por ${senadores.length} senadores e ${federais.length} deputados federais. Na esfera estadual, ${estaduais.length} deputados estaduais com dados disponíveis nesta plataforma compõem a Assembleia Legislativa.`,
        ],
        items: [
          { text: `Senadores: ${senadores.length}`, href: `/senadores/${ufLower}` },
          { text: `Deputados federais: ${federais.length}`, href: `/por-estado/${ufLower}/deputado-federal` },
          { text: `Deputados estaduais: ${estaduais.length}`, href: `/por-estado/${ufLower}/deputado-estadual` },
        ],
      },
    ]
    const parties = partySection(stateName, 'parlamentares', [...senadores, ...federais, ...estaduais])
    if (parties) sections.push(parties)
    return sections
  }

  if (routeKey === '/' || routeKey === '/por-estado' || routeKey === '/informacoes-gerais') {
    return [
      {
        heading: 'Consulte seus representantes por estado',
        paragraphs: [
          `O Mandato Transparente reúne dados públicos de ${index.senadores.length} senadores, ${index.federais.length} deputados federais e ${index.estaduais.length} deputados estaduais, organizados por estado, para que o eleitor conheça a atuação de quem o representa antes de votar.`,
        ],
        items: [...STATE_NAME_BY_UF.entries()].map(([uf, name]) => ({
          text: name,
          href: `/informacoes-gerais/${uf.toLowerCase()}`,
        })),
      },
      ...Object.values(OFFICE_INFO).map(officeSection),
    ]
  }

  const candidateMatch = routeKey.match(/^\/candidatos-2026\/(senador|deputado-federal|deputado-estadual)\//)
  if (candidateMatch) {
    return [officeSection(OFFICE_INFO[candidateMatch[1]])]
  }

  return []
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
    sections: meta.sections,
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

  // Usa o índice local (versionado) para não depender de APIs externas durante o build.
  const politiciansIndex = await loadPoliticiansIndex()
  const { deputyNameByUf, senatorNameById, stateDeputyNameByKey } = buildNameMapsFromIndex(politiciansIndex)

  await Promise.all(
    routes.map(async (routePath) => {
      const meta = buildMetaForRoute(routePath, deputyNameByUf, senatorNameById, stateDeputyNameByKey)
      meta.sections = buildEnrichedSections(routePath, politiciansIndex)
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
