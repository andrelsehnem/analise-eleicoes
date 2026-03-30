import { useParams, useNavigate } from 'react-router-dom'
import { DeputiesPanel } from '../panels/DeputiesPanel'
import { useDeputies } from '../../hooks/useDeputies'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useEffect } from 'react'
import { STATES } from '../../constants/states'
import type { Deputy } from '../../types/camara'

export function DeputiesListPage() {
  const { uf } = useParams<{ uf: string }>()
  const navigate = useNavigate()
  const { goToDeputyDetail, goToStateSelection } = useAppNavigation()
  const {
    allDeputies,
    search,
    loadingDeputies,
    deputiesError,
    filteredDeputies,
    setSearch,
    loadDeputies,
  } = useDeputies()

  // Validar se UF é válido
  useEffect(() => {
    if (!uf) {
      navigate('/federal-por-estado')
      return
    }

    const isValidUf = STATES.some(
      (state) => state.uf.toLowerCase() === uf.toLowerCase()
    )

    if (!isValidUf) {
      navigate('/federal-por-estado')
      return
    }

    const loadData = async () => {
      await loadDeputies(uf.toUpperCase())
    }

    loadData()
  }, [uf, navigate])

  const stateName: string =
    STATES.find((state) => state.uf.toLowerCase() === uf?.toLowerCase())
      ?.name || uf || ''

  function handleSelectDeputy(deputy: Deputy) {
    goToDeputyDetail(uf || '', deputy)
  }

  return (
    <DeputiesPanel
      stateName={stateName}
      allDeputiesCount={allDeputies.length}
      search={search}
      onSearchChange={setSearch}
      loading={loadingDeputies}
      error={deputiesError}
      deputies={filteredDeputies}
      onBack={goToStateSelection}
      onSelectDeputy={handleSelectDeputy}
    />
  )
}
