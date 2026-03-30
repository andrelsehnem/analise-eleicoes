import { useMemo, useState } from 'react'
import { fetchDeputiesByState } from '../api/camaraApi'
import type { Deputy } from '../types/camara'

export function useDeputies() {
  const [allDeputies, setAllDeputies] = useState<Deputy[]>([])
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

  async function loadDeputies(uf: string) {
    setLoadingDeputies(true)
    setDeputiesError('')

    try {
      const deputies = await fetchDeputiesByState(uf)
      setAllDeputies(deputies)
    } catch {
      setDeputiesError('Erro ao carregar deputados. Verifique a conexão.')
      setAllDeputies([])
    } finally {
      setLoadingDeputies(false)
    }
  }

  function clearDeputiesState() {
    setAllDeputies([])
    setSearch('')
    setDeputiesError('')
  }

  function findDeputyById(id: number) {
    return allDeputies.find((item) => item.id === id) || null
  }

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
