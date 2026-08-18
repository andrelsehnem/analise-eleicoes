import { useCallback, useMemo, useState } from 'react'
import { fetchStateElectionCandidates } from '../api/candidatesApi'
import type { ElectionCandidate, StateElectionOffice } from '../types/camara'

const PAGE_SIZE = 24

export function useStateElectionCandidates(office: StateElectionOffice, uf: string) {
  const [allCandidates, setAllCandidates] = useState<ElectionCandidate[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    if (!query) return allCandidates
    return allCandidates.filter((candidate) =>
      [candidate.nomeUrna, candidate.nomeCompleto, candidate.partido, candidate.nomePartido,
        candidate.coligacao, String(candidate.numero)]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(query)),
    )
  }, [allCandidates, search])

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / PAGE_SIZE))
  const candidates = useMemo(
    () => filteredCandidates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredCandidates, page],
  )

  const changeSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const loadCandidates = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchStateElectionCandidates(office, uf)
      setAllCandidates(response.candidatos)
      setPage(1)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as candidaturas.')
      setAllCandidates([])
    } finally {
      setLoading(false)
    }
  }, [office, uf])

  return { allCandidates, candidates, filteredCount: filteredCandidates.length, search, page,
    totalPages, loading, error, setSearch: changeSearch, setPage, loadCandidates }
}
