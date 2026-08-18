import type { IncomingMessage, ServerResponse } from 'node:http'

type CandidateDetailRequest = IncomingMessage & {
  query?: { id?: string | string[] }
}

type CandidateDetailResponse = ServerResponse & {
  status: (code: number) => CandidateDetailResponse
  json: (body: unknown) => void
}

declare const handler: (
  req: CandidateDetailRequest,
  res: CandidateDetailResponse,
) => Promise<void>

export default handler
