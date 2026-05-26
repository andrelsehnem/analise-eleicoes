import { randomBytes, timingSafeEqual } from 'node:crypto'

const rateLimitBuckets = new Map()

export function applySecurityHeaders(res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Vary', 'Origin')
}

export function jsonResponse(res, statusCode, body) {
  applySecurityHeaders(res)
  res.status(statusCode).json(body)
}

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  const candidate = trimmed.includes('://') ? trimmed : `https://${trimmed}`

  try {
    return new URL(candidate).origin
  } catch {
    return ''
  }
}

export function getTrustedOrigins() {
  const origins = new Set()
  const configuredOrigins = [
    process.env.SITE_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]

  for (const value of configuredOrigins) {
    const normalized = normalizeOrigin(value)

    if (normalized) {
      origins.add(normalized)
    }
  }

  const trustedOriginsEnv = process.env.BETTER_AUTH_TRUSTED_ORIGINS || process.env.TRUSTED_ORIGINS || ''

  for (const value of trustedOriginsEnv.split(',')) {
    const normalized = normalizeOrigin(value)

    if (normalized) {
      origins.add(normalized)
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:5173')
    origins.add('http://127.0.0.1:5173')
    origins.add('http://localhost:4173')
    origins.add('http://127.0.0.1:4173')
  }

  return origins
}

export function isTrustedOrigin(req) {
  const originHeader = req.headers.origin

  if (!originHeader || typeof originHeader !== 'string') {
    return true
  }

  const requestOrigin = normalizeOrigin(originHeader)

  if (!requestOrigin) {
    return false
  }

  return getTrustedOrigins().has(requestOrigin)
}

export function logSecurityEvent(eventName, details) {
  console.warn(
    `[security] ${eventName}`,
    JSON.stringify({
      at: new Date().toISOString(),
      ...details,
    }),
  )
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']

  if (Array.isArray(forwarded)) {
    return forwarded[0] || 'unknown'
  }

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  return req.socket?.remoteAddress || 'unknown'
}

function createRateLimitKey(prefix, key) {
  return `${prefix}:${key}`
}

export function isRateLimited({ prefix, key, maxRequests, windowMs }) {
  const bucketKey = createRateLimitKey(prefix, key)
  const now = Date.now()
  const existing = rateLimitBuckets.get(bucketKey)

  if (!existing || now - existing.windowStart > windowMs) {
    rateLimitBuckets.set(bucketKey, { count: 1, windowStart: now })
    return false
  }

  existing.count += 1

  if (existing.count > maxRequests) {
    return true
  }

  rateLimitBuckets.set(bucketKey, existing)
  return false
}

export function parseCookies(req) {
  const cookieHeader = req.headers.cookie

  if (!cookieHeader || typeof cookieHeader !== 'string') {
    return {}
  }

  return cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const separatorIndex = pair.indexOf('=')

      if (separatorIndex <= 0) {
        return acc
      }

      const name = pair.slice(0, separatorIndex).trim()
      const value = pair.slice(separatorIndex + 1).trim()

      if (!name) {
        return acc
      }

      acc[name] = decodeURIComponent(value)
      return acc
    }, {})
}

function serializeCookie(name, value, options = {}) {
  const encodedValue = encodeURIComponent(value)
  const parts = [`${name}=${encodedValue}`]

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`)
  }

  if (options.domain) {
    parts.push(`Domain=${options.domain}`)
  }

  parts.push(`Path=${options.path || '/'}`)

  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`)
  }

  if (options.httpOnly) {
    parts.push('HttpOnly')
  }

  if (options.secure) {
    parts.push('Secure')
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`)
  }

  return parts.join('; ')
}

export function setCookie(res, name, value, options = {}) {
  const serialized = serializeCookie(name, value, options)
  const existing = res.getHeader('Set-Cookie')

  if (!existing) {
    res.setHeader('Set-Cookie', serialized)
    return
  }

  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, serialized])
    return
  }

  res.setHeader('Set-Cookie', [existing, serialized])
}

export function clearCookie(res, name, options = {}) {
  setCookie(res, name, '', {
    ...options,
    expires: new Date(0),
    maxAge: 0,
  })
}

export function generateCsrfToken() {
  return randomBytes(24).toString('hex')
}

function secureCompare(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function hasValidCsrf(req, cookieName = 'mt_csrf') {
  const cookies = parseCookies(req)
  const cookieToken = typeof cookies[cookieName] === 'string' ? cookies[cookieName] : ''
  const headerToken = typeof req.headers['x-csrf-token'] === 'string' ? req.headers['x-csrf-token'] : ''

  if (!cookieToken || !headerToken) {
    return false
  }

  return secureCompare(cookieToken, headerToken)
}
