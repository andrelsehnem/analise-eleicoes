import { getFirebaseAdminAuth, getFirebaseAdminDb } from '../_lib/firebaseAdmin'
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  clearAuthCookies,
  getSessionTtlMs,
  isProductionEnv,
  verifySessionFromRequest,
} from '../_lib/authSession'
import {
  applySecurityHeaders,
  getClientIp,
  hasValidCsrf,
  isRateLimited,
  isTrustedOrigin,
  jsonResponse,
  logSecurityEvent,
  setCookie,
} from '../_lib/security'

const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX || 8)

function getBearerToken(req) {
  const authHeader = req.headers.authorization

  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  if (req.body && typeof req.body === 'object' && typeof req.body.idToken === 'string') {
    return req.body.idToken.trim()
  }

  return ''
}

async function upsertUserProfile(decodedToken) {
  const db = getFirebaseAdminDb()
  const now = new Date().toISOString()
  const ref = db.collection('users').doc(decodedToken.uid)

  await ref.set(
    {
      uid: decodedToken.uid,
      email: typeof decodedToken.email === 'string' ? decodedToken.email : '',
      displayName: typeof decodedToken.name === 'string' ? decodedToken.name : '',
      photoURL: typeof decodedToken.picture === 'string' ? decodedToken.picture : '',
      lastLoginAt: now,
      updatedAt: now,
      createdAt: now,
    },
    { merge: true },
  )
}

export default async function handler(req, res) {
  applySecurityHeaders(res)

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'POST, DELETE')
    return jsonResponse(res, 405, { message: 'Método não permitido.' })
  }

  const ip = getClientIp(req)

  if (!isTrustedOrigin(req)) {
    logSecurityEvent('auth.session.invalid_origin', {
      ip,
      origin: typeof req.headers.origin === 'string' ? req.headers.origin : 'unknown',
    })

    return jsonResponse(res, 403, {
      message: 'Origem não autorizada.',
    })
  }

  if (!hasValidCsrf(req, CSRF_COOKIE_NAME)) {
    logSecurityEvent('auth.session.invalid_csrf', { ip })

    return jsonResponse(res, 403, {
      message: 'Token CSRF inválido.',
    })
  }

  if (req.method === 'DELETE') {
    const session = await verifySessionFromRequest(req)

    if (session) {
      try {
        const auth = getFirebaseAdminAuth()
        await auth.revokeRefreshTokens(session.uid)
      } catch {
        logSecurityEvent('auth.session.revoke_failed', { ip, uid: session.uid })
      }
    }

    clearAuthCookies(res)

    return jsonResponse(res, 200, {
      success: true,
      message: 'Sessão encerrada com sucesso.',
    })
  }

  if (isRateLimited({
    prefix: 'auth.session',
    key: ip,
    maxRequests: AUTH_RATE_LIMIT_MAX,
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  })) {
    res.setHeader('Retry-After', String(Math.ceil(AUTH_RATE_LIMIT_WINDOW_MS / 1000)))
    logSecurityEvent('auth.session.rate_limited', { ip })

    return jsonResponse(res, 429, {
      message: 'Muitas tentativas de autenticação. Tente novamente em alguns minutos.',
    })
  }

  const idToken = getBearerToken(req)

  if (!idToken) {
    return jsonResponse(res, 400, {
      message: 'Token de autenticação não informado.',
    })
  }

  try {
    const auth = getFirebaseAdminAuth()
    const decodedToken = await auth.verifyIdToken(idToken, true)
    const expiresIn = getSessionTtlMs()
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

    setCookie(res, SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: isProductionEnv(),
      sameSite: 'Lax',
      path: '/',
      maxAge: Math.floor(expiresIn / 1000),
    })

    await upsertUserProfile(decodedToken)

    return jsonResponse(res, 200, {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: typeof decodedToken.email === 'string' ? decodedToken.email : '',
        displayName: typeof decodedToken.name === 'string' ? decodedToken.name : '',
        photoURL: typeof decodedToken.picture === 'string' ? decodedToken.picture : '',
      },
    })
  } catch {
    logSecurityEvent('auth.session.invalid_id_token', { ip })

    return jsonResponse(res, 401, {
      message: 'Falha ao validar autenticação. Faça login novamente.',
    })
  }
}
