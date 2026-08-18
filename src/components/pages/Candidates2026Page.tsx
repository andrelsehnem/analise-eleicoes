import { SeoHead } from '../common/SeoHead'
import { Candidates2026Panel } from '../panels/Candidates2026/Candidates2026Panel'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'

const PAGE_PATH = '/candidatos-2026'
const PAGE_DESCRIPTION =
  'Conheça a futura consulta de candidatos das Eleições 2026 por cargo e estado. Os dados oficiais serão disponibilizados após o registro das candidaturas.'

export function Candidates2026Page() {
  return (
    <>
      <SeoHead
        canonicalPath={PAGE_PATH}
        title="Candidatos 2026"
        description={PAGE_DESCRIPTION}
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Candidatos 2026', path: PAGE_PATH },
          ]),
          buildCollectionPageSchema('Candidatos 2026', PAGE_DESCRIPTION, PAGE_PATH),
        ]}
      />
      <Candidates2026Panel />
    </>
  )
}
