import type { IncomingMessage, ServerResponse } from 'node:http'

type SuggestionApiRequest = IncomingMessage & {
  body?: unknown
}

type SuggestionApiResponse = ServerResponse & {
  status: (code: number) => SuggestionApiResponse
  json: (body: unknown) => void
}

declare const handler: (req: SuggestionApiRequest, res: SuggestionApiResponse) => Promise<void>

export default handler
