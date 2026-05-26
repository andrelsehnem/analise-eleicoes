import { CSRF_COOKIE_NAME, isProductionEnv } from '../_lib/authSession'
import {
  applySecurityHeaders,
  generateCsrfToken,
  isTrustedOrigin,
  jsonResponse,
  logSecurityEvent,
  setCookie,
  getClientIp,
} from '../_lib/security'

export default async function handler(req, res) {
  applySecurityHeaders(res)

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonResponse(res, 405, { message: 'Método não permitido.' })
  }

  const ip = getClientIp(req)

  if (!isTrustedOrigin(req)) {
    logSecurityEvent('auth.csrf.invalid_origin', {
      ip,
      origin: typeof req.headers.origin === 'string' ? req.headers.origin : 'unknown',
    })

    return jsonResponse(res, 403, { message: 'Origem não autorizada.' })
  }

  const csrfToken = generateCsrfToken()

  setCookie(res, CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: isProductionEnv(),
    sameSite: 'Strict',
    path: '/',
    maxAge: 60 * 60,
  })

  return jsonResponse(res, 200, {
    csrfToken,
  })
}
