import { useCallback, useState } from 'react'
import { fetchStateElectionCandidateDetail } from '../api/candidatesApi'
import type { ElectionCandidateDetail, StateElectionOffice } from '../types/camara'

export function useStateElectionCandidateDetail() {
  const [candidate, setCandidate] = useState<ElectionCandidateDetail | null>(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadCandidate = useCallback(async (office: StateElectionOffice, uf: string, candidateId: string) => {
    setLoading(true)
    setError('')
    setCandidate(null)
    try {
      const response = await fetchStateElectionCandidateDetail(office, uf, candidateId)
      setCandidate(response.candidato)
      setSourceUrl(response.fonteUrl)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os detalhes da candidatura.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { candidate, sourceUrl, loading, error, loadCandidate }
}
