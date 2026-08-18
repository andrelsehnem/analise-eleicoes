import { applySecurityHeaders, jsonResponse } from '../../_lib/security.js'

const TSE_API_BASE = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura'
const TSE_ELECTION_ID = '20322002026'
const TIMEOUT_MS = 12_000
const VALID_UFS = new Set(['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'])

function text(value) {
  if (typeof value !== 'string') return ''
  const normalized = value.trim()
  return ['*', '**', 'null', 'null-null'].includes(normalized.toLowerCase()) ? '' : normalized
}
function number(value) { return typeof value === 'number' && Number.isFinite(value) ? value : null }
function asset(value) {
  if (!value || typeof value !== 'object') return null
  const descricao = text(value.descricao)
  const tipo = text(value.descricaoDeTipoDeBem)
  const valor = number(value.valor)
  if (!descricao && !tipo && valor === null) return null
  return { ordem: number(value.ordem) ?? 0, tipo, descricao, valor: valor ?? 0,
    atualizadoEm: text(value.dataUltimaAtualizacao) }
}
function baseCandidate(candidate, uf, fallbackOffice) {
  if (!candidate || typeof candidate !== 'object') return null
  const id = number(candidate.id)
  const nomeUrna = text(candidate.nomeUrna)
  const nomeCompleto = text(candidate.nomeCompleto)
  const numero = number(candidate.numero)
  if (id === null || !nomeUrna || !nomeCompleto || numero === null) return null
  const partido = candidate.partido && typeof candidate.partido === 'object' ? candidate.partido : {}
  return { id: String(id), nomeUrna, nomeCompleto, numero, partido: text(partido.sigla),
    nomePartido: text(partido.nome), coligacao: text(candidate.nomeColigacao),
    cargo: text(candidate.cargo?.nome) || fallbackOffice, situacao: text(candidate.descricaoSituacao),
    situacaoTotalizacao: text(candidate.descricaoTotalizacao), uf: text(candidate.ufCandidatura) || uf,
    fotoUrl: candidate.fotoUrlPublicavel === false ? '' : text(candidate.fotoUrl),
    atualizadoEm: text(candidate.dataUltimaAtualizacao) }
}
function detailCandidate(candidate, uf, fallbackOffice) {
  const base = baseCandidate(candidate, uf, fallbackOffice)
  if (!base) return null
  return { ...base, composicaoColigacao: text(candidate.composicaoColigacao),
    situacaoCandidatura: text(candidate.descricaoSituacaoCandidato), candidatoApto: candidate.candidatoApto === true,
    dataNascimento: text(candidate.dataDeNascimento), sexo: text(candidate.descricaoSexo),
    corRaca: text(candidate.descricaoCorRaca), estadoCivil: text(candidate.descricaoEstadoCivil),
    nacionalidade: text(candidate.nacionalidade), escolaridade: text(candidate.grauInstrucao),
    ocupacao: text(candidate.ocupacao), municipioNascimento: text(candidate.nomeMunicipioNascimento),
    ufNascimento: text(candidate.sgUfNascimento), gastoCampanha: number(candidate.gastoCampanha) ?? 0,
    gastoCampanhaPrimeiroTurno: number(candidate.gastoCampanha1T) ?? 0,
    gastoCampanhaSegundoTurno: number(candidate.gastoCampanha2T) ?? 0,
    totalBens: number(candidate.totalDeBens) ?? 0,
    bens: Array.isArray(candidate.bens) ? candidate.bens.map(asset).filter(Boolean) : [] }
}
function requestOptions() {
  return { headers: { Accept: 'application/json',
    'User-Agent': 'MandatoTransparente/1.0 (consulta de dados eleitorais públicos)' },
    signal: AbortSignal.timeout(TIMEOUT_MS) }
}
function readParam(req, name) {
  const raw = req.query?.[name]
  return (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? ''
}

export function createStateCandidatesListHandler(config) {
  return async function handler(req, res) {
    applySecurityHeaders(res)
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return jsonResponse(res, 405, { message: 'Método não permitido.' }) }
    const uf = readParam(req, 'uf').toUpperCase()
    if (!VALID_UFS.has(uf)) return jsonResponse(res, 400, { message: 'Estado inválido.' })
    const officeCode = config.officeCode(uf)
    const officeLabel = config.officeLabel(uf)
    const upstreamUrl = `${TSE_API_BASE}/listar/2026/${uf}/${TSE_ELECTION_ID}/${officeCode}/candidatos`
    try {
      const response = await fetch(upstreamUrl, requestOptions())
      if (!response.ok) throw new Error(`TSE respondeu com HTTP ${response.status}.`)
      const payload = await response.json()
      if (!payload || typeof payload !== 'object' || !Array.isArray(payload.candidatos)) throw new Error('Resposta do TSE em formato inesperado.')
      const candidatos = payload.candidatos.map((candidate) => baseCandidate(candidate, uf, officeLabel))
        .filter(Boolean).sort((left, right) => left.nomeUrna.localeCompare(right.nomeUrna, 'pt-BR'))
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400')
      return res.status(200).json({ fonte: 'Tribunal Superior Eleitoral — DivulgaCandContas', fonteUrl: upstreamUrl,
        consultadoEm: new Date().toISOString(), total: candidatos.length, candidatos })
    } catch (error) {
      console.error(`[candidatos-2026.${config.logName}] Falha ao consultar o TSE:`, error instanceof Error ? error.message : 'Erro desconhecido.')
      return jsonResponse(res, 502, { message: `Não foi possível consultar os candidatos a ${officeLabel} de ${uf} no TSE.` })
    }
  }
}

export function createStateCandidateDetailHandler(config) {
  return async function handler(req, res) {
    applySecurityHeaders(res)
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return jsonResponse(res, 405, { message: 'Método não permitido.' }) }
    const uf = readParam(req, 'uf').toUpperCase()
    const candidateId = readParam(req, 'id')
    if (!VALID_UFS.has(uf)) return jsonResponse(res, 400, { message: 'Estado inválido.' })
    if (!/^\d{6,18}$/.test(candidateId)) return jsonResponse(res, 400, { message: 'Identificador de candidatura inválido.' })
    const officeLabel = config.officeLabel(uf)
    const upstreamUrl = `${TSE_API_BASE}/buscar/2026/${uf}/${TSE_ELECTION_ID}/candidato/${candidateId}`
    try {
      const response = await fetch(upstreamUrl, requestOptions())
      if (response.status === 404) return jsonResponse(res, 404, { message: 'Candidatura não encontrada no TSE.' })
      if (!response.ok) throw new Error(`TSE respondeu com HTTP ${response.status}.`)
      const candidato = detailCandidate(await response.json(), uf, officeLabel)
      if (!candidato || candidato.id !== candidateId || candidato.cargo.toLocaleLowerCase('pt-BR') !== officeLabel.toLocaleLowerCase('pt-BR')) {
        return jsonResponse(res, 404, { message: 'Candidatura não encontrada para este cargo e estado.' })
      }
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400')
      return res.status(200).json({ fonte: 'Tribunal Superior Eleitoral — DivulgaCandContas',
        fonteUrl: `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/${uf}/${uf}/${TSE_ELECTION_ID}/${candidateId}/2026/${uf}`,
        consultadoEm: new Date().toISOString(), candidato })
    } catch (error) {
      console.error(`[candidatos-2026.${config.logName}-detalhe] Falha ao consultar o TSE:`, error instanceof Error ? error.message : 'Erro desconhecido.')
      return jsonResponse(res, 502, { message: 'Não foi possível consultar os detalhes da candidatura no TSE.' })
    }
  }
}
