const rateLimitBuckets = new Map()
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.SUGESTOES_RATE_LIMIT_MAX || 5)

function jsonResponse(res, statusCode, body) {
  res.status(statusCode).json(body)
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']

  if (Array.isArray(forwarded)) {
    return forwarded[0] || 'unknown'
  }

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  return req.socket?.remoteAddress || 'unknown'
}

function isRateLimited(ip) {
  const now = Date.now()
  const existing = rateLimitBuckets.get(ip)

  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(ip, { count: 1, windowStart: now })
    return false
  }

  existing.count += 1

  if (existing.count > RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  rateLimitBuckets.set(ip, existing)
  return false
}

function validateBody(body) {
  if (!body || typeof body !== 'object') {
    return 'Payload inválido.'
  }

  const nome = typeof body.nome === 'string' ? body.nome.trim() : ''
  const telefone = typeof body.telefone === 'string' ? body.telefone.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const assunto = typeof body.assunto === 'string' ? body.assunto.trim() : ''
  const descricao = typeof body.descricao === 'string' ? body.descricao.trim() : ''
  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken.trim() : ''

  if (!nome || nome.length < 2 || nome.length > 100) {
    return 'Nome inválido.'
  }

  if (telefone && telefone.length > 30) {
    return 'Telefone inválido.'
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'E-mail inválido.'
  }

  if (!assunto || assunto.length < 3 || assunto.length > 120) {
    return 'Assunto inválido.'
  }

  if (!descricao || descricao.length < 10 || descricao.length > 2000) {
    return 'Descrição inválida.'
  }

  if (!captchaToken) {
    return 'Captcha não informado.'
  }

  return ''
}

async function verifyTurnstileToken(captchaToken, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    throw new Error('TURNSTILE_SECRET_KEY não configurado no servidor.')
  }

  const payload = new URLSearchParams()
  payload.append('secret', secret)
  payload.append('response', captchaToken)
  payload.append('remoteip', ip)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  })

  if (!response.ok) {
    return {
      success: false,
      errorCodes: ['turnstile-unreachable'],
      hostname: '',
    }
  }

  const body = await response.json()
  const errorCodes = Array.isArray(body?.['error-codes'])
    ? body['error-codes'].filter((value) => typeof value === 'string')
    : []

  return {
    success: Boolean(body?.success),
    errorCodes,
    hostname: typeof body?.hostname === 'string' ? body.hostname : '',
  }
}

function buildMailText(body) {
  const nome = body.nome.trim()
  const telefone = typeof body.telefone === 'string' ? body.telefone.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const assunto = body.assunto.trim()
  const descricao = body.descricao.trim()

  const contactBlock = [
    `Nome: ${nome}`,
    `Telefone: ${telefone || 'Não informado'}`,
    `E-mail: ${email || 'Não informado'}`,
  ].join('\n')

  return [
    'Nova sugestão recebida no Mandato Transparente',
    '',
    contactBlock,
    '',
    `Assunto: ${assunto}`,
    '',
    'Descrição:',
    descricao,
  ].join('\n')
}

async function sendWithResend(body) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.SUGESTOES_DEST_EMAIL
  const from = process.env.SUGESTOES_FROM_EMAIL || 'Mandato Transparente <onboarding@resend.dev>'

  if (!apiKey) {
    throw new Error('RESEND_API_KEY não configurado no servidor.')
  }

  if (!to) {
    throw new Error('SUGESTOES_DEST_EMAIL não configurado no servidor.')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `[Sugestão] ${body.assunto.trim()}`,
      text: buildMailText(body),
      reply_to: typeof body.email === 'string' && body.email.trim() ? body.email.trim() : undefined,
    }),
  })

  if (!response.ok) {
    throw new Error('Falha ao enviar sugestão por e-mail.')
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonResponse(res, 405, { message: 'Método não permitido.' })
  }

  const ip = getClientIp(req)

  if (isRateLimited(ip)) {
    return jsonResponse(res, 429, {
      message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    })
  }

  const validationError = validateBody(req.body)

  if (validationError) {
    return jsonResponse(res, 400, { message: validationError })
  }

  try {
    const captchaResult = await verifyTurnstileToken(req.body.captchaToken, ip)

    if (!captchaResult.success) {
      const baseMessage = 'Captcha inválido. Tente novamente.'
      const isProduction = process.env.NODE_ENV === 'production'

      if (isProduction) {
        return jsonResponse(res, 400, { message: baseMessage })
      }

      const details = []

      if (captchaResult.errorCodes.length > 0) {
        details.push(`códigos=${captchaResult.errorCodes.join(',')}`)
      }

      if (captchaResult.hostname) {
        details.push(`hostname=${captchaResult.hostname}`)
      }

      const detailsMessage = details.length > 0
        ? ` Detalhes Turnstile: ${details.join(' | ')}.`
        : ' Sem detalhes adicionais do Turnstile.'

      return jsonResponse(res, 400, {
        message: `${baseMessage}${detailsMessage} Verifique se a chave e o domínio localhost estão configurados no Turnstile.`,
      })
    }

    await sendWithResend(req.body)

    return jsonResponse(res, 200, {
      success: true,
      message: 'Sugestão enviada com sucesso. Obrigado por contribuir!',
    })
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Erro interno ao processar sua sugestão.'

    return jsonResponse(res, 500, { message })
  }
}
