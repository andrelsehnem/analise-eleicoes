import { StatesPanel } from '../panels/StatesPanel'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useState } from 'react'

export function StateSelectionPage() {
  const { goToDeputies } = useAppNavigation()
  const [selectedUf, setSelectedUf] = useState<string | null>(null)

  async function handleSelectState(uf: string) {
    setSelectedUf(uf)
    goToDeputies(uf)
  }

  return (
    <StatesPanel
      selectedUf={selectedUf}
      onSelectState={handleSelectState}
    />
  )
}
