import { useCallback, useState } from 'react'
import { fetchPresidentialCandidateDetail } from '../api/candidatesApi'
import type { PresidentialCandidateDetail } from '../types/camara'

export function usePresidentialCandidateDetail() {
  const [candidate, setCandidate] = useState<PresidentialCandidateDetail | null>(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadCandidate = useCallback(async (candidateId: string) => {
    setLoading(true)
    setError('')
    setCandidate(null)

    try {
      const response = await fetchPresidentialCandidateDetail(candidateId)
      setCandidate(response.candidato)
      setSourceUrl(response.fonteUrl)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar os detalhes da candidatura.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  return { candidate, sourceUrl, loading, error, loadCandidate }
}
