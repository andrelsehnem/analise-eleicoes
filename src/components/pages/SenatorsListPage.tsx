import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { STATES } from '../../constants/states'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useSenators } from '../../hooks/useSenators'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'
import { SeoHead } from '../common/SeoHead'
import { SenatorsPanel } from '../panels/SenatorsPanel'
import { useAuth } from '../../hooks/useAuth'
import { useFavoritePoliticians } from '../../hooks/useFavoritePoliticians'
import { toSenatorFavorite } from '../../utils/favorites'

export function SenatorsListPage() {
  const { uf } = useParams<{ uf: string }>()
  const navigate = useNavigate()
  const { goToStateSelection } = useAppNavigation()
  const { authStatus } = useAuth()
  const {
    allSenators,
    search,
    loadingSenators,
    senatorsError,
    filteredSenators,
    setSearch,
    loadSenators,
  } = useSenators()
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
      navigate('/por-estado/senador')
      return
    }

    const isValidUf = STATES.some((state) => state.uf.toLowerCase() === uf.toLowerCase())

    if (!isValidUf) {
      navigate('/por-estado/senador')
      return
    }

    const loadData = async () => {
      await loadSenators(uf.toUpperCase())
    }

    void loadData()
  }, [uf, navigate, loadSenators])

  const stateName: string =
    STATES.find((state) => state.uf.toLowerCase() === uf?.toLowerCase())?.name || uf || ''

  async function handleToggleFavorite(senator: (typeof filteredSenators)[number]) {
    await toggleFavorite(toSenatorFavorite(senator))
  }

  return (
    <>
      <SeoHead
        title={stateName ? `Senadores de ${stateName}` : 'Senadores por estado'}
        description={
          stateName
            ? `Veja a lista de senadores de ${stateName}, filtre por nome ou partido e abra o perfil público de cada parlamentar.`
            : 'Veja a lista de senadores por estado e consulte dados públicos de atuação parlamentar.'
        }
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Seleção por estado', path: '/por-estado' },
            {
              name: stateName ? `Senadores de ${stateName}` : 'Lista de senadores',
              path: uf ? `/senadores/${uf.toLowerCase()}` : '/por-estado',
            },
          ]),
          buildCollectionPageSchema(
            stateName ? `Senadores de ${stateName}` : 'Senadores por estado',
            stateName
              ? `Diretório de senadores de ${stateName} com busca por nome e partido.`
              : 'Diretório de senadores com filtros de busca.',
            uf ? `/senadores/${uf.toLowerCase()}` : '/por-estado',
          ),
        ]}
      />
      <SenatorsPanel
        stateName={stateName}
        allSenatorsCount={allSenators.length}
        search={search}
        onSearchChange={setSearch}
        loading={loadingSenators}
        error={senatorsError}
        senators={filteredSenators}
        favoriteKeys={favoriteKeys}
        canFavorite={authStatus === 'authenticated'}
        savingFavorite={savingFavorite}
        favoritesError={favoritesError}
        onToggleFavorite={handleToggleFavorite}
        onClearFavoritesError={clearFavoritesError}
        onBack={() => goToStateSelection('senador')}
      />
    </>
  )
}
