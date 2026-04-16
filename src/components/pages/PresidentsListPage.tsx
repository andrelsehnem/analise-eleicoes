import { useEffect } from 'react'
import { PresidentsPanel } from '../panels/PresidentsPanel'
import { usePresidents } from '../../hooks/usePresidents'
import { useAppNavigation } from '../../hooks/useAppNavigation'

export function PresidentsListPage() {
  const { goToPresidentDetailById, goToStateSelection } = useAppNavigation()
  const {
    search,
    loadingPresidents,
    presidentsError,
    filteredPresidents,
    setSearch,
    loadPresidents,
  } = usePresidents()

  useEffect(() => {
    void loadPresidents()
  }, [loadPresidents])

  function handleSelectPresident(id: string) {
    goToPresidentDetailById(id)
  }

  return (
    <PresidentsPanel
      search={search}
      onSearchChange={setSearch}
      loading={loadingPresidents}
      error={presidentsError}
      presidents={filteredPresidents}
      onBack={goToStateSelection}
      onSelectPresident={handleSelectPresident}
    />
  )
}
