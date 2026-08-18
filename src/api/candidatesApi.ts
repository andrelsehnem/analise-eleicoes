import type {
  PresidentialCandidateDetailResponse,
  PresidentialCandidatesResponse,
} from '../types/camara'

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
