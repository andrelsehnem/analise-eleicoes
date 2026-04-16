import { useState } from 'react'
import { useDeputies } from './useDeputies'
import { useDeputyDetail } from './useDeputyDetail'
import type { Deputy, Panel, StateItem } from '../types/camara'

export function useCamaraData() {
  const [panel, setPanel] = useState<Panel>('landing')
  const [selectedState, setSelectedState] = useState<StateItem | null>(null)
  const [selectedDeputy, setSelectedDeputy] = useState<Deputy | null>(null)

  const {
    allDeputies,
    search,
    loadingDeputies,
    deputiesError,
    filteredDeputies,
    setSearch,
    loadDeputies,
    clearDeputiesState,
    findDeputyById,
  } = useDeputies()

  const {
    activeTab,
    loadingDetail,
    detailError,
    deputyInfo,
    propositions,
    setActiveTab,
    loadDeputyDetail,
    clearDeputyDetailState,
  } = useDeputyDetail()

  async function handleSelectState(uf: string, name: string) {
    setSelectedState({ uf, name })
    setSelectedDeputy(null)
    clearDeputyDetailState()
    setSearch('')
    setPanel('deputies')
    await loadDeputies(uf)
  }

  async function handleSelectDeputy(id: number) {
    const deputy = findDeputyById(id)
    setSelectedDeputy(deputy)
    setPanel('detail')
    await loadDeputyDetail(id)
  }

  function goToStates() {
    setPanel('states')
    setSelectedState(null)
    setSelectedDeputy(null)
    clearDeputiesState()
    clearDeputyDetailState()
  }

  function goToDeputies() {
    if (!selectedState) return
    setPanel('deputies')
    setSelectedDeputy(null)
    clearDeputyDetailState()
  }

  function goToSearch() {
    setPanel('states')
    setSelectedState(null)
    setSelectedDeputy(null)
    clearDeputiesState()
    clearDeputyDetailState()
  }

  return {
    panel,
    selectedState,
    selectedDeputy,
    allDeputies,
    search,
    activeTab,
    loadingDeputies,
    deputiesError,
    loadingDetail,
    detailError,
    deputyInfo,
    propositions,
    goToSearch,
    filteredDeputies,
    setSearch,
    setActiveTab,
    handleSelectState,
    handleSelectDeputy,
    goToStates,
    goToDeputies,
  }
}
