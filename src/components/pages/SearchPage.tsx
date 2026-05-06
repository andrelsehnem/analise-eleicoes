import { useEffect } from 'react'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'
import { SeoHead } from '../common/SeoHead'
import { SearchPanel } from '../panels/SearchPanel'

export function SearchPage() {
  const { goToHome } = useAppNavigation()
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

  useEffect(() => {
    void loadSearchIndex()
  }, [loadSearchIndex])

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
        onBack={goToHome}
      />
    </>
  )
}
