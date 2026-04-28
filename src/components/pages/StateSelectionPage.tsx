import { StatesPanel } from '../panels/StatesPanel'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { OfficeType } from '../../types/camara'
import { SeoHead } from '../common/SeoHead'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'

const VALID_OFFICES: OfficeType[] = [
  'deputado-federal',
  'deputado-estadual',
  'senador',
  'presidente',
]

function isOfficeType(value: string): value is OfficeType {
  return VALID_OFFICES.includes(value as OfficeType)
}

export function StateSelectionPage() {
  const { office } = useParams<{ office?: string }>()
  const navigate = useNavigate()
  const { goToDeputies, goToPresidents, goToSenators, goToStateSelection } = useAppNavigation()
  const [selectedUf, setSelectedUf] = useState<string | null>(null)

  const selectedOffice: OfficeType = office && isOfficeType(office) ? office : 'deputado-federal'

  useEffect(() => {
    if (!office) {
      return
    }

    if (!isOfficeType(office)) {
      navigate('/por-estado', { replace: true })
    }
  }, [office, navigate])

  function handleSelectState(uf: string) {
    setSelectedUf(uf)

    if (selectedOffice === 'deputado-federal') {
      goToDeputies(uf)
      return
    }

    if (selectedOffice === 'senador') {
      goToSenators(uf)
    }
  }

  function handleOfficeChange(office: OfficeType) {
    setSelectedUf(null)

    if (office === 'presidente') {
      goToPresidents()
      return
    }

    goToStateSelection(office)
  }

  const stateSelectionPath =
    selectedOffice === 'deputado-federal' ? '/por-estado' : `/por-estado/${selectedOffice}`

  return (
    <>
      <SeoHead
        title="Selecionar estado e cargo"
        description="Escolha o cargo e o estado para consultar representantes e acessar informações públicas sobre atuação política."
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Seleção por estado', path: stateSelectionPath },
          ]),
          buildCollectionPageSchema(
            'Seleção por estado e cargo',
            'Página de seleção de estado e cargo para iniciar a consulta de representantes públicos.',
            stateSelectionPath,
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
