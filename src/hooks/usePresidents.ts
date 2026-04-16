import { useCallback, useMemo, useState } from 'react'
import { fetchPresidents } from '../api/camaraApi'
import type { President } from '../types/camara'

export function usePresidents() {
  const [allPresidents, setAllPresidents] = useState<President[]>([])
  const [search, setSearch] = useState('')
  const [loadingPresidents, setLoadingPresidents] = useState(false)
  const [presidentsError, setPresidentsError] = useState('')

  const filteredPresidents = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return allPresidents
    }

    return allPresidents.filter(
      (president) =>
        president.nome.toLowerCase().includes(query) ||
        president.siglaPartido.toLowerCase().includes(query) ||
        president.cargo.toLowerCase().includes(query) ||
        president.vice?.nome.toLowerCase().includes(query) ||
        president.vice?.siglaPartido?.toLowerCase().includes(query) ||
        president.vice?.cargo.toLowerCase().includes(query),
    )
  }, [allPresidents, search])

  const loadPresidents = useCallback(async () => {
    setLoadingPresidents(true)
    setPresidentsError('')

    try {
      const presidents = await fetchPresidents()
      setAllPresidents(presidents)
    } catch {
      setPresidentsError('Erro ao carregar a consulta da Presidência.')
      setAllPresidents([])
    } finally {
      setLoadingPresidents(false)
    }
  }, [])

  const findPresidentById = useCallback((id: string) => {
    return allPresidents.find((item) => item.id === id) || null
  }, [allPresidents])

  return {
    allPresidents,
    search,
    loadingPresidents,
    presidentsError,
    filteredPresidents,
    setSearch,
    loadPresidents,
    findPresidentById,
  }
}
