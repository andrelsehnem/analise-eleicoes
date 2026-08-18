import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

type DevApiRequest = IncomingMessage & {
  body?: unknown
  query?: Record<string, string | string[]>
}

type DevApiResponse = ServerResponse & {
  status: (code: number) => DevApiResponse
  json: (body: unknown) => void
}

type ApiHandler = (req: DevApiRequest, res: DevApiResponse) => Promise<void>

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  let raw = ''

  for await (const chunk of req) {
    raw += chunk instanceof Buffer ? chunk.toString('utf-8') : String(chunk)
  }

  if (!raw.trim()) {
    return {}
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function withResponseHelpers(res: ServerResponse): DevApiResponse {
  const nextRes = res as DevApiResponse

  nextRes.status = (code: number) => {
    nextRes.statusCode = code
    return nextRes
  }

  nextRes.json = (body: unknown) => {
    if (!nextRes.headersSent) {
      nextRes.setHeader('Content-Type', 'application/json; charset=utf-8')
    }

    nextRes.end(JSON.stringify(body))
  }

  return nextRes
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  Object.entries(env).forEach(([key, value]) => {
    if (!(key in process.env)) {
      process.env[key] = value
    }
  })

  return {
    plugins: [
      react(),
      {
        name: 'local-api-sugestoes',
        configureServer(server) {
          server.middlewares.use('/api/sugestoes', async (req, res) => {
            try {
              const module = (await import('./api/sugestoes.js')) as { default: ApiHandler }
              const handler = module.default
              const apiReq = req as DevApiRequest

              if (req.method === 'POST') {
                apiReq.body = await readJsonBody(req)
              }

              await handler(apiReq, withResponseHelpers(res))
            } catch {
              if (!res.headersSent) {
                withResponseHelpers(res).status(500).json({
                  message: 'Erro interno ao processar a API de sugestões no ambiente local.',
                })
              }
            }
          })
        },
      },
      {
        name: 'local-api-auth',
        configureServer(server) {
          server.middlewares.use('/api/auth', async (req, res, next) => {
            const url = (req.url ?? '').replace(/\?.*$/, '').replace(/\/$/, '')

            const routeMap: Record<string, string> = {
              '/csrf': new URL('./api/auth/csrf.js', import.meta.url).href,
              '/me': new URL('./api/auth/me.js', import.meta.url).href,
              '/session': new URL('./api/auth/session.js', import.meta.url).href,
            }

            const modulePath = routeMap[url]

            if (!modulePath) {
              next()
              return
            }

            try {
              const module = (await import(/* @vite-ignore */ modulePath)) as { default: ApiHandler }
              const apiReq = req as DevApiRequest

              if (req.method === 'POST' || req.method === 'DELETE') {
                apiReq.body = await readJsonBody(req)
              }

              await module.default(apiReq, withResponseHelpers(res))
            } catch (err) {
              console.error('[local-api-auth] Erro ao processar', url, err)
              if (!res.headersSent) {
                withResponseHelpers(res).status(500).json({
                  message: 'Erro interno ao processar a API de autenticação no ambiente local.',
                })
              }
            }
          })
        },
      },
      {
        name: 'local-api-profile',
        configureServer(server) {
          server.middlewares.use('/api/profile', async (req, res) => {
            try {
              const module = (await import('./api/profile.js')) as { default: ApiHandler }
              const handler = module.default
              const apiReq = req as DevApiRequest

              if (req.method === 'PUT') {
                apiReq.body = await readJsonBody(req)
              }

              await handler(apiReq, withResponseHelpers(res))
            } catch {
              if (!res.headersSent) {
                withResponseHelpers(res).status(500).json({
                  message: 'Erro interno ao processar a API de perfil no ambiente local.',
                })
              }
            }
          })
        },
      },
      {
        name: 'local-api-candidatos-2026',
        configureServer(server) {
          server.middlewares.use('/api/candidatos-2026/presidentes', async (req, res, next) => {
            const path = (req.url ?? '/').replace(/\?.*$/, '').replace(/\/$/, '')
            const candidateIdMatch = path.match(/^\/([^/]+)$/)

            if (path && !candidateIdMatch) {
              next()
              return
            }

            try {
              const apiReq = req as DevApiRequest
              const modulePath = candidateIdMatch
                ? '/api/candidatos-2026/presidentes/[id].js'
                : '/api/candidatos-2026/presidentes.js'
              const module = (await server.ssrLoadModule(modulePath)) as {
                default: ApiHandler
              }

              if (candidateIdMatch) {
                apiReq.query = { id: candidateIdMatch[1] }
              }

              await module.default(apiReq, withResponseHelpers(res))
            } catch (error) {
              console.error(
                '[local-api-candidatos-2026] Erro ao consultar candidatos à Presidência',
                error,
              )

              if (!res.headersSent) {
                withResponseHelpers(res).status(500).json({
                  message: 'Erro interno ao consultar candidatos no ambiente local.',
                })
              }
            }
          })

          server.middlewares.use('/api/candidatos-2026/governadores', async (req, res, next) => {
            const path = (req.url ?? '/').replace(/\?.*$/, '').replace(/\/$/, '')
            const listMatch = path.match(/^\/([A-Za-z]{2})$/)
            const detailMatch = path.match(/^\/([A-Za-z]{2})\/([^/]+)$/)

            if (!listMatch && !detailMatch) {
              next()
              return
            }

            try {
              const apiReq = req as DevApiRequest
              const uf = (detailMatch?.[1] ?? listMatch?.[1] ?? '').toUpperCase()
              const modulePath = detailMatch
                ? '/api/candidatos-2026/governadores/[uf]/[id].js'
                : '/api/candidatos-2026/governadores/[uf].js'
              const module = (await server.ssrLoadModule(modulePath)) as {
                default: ApiHandler
              }

              apiReq.query = detailMatch
                ? { uf, id: detailMatch[2] }
                : { uf }

              await module.default(apiReq, withResponseHelpers(res))
            } catch (error) {
              console.error(
                '[local-api-candidatos-2026] Erro ao consultar candidatos a Governador',
                error,
              )

              if (!res.headersSent) {
                withResponseHelpers(res).status(500).json({
                  message: 'Erro interno ao consultar candidatos no ambiente local.',
                })
              }
            }
          })

          const stateOfficeApis = [
            { segment: 'senadores', moduleBase: '/api/candidatos-2026/senadores' },
            { segment: 'deputados-federais', moduleBase: '/api/candidatos-2026/deputados-federais' },
            { segment: 'deputados-estaduais', moduleBase: '/api/candidatos-2026/deputados-estaduais' },
          ]

          stateOfficeApis.forEach(({ segment, moduleBase }) => {
            server.middlewares.use(`/api/candidatos-2026/${segment}`, async (req, res, next) => {
              const path = (req.url ?? '/').replace(/\?.*$/, '').replace(/\/$/, '')
              const listMatch = path.match(/^\/([A-Za-z]{2})$/)
              const detailMatch = path.match(/^\/([A-Za-z]{2})\/([^/]+)$/)
              if (!listMatch && !detailMatch) { next(); return }

              try {
                const uf = (detailMatch?.[1] ?? listMatch?.[1] ?? '').toUpperCase()
                const modulePath = detailMatch ? `${moduleBase}/[uf]/[id].js` : `${moduleBase}/[uf].js`
                const module = (await server.ssrLoadModule(modulePath)) as { default: ApiHandler }
                const apiReq = req as DevApiRequest
                apiReq.query = detailMatch ? { uf, id: detailMatch[2] } : { uf }
                await module.default(apiReq, withResponseHelpers(res))
              } catch (error) {
                console.error(`[local-api-candidatos-2026] Erro ao consultar ${segment}`, error)
                if (!res.headersSent) withResponseHelpers(res).status(500).json({
                  message: 'Erro interno ao consultar candidatos no ambiente local.',
                })
              }
            })
          })
        },
      },
    ],
    server: {
      middlewareMode: false,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
  }
})
