import { useRef, useState } from 'react'
import { fetchDeputyDetailBundle } from '../api/camaraApi'
import type { DeputyInfo, Proposition, Tab, Vote } from '../types/camara'

export function useDeputyDetail() {
  const [activeTab, setActiveTab] = useState<Tab>('proposicoes')
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [deputyInfo, setDeputyInfo] = useState<DeputyInfo | null>(null)
  const [propositions, setPropositions] = useState<Proposition[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const latestRequestId = useRef(0)

  async function loadDeputyDetail(id: number) {
    latestRequestId.current += 1
    const requestId = latestRequestId.current

    setLoadingDetail(true)
    setDetailError('')
    setActiveTab('proposicoes')

    try {
      const { info, propositions: fetchedPropositions, votes: fetchedVotes } =
        await fetchDeputyDetailBundle(id)

      if (requestId !== latestRequestId.current) {
        return
      }

      setDeputyInfo(info)
      setPropositions(fetchedPropositions)
      setVotes(fetchedVotes)
    } catch {
      if (requestId !== latestRequestId.current) {
        return
      }

      setDetailError('Erro ao carregar detalhes do deputado.')
      setDeputyInfo(null)
      setPropositions([])
      setVotes([])
    } finally {
      if (requestId === latestRequestId.current) {
        setLoadingDetail(false)
      }
    }
  }

  function clearDeputyDetailState() {
    setDeputyInfo(null)
    setPropositions([])
    setVotes([])
    setDetailError('')
    setActiveTab('proposicoes')
  }

  return {
    activeTab,
    loadingDetail,
    detailError,
    deputyInfo,
    propositions,
    votes,
    setActiveTab,
    loadDeputyDetail,
    clearDeputyDetailState,
  }
}
