import { useRef, useState } from 'react'
import { fetchDeputyDetailBundle, fetchDeputyOrgaos } from '../api/camaraApi'
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
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [deputyInfo, setDeputyInfo] = useState<DeputyInfo | null>(null)
  const [professions, setProfessions] = useState<Profession[]>([])
  const [propositions, setPropositions] = useState<Proposition[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [orgaos, setOrgaos] = useState<DeputyOrgan[]>([])
  const [loadingOrgaos, setLoadingOrgaos] = useState(false)
  const [orgaosError, setOrgaosError] = useState('')
  const lastLoadedOrgaosDeputyId = useRef<number | null>(null)
  const latestRequestId = useRef(0)

  async function loadDeputyDetail(id: number) {
    latestRequestId.current += 1
    const requestId = latestRequestId.current

    setLoadingDetail(true)
    setDetailError('')
    setActiveTab('proposicoes')

    try {
      const {
        info,
        professions: fetchedProfessions,
        propositions: fetchedPropositions,
        votes: fetchedVotes,
      } =
        await fetchDeputyDetailBundle(id)

      if (requestId !== latestRequestId.current) {
        return
      }

      setDeputyInfo(info)
      setProfessions(fetchedProfessions)
      setPropositions(fetchedPropositions)
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
  }

  async function loadDeputyOrgaos(id: number) {
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
  }

  function clearDeputyDetailState() {
    setDeputyInfo(null)
    setProfessions([])
    setPropositions([])
    setVotes([])
    setOrgaos([])
    setOrgaosError('')
    setLoadingOrgaos(false)
    lastLoadedOrgaosDeputyId.current = null
    setDetailError('')
    setActiveTab('proposicoes')
  }

  return {
    activeTab,
    loadingDetail,
    detailError,
    deputyInfo,
    professions,
    propositions,
    votes,
    orgaos,
    loadingOrgaos,
    orgaosError,
    setActiveTab,
    loadDeputyDetail,
    loadDeputyOrgaos,
    clearDeputyDetailState,
  }
}
