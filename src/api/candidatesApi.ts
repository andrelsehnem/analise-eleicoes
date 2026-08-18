import type {
  PresidentialCandidateDetailResponse,
  PresidentialCandidatesResponse,
  GovernorCandidateDetailResponse,
  GovernorCandidatesResponse,
  ElectionCandidateDetailResponse,
  ElectionCandidatesResponse,
  StateElectionOffice,
} from '../types/camara'
import { getStateElectionOffice } from '../constants/electionOffices'

const VALID_UF = /^[A-Z]{2}$/

function normalizeUf(uf: string): string {
  const normalizedUf = uf.trim().toUpperCase()

  if (!VALID_UF.test(normalizedUf)) {
    throw new Error('Estado inválido para a consulta de candidaturas.')
  }

  return normalizedUf
}

export async function fetchPresidentialCandidates(): Promise<PresidentialCandidatesResponse> {
  const response = await fetch('/api/candidatos-2026/presidentes')
  const body = (await response.json().catch(() => null)) as
    | PresidentialCandidatesResponse
    | { message?: string }
    | null

  if (!response.ok) {
    const message = body && 'message' in body ? body.message : ''
    throw new Error(message || 'Não foi possível consultar os candidatos à Presidência.')
  }

  if (!body || !('candidatos' in body) || !Array.isArray(body.candidatos)) {
    throw new Error('O servidor retornou uma resposta inválida para os candidatos à Presidência.')
  }

  return body
}

export async function fetchPresidentialCandidateDetail(
  candidateId: string,
): Promise<PresidentialCandidateDetailResponse> {
  const response = await fetch(`/api/candidatos-2026/presidentes/${encodeURIComponent(candidateId)}`)
  const body = (await response.json().catch(() => null)) as
    | PresidentialCandidateDetailResponse
    | { message?: string }
    | null

  if (!response.ok) {
    const message = body && 'message' in body ? body.message : ''
    throw new Error(message || 'Não foi possível consultar os detalhes da candidatura.')
  }

  if (!body || !('candidato' in body) || !body.candidato) {
    throw new Error('O servidor retornou uma resposta inválida para a candidatura.')
  }

  return body
}

export async function fetchGovernorCandidates(uf: string): Promise<GovernorCandidatesResponse> {
  const normalizedUf = normalizeUf(uf)
  const response = await fetch(`/api/candidatos-2026/governadores/${normalizedUf}`)
  const body = (await response.json().catch(() => null)) as
    | GovernorCandidatesResponse
    | { message?: string }
    | null

  if (!response.ok) {
    const message = body && 'message' in body ? body.message : ''
    throw new Error(message || 'Não foi possível consultar os candidatos a Governador.')
  }

  if (!body || !('candidatos' in body) || !Array.isArray(body.candidatos)) {
    throw new Error('O servidor retornou uma resposta inválida para os candidatos a Governador.')
  }

  return body
}

export async function fetchGovernorCandidateDetail(
  uf: string,
  candidateId: string,
): Promise<GovernorCandidateDetailResponse> {
  const normalizedUf = normalizeUf(uf)
  const response = await fetch(
    `/api/candidatos-2026/governadores/${normalizedUf}/${encodeURIComponent(candidateId)}`,
  )
  const body = (await response.json().catch(() => null)) as
    | GovernorCandidateDetailResponse
    | { message?: string }
    | null

  if (!response.ok) {
    const message = body && 'message' in body ? body.message : ''
    throw new Error(message || 'Não foi possível consultar os detalhes da candidatura.')
  }

  if (!body || !('candidato' in body) || !body.candidato) {
    throw new Error('O servidor retornou uma resposta inválida para a candidatura.')
  }

  return body
}

export async function fetchStateElectionCandidates(
  office: StateElectionOffice,
  uf: string,
): Promise<ElectionCandidatesResponse> {
  const normalizedUf = normalizeUf(uf)
  const config = getStateElectionOffice(office)
  if (!config) throw new Error('Cargo eleitoral inválido.')

  const response = await fetch(`/api/candidatos-2026/${config.apiSegment}/${normalizedUf}`)
  const body = (await response.json().catch(() => null)) as ElectionCandidatesResponse | { message?: string } | null
  if (!response.ok) {
    const message = body && 'message' in body ? body.message : ''
    throw new Error(message || `Não foi possível consultar os candidatos a ${config.candidateLabel}.`)
  }
  if (!body || !('candidatos' in body) || !Array.isArray(body.candidatos)) {
    throw new Error('O servidor retornou uma resposta inválida para as candidaturas.')
  }
  return body
}

export async function fetchStateElectionCandidateDetail(
  office: StateElectionOffice,
  uf: string,
  candidateId: string,
): Promise<ElectionCandidateDetailResponse> {
  const normalizedUf = normalizeUf(uf)
  const config = getStateElectionOffice(office)
  if (!config) throw new Error('Cargo eleitoral inválido.')

  const response = await fetch(`/api/candidatos-2026/${config.apiSegment}/${normalizedUf}/${encodeURIComponent(candidateId)}`)
  const body = (await response.json().catch(() => null)) as ElectionCandidateDetailResponse | { message?: string } | null
  if (!response.ok) {
    const message = body && 'message' in body ? body.message : ''
    throw new Error(message || 'Não foi possível consultar os detalhes da candidatura.')
  }
  if (!body || !('candidato' in body) || !body.candidato) {
    throw new Error('O servidor retornou uma resposta inválida para a candidatura.')
  }
  return body
}
