import type { ProfileData } from '../types/camara'
import { ensureCsrfToken } from './authApi'

type ProfileResponse = {
  profile?: ProfileData
  message?: string
}

async function parseError(response: Response, fallbackMessage: string): Promise<Error> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null
  return new Error(body?.message || fallbackMessage)
}

export async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch('/api/profile', {
    method: 'GET',
    credentials: 'include',
  })

  if (!response.ok) {
    throw await parseError(response, 'Não foi possível carregar seu perfil.')
  }

  const body = (await response.json()) as ProfileResponse

  if (!body.profile) {
    throw new Error('Resposta inválida ao carregar perfil.')
  }

  return body.profile
}

export async function updateProfile(displayName: string): Promise<ProfileData> {
  const csrfToken = await ensureCsrfToken()

  const response = await fetch('/api/profile', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify({ displayName }),
  })

  if (!response.ok) {
    throw await parseError(response, 'Não foi possível atualizar seu perfil.')
  }

  const body = (await response.json()) as ProfileResponse

  if (!body.profile) {
    throw new Error('Resposta inválida ao salvar perfil.')
  }

  return body.profile
}
