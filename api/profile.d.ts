import type { IncomingMessage, ServerResponse } from 'node:http'

type ProfileApiRequest = IncomingMessage & {
  body?: unknown
}

type ProfileApiResponse = ServerResponse & {
  status: (code: number) => ProfileApiResponse
  json: (body: unknown) => void
}

declare const handler: (req: ProfileApiRequest, res: ProfileApiResponse) => Promise<void>

export default handler
