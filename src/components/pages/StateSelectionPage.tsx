import { StatesPanel } from '../panels/StatesPanel'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useState } from 'react'
import type { OfficeType } from '../../types/camara'
import { SeoHead } from '../common/SeoHead'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'

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
    <>
      <SeoHead
        title="Selecionar estado e cargo"
        description="Escolha o cargo e o estado para consultar representantes e acessar informações públicas sobre atuação política."
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Seleção por estado', path: '/por-estado' },
          ]),
          buildCollectionPageSchema(
            'Seleção por estado e cargo',
            'Página de seleção de estado e cargo para iniciar a consulta de representantes públicos.',
            '/por-estado',
          ),
        ]}
      />
      <StatesPanel
        selectedUf={selectedUf}
        selectedOffice={selectedOffice}
        onChangeOffice={handleOfficeChange}
        onSelectState={handleSelectState}
      />
    </>
  )
}
