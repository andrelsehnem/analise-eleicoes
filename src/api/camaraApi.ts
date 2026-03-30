import type { Deputy, DeputyInfo, Proposition, Vote } from '../types/camara'

const API = 'https://dadosabertos.camara.leg.br/api/v2'

type ApiResponse<T> = {
  dados?: T
}

type DeputyDetailBundle = {
  info: DeputyInfo | null
  propositions: Proposition[]
  votes: Vote[]
}

const deputyDetailRequestCache = new Map<number, Promise<DeputyDetailBundle>>()

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Falha na API: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function fetchDeputiesByState(uf: string): Promise<Deputy[]> {
  const data = await fetchApi<ApiResponse<Deputy[]>>(
    `${API}/deputados?siglaUf=${uf}&ordem=ASC&ordenarPor=nome&itens=100`,
  )

  return data.dados || []
}

export async function fetchDeputyDetailBundle(id: number): Promise<DeputyDetailBundle> {
  const cachedRequest = deputyDetailRequestCache.get(id)

  if (cachedRequest) {
    return cachedRequest
  }

  const request = (async () => {
    const [infoResult, propResult] = await Promise.allSettled([
      fetchApi<ApiResponse<DeputyInfo>>(`${API}/deputados/${id}`),
      fetchApi<ApiResponse<Proposition[]>>(
        `${API}/proposicoes?idDeputadoAutor=${id}&itens=50&ordem=DESC&ordenarPor=ano`,
      ),
    ])

    const infoData = infoResult.status === 'fulfilled' ? infoResult.value : undefined
    const propData = propResult.status === 'fulfilled' ? propResult.value : undefined

    return {
      info: infoData?.dados || null,
      propositions: propData?.dados || [],
      votes: [],
    }
  })()

  deputyDetailRequestCache.set(id, request)

  try {
    return await request
  } catch (error) {
    deputyDetailRequestCache.delete(id)
    throw error
  }
}
