import type { FavoritePolitician, ProfileData } from '../types/camara'
import { ensureCsrfToken } from './authApi'

type ProfileResponse = {
  profile?: ProfileData
  message?: string
}

async function parseError(response: Response, fallbackMessage: string): Promise<Error> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null
  return new Error(body?.message || fallbackMessage)
}

async function putProfilePayload(payload: Record<string, unknown>, fallbackMessage: string): Promise<ProfileData> {
  let csrfToken = await ensureCsrfToken()
  let response = await fetch('/api/profile', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(payload),
  })

  if (response.status === 403) {
    csrfToken = await ensureCsrfToken(true)
    response = await fetch('/api/profile', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify(payload),
    })
  }

  if (!response.ok) {
    throw await parseError(response, fallbackMessage)
  }

  const body = (await response.json()) as ProfileResponse

  if (!body.profile) {
    throw new Error('Resposta inválida ao salvar perfil.')
  }

  return body.profile
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
  return putProfilePayload({ displayName }, 'Não foi possível atualizar seu perfil.')
}

export async function updateProfileFavorites(favorites: FavoritePolitician[]): Promise<ProfileData> {
  return putProfilePayload({ favorites }, 'Não foi possível atualizar seus favoritos.')
}

export async function deleteAccount(): Promise<void> {
  const csrfToken = await ensureCsrfToken(true)

  const response = await fetch('/api/profile', {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'x-csrf-token': csrfToken,
    },
  })

  if (!response.ok) {
    throw await parseError(response, 'Não foi possível excluir a conta.')
  }
}
