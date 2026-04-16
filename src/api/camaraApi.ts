import type {
  Deputy,
  DeputyInfo,
  DeputyOrgan,
  President,
  PresidentDetail,
  PropositionVote,
  Profession,
  Proposition,
} from '../types/camara'
import { PRESIDENT_DETAIL_BY_ID, PRESIDENTS } from '../constants/presidents'

const API = 'https://dadosabertos.camara.leg.br/api/v2'
const WIKIPEDIA_API = 'https://pt.wikipedia.org/api/rest_v1/page/summary'

type ApiResponse<T> = {
  dados?: T
}

type WikipediaSummaryResponse = {
  description?: string
  extract?: string
  thumbnail?: {
    source?: string
  }
  originalimage?: {
    source?: string
  }
  content_urls?: {
    desktop?: {
      page?: string
    }
  }
}

const MANDATE_START_YEAR = 2022
const MANDATE_END_YEAR = 2026
const PROPOSITIONS_PAGE_SIZE = 100

export type DeputyPropositionsPage = {
  propositions: Proposition[]
  hasNextPage: boolean
  page: number
}

type DeputyPropositionsOptions = {
  includeRequirements?: boolean
}

type DeputyDetailBundle = {
  info: DeputyInfo | null
  professions: Profession[]
  propositions: Proposition[]
  hasMorePropositions: boolean
  propositionsPage: number
}

const deputyDetailRequestCache = new Map<string, Promise<DeputyDetailBundle>>()
const deputyOrgaosRequestCache = new Map<number, Promise<DeputyOrgan[]>>()
const propositionVotesRequestCache = new Map<number, Promise<PropositionVote[]>>()
const presidentDetailRequestCache = new Map<string, Promise<PresidentDetail>>()

type PropositionVoting = {
  id: string
  descricao?: string
  proposicaoObjeto?: string | null
}

type VotingVoteItem = {
  tipoVoto?: string
  dataRegistroVoto?: string
  deputado_?: {
    id?: number
    nome?: string
    siglaPartido?: string
    siglaUf?: string
  }
}

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Falha na API: ${response.status}`)
  }

  return response.json() as Promise<T>
}

function filterMandatePropositions(
  propositions: Proposition[],
  options?: DeputyPropositionsOptions,
): Proposition[] {
  return propositions.filter((proposition) => {
    const year = proposition.ano
    const type = proposition.siglaTipo?.toUpperCase().trim()
    const isReq = type === 'REQ' || type?.startsWith('REQ')

    return (
      !!year &&
      year >= MANDATE_START_YEAR &&
      year <= MANDATE_END_YEAR &&
      (options?.includeRequirements || !isReq)
    )
  })
}

export async function fetchDeputyPropositionsPage(
  id: number,
  page: number,
  options?: DeputyPropositionsOptions,
): Promise<DeputyPropositionsPage> {
  const response = await fetchApi<ApiResponse<Proposition[]>>(
    `${API}/proposicoes?idDeputadoAutor=${id}&itens=${PROPOSITIONS_PAGE_SIZE}&pagina=${page}&ordem=ASC&ordenarPor=ano`,
  )

  const batch = response.dados || []

  return {
    propositions: filterMandatePropositions(batch, options),
    hasNextPage: batch.length === PROPOSITIONS_PAGE_SIZE,
    page,
  }
}

export async function fetchDeputiesByState(uf: string): Promise<Deputy[]> {
  const data = await fetchApi<ApiResponse<Deputy[]>>(
    `${API}/deputados?siglaUf=${uf}&ordem=ASC&ordenarPor=nome&itens=100`,
  )

  return data.dados || []
}

export async function fetchDeputyDetailBundle(
  id: number,
  options?: DeputyPropositionsOptions,
): Promise<DeputyDetailBundle> {
  const cacheKey = `${id}-${options?.includeRequirements ? 'with-req' : 'without-req'}`
  const cachedRequest = deputyDetailRequestCache.get(cacheKey)

  if (cachedRequest) {
    return cachedRequest
  }

  const request = (async () => {
    const [infoResult, professionsResult, propResult] = await Promise.allSettled([
      fetchApi<ApiResponse<DeputyInfo>>(`${API}/deputados/${id}`),
      fetchApi<ApiResponse<Profession[]>>(`${API}/deputados/${id}/profissoes`),
      fetchDeputyPropositionsPage(id, 1, options),
    ])

    const infoData = infoResult.status === 'fulfilled' ? infoResult.value : undefined
    const professionsData =
      professionsResult.status === 'fulfilled' ? professionsResult.value : undefined
    const propData = propResult.status === 'fulfilled' ? propResult.value : undefined

    return {
      info: infoData?.dados || null,
      professions: professionsData?.dados || [],
      propositions: propData?.propositions || [],
      hasMorePropositions: propData?.hasNextPage || false,
      propositionsPage: propData?.page || 1,
    }
  })()

  deputyDetailRequestCache.set(cacheKey, request)

  try {
    return await request
  } catch (error) {
    deputyDetailRequestCache.delete(cacheKey)
    throw error
  }
}

export async function fetchDeputyOrgaos(id: number): Promise<DeputyOrgan[]> {
  const cachedRequest = deputyOrgaosRequestCache.get(id)

  if (cachedRequest) {
    return cachedRequest
  }

  const request = (async () => {
    const response = await fetchApi<ApiResponse<DeputyOrgan[]>>(`${API}/deputados/${id}/orgaos`)
    return response.dados || []
  })()

  deputyOrgaosRequestCache.set(id, request)

  try {
    return await request
  } catch (error) {
    deputyOrgaosRequestCache.delete(id)
    throw error
  }
}

export async function fetchPropositionVotes(propositionId: number): Promise<PropositionVote[]> {
  const cachedRequest = propositionVotesRequestCache.get(propositionId)

  if (cachedRequest) {
    return cachedRequest
  }

  const request = (async () => {
    const votacoesResponse = await fetchApi<ApiResponse<PropositionVoting[]>>(
      `${API}/proposicoes/${propositionId}/votacoes`,
    )

    const votacoes = votacoesResponse.dados || []

    if (votacoes.length === 0) {
      return []
    }

    const voteRequests = await Promise.allSettled(
      votacoes.map((votacao) =>
        fetchApi<ApiResponse<VotingVoteItem[]>>(`${API}/votacoes/${votacao.id}/votos`),
      ),
    )

    const votesByProposition = voteRequests.flatMap((requestResult, index) => {
      if (requestResult.status !== 'fulfilled') {
        return []
      }

      const votacao = votacoes[index]
      const votes = requestResult.value.dados || []

      return votes.map((vote) => ({
        votacaoId: votacao.id,
        voto: vote.tipoVoto || 'Não informado',
        deputadoId: vote.deputado_?.id,
        deputadoNome: vote.deputado_?.nome || 'Deputado não identificado',
        siglaPartido: vote.deputado_?.siglaPartido,
        siglaUf: vote.deputado_?.siglaUf,
        descricao: votacao.descricao,
        proposicaoObjeto: votacao.proposicaoObjeto || undefined,
        dataHoraVoto: vote.dataRegistroVoto,
      }))
    })

    return votesByProposition.sort((leftVote, rightVote) => {
      const leftTime = leftVote.dataHoraVoto ? new Date(leftVote.dataHoraVoto).getTime() : 0
      const rightTime = rightVote.dataHoraVoto ? new Date(rightVote.dataHoraVoto).getTime() : 0
      return rightTime - leftTime
    })
  })()

  propositionVotesRequestCache.set(propositionId, request)

  try {
    return await request
  } catch (error) {
    propositionVotesRequestCache.delete(propositionId)
    throw error
  }
}

export async function fetchPresidents(): Promise<President[]> {
  return PRESIDENTS
}

export async function fetchPresidentDetail(id: string): Promise<PresidentDetail> {
  const cachedRequest = presidentDetailRequestCache.get(id)

  if (cachedRequest) {
    return cachedRequest
  }

  const request = (async () => {
    const presidentDetail = PRESIDENT_DETAIL_BY_ID[id]

    if (!presidentDetail) {
      throw new Error('Perfil não encontrado.')
    }

    try {
      const wikipediaSummary = await fetchApi<WikipediaSummaryResponse>(
        `${WIKIPEDIA_API}/${encodeURIComponent(presidentDetail.wikipediaTitle)}`,
      )

      return {
        ...presidentDetail,
        descricao: wikipediaSummary.description || presidentDetail.descricao,
        resumo: wikipediaSummary.extract || presidentDetail.resumo,
        urlFoto:
          wikipediaSummary.originalimage?.source ||
          wikipediaSummary.thumbnail?.source ||
          presidentDetail.urlFoto,
        fonteResumoUrl:
          wikipediaSummary.content_urls?.desktop?.page || presidentDetail.fonteResumoUrl,
      }
    } catch {
      return presidentDetail
    }
  })()

  presidentDetailRequestCache.set(id, request)

  try {
    return await request
  } catch (error) {
    presidentDetailRequestCache.delete(id)
    throw error
  }
}
