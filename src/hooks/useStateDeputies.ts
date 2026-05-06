import { useCallback, useMemo, useState } from 'react'
import { fetchStateDeputiesByState } from '../api/camaraApi'
import type { StateDeputy } from '../types/camara'

export function useStateDeputies() {
  const [allDeputies, setAllDeputies] = useState<StateDeputy[]>([])
  const [search, setSearch] = useState('')
  const [loadingDeputies, setLoadingDeputies] = useState(false)
  const [deputiesError, setDeputiesError] = useState('')

  const filteredDeputies = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return allDeputies

    return allDeputies.filter(
      (deputy) =>
        deputy.nome.toLowerCase().includes(query) ||
        deputy.siglaPartido.toLowerCase().includes(query),
    )
  }, [allDeputies, search])

  const loadDeputies = useCallback(async (uf: string) => {
    setLoadingDeputies(true)
    setDeputiesError('')

    try {
      const deputies = await fetchStateDeputiesByState(uf)
      setAllDeputies(deputies)
    } catch {
      setDeputiesError('Erro ao carregar deputados estaduais. Verifique a conexão.')
      setAllDeputies([])
    } finally {
      setLoadingDeputies(false)
    }
  }, [])

  const clearDeputiesState = useCallback(() => {
    setAllDeputies([])
    setSearch('')
    setDeputiesError('')
  }, [])

  const findDeputyById = useCallback((id: string) => {
    return allDeputies.find((item) => item.id === id) || null
  }, [allDeputies])

  return {
    allDeputies,
    search,
    loadingDeputies,
    deputiesError,
    filteredDeputies,
    setSearch,
    loadDeputies,
    clearDeputiesState,
    findDeputyById,
  }
}
