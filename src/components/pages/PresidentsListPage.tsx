import { useEffect } from 'react'
import { PresidentsPanel } from '../panels/PresidentsPanel'
import { usePresidents } from '../../hooks/usePresidents'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { SeoHead } from '../common/SeoHead'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'

export function PresidentsListPage() {
  const { goToStateSelection } = useAppNavigation()
  const {
    search,
    loadingPresidents,
    presidentsError,
    filteredPresidents,
    setSearch,
    loadPresidents,
  } = usePresidents()

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
        onBack={goToStateSelection}
      />
    </>
  )
}
