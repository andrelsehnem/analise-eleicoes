import { verifySessionFromRequest } from '../_lib/authSession.js'
import {
  applySecurityHeaders,
  getClientIp,
  isTrustedOrigin,
  jsonResponse,
  logSecurityEvent,
} from '../_lib/security.js'

export default async function handler(req, res) {
  applySecurityHeaders(res)

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonResponse(res, 405, { message: 'Método não permitido.' })
  }

  const ip = getClientIp(req)

  if (!isTrustedOrigin(req)) {
    logSecurityEvent('auth.me.invalid_origin', {
      ip,
      origin: typeof req.headers.origin === 'string' ? req.headers.origin : 'unknown',
    })

    return jsonResponse(res, 403, {
      message: 'Origem não autorizada.',
    })
  }

  const session = await verifySessionFromRequest(req)

  if (!session) {
    return jsonResponse(res, 200, {
      authenticated: false,
    })
  }

  return jsonResponse(res, 200, {
    authenticated: true,
    user: session,
  })
}
