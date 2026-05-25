import { CSRF_COOKIE_NAME, verifySessionFromRequest } from './_lib/authSession'
import { getFirebaseAdminDb } from './_lib/firebaseAdmin'
import {
  applySecurityHeaders,
  getClientIp,
  hasValidCsrf,
  isRateLimited,
  isTrustedOrigin,
  jsonResponse,
  logSecurityEvent,
} from './_lib/security'

const PROFILE_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const PROFILE_RATE_LIMIT_MAX = Number(process.env.PROFILE_RATE_LIMIT_MAX || 20)

function normalizeDisplayName(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().replace(/\s+/g, ' ')
}

function validateProfilePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Payload inválido.'
  }

  const displayName = normalizeDisplayName(body.displayName)

  if (!displayName || displayName.length < 2 || displayName.length > 80) {
    return 'Nome inválido. Use entre 2 e 80 caracteres.'
  }

  return ''
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
  }
}

export default async function handler(req, res) {
  applySecurityHeaders(res)

  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT')
    return jsonResponse(res, 405, { message: 'Método não permitido.' })
  }

  const ip = getClientIp(req)

  if (!isTrustedOrigin(req)) {
    logSecurityEvent('profile.invalid_origin', {
      ip,
      origin: typeof req.headers.origin === 'string' ? req.headers.origin : 'unknown',
    })

    return jsonResponse(res, 403, {
      message: 'Origem não autorizada.',
    })
  }

  if (isRateLimited({
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
      },
    })
  }

  if (!hasValidCsrf(req, CSRF_COOKIE_NAME)) {
    logSecurityEvent('profile.invalid_csrf', { ip, uid: session.uid })

    return jsonResponse(res, 403, {
      message: 'Token CSRF inválido.',
    })
  }

  const validationError = validateProfilePayload(req.body)

  if (validationError) {
    return jsonResponse(res, 400, { message: validationError })
  }

  const displayName = normalizeDisplayName(req.body.displayName)
  const now = new Date().toISOString()
  const db = getFirebaseAdminDb()

  await db.collection('users').doc(session.uid).set(
    {
      uid: session.uid,
      email: session.email,
      displayName,
      photoURL: session.picture || '',
      updatedAt: now,
      createdAt: now,
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
      updatedAt: now,
    },
  })
}
