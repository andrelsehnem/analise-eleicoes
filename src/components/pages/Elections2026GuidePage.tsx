import { SeoHead } from '../common/SeoHead'
import { Elections2026GuidePanel } from '../panels/Candidates2026/Elections2026GuidePanel'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'

const PAGE_PATH = '/candidatos-2026/guia-eleicoes'
const PAGE_DESCRIPTION =
  'Confira as datas das Eleições 2026, os cargos em disputa, a ordem dos seis votos na urna e orientações simples sobre como votar.'

export function Elections2026GuidePage() {
  return (
    <>
      <SeoHead
        canonicalPath={PAGE_PATH}
        title="Eleições 2026: datas, cargos, ordem de votação e como votar"
        description={PAGE_DESCRIPTION}
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Candidatos 2026', path: '/candidatos-2026' },
            { name: 'Guia das Eleições 2026', path: PAGE_PATH },
          ]),
          buildCollectionPageSchema('Guia das Eleições 2026', PAGE_DESCRIPTION, PAGE_PATH),
        ]}
      />
      <Elections2026GuidePanel />
    </>
  )
}
