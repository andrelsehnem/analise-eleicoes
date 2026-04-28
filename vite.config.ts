import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

type DevApiRequest = IncomingMessage & {
  body?: unknown
}

type DevApiResponse = ServerResponse & {
  status: (code: number) => DevApiResponse
  json: (body: unknown) => void
}

type SuggestionHandler = (req: DevApiRequest, res: DevApiResponse) => Promise<void>

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
              const module = (await import('./api/sugestoes.js')) as { default: SuggestionHandler }
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
    ],
    server: {
      middlewareMode: false,
    },
  }
})
