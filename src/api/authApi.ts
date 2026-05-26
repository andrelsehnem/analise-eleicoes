import type { AuthProfile } from '../types/camara'

const JSON_HEADERS = {
  'Content-Type': 'application/json',
}

let csrfTokenCache = ''

type AuthMeResponse = {
  authenticated: boolean
  user?: AuthProfile
}

type SessionResponse = {
  success: boolean
  user: AuthProfile
}

type CsrfResponse = {
  csrfToken: string
}

async function parseError(response: Response, fallbackMessage: string): Promise<Error> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null
  return new Error(body?.message || fallbackMessage)
}

export async function ensureCsrfToken(forceRefresh = false): Promise<string> {
  if (csrfTokenCache && !forceRefresh) {
    return csrfTokenCache
  }

  const response = await fetch('/api/auth/csrf', {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw await parseError(response, 'Não foi possível iniciar sessão segura.')
  }

  const body = (await response.json()) as CsrfResponse

  if (!body.csrfToken) {
    throw new Error('Resposta inválida ao solicitar token CSRF.')
  }

  csrfTokenCache = body.csrfToken
  return csrfTokenCache
}

export async function createServerSession(idToken: string): Promise<AuthProfile> {
  const csrfToken = await ensureCsrfToken()

  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${idToken}`,
      'x-csrf-token': csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  })

  if (!response.ok) {
    throw await parseError(response, 'Não foi possível concluir o login.')
  }

  const body = (await response.json()) as SessionResponse

  if (!body.success || !body.user) {
    throw new Error('Resposta inválida ao concluir login.')
  }

  return body.user
}

export async function endServerSession(): Promise<void> {
  const csrfToken = await ensureCsrfToken(true)

  const response = await fetch('/api/auth/session', {
    method: 'DELETE',
    headers: {
      'x-csrf-token': csrfToken,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw await parseError(response, 'Não foi possível encerrar a sessão.')
  }

  csrfTokenCache = ''
}

export async function fetchCurrentSession(): Promise<AuthProfile | null> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw await parseError(response, 'Não foi possível validar a sessão atual.')
  }

  const body = (await response.json()) as AuthMeResponse

  if (!body.authenticated || !body.user) {
    return null
  }

  return body.user
}
