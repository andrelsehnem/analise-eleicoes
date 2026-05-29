import { CSRF_COOKIE_NAME, clearAuthCookies, verifySessionFromRequest } from './_lib/authSession.js'
import { getFirebaseAdminAuth, getFirebaseAdminDb } from './_lib/firebaseAdmin.js'
import {
  applySecurityHeaders,
  getClientIp,
  hasValidCsrf,
  isRateLimited,
  isTrustedOrigin,
  jsonResponse,
  logSecurityEvent,
} from './_lib/security.js'

const PROFILE_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const PROFILE_RATE_LIMIT_MAX = Number(process.env.PROFILE_RATE_LIMIT_MAX || 20)
const FAVORITES_LIMIT = 100
const VALID_GROUPS = new Set(['deputados-federais', 'senadores', 'deputados-estaduais', 'presidentes'])
const VALID_CARGOS = new Set(['deputado-federal', 'senador', 'deputado-estadual', 'presidente'])

function normalizeDisplayName(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().replace(/\s+/g, ' ')
}

function normalizeText(value, maxLength) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function normalizeFavorite(entry) {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const id = normalizeText(entry.id, 120)
  const nome = normalizeText(entry.nome, 140)
  const estado = normalizeText(entry.estado, 32).toUpperCase()
  const partido = normalizeText(entry.partido, 32).toUpperCase()
  const grupo = normalizeText(entry.grupo, 32)
  const cargo = normalizeText(entry.cargo, 32)

  if (!id || !nome || !estado || !partido) {
    return null
  }

  if (!VALID_GROUPS.has(grupo) || !VALID_CARGOS.has(cargo)) {
    return null
  }

  return {
    id,
    nome,
    estado,
    partido,
    grupo,
    cargo,
  }
}

function normalizeFavorites(value) {
  if (!Array.isArray(value)) {
    return []
  }

  const favoriteMap = new Map()

  for (const entry of value) {
    const normalized = normalizeFavorite(entry)

    if (!normalized) {
      continue
    }

    const key = `${normalized.grupo}:${normalized.id}`
    favoriteMap.set(key, normalized)

    if (favoriteMap.size >= FAVORITES_LIMIT) {
      break
    }
  }

  return Array.from(favoriteMap.values())
}

function parseProfilePayload(body) {
  if (!body || typeof body !== 'object') {
    return {
      error: 'Payload inválido.',
      displayName: '',
      favorites: [],
      hasDisplayName: false,
      hasFavorites: false,
    }
  }

  const hasDisplayName = Object.prototype.hasOwnProperty.call(body, 'displayName')
  const hasFavorites = Object.prototype.hasOwnProperty.call(body, 'favorites')

  if (!hasDisplayName && !hasFavorites) {
    return {
      error: 'Payload inválido.',
      displayName: '',
      favorites: [],
      hasDisplayName,
      hasFavorites,
    }
  }

  const displayName = hasDisplayName ? normalizeDisplayName(body.displayName) : ''
  const favorites = hasFavorites ? normalizeFavorites(body.favorites) : []

  if (hasDisplayName && (!displayName || displayName.length < 2 || displayName.length > 80)) {
    return {
      error: 'Nome inválido. Use entre 2 e 80 caracteres.',
      displayName,
      favorites,
      hasDisplayName,
      hasFavorites,
    }
  }

  if (hasFavorites) {
    if (!Array.isArray(body.favorites)) {
      return {
        error: 'Favoritos inválidos.',
        displayName,
        favorites,
        hasDisplayName,
        hasFavorites,
      }
    }

    if (body.favorites.length > FAVORITES_LIMIT) {
      return {
        error: `Limite de ${FAVORITES_LIMIT} favoritos excedido.`,
        displayName,
        favorites,
        hasDisplayName,
        hasFavorites,
      }
    }
  }

  return {
    error: '',
    displayName,
    favorites,
    hasDisplayName,
    hasFavorites,
  }
}

async function readProfile(uid) {
  const db = getFirebaseAdminDb()
  const doc = await db.collection('users').doc(uid).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data() || {}

  return {
    uid,
    email: typeof data.email === 'string' ? data.email : '',
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
    favorites: normalizeFavorites(data.favorites),
  }
}

export default async function handler(req, res) {
  applySecurityHeaders(res)

  if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'GET, PUT, DELETE')
    return jsonResponse(res, 405, { message: 'Método não permitido.' })
  }

  const ip = getClientIp(req)

  const requiresExplicitOrigin = req.method !== 'GET'

  if (!isTrustedOrigin(req, { allowMissingOrigin: !requiresExplicitOrigin })) {
    logSecurityEvent('profile.invalid_origin', {
      ip,
      origin: typeof req.headers.origin === 'string' ? req.headers.origin : 'unknown',
    })

    return jsonResponse(res, 403, {
      message: 'Origem não autorizada.',
    })
  }

  if (await isRateLimited({
    prefix: 'profile',
    key: ip,
    maxRequests: PROFILE_RATE_LIMIT_MAX,
    windowMs: PROFILE_RATE_LIMIT_WINDOW_MS,
  })) {
    res.setHeader('Retry-After', String(Math.ceil(PROFILE_RATE_LIMIT_WINDOW_MS / 1000)))
    logSecurityEvent('profile.rate_limited', { ip })

    return jsonResponse(res, 429, {
      message: 'Muitas tentativas. Aguarde alguns minutos para continuar.',
    })
  }

  const session = await verifySessionFromRequest(req)

  if (!session) {
    return jsonResponse(res, 401, {
      message: 'Sessão inválida ou expirada.',
    })
  }

  if (req.method === 'GET') {
    const profile = await readProfile(session.uid)

    return jsonResponse(res, 200, {
      profile: {
        uid: session.uid,
        email: profile?.email || session.email,
        displayName: profile?.displayName || session.displayName,
        photoURL: profile?.photoURL || session.picture,
        createdAt: profile?.createdAt || '',
        updatedAt: profile?.updatedAt || '',
        favorites: profile?.favorites || [],
      },
    })
  }

  if (!hasValidCsrf(req, CSRF_COOKIE_NAME)) {
    logSecurityEvent('profile.invalid_csrf', { ip, uid: session.uid })

    return jsonResponse(res, 403, {
      message: 'Token CSRF inválido.',
    })
  }

  if (req.method === 'DELETE') {
    const db = getFirebaseAdminDb()
    const auth = getFirebaseAdminAuth()

    try {
      await db.collection('users').doc(session.uid).delete()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown_error'
      logSecurityEvent('profile.delete.firestore_failed', { ip, uid: session.uid, errorMessage })

      return jsonResponse(res, 500, {
        message: 'Não foi possível excluir os dados do perfil no momento.',
      })
    }

    try {
      await auth.deleteUser(session.uid)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown_error'

      if (!errorMessage.includes('auth/user-not-found')) {
        logSecurityEvent('profile.delete.auth_failed', { ip, uid: session.uid, errorMessage })

        return jsonResponse(res, 500, {
          message: 'Não foi possível excluir a conta de autenticação no momento.',
        })
      }
    }

    clearAuthCookies(res)

    return jsonResponse(res, 200, {
      success: true,
      message: 'Conta excluída com sucesso.',
    })
  }

  const payload = parseProfilePayload(req.body)

  if (payload.error) {
    return jsonResponse(res, 400, { message: payload.error })
  }

  const currentProfile = await readProfile(session.uid)
  const displayName = payload.hasDisplayName
    ? payload.displayName
    : currentProfile?.displayName || session.displayName
  const favorites = payload.hasFavorites
    ? payload.favorites
    : currentProfile?.favorites || []
  const now = new Date().toISOString()
  const db = getFirebaseAdminDb()
  const createdAt = currentProfile?.createdAt || now

  await db.collection('users').doc(session.uid).set(
    {
      uid: session.uid,
      email: session.email,
      displayName,
      photoURL: session.picture || '',
      updatedAt: now,
      createdAt,
      ...(payload.hasFavorites ? { favorites } : {}),
    },
    { merge: true },
  )

  return jsonResponse(res, 200, {
    success: true,
    profile: {
      uid: session.uid,
      email: session.email,
      displayName,
      photoURL: session.picture || '',
      createdAt,
      updatedAt: now,
      favorites,
    },
  })
}
