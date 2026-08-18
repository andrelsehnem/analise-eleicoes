import { applySecurityHeaders, jsonResponse } from '../../_lib/security.js'

const TSE_API_BASE = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura'
const TSE_ELECTION_ID = '20322002026'
const UPSTREAM_TIMEOUT_MS = 12_000

function asText(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const normalized = value.trim()

  if (['*', '**', 'null', 'null-null'].includes(normalized.toLowerCase())) {
    return ''
  }

  return normalized
}

function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeAsset(asset) {
  if (!asset || typeof asset !== 'object') {
    return null
  }

  const description = asText(asset.descricao)
  const type = asText(asset.descricaoDeTipoDeBem)
  const value = asNumber(asset.valor)

  if (!description && !type && value === null) {
    return null
  }

  return {
    ordem: asNumber(asset.ordem) ?? 0,
    tipo: type,
    descricao: description,
    valor: value ?? 0,
    atualizadoEm: asText(asset.dataUltimaAtualizacao),
  }
}

function normalizeDetail(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return null
  }

  const id = asNumber(candidate.id)
  const nomeUrna = asText(candidate.nomeUrna)
  const nomeCompleto = asText(candidate.nomeCompleto)
  const numero = asNumber(candidate.numero)

  if (id === null || !nomeUrna || !nomeCompleto || numero === null) {
    return null
  }

  const partido = candidate.partido && typeof candidate.partido === 'object'
    ? candidate.partido
    : {}
  const cargo = candidate.cargo && typeof candidate.cargo === 'object' ? candidate.cargo : {}
  const bens = Array.isArray(candidate.bens)
    ? candidate.bens.map(normalizeAsset).filter((asset) => asset !== null)
    : []

  return {
    id: String(id),
    nomeUrna,
    nomeCompleto,
    numero,
    cargo: asText(cargo.nome) || 'Presidente',
    partido: asText(partido.sigla),
    nomePartido: asText(partido.nome),
    coligacao: asText(candidate.nomeColigacao),
    composicaoColigacao: asText(candidate.composicaoColigacao),
    situacao: asText(candidate.descricaoSituacao),
    situacaoCandidatura: asText(candidate.descricaoSituacaoCandidato),
    situacaoTotalizacao: asText(candidate.descricaoTotalizacao),
    candidatoApto: candidate.candidatoApto === true,
    dataNascimento: asText(candidate.dataDeNascimento),
    sexo: asText(candidate.descricaoSexo),
    corRaca: asText(candidate.descricaoCorRaca),
    estadoCivil: asText(candidate.descricaoEstadoCivil),
    nacionalidade: asText(candidate.nacionalidade),
    escolaridade: asText(candidate.grauInstrucao),
    ocupacao: asText(candidate.ocupacao),
    municipioNascimento: asText(candidate.nomeMunicipioNascimento),
    ufNascimento: asText(candidate.sgUfNascimento),
    fotoUrl: candidate.fotoUrlPublicavel ? asText(candidate.fotoUrl) : '',
    atualizadoEm: asText(candidate.dataUltimaAtualizacao),
    gastoCampanha: asNumber(candidate.gastoCampanha) ?? 0,
    gastoCampanhaPrimeiroTurno: asNumber(candidate.gastoCampanha1T) ?? 0,
    gastoCampanhaSegundoTurno: asNumber(candidate.gastoCampanha2T) ?? 0,
    totalBens: asNumber(candidate.totalDeBens) ?? 0,
    bens,
  }
}

export default async function handler(req, res) {
  applySecurityHeaders(res)

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonResponse(res, 405, { message: 'Método não permitido.' })
  }

  const rawId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id
  const candidateId = typeof rawId === 'string' ? rawId.trim() : ''

  if (!/^\d{6,18}$/.test(candidateId)) {
    return jsonResponse(res, 400, { message: 'Identificador de candidatura inválido.' })
  }

  const upstreamUrl = `${TSE_API_BASE}/buscar/2026/BR/${TSE_ELECTION_ID}/candidato/${candidateId}`

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'MandatoTransparente/1.0 (consulta de dados eleitorais públicos)',
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    if (response.status === 404) {
      return jsonResponse(res, 404, { message: 'Candidatura não encontrada no TSE.' })
    }

    if (!response.ok) {
      throw new Error(`TSE respondeu com HTTP ${response.status}.`)
    }

    const candidate = normalizeDetail(await response.json())

    if (!candidate || candidate.id !== candidateId) {
      throw new Error('Resposta do TSE em formato inesperado.')
    }

    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
    )

    return res.status(200).json({
      fonte: 'Tribunal Superior Eleitoral — DivulgaCandContas',
      fonteUrl: `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BR/BR/${TSE_ELECTION_ID}/${candidateId}/2026/BR`,
      consultadoEm: new Date().toISOString(),
      candidato: candidate,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Erro desconhecido.'
    console.error('[candidatos-2026.presidente-detalhe] Falha ao consultar o TSE:', reason)

    return jsonResponse(res, 502, {
      message: 'Não foi possível consultar os detalhes da candidatura no TSE.',
    })
  }
}
