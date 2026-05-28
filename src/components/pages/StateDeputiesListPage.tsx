import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { STATES } from '../../constants/states'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useStateDeputies } from '../../hooks/useStateDeputies'
import { SeoHead } from '../common/SeoHead'
import { StateDeputiesPanel } from '../panels/StateDeputiesPanel'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'
import { useAuth } from '../../hooks/useAuth'
import { useFavoritePoliticians } from '../../hooks/useFavoritePoliticians'
import { toStateDeputyFavorite } from '../../utils/favorites'

const ENABLED_UFS = new Set(STATES.map((state) => state.uf))

export function StateDeputiesListPage() {
  const { uf } = useParams<{ uf: string }>()
  const navigate = useNavigate()
  const { goToStateSelection } = useAppNavigation()
  const { authStatus } = useAuth()
  const {
    allDeputies,
    search,
    loadingDeputies,
    deputiesError,
    filteredDeputies,
    setSearch,
    loadDeputies,
  } = useStateDeputies()
  const {
    favoriteKeys,
    savingFavorite,
    favoritesError,
    toggleFavorite,
    clearFavoritesError,
  } = useFavoritePoliticians({
    isAuthenticated: authStatus === 'authenticated',
  })

  useEffect(() => {
    if (!uf) {
      navigate('/por-estado/deputado-estadual')
      return
    }

    const normalizedUf = uf.toUpperCase()
    const isValidUf = STATES.some((state) => state.uf === normalizedUf)

    if (!isValidUf || !ENABLED_UFS.has(normalizedUf)) {
      navigate('/por-estado/deputado-estadual')
      return
    }

    void loadDeputies(normalizedUf)
  }, [uf, navigate, loadDeputies])

  const normalizedUf = uf?.toUpperCase() ?? ''
  const stateName = STATES.find((state) => state.uf === normalizedUf)?.name || normalizedUf
  const path = uf ? `/por-estado/${uf.toLowerCase()}/deputado-estadual` : '/por-estado/deputado-estadual'

  async function handleToggleFavorite(deputy: (typeof filteredDeputies)[number]) {
    await toggleFavorite(toStateDeputyFavorite(deputy))
  }

  return (
    <>
      <SeoHead
        title={stateName ? `Deputados estaduais de ${stateName}` : 'Deputados estaduais por estado'}
        description={
          stateName
            ? `Veja a lista de deputados estaduais de ${stateName}, filtre por nome ou partido e abra o perfil oficial.`
            : 'Veja a lista de deputados estaduais por estado e consulte dados públicos.'
        }
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Seleção por estado', path: '/por-estado/deputado-estadual' },
            {
              name: stateName ? `Deputados estaduais de ${stateName}` : 'Lista de deputados estaduais',
              path,
            },
          ]),
          buildCollectionPageSchema(
            stateName ? `Deputados estaduais de ${stateName}` : 'Deputados estaduais por estado',
            stateName
              ? `Diretório de deputados estaduais de ${stateName} com busca por nome e partido.`
              : 'Diretório de deputados estaduais com filtros de busca.',
            path,
          ),
        ]}
      />
      <StateDeputiesPanel
        stateName={stateName}
        allDeputiesCount={allDeputies.length}
        search={search}
        onSearchChange={setSearch}
        loading={loadingDeputies}
        error={deputiesError}
        deputies={filteredDeputies}
        favoriteKeys={favoriteKeys}
        canFavorite={authStatus === 'authenticated'}
        savingFavorite={savingFavorite}
        favoritesError={favoritesError}
        onToggleFavorite={handleToggleFavorite}
        onClearFavoritesError={clearFavoritesError}
        onBack={() => goToStateSelection('deputado-estadual')}
      />
    </>
  )
}
