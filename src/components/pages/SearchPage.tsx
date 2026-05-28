import { useEffect } from 'react'
import type { GlobalSearchItem } from '../../types/camara'
import { useAuth } from '../../hooks/useAuth'
import { mapGlobalSearchItemToFavorite, useFavoritePoliticians } from '../../hooks/useFavoritePoliticians'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'
import { SeoHead } from '../common/SeoHead'
import { SearchPanel } from '../panels/SearchPanel'

export function SearchPage() {
  const { goToHome } = useAppNavigation()
  const { authStatus } = useAuth()
  const {
    parties,
    offices,
    search,
    selectedParty,
    selectedOffice,
    loadingSearch,
    searchError,
    filteredItems,
    setSearch,
    loadSearchIndex,
    toggleParty,
    toggleOffice,
    clearParty,
    clearOffice,
  } = useGlobalSearch()
  const {
    favoriteKeys,
    loadingFavorites,
    savingFavorite,
    favoritesError,
    toggleFavorite,
    clearFavoritesError,
  } = useFavoritePoliticians({
    isAuthenticated: authStatus === 'authenticated',
  })

  useEffect(() => {
    void loadSearchIndex()
  }, [loadSearchIndex])

  async function handleToggleFavorite(item: GlobalSearchItem) {
    await toggleFavorite(mapGlobalSearchItemToFavorite(item))
  }

  return (
    <>
      <SeoHead
        title="Busca global por nome, partido e cargo"
        description="Pesquise políticos por nome, partido e cargo com dados públicos de deputados federais e senadores em um só lugar."
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Busca global', path: '/busca' },
          ]),
          buildCollectionPageSchema(
            'Busca global por nome, partido e cargo',
            'Busca em tempo real por nome e filtros por partido e cargo para deputados federais e senadores.',
            '/busca',
          ),
        ]}
      />
      <SearchPanel
        search={search}
        selectedParty={selectedParty}
        selectedOffice={selectedOffice}
        parties={parties}
        offices={offices}
        totalCount={filteredItems.length}
        loading={loadingSearch}
        error={searchError}
        results={filteredItems}
        onSearchChange={setSearch}
        onSelectParty={toggleParty}
        onSelectOffice={toggleOffice}
        onClearParty={clearParty}
        onClearOffice={clearOffice}
        favoriteKeys={favoriteKeys}
        canFavorite={authStatus === 'authenticated'}
        loadingFavorites={loadingFavorites}
        savingFavorite={savingFavorite}
        favoritesError={favoritesError}
        onToggleFavorite={handleToggleFavorite}
        onClearFavoritesError={clearFavoritesError}
        onBack={goToHome}
      />
    </>
  )
}
