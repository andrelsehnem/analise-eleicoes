import { applySecurityHeaders, jsonResponse } from '../_lib/security.js'

const TSE_PRESIDENTS_URL =
  'https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2026/BR/20322002026/1/candidatos'
const TSE_CANDIDATE_DETAIL_BASE =
  'https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/buscar/2026/BR/20322002026/candidato'
const UPSTREAM_TIMEOUT_MS = 12_000

function asText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function asNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeCandidate(candidate) {
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

  return {
    id: String(id),
    nomeUrna,
    nomeCompleto,
    numero,
    partido: asText(partido.sigla),
    nomePartido: asText(partido.nome),
    coligacao: asText(candidate.nomeColigacao),
    cargo: asText(candidate.cargo?.nome) || 'Presidente',
    situacao: asText(candidate.descricaoSituacao),
    situacaoTotalizacao: asText(candidate.descricaoTotalizacao),
    uf: asText(candidate.ufCandidatura) || 'BR',
    fotoUrl: candidate.fotoUrlPublicavel === false ? '' : asText(candidate.fotoUrl),
    atualizadoEm: asText(candidate.dataUltimaAtualizacao),
  }
}

async function fetchCandidatePhoto(candidateId) {
  try {
    const response = await fetch(`${TSE_CANDIDATE_DETAIL_BASE}/${candidateId}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'MandatoTransparente/1.0 (consulta de dados eleitorais públicos)',
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })

    if (!response.ok) {
      return ''
    }

    const candidate = await response.json()

    if (!candidate || typeof candidate !== 'object' || candidate.fotoUrlPublicavel === false) {
      return ''
    }

    return asText(candidate.fotoUrl)
  } catch {
    return ''
  }
}

async function fetchPresidents() {
  const response = await fetch(TSE_PRESIDENTS_URL, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'MandatoTransparente/1.0 (consulta de dados eleitorais públicos)',
    },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`TSE respondeu com HTTP ${response.status}.`)
  }

  const payload = await response.json()

  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.candidatos)) {
    throw new Error('Resposta do TSE em formato inesperado.')
  }

  const candidates = payload.candidatos
    .map(normalizeCandidate)
    .filter((candidate) => candidate !== null)
    .sort((left, right) => left.nomeUrna.localeCompare(right.nomeUrna, 'pt-BR'))

  return Promise.all(
    candidates.map(async (candidate) => ({
      ...candidate,
      fotoUrl: candidate.fotoUrl || await fetchCandidatePhoto(candidate.id),
    })),
  )
}

export default async function handler(req, res) {
  applySecurityHeaders(res)

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonResponse(res, 405, { message: 'Método não permitido.' })
  }

  try {
    const candidatos = await fetchPresidents()

    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
    )

    return res.status(200).json({
      fonte: 'Tribunal Superior Eleitoral — DivulgaCandContas',
      fonteUrl: TSE_PRESIDENTS_URL,
      consultadoEm: new Date().toISOString(),
      total: candidatos.length,
      candidatos,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Erro desconhecido.'
    console.error('[candidatos-2026.presidentes] Falha ao consultar o TSE:', reason)

    return jsonResponse(res, 502, {
      message: 'Não foi possível consultar os candidatos à Presidência no TSE.',
    })
  }
}
