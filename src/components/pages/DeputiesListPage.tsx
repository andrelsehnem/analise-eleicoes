import { useParams, useNavigate } from 'react-router-dom'
import { DeputiesPanel } from '../panels/DeputiesPanel'
import { useDeputies } from '../../hooks/useDeputies'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useEffect } from 'react'
import { STATES } from '../../constants/states'
import type { Deputy } from '../../types/camara'
import { SeoHead } from '../common/SeoHead'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'

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
      navigate('/por-estado')
      return
    }

    const isValidUf = STATES.some(
      (state) => state.uf.toLowerCase() === uf.toLowerCase()
    )

    if (!isValidUf) {
      navigate('/por-estado')
      return
    }

    const loadData = async () => {
      await loadDeputies(uf.toUpperCase())
    }

    loadData()
  }, [uf, navigate, loadDeputies])

  const stateName: string =
    STATES.find((state) => state.uf.toLowerCase() === uf?.toLowerCase())
      ?.name || uf || ''

  function handleSelectDeputy(deputy: Deputy) {
    goToDeputyDetail(uf || '', deputy)
  }

  return (
    <>
      <SeoHead
        title={stateName ? `Deputados federais de ${stateName}` : 'Deputados federais por estado'}
        description={
          stateName
            ? `Veja a lista de deputados federais de ${stateName}, filtre por nome ou partido e abra o histórico de atuação de cada parlamentar.`
            : 'Veja a lista de deputados federais por estado e consulte dados públicos de atuação parlamentar.'
        }
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Seleção por estado', path: '/por-estado' },
            {
              name: stateName ? `Deputados de ${stateName}` : 'Lista de deputados',
              path: uf ? `/por-estado/${uf.toLowerCase()}/deputado-federal` : '/por-estado',
            },
          ]),
          buildCollectionPageSchema(
            stateName ? `Deputados federais de ${stateName}` : 'Deputados federais por estado',
            stateName
              ? `Diretório de deputados federais de ${stateName} com busca por nome e partido.`
              : 'Diretório de deputados federais com filtros de busca.',
            uf ? `/por-estado/${uf.toLowerCase()}/deputado-federal` : '/por-estado',
          ),
        ]}
      />
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
    </>
  )
}
