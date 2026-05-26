import type {
  Deputy,
  GlobalSearchItem,
  DeputyInfo,
  DeputyOrgan,
  PoliticianIndexItem,
  PoliticiansIndexGroup,
  PoliticiansIndex,
  President,
  PresidentDetail,
  Senator,
  SenatorAparte,
  SenatorCommission,
  SenatorDetail,
  SenatorFiliacao,
  SenatorLicenca,
  SenatorLideranca,
  SenatorMateriaAutoria,
  SenatorMateriaRelatoria,
  SenatorOffice,
  SenatorServiceLink,
  SenatorTerm,
  SenatorVotacao,
  PropositionVote,
  Profession,
  Proposition,
  StateDeputy,
} from '../types/camara'
import { PRESIDENT_DETAIL_BY_ID, PRESIDENTS } from '../constants/presidents'

const API = 'https://dadosabertos.camara.leg.br/api/v2'
const SENADO_API = 'https://legis.senado.leg.br/dadosabertos'
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
const senatorsByStateRequestCache = new Map<string, Promise<Senator[]>>()
const senatorDetailRequestCache = new Map<string, Promise<SenatorDetail>>()
let politiciansIndexRequestCache: Promise<GlobalSearchItem[]> | null = null

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

type SenadoSingleOrArray<T> = T | T[] | '' | ' '

type SenadoListaAtualResponse = {
  ListaParlamentarEmExercicio?: {
    Parlamentares?: {
      Parlamentar?: SenadoSingleOrArray<{
        IdentificacaoParlamentar?: {
          CodigoParlamentar?: string
          CodigoPublicoNaLegAtual?: string
          NomeParlamentar?: string
          NomeCompletoParlamentar?: string
          SexoParlamentar?: string
          UrlFotoParlamentar?: string
          UrlPaginaParlamentar?: string
          UrlPaginaParticular?: string
          EmailParlamentar?: string
          Telefones?: {
            Telefone?: SenadoSingleOrArray<
              | string
              | {
                  NumeroTelefone?: string
                }
            >
          }
          SiglaPartidoParlamentar?: string
          UfParlamentar?: string
          Bloco?: {
            NomeBloco?: string
            NomeApelido?: string
          }
          MembroMesa?: string
          MembroLideranca?: string
        }
        Mandato?: {
          DescricaoParticipacao?: string
        }
      }>
    }
  }
}

type SenadoDetalheResponse = {
  DetalheParlamentar?: {
    Parlamentar?: {
      IdentificacaoParlamentar?: {
        CodigoParlamentar?: string
        CodigoPublicoNaLegAtual?: string
        NomeParlamentar?: string
        NomeCompletoParlamentar?: string
        SexoParlamentar?: string
        UrlFotoParlamentar?: string
        UrlPaginaParlamentar?: string
        UrlPaginaParticular?: string
        EmailParlamentar?: string
        SiglaPartidoParlamentar?: string
        UfParlamentar?: string
      }
      DadosBasicosParlamentar?: {
        DataNascimento?: string
        Naturalidade?: string
        UfNaturalidade?: string
        EnderecoParlamentar?: string
      }
      OutrasInformacoes?: {
        Servico?: SenadoSingleOrArray<{
          NomeServico?: string
          DescricaoServico?: string
          UrlServico?: string
        }>
      }
    }
  }
}

type SenadoMandatosResponse = {
  MandatoParlamentar?: {
    Parlamentar?: {
      Mandatos?: {
        Mandato?: SenadoSingleOrArray<{
          CodigoMandato?: string
          UfParlamentar?: string
          DescricaoParticipacao?: string
          PrimeiraLegislaturaDoMandato?: {
            NumeroLegislatura?: string
            DataInicio?: string
            DataFim?: string
          }
          SegundaLegislaturaDoMandato?: {
            NumeroLegislatura?: string
            DataInicio?: string
            DataFim?: string
          }
          Partidos?: {
            Partido?: SenadoSingleOrArray<{
              Sigla?: string
              Nome?: string
              DataFiliacao?: string
            }>
          }
        }>
      }
    }
  }
}

type SenadoComissoesResponse = {
  MembroComissaoParlamentar?: {
    Parlamentar?: {
      Comissoes?: {
        Comissao?: SenadoSingleOrArray<{
          IdentificacaoComissao?: {
            CodigoComissao?: string
            SiglaComissao?: string
            NomeComissao?: string
            SiglaCasaComissao?: string
          }
          DescricaoParticipacao?: string
          DataInicio?: string
          DataFim?: string
        }>
      }
    }
  }
}

type SenadoCargosResponse = {
  CargoParlamentar?: {
    Parlamentar?: {
      Cargos?: {
        Cargo?: SenadoSingleOrArray<{
          CodigoCargo?: string
          DescricaoCargo?: string
          IdentificacaoComissao?: {
            CodigoComissao?: string
            SiglaComissao?: string
            NomeComissao?: string
            SiglaCasaComissao?: string
          }
          DataInicio?: string
          DataFim?: string
        }>
      }
    }
  }
}

function asArray<T>(value?: SenadoSingleOrArray<T>): T[] {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    return value.trim() ? [] : []
  }

  return [value]
}

function normalizeBooleanFlag(value?: string): boolean {
  return value?.trim().toLowerCase() === 'sim'
}

function normalizePhone(
  rawPhone?: SenadoSingleOrArray<
    | string
    | {
        NumeroTelefone?: string
      }
  >,
): string | undefined {
  const phones = asArray(rawPhone)
    .map((phone) => {
      if (typeof phone === 'string') {
        return phone.trim()
      }

      return phone.NumeroTelefone?.trim() || ''
    })
    .filter(Boolean)

  return phones[0] || undefined
}

function mapSenatorFromListaItem(item: {
  IdentificacaoParlamentar?: {
    CodigoParlamentar?: string
    CodigoPublicoNaLegAtual?: string
    NomeParlamentar?: string
    NomeCompletoParlamentar?: string
    SexoParlamentar?: string
    UrlFotoParlamentar?: string
    UrlPaginaParlamentar?: string
    UrlPaginaParticular?: string
    EmailParlamentar?: string
    Telefones?: {
      Telefone?: SenadoSingleOrArray<
        | string
        | {
            NumeroTelefone?: string
          }
      >
    }
    SiglaPartidoParlamentar?: string
    UfParlamentar?: string
    Bloco?: {
      NomeBloco?: string
      NomeApelido?: string
    }
    MembroMesa?: string
    MembroLideranca?: string
  }
  Mandato?: {
    DescricaoParticipacao?: string
  }
}): Senator | null {
  const identification = item.IdentificacaoParlamentar
  const id = identification?.CodigoParlamentar?.trim()
  const name = identification?.NomeParlamentar?.trim()
  const state = identification?.UfParlamentar?.trim().toUpperCase()

  if (!id || !name || !state) {
    return null
  }

  return {
    id,
    codigoPublico: identification?.CodigoPublicoNaLegAtual?.trim() || undefined,
    nome: name,
    nomeCompleto: identification?.NomeCompletoParlamentar?.trim() || undefined,
    sexo: identification?.SexoParlamentar?.trim() || undefined,
    siglaPartido: identification?.SiglaPartidoParlamentar?.trim() || 'Sem partido',
    siglaUf: state,
    email: identification?.EmailParlamentar?.trim() || undefined,
    telefone: normalizePhone(identification?.Telefones?.Telefone),
    urlFoto: identification?.UrlFotoParlamentar?.trim() || undefined,
    urlPagina: identification?.UrlPaginaParlamentar?.trim() || undefined,
    urlPaginaParticular: identification?.UrlPaginaParticular?.trim() || undefined,
    blocoNome: identification?.Bloco?.NomeBloco?.trim() || undefined,
    blocoApelido: identification?.Bloco?.NomeApelido?.trim() || undefined,
    membroMesa: normalizeBooleanFlag(identification?.MembroMesa),
    membroLideranca: normalizeBooleanFlag(identification?.MembroLideranca),
    descricaoParticipacao: item.Mandato?.DescricaoParticipacao?.trim() || undefined,
  }
}

function mapSenatorLinks(value?: SenadoSingleOrArray<{
  NomeServico?: string
  DescricaoServico?: string
  UrlServico?: string
}>): SenatorServiceLink[] {
  return asArray(value)
    .map((item) => ({
      nome: item.NomeServico?.trim() || '',
      descricao: item.DescricaoServico?.trim() || undefined,
      url: item.UrlServico?.trim() || '',
    }))
    .filter((item) => item.nome && item.url)
}

function mapSenatorTerms(value?: SenadoSingleOrArray<{
  CodigoMandato?: string
  UfParlamentar?: string
  DescricaoParticipacao?: string
  PrimeiraLegislaturaDoMandato?: {
    NumeroLegislatura?: string
    DataInicio?: string
    DataFim?: string
  }
  SegundaLegislaturaDoMandato?: {
    NumeroLegislatura?: string
    DataInicio?: string
    DataFim?: string
  }
  Partidos?: {
    Partido?: SenadoSingleOrArray<{
      Sigla?: string
      Nome?: string
      DataFiliacao?: string
    }>
  }
}>): SenatorTerm[] {
  return asArray(value).map((item) => {
    const legislaturas = [
      item.PrimeiraLegislaturaDoMandato,
      item.SegundaLegislaturaDoMandato,
    ]
      .filter(Boolean)
      .map((legislatura) => ({
        numero: legislatura?.NumeroLegislatura?.trim() || undefined,
        inicio: legislatura?.DataInicio?.trim() || undefined,
        fim: legislatura?.DataFim?.trim() || undefined,
      }))

    const partidos = asArray(item.Partidos?.Partido).map((party) => ({
      sigla: party.Sigla?.trim() || undefined,
      nome: party.Nome?.trim() || undefined,
      dataFiliacao: party.DataFiliacao?.trim() || undefined,
    }))

    return {
      codigoMandato: item.CodigoMandato?.trim() || undefined,
      uf: item.UfParlamentar?.trim().toUpperCase() || '',
      participacao: item.DescricaoParticipacao?.trim() || undefined,
      legislaturas,
      partidos,
    }
  })
}

function mapSenatorCommissions(value?: SenadoSingleOrArray<{
  IdentificacaoComissao?: {
    CodigoComissao?: string
    SiglaComissao?: string
    NomeComissao?: string
    SiglaCasaComissao?: string
  }
  DescricaoParticipacao?: string
  DataInicio?: string
  DataFim?: string
}>): SenatorCommission[] {
  return asArray(value)
    .map((item) => ({
      codigo: item.IdentificacaoComissao?.CodigoComissao?.trim() || undefined,
      sigla: item.IdentificacaoComissao?.SiglaComissao?.trim() || undefined,
      nome: item.IdentificacaoComissao?.NomeComissao?.trim() || undefined,
      casa: item.IdentificacaoComissao?.SiglaCasaComissao?.trim() || undefined,
      participacao: item.DescricaoParticipacao?.trim() || undefined,
      inicio: item.DataInicio?.trim() || undefined,
      fim: item.DataFim?.trim() || undefined,
    }))
    .filter((item) => Boolean(item.sigla || item.nome))
}

function mapSenatorOffices(value?: SenadoSingleOrArray<{
  CodigoCargo?: string
  DescricaoCargo?: string
  IdentificacaoComissao?: {
    CodigoComissao?: string
    SiglaComissao?: string
    NomeComissao?: string
    SiglaCasaComissao?: string
  }
  DataInicio?: string
  DataFim?: string
}>): SenatorOffice[] {
  return asArray(value)
    .map((item) => ({
      codigo: item.CodigoCargo?.trim() || undefined,
      cargo: item.DescricaoCargo?.trim() || undefined,
      comissao: item.IdentificacaoComissao?.SiglaComissao?.trim() || undefined,
      nomeComissao: item.IdentificacaoComissao?.NomeComissao?.trim() || undefined,
      inicio: item.DataInicio?.trim() || undefined,
      fim: item.DataFim?.trim() || undefined,
    }))
    .filter((item) => Boolean(item.cargo || item.comissao))
}

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Falha na API: ${response.status}`)
  }

  return response.json() as Promise<T>
}

function mapIndexGroupItems(
  items: PoliticianIndexItem[],
  group: PoliticiansIndexGroup,
): GlobalSearchItem[] {
  return items
    .map((item) => ({
      id: item.id?.trim() || '',
      nome: item.nome?.trim() || '',
      estado: item.estado?.trim().toUpperCase() || '',
      partido: item.partido?.trim() || 'Sem partido',
      email: item.email?.trim(),
      urlFoto: item.urlFoto?.trim(),
      telefone: item.telefone?.trim(),
      urlPerfil: item.urlPerfil?.trim(),
      grupo: group,
      cargo: (
        group === 'deputados-federais'
          ? 'deputado-federal'
          : group === 'senadores'
            ? 'senador'
            : 'deputado-estadual'
      ) as 'deputado-federal' | 'senador' | 'deputado-estadual',
    }))
    .filter((item) => item.id && item.nome && item.partido)
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

export async function fetchPoliticiansIndex(): Promise<GlobalSearchItem[]> {
  if (politiciansIndexRequestCache) {
    return politiciansIndexRequestCache
  }

  const request = (async () => {
    const index = await fetchApi<PoliticiansIndex>('/politicians-index.json')
    const federalDeputies = mapIndexGroupItems(index['deputados-federais'] || [], 'deputados-federais')
    const senators = mapIndexGroupItems(index.senadores || [], 'senadores')
    const stateDeputies = mapIndexGroupItems(index['deputados-estaduais'] || [], 'deputados-estaduais')

    if (federalDeputies.length === 0 && senators.length === 0 && stateDeputies.length === 0) {
      throw new Error('Arquivo de índice de políticos indisponível ou vazio.')
    }

    return [...federalDeputies, ...senators, ...stateDeputies]
  })()

  politiciansIndexRequestCache = request

  try {
    return await request
  } catch (error) {
    politiciansIndexRequestCache = null
    throw error
  }
}

export async function fetchSenatorsByState(uf: string): Promise<Senator[]> {
  const normalizedUf = uf.trim().toUpperCase()
  const cacheKey = normalizedUf
  const cachedRequest = senatorsByStateRequestCache.get(cacheKey)

  if (cachedRequest) {
    return cachedRequest
  }

  const request = (async () => {
    const response = await fetchApi<SenadoListaAtualResponse>(`${SENADO_API}/senador/lista/atual.json`)
    const allItems = asArray(response.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar)

    if (allItems.length === 0) {
      throw new Error('Formato de dados da API do Senado está indisponível ou foi alterado.')
    }

    const senators = allItems
      .map((item) => mapSenatorFromListaItem(item))
      .filter((item): item is Senator => item !== null)
      .filter((item) => item.siglaUf === normalizedUf)
      .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))

    if (senators.length === 0) {
      throw new Error('Não foi possível interpretar os dados de senadores para a UF selecionada.')
    }

    return senators
  })()

  senatorsByStateRequestCache.set(cacheKey, request)

  try {
    return await request
  } catch (error) {
    senatorsByStateRequestCache.delete(cacheKey)
    throw error
  }
}

/**
 * Retorna a lista de deputados estaduais de uma UF a partir do índice pré-gerado.
* Disponível para todas as UFs (incluindo DF) via índice gerado.
 */
export async function fetchStateDeputiesByState(uf: string): Promise<StateDeputy[]> {
  const normalizedUf = uf.trim().toUpperCase()

  const allItems = await fetchPoliticiansIndex()
  return allItems
    .filter((item) => item.cargo === 'deputado-estadual' && item.estado === normalizedUf)
    .map((item) => ({
      id: item.id,
      nome: item.nome,
      siglaPartido: item.partido,
      siglaUf: item.estado,
      email: item.email,
      urlFoto: item.urlFoto,
      telefone: item.telefone,
      urlPerfil: item.estado === 'RS'
        ? item.urlPerfil || `https://ww4.al.rs.gov.br/deputados/${item.id}`
        : item.estado === 'SC'
          ? item.urlPerfil || `https://www.alesc.sc.gov.br/deputado/${item.id.replace('sc-', '')}/`
          : item.urlPerfil,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export async function fetchSenatorDetailBundle(id: string): Promise<SenatorDetail> {
  const normalizedId = id.trim()

  if (!normalizedId) {
    throw new Error('Código de senador inválido.')
  }

  const cachedRequest = senatorDetailRequestCache.get(normalizedId)

  if (cachedRequest) {
    return cachedRequest
  }

  const request = (async () => {
    const [detailResult, mandatesResult, commissionsResult, officesResult] =
      await Promise.allSettled([
        fetchApi<SenadoDetalheResponse>(`${SENADO_API}/senador/${normalizedId}.json`),
        fetchApi<SenadoMandatosResponse>(`${SENADO_API}/senador/${normalizedId}/mandatos.json`),
        fetchApi<SenadoComissoesResponse>(`${SENADO_API}/senador/${normalizedId}/comissoes.json`),
        fetchApi<SenadoCargosResponse>(`${SENADO_API}/senador/${normalizedId}/cargos.json`),
      ])

    if (detailResult.status !== 'fulfilled') {
      throw new Error('Erro ao carregar detalhe do senador.')
    }

    const parlamentar = detailResult.value.DetalheParlamentar?.Parlamentar
    const identification = parlamentar?.IdentificacaoParlamentar

    if (!identification?.CodigoParlamentar || !identification.NomeParlamentar) {
      throw new Error('Senador não encontrado.')
    }

    const mandates =
      mandatesResult.status === 'fulfilled'
        ? mapSenatorTerms(mandatesResult.value.MandatoParlamentar?.Parlamentar?.Mandatos?.Mandato)
        : []
    const commissions =
      commissionsResult.status === 'fulfilled'
        ? mapSenatorCommissions(
            commissionsResult.value.MembroComissaoParlamentar?.Parlamentar?.Comissoes?.Comissao,
          )
        : []
    const offices =
      officesResult.status === 'fulfilled'
        ? mapSenatorOffices(officesResult.value.CargoParlamentar?.Parlamentar?.Cargos?.Cargo)
        : []

    const baseSenator = mapSenatorFromListaItem({
      IdentificacaoParlamentar: {
        CodigoParlamentar: identification.CodigoParlamentar,
        CodigoPublicoNaLegAtual: identification.CodigoPublicoNaLegAtual,
        NomeParlamentar: identification.NomeParlamentar,
        NomeCompletoParlamentar: identification.NomeCompletoParlamentar,
        SexoParlamentar: identification.SexoParlamentar,
        UrlFotoParlamentar: identification.UrlFotoParlamentar,
        UrlPaginaParlamentar: identification.UrlPaginaParlamentar,
        UrlPaginaParticular: identification.UrlPaginaParticular,
        EmailParlamentar: identification.EmailParlamentar,
        SiglaPartidoParlamentar: identification.SiglaPartidoParlamentar,
        UfParlamentar: identification.UfParlamentar,
      },
    })

    if (!baseSenator) {
      throw new Error('Senador não encontrado.')
    }

    return {
      ...baseSenator,
      dataNascimento: parlamentar?.DadosBasicosParlamentar?.DataNascimento?.trim() || undefined,
      naturalidade: parlamentar?.DadosBasicosParlamentar?.Naturalidade?.trim() || undefined,
      ufNaturalidade: parlamentar?.DadosBasicosParlamentar?.UfNaturalidade?.trim() || undefined,
      enderecoParlamentar:
        parlamentar?.DadosBasicosParlamentar?.EnderecoParlamentar?.trim() || undefined,
      mandatos: mandates,
      comissoes: commissions,
      cargos: offices,
      links: mapSenatorLinks(parlamentar?.OutrasInformacoes?.Servico),
    }
  })()

  senatorDetailRequestCache.set(normalizedId, request)

  try {
    return await request
  } catch (error) {
    senatorDetailRequestCache.delete(normalizedId)
    throw error
  }
}

type SenadoApartesResponse = {
  ApartesParlamentar?: {                         // used by fetchSenatorApartes
    Parlamentar?: {
      Apartes?: {
        Aparte?: SenadoSingleOrArray<{
          CodigoPronunciamento?: string
          TipoUsoPalavra?: {
            Sigla?: string
            Descricao?: string
          }
          DataPronunciamento?: string
          NomeCasaPronunciamento?: string
          TextoResumo?: string
          UrlTexto?: string
          Orador?: {
            NomeParlamentar?: string
            SiglaPartidoParlamentarNaData?: string
            UfParlamentarNaData?: string
          }
          SessaoPlenaria?: {
            DataSessao?: string
            NumeroSessao?: string
            SiglaTipoSessao?: string
          }
        }>
      }
    }
  }
}

export async function fetchSenatorApartes(url: string): Promise<SenatorAparte[]> {
  const normalizedUrl = (() => {
    const [base, query] = url.split('?')
    const cleanBase = base.replace(/\.xml$/i, '')
    const withJson = cleanBase.endsWith('.json') ? cleanBase : `${cleanBase}.json`
    return query ? `${withJson}?${query}` : withJson
  })()
  return fetchAndMapPronunciamentos<SenadoApartesResponse>(
    normalizedUrl,
    (r) => r.ApartesParlamentar?.Parlamentar?.Apartes?.Aparte,
  )
}

// ─── Shared pronunciamento item shape ───────────────────────────────────────
type SenadoPronunciamentoItem = {
  CodigoPronunciamento?: string
  TipoUsoPalavra?: { Sigla?: string; Descricao?: string }
  DataPronunciamento?: string
  NomeCasaPronunciamento?: string
  TextoResumo?: string
  UrlTexto?: string
  Orador?: {
    NomeParlamentar?: string
    SiglaPartidoParlamentarNaData?: string
    UfParlamentarNaData?: string
  }
  SessaoPlenaria?: {
    DataSessao?: string
    NumeroSessao?: string
    SiglaTipoSessao?: string
  }
}

function normalizeSenadorUrl(url: string): string {
  const [base, query] = url.split('?')
  const cleanBase = base.replace(/\.xml$/i, '')
  const withJson = cleanBase.endsWith('.json') ? cleanBase : `${cleanBase}.json`
  return query ? `${withJson}?${query}` : withJson
}

function mapPronunciamento(item: SenadoPronunciamentoItem): SenatorAparte {
  return {
    codigo: item.CodigoPronunciamento?.trim() || '',
    tipoSigla: item.TipoUsoPalavra?.Sigla?.trim() || undefined,
    tipoDescricao: item.TipoUsoPalavra?.Descricao?.trim() || undefined,
    data: item.DataPronunciamento?.trim() || undefined,
    casa: item.NomeCasaPronunciamento?.trim() || undefined,
    textoResumo: item.TextoResumo?.trim() || undefined,
    urlTexto: item.UrlTexto?.trim() || undefined,
    orador: item.Orador
      ? {
          nome: item.Orador.NomeParlamentar?.trim() || undefined,
          siglaPartido: item.Orador.SiglaPartidoParlamentarNaData?.trim() || undefined,
          uf: item.Orador.UfParlamentarNaData?.trim() || undefined,
        }
      : undefined,
    sessao: item.SessaoPlenaria
      ? {
          data: item.SessaoPlenaria.DataSessao?.trim() || undefined,
          numero: item.SessaoPlenaria.NumeroSessao?.trim() || undefined,
          tipo: item.SessaoPlenaria.SiglaTipoSessao?.trim() || undefined,
        }
      : undefined,
  }
}

async function fetchAndMapPronunciamentos<T>(
  url: string,
  getItems: (response: T) => SenadoSingleOrArray<SenadoPronunciamentoItem> | undefined,
): Promise<SenatorAparte[]> {
  const response = await fetchApi<T>(url)
  const items = asArray(getItems(response))
  return items
    .map(mapPronunciamento)
    .filter((item) => Boolean(item.codigo))
    .sort((a, b) => {
      if (!a.data || !b.data) return 0
      return b.data.localeCompare(a.data)
    })
}

// ─── Discursos ───────────────────────────────────────────────────────────────
type SenadoDiscursosResponse = {
  DiscursosParlamentar?: {
    Parlamentar?: {
      Pronunciamentos?: {
        Pronunciamento?: SenadoSingleOrArray<SenadoPronunciamentoItem>
      }
    }
  }
}

export async function fetchSenatorDiscursos(url: string): Promise<SenatorAparte[]> {
  return fetchAndMapPronunciamentos<SenadoDiscursosResponse>(
    normalizeSenadorUrl(url),
    (r) => r.DiscursosParlamentar?.Parlamentar?.Pronunciamentos?.Pronunciamento,
  )
}

// ─── Filiações ───────────────────────────────────────────────────────────────
type SenadoFiliacoesResponse = {
  FiliacaoParlamentar?: {
    Parlamentar?: {
      Filiacoes?: {
        Filiacao?: SenadoSingleOrArray<{
          Partido?: { CodigoPartido?: string; SiglaPartido?: string; NomePartido?: string }
          DataFiliacao?: string
          DataDesfiliacao?: string
        }>
      }
    }
  }
}

export async function fetchSenatorFiliacoes(url: string): Promise<SenatorFiliacao[]> {
  const response = await fetchApi<SenadoFiliacoesResponse>(normalizeSenadorUrl(url))
  return asArray(response.FiliacaoParlamentar?.Parlamentar?.Filiacoes?.Filiacao)
    .map((item) => ({
      siglaPartido: item.Partido?.SiglaPartido?.trim() || 'Sem partido',
      nomePartido: item.Partido?.NomePartido?.trim() || undefined,
      dataFiliacao: item.DataFiliacao?.trim() || undefined,
      dataDesfiliacao: item.DataDesfiliacao?.trim() || undefined,
    }))
    .filter((item) => Boolean(item.siglaPartido))
}

// ─── Licenças ────────────────────────────────────────────────────────────────
type SenadoLicencasResponse = {
  LicencaParlamentar?: {
    Parlamentar?: {
      Licencas?: {
        Licenca?: SenadoSingleOrArray<{
          Codigo?: string
          DataInicio?: string
          DataFim?: string
          SiglaTipoAfastamento?: string
          DescricaoTipoAfastamento?: string
        }>
      }
    }
  }
}

export async function fetchSenatorLicencas(url: string): Promise<SenatorLicenca[]> {
  const response = await fetchApi<SenadoLicencasResponse>(normalizeSenadorUrl(url))
  return asArray(response.LicencaParlamentar?.Parlamentar?.Licencas?.Licenca)
    .map((item) => ({
      codigo: item.Codigo?.trim() || '',
      dataInicio: item.DataInicio?.trim() || undefined,
      dataFim: item.DataFim?.trim() || undefined,
      siglaTipo: item.SiglaTipoAfastamento?.trim() || undefined,
      descricaoTipo: item.DescricaoTipoAfastamento?.trim() || undefined,
    }))
    .filter((item) => Boolean(item.codigo))
    .sort((a, b) => {
      if (!a.dataInicio || !b.dataInicio) return 0
      return b.dataInicio.localeCompare(a.dataInicio)
    })
}

type SenadoLiderancasResponse = {
  LiderancaParlamentar?: {
    Parlamentar?: {
      Liderancas?: {
        Lideranca?: SenadoSingleOrArray<{
          UnidadeLideranca?: string
          SiglaCasaLideranca?: string
          NomeCasaLideranca?: string
          DescricaoTipoLideranca?: string
          NumeroOrdemViceLideranca?: string
          DataDesignacao?: string
          DataFim?: string
          Partido?: {
            SiglaPartido?: string
            NomePartido?: string
          }
          Bloco?: {
            SiglaBloco?: string
            NomeBloco?: string
            ApelidoBloco?: string
          }
        }>
      }
    }
  }
}

export async function fetchSenatorLiderancas(url: string): Promise<SenatorLideranca[]> {
  const response = await fetchApi<SenadoLiderancasResponse>(normalizeSenadorUrl(url))

  return asArray(response.LiderancaParlamentar?.Parlamentar?.Liderancas?.Lideranca)
    .map((item) => ({
      unidade: item.UnidadeLideranca?.trim() || undefined,
      casa: item.NomeCasaLideranca?.trim() || item.SiglaCasaLideranca?.trim() || undefined,
      tipo: item.DescricaoTipoLideranca?.trim() || undefined,
      ordemVice: item.NumeroOrdemViceLideranca?.trim() || undefined,
      dataInicio: item.DataDesignacao?.trim() || undefined,
      dataFim: item.DataFim?.trim() || undefined,
      bloco: item.Bloco
        ? {
            sigla: item.Bloco.SiglaBloco?.trim() || undefined,
            nome: item.Bloco.NomeBloco?.trim() || item.Bloco.ApelidoBloco?.trim() || undefined,
          }
        : undefined,
      partido: item.Partido
        ? {
            sigla: item.Partido.SiglaPartido?.trim() || undefined,
            nome: item.Partido.NomePartido?.trim() || undefined,
          }
        : undefined,
    }))
    .filter((item) => Boolean(item.tipo || item.unidade || item.partido?.sigla || item.bloco?.sigla))
}

type SenadoMateriaItem = {
  Codigo?: string
  DescricaoIdentificacao?: string
  Ementa?: string
  Data?: string
}

type SenadoAutoriasResponse = {
  MateriasAutoriaParlamentar?: {
    Parlamentar?: {
      Autorias?: {
        Autoria?: SenadoSingleOrArray<{
          IndicadorAutorPrincipal?: string
          IndicadorOutrosAutores?: string
          Materia?: SenadoMateriaItem
        }>
      }
      Materias?: {
        Materia?: SenadoSingleOrArray<SenadoMateriaItem>
      }
    }
  }
}

function normalizeIndicator(value?: string): boolean {
  const normalized = value?.trim().toLowerCase()
  return normalized === 'sim' || normalized === 's' || normalized === 'true'
}

function mapMateria(item?: SenadoMateriaItem): Pick<SenatorMateriaAutoria, 'codigoMateria' | 'identificacao' | 'ementa' | 'data'> {
  return {
    codigoMateria: item?.Codigo?.trim() || undefined,
    identificacao: item?.DescricaoIdentificacao?.trim() || undefined,
    ementa: item?.Ementa?.trim() || undefined,
    data: item?.Data?.trim() || undefined,
  }
}

export async function fetchSenatorMateriasAutoria(url: string): Promise<SenatorMateriaAutoria[]> {
  const response = await fetchApi<SenadoAutoriasResponse>(normalizeSenadorUrl(url))
  const parlamentar = response.MateriasAutoriaParlamentar?.Parlamentar
  const autorias = asArray(parlamentar?.Autorias?.Autoria)

  if (autorias.length > 0) {
    return autorias
      .map((item) => ({
        ...mapMateria(item.Materia),
        indicadorAutorPrincipal: normalizeIndicator(item.IndicadorAutorPrincipal),
        indicadorOutrosAutores: normalizeIndicator(item.IndicadorOutrosAutores),
      }))
      .filter((item) => Boolean(item.codigoMateria || item.identificacao))
  }

  return asArray(parlamentar?.Materias?.Materia)
    .map((item) => ({
      ...mapMateria(item),
      indicadorAutorPrincipal: false,
      indicadorOutrosAutores: false,
    }))
    .filter((item) => Boolean(item.codigoMateria || item.identificacao))
}

type SenadoRelatoriasResponse = {
  MateriasRelatoriaParlamentar?: {
    Parlamentar?: {
      Relatorias?: {
        Relatoria?: SenadoSingleOrArray<{
          CodigoTipoRelator?: string
          DescricaoTipoRelator?: string
          DataDesignacao?: string
          DataDestituicao?: string
          DescricaoMotivoDestituicao?: string
          Materia?: SenadoMateriaItem
          Comissao?: {
            Sigla?: string
            Nome?: string
          }
        }>
      }
    }
  }
}

export async function fetchSenatorMateriasRelatoria(url: string): Promise<SenatorMateriaRelatoria[]> {
  const response = await fetchApi<SenadoRelatoriasResponse>(normalizeSenadorUrl(url))

  return asArray(response.MateriasRelatoriaParlamentar?.Parlamentar?.Relatorias?.Relatoria)
    .map((item) => ({
      ...mapMateria(item.Materia),
      tipoRelator: item.DescricaoTipoRelator?.trim() || item.CodigoTipoRelator?.trim() || undefined,
      dataDesignacao: item.DataDesignacao?.trim() || undefined,
      dataDestituicao: item.DataDestituicao?.trim() || undefined,
      motivoDestituicao: item.DescricaoMotivoDestituicao?.trim() || undefined,
      comissao: item.Comissao
        ? {
            sigla: item.Comissao.Sigla?.trim() || undefined,
            nome: item.Comissao.Nome?.trim() || undefined,
          }
        : undefined,
    }))
    .filter((item) => Boolean(item.codigoMateria || item.identificacao))
}

type SenadoVotacoesResponse = {
  VotacaoParlamentar?: {
    Parlamentar?: {
      Votacoes?: {
        Votacao?: SenadoSingleOrArray<{
          CodigoSessaoVotacao?: string
          IndicadorVotacaoSecreta?: string
          DescricaoVotacao?: string
          DescricaoResultado?: string
          TotalVotosSim?: string
          TotalVotosNao?: string
          TotalVotosAbstencao?: string
          SiglaDescricaoVoto?: string
          DescricaoVoto?: string
          SessaoPlenaria?: {
            DataSessao?: string
          }
          Materia?: {
            DescricaoIdentificacao?: string
            Ementa?: string
          }
        }>
      }
    }
  }
}

export async function fetchSenatorVotacoes(url: string): Promise<SenatorVotacao[]> {
  const response = await fetchApi<SenadoVotacoesResponse>(normalizeSenadorUrl(url))

  return asArray(response.VotacaoParlamentar?.Parlamentar?.Votacoes?.Votacao)
    .map((item) => ({
      codigoSessaoVotacao: item.CodigoSessaoVotacao?.trim() || undefined,
      descricaoVotacao: item.DescricaoVotacao?.trim() || undefined,
      descricaoResultado: item.DescricaoResultado?.trim() || undefined,
      dataSessao: item.SessaoPlenaria?.DataSessao?.trim() || undefined,
      siglaVoto: item.SiglaDescricaoVoto?.trim() || undefined,
      descricaoVoto: item.DescricaoVoto?.trim() || undefined,
      votacaoSecreta: normalizeIndicator(item.IndicadorVotacaoSecreta),
      totalSim: item.TotalVotosSim?.trim() || undefined,
      totalNao: item.TotalVotosNao?.trim() || undefined,
      totalAbstencao: item.TotalVotosAbstencao?.trim() || undefined,
      materia: item.Materia
        ? {
            identificacao: item.Materia.DescricaoIdentificacao?.trim() || undefined,
            ementa: item.Materia.Ementa?.trim() || undefined,
          }
        : undefined,
    }))
    .filter((item) => Boolean(item.codigoSessaoVotacao || item.descricaoVotacao))
    .sort((a, b) => {
      if (!a.dataSessao || !b.dataSessao) return 0
      return b.dataSessao.localeCompare(a.dataSessao)
    })
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
