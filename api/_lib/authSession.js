import { getFirebaseAdminAuth } from './firebaseAdmin.js'
import { clearCookie, parseCookies } from './security.js'

export const SESSION_COOKIE_NAME = 'mt_session'
export const CSRF_COOKIE_NAME = 'mt_csrf'

const SESSION_TTL_MS_MIN = 60 * 60 * 1000
const SESSION_TTL_MS_MAX = 14 * 24 * 60 * 60 * 1000
const SESSION_TTL_MS_DEFAULT = 12 * 60 * 60 * 1000

export function isProductionEnv() {
  return process.env.NODE_ENV === 'production'
}

export function getSessionTtlMs() {
  const parsed = Number(process.env.AUTH_SESSION_TTL_MS || SESSION_TTL_MS_DEFAULT)

  if (Number.isNaN(parsed)) {
    return SESSION_TTL_MS_DEFAULT
  }

  return Math.min(Math.max(parsed, SESSION_TTL_MS_MIN), SESSION_TTL_MS_MAX)
}

export function readSessionCookie(req) {
  const cookies = parseCookies(req)
  const sessionCookie = cookies[SESSION_COOKIE_NAME]

  return typeof sessionCookie === 'string' ? sessionCookie : ''
}

export function clearAuthCookies(res) {
  const secure = isProductionEnv()

  clearCookie(res, SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite: 'Lax',
    path: '/',
  })

  clearCookie(res, CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure,
    sameSite: 'Strict',
    path: '/',
  })
}

export async function verifySessionFromRequest(req) {
  const sessionCookie = readSessionCookie(req)

  if (!sessionCookie) {
    return null
  }

  const auth = getFirebaseAdminAuth()

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true)

    return {
      uid: decoded.uid,
      email: typeof decoded.email === 'string' ? decoded.email : '',
      displayName: typeof decoded.name === 'string' ? decoded.name : '',
      picture: typeof decoded.picture === 'string' ? decoded.picture : '',
    }
  } catch {
    return null
  }
}
