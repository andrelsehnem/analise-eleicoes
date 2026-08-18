import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePresidentialCandidates } from '../../hooks/usePresidentialCandidates'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'
import { SeoHead } from '../common/SeoHead'
import { Candidates2026PresidentsPanel } from '../panels/Candidates2026/Candidates2026PresidentsPanel'

const PAGE_PATH = '/candidatos-2026/presidente'
const PAGE_DESCRIPTION =
  'Consulte a lista de candidatos à Presidência nas Eleições 2026 com dados publicados pelo Tribunal Superior Eleitoral.'

export function Candidates2026PresidentsPage() {
  const navigate = useNavigate()
  const {
    allCandidates,
    filteredCandidates,
    search,
    loadingCandidates,
    candidatesError,
    setSearch,
    loadCandidates,
  } = usePresidentialCandidates()

  useEffect(() => {
    void loadCandidates()
  }, [loadCandidates])

  return (
    <>
      <SeoHead
        canonicalPath={PAGE_PATH}
        description={PAGE_DESCRIPTION}
        title="Candidatos à Presidência em 2026"
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Candidatos 2026', path: '/candidatos-2026' },
            { name: 'Presidência', path: PAGE_PATH },
          ]),
          buildCollectionPageSchema(
            'Candidatos à Presidência em 2026',
            PAGE_DESCRIPTION,
            PAGE_PATH,
          ),
        ]}
      />
      <Candidates2026PresidentsPanel
        allCandidatesCount={allCandidates.length}
        candidates={filteredCandidates}
        error={candidatesError}
        loading={loadingCandidates}
        search={search}
        onBack={() => navigate('/candidatos-2026')}
        onSearchChange={setSearch}
      />
    </>
  )
}
