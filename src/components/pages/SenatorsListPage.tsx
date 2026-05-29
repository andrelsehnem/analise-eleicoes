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
  const normalizedUf = uf?.trim().toUpperCase() || ''
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
    STATES.find((state) => state.uf.toLowerCase() === uf?.toLowerCase())?.name || ''
  const stateNameWithUf = stateName && normalizedUf ? `${stateName} (${normalizedUf})` : stateName

  async function handleToggleFavorite(senator: (typeof filteredSenators)[number]) {
    await toggleFavorite(toSenatorFavorite(senator))
  }

  return (
    <>
      <SeoHead
        title={stateNameWithUf ? `Senadores do ${stateNameWithUf}: quem são e quantos são` : 'Senadores por estado'}
        description={
          stateNameWithUf
            ? `Veja quais são os senadores do ${stateNameWithUf}. Cada estado e o Distrito Federal elegem 3 senadores. Filtre por nome ou partido e abra o perfil público de cada parlamentar.`
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
            stateNameWithUf ? `Senadores do ${stateNameWithUf}` : 'Senadores por estado',
            stateNameWithUf
              ? `Diretório de senadores do ${stateNameWithUf}, com busca por nome, partido e informações de mandato.`
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
