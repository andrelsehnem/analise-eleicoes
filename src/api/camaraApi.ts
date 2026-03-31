import type {
  Deputy,
  DeputyInfo,
  DeputyOrgan,
  Profession,
  Proposition,
  Vote,
} from '../types/camara'

const API = 'https://dadosabertos.camara.leg.br/api/v2'

type ApiResponse<T> = {
  dados?: T
}

type DeputyDetailBundle = {
  info: DeputyInfo | null
  professions: Profession[]
  propositions: Proposition[]
  votes: Vote[]
}

const deputyDetailRequestCache = new Map<number, Promise<DeputyDetailBundle>>()
const deputyOrgaosRequestCache = new Map<number, Promise<DeputyOrgan[]>>()

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
    const [infoResult, professionsResult, propResult] = await Promise.allSettled([
      fetchApi<ApiResponse<DeputyInfo>>(`${API}/deputados/${id}`),
      fetchApi<ApiResponse<Profession[]>>(`${API}/deputados/${id}/profissoes`),
      fetchApi<ApiResponse<Proposition[]>>(
        `${API}/proposicoes?idDeputadoAutor=${id}&itens=50&ordem=DESC&ordenarPor=ano`,
      ),
    ])

    const infoData = infoResult.status === 'fulfilled' ? infoResult.value : undefined
    const professionsData =
      professionsResult.status === 'fulfilled' ? professionsResult.value : undefined
    const propData = propResult.status === 'fulfilled' ? propResult.value : undefined

    return {
      info: infoData?.dados || null,
      professions: professionsData?.dados || [],
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
