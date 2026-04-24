import type { SuggestionPayload, SuggestionSuccessResponse } from '../types/camara'

export async function submitSuggestion(
  payload: SuggestionPayload,
): Promise<SuggestionSuccessResponse> {
  const response = await fetch('/api/sugestoes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const body = (await response.json().catch(() => null)) as
    | SuggestionSuccessResponse
    | { message?: string }
    | null

  if (!response.ok) {
    throw new Error(body?.message || 'Não foi possível enviar sua sugestão.')
  }

  if (!body || !('success' in body) || !body.success) {
    throw new Error('Resposta inválida do servidor ao enviar sugestão.')
  }

  return body
}
