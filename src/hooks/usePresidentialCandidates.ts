import { useCallback, useMemo, useState } from 'react'
import { fetchPresidentialCandidates } from '../api/candidatesApi'
import type { PresidentialCandidate } from '../types/camara'

export function usePresidentialCandidates() {
  const [allCandidates, setAllCandidates] = useState<PresidentialCandidate[]>([])
  const [search, setSearch] = useState('')
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [candidatesError, setCandidatesError] = useState('')

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')

    if (!query) {
      return allCandidates
    }

    return allCandidates.filter((candidate) =>
      [
        candidate.nomeUrna,
        candidate.nomeCompleto,
        candidate.partido,
        candidate.nomePartido,
        candidate.coligacao,
        String(candidate.numero),
      ].some((value) => value.toLocaleLowerCase('pt-BR').includes(query)),
    )
  }, [allCandidates, search])

  const loadCandidates = useCallback(async () => {
    setLoadingCandidates(true)
    setCandidatesError('')

    try {
      const response = await fetchPresidentialCandidates()
      setAllCandidates(response.candidatos)
    } catch (error) {
      setCandidatesError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os candidatos à Presidência.',
      )
      setAllCandidates([])
    } finally {
      setLoadingCandidates(false)
    }
  }, [])

  return {
    allCandidates,
    filteredCandidates,
    search,
    loadingCandidates,
    candidatesError,
    setSearch,
    loadCandidates,
  }
}
