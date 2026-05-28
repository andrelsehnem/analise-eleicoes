import { useEffect } from 'react'
import { PresidentsPanel } from '../panels/PresidentsPanel'
import { usePresidents } from '../../hooks/usePresidents'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useAuth } from '../../hooks/useAuth'
import { useFavoritePoliticians } from '../../hooks/useFavoritePoliticians'
import { SeoHead } from '../common/SeoHead'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'

export function PresidentsListPage() {
  const { goToStateSelection } = useAppNavigation()
  const { authStatus } = useAuth()
  const {
    search,
    loadingPresidents,
    presidentsError,
    filteredPresidents,
    setSearch,
    loadPresidents,
  } = usePresidents()
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
    void loadPresidents()
  }, [loadPresidents])

  return (
    <>
      <SeoHead
        title="Presidente e vice-presidente"
        description="Consulte presidente e vice-presidente atuais, com dados públicos sobre mandato, trajetória e fontes oficiais."
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Presidência', path: '/presidente' },
          ]),
          buildCollectionPageSchema(
            'Presidência da República',
            'Diretório de presidente e vice-presidente com acesso ao perfil detalhado.',
            '/presidente',
          ),
        ]}
      />
      <PresidentsPanel
        search={search}
        onSearchChange={setSearch}
        loading={loadingPresidents}
        error={presidentsError}
        presidents={filteredPresidents}
        favoriteKeys={favoriteKeys}
        canFavorite={authStatus === 'authenticated'}
        savingFavorite={savingFavorite}
        favoritesError={favoritesError}
        onToggleFavorite={toggleFavorite}
        onClearFavoritesError={clearFavoritesError}
        onBack={goToStateSelection}
      />
    </>
  )
}
