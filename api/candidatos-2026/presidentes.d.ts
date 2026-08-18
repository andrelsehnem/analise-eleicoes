import type { IncomingMessage, ServerResponse } from 'node:http'

type PresidentsApiResponse = ServerResponse & {
  status: (code: number) => PresidentsApiResponse
  json: (body: unknown) => void
}

declare const handler: (req: IncomingMessage, res: PresidentsApiResponse) => Promise<void>

export default handler
