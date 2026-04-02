import { StatesPanel } from '../panels/StatesPanel'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useState } from 'react'
import type { OfficeType } from '../../types/camara'

export function StateSelectionPage() {
  const { goToDeputies, goToPresidents } = useAppNavigation()
  const [selectedUf, setSelectedUf] = useState<string | null>(null)
  const [selectedOffice, setSelectedOffice] = useState<OfficeType>('deputado-federal')

  function handleSelectState(uf: string) {
    setSelectedUf(uf)

    if (selectedOffice === 'deputado-federal') {
      goToDeputies(uf)
    }
  }

  function handleOfficeChange(office: OfficeType) {
    setSelectedOffice(office)
    setSelectedUf(null)

    if (office === 'presidente') {
      goToPresidents()
    }
  }

  return (
    <StatesPanel
      selectedUf={selectedUf}
      selectedOffice={selectedOffice}
      onChangeOffice={handleOfficeChange}
      onSelectState={handleSelectState}
    />
  )
}
