import { useCallback, useRef, useState } from 'react'
import {
  fetchDeputyDetailBundle,
  fetchDeputyOrgaos,
  fetchDeputyPropositionsPage,
} from '../api/camaraApi'
import type {
  DeputyInfo,
  DeputyOrgan,
  Profession,
  Proposition,
  Tab,
  Vote,
} from '../types/camara'

export function useDeputyDetail() {
  const [activeTab, setActiveTab] = useState<Tab>('proposicoes')
  const [includeRequirements, setIncludeRequirements] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [deputyInfo, setDeputyInfo] = useState<DeputyInfo | null>(null)
  const [professions, setProfessions] = useState<Profession[]>([])
  const [propositions, setPropositions] = useState<Proposition[]>([])
  const [loadingMorePropositions, setLoadingMorePropositions] = useState(false)
  const [hasMorePropositions, setHasMorePropositions] = useState(false)
  const [votes, setVotes] = useState<Vote[]>([])
  const [orgaos, setOrgaos] = useState<DeputyOrgan[]>([])
  const [loadingOrgaos, setLoadingOrgaos] = useState(false)
  const [orgaosError, setOrgaosError] = useState('')
  const lastLoadedOrgaosDeputyId = useRef<number | null>(null)
  const latestRequestId = useRef(0)
  const currentDeputyId = useRef<number | null>(null)
  const currentPropositionsPage = useRef(1)
  const includeRequirementsRef = useRef(false)

  const loadDeputyDetail = useCallback(async (id: number, nextIncludeRequirements?: boolean) => {
    latestRequestId.current += 1
    const requestId = latestRequestId.current
    const shouldIncludeRequirements = nextIncludeRequirements ?? includeRequirementsRef.current

    setLoadingDetail(true)
    setDetailError('')
    setActiveTab('proposicoes')
    setIncludeRequirements(shouldIncludeRequirements)
    includeRequirementsRef.current = shouldIncludeRequirements
    currentDeputyId.current = id
    setLoadingMorePropositions(false)
    setHasMorePropositions(false)
    currentPropositionsPage.current = 1

    try {
      const {
        info,
        professions: fetchedProfessions,
        propositions: fetchedPropositions,
        hasMorePropositions: fetchedHasMorePropositions,
        propositionsPage: fetchedPropositionsPage,
        votes: fetchedVotes,
      } =
        await fetchDeputyDetailBundle(id, {
          includeRequirements: shouldIncludeRequirements,
        })

      if (requestId !== latestRequestId.current) {
        return
      }

      setDeputyInfo(info)
      setProfessions(fetchedProfessions)
      setPropositions(fetchedPropositions)
      setHasMorePropositions(fetchedHasMorePropositions)
      currentPropositionsPage.current = fetchedPropositionsPage
      setVotes(fetchedVotes)
      setOrgaos([])
      setOrgaosError('')
      setLoadingOrgaos(false)
      lastLoadedOrgaosDeputyId.current = null
    } catch {
      if (requestId !== latestRequestId.current) {
        return
      }

      setDetailError('Erro ao carregar detalhes do deputado.')
      setDeputyInfo(null)
      setProfessions([])
      setPropositions([])
      setLoadingMorePropositions(false)
      setHasMorePropositions(false)
      currentPropositionsPage.current = 1
      setVotes([])
      setOrgaos([])
      setOrgaosError('')
      setLoadingOrgaos(false)
      lastLoadedOrgaosDeputyId.current = null
    } finally {
      if (requestId === latestRequestId.current) {
        setLoadingDetail(false)
      }
    }
  }, [])

  const loadMorePropositions = useCallback(async () => {
    const deputyId = currentDeputyId.current

    if (!deputyId || loadingMorePropositions || !hasMorePropositions) {
      return
    }

    setLoadingMorePropositions(true)

    try {
      const nextPage = currentPropositionsPage.current + 1
      const response = await fetchDeputyPropositionsPage(deputyId, nextPage, {
        includeRequirements: includeRequirementsRef.current,
      })

      if (currentDeputyId.current !== deputyId) {
        return
      }

      setPropositions((currentItems) => [...currentItems, ...response.propositions])
      setHasMorePropositions(response.hasNextPage)
      currentPropositionsPage.current = response.page
    } catch {
      if (currentDeputyId.current !== deputyId) {
        return
      }

      setDetailError('Erro ao carregar mais proposições do deputado.')
    } finally {
      if (currentDeputyId.current === deputyId) {
        setLoadingMorePropositions(false)
      }
    }
  }, [hasMorePropositions, loadingMorePropositions])

  const loadDeputyOrgaos = useCallback(async (id: number) => {
    if (lastLoadedOrgaosDeputyId.current === id) {
      return
    }

    setLoadingOrgaos(true)
    setOrgaosError('')

    try {
      const fetchedOrgaos = await fetchDeputyOrgaos(id)
      setOrgaos(fetchedOrgaos)
      lastLoadedOrgaosDeputyId.current = id
    } catch {
      setOrgaos([])
      setOrgaosError('Erro ao carregar órgãos do deputado.')
      lastLoadedOrgaosDeputyId.current = null
    } finally {
      setLoadingOrgaos(false)
    }
  }, [])

  const clearDeputyDetailState = useCallback(() => {
    setIncludeRequirements(false)
    includeRequirementsRef.current = false
    setDeputyInfo(null)
    setProfessions([])
    setPropositions([])
    setLoadingMorePropositions(false)
    setHasMorePropositions(false)
    currentPropositionsPage.current = 1
    currentDeputyId.current = null
    setVotes([])
    setOrgaos([])
    setOrgaosError('')
    setLoadingOrgaos(false)
    lastLoadedOrgaosDeputyId.current = null
    setDetailError('')
    setActiveTab('proposicoes')
  }, [])

  const toggleIncludeRequirements = useCallback(async () => {
    const deputyId = currentDeputyId.current
    const nextIncludeRequirements = !includeRequirementsRef.current

    if (!deputyId) {
      setIncludeRequirements(nextIncludeRequirements)
      includeRequirementsRef.current = nextIncludeRequirements
      return
    }

    await loadDeputyDetail(deputyId, nextIncludeRequirements)
  }, [loadDeputyDetail])

  return {
    activeTab,
    includeRequirements,
    loadingDetail,
    detailError,
    deputyInfo,
    professions,
    propositions,
    hasMorePropositions,
    loadingMorePropositions,
    votes,
    orgaos,
    loadingOrgaos,
    orgaosError,
    setActiveTab,
    loadDeputyDetail,
    toggleIncludeRequirements,
    loadMorePropositions,
    loadDeputyOrgaos,
    clearDeputyDetailState,
  }
}
