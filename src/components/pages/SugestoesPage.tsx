import { SeoHead } from '../common/SeoHead'
import { SugestoesPanel } from '../panels/Sugestoes/SugestoesPanel'
import { buildBreadcrumbSchema } from '../../utils/seo'

export function SugestoesPage() {
  return (
    <>
      <SeoHead
        title="Sugestões"
        description="Envie sua sugestão para melhorar o Mandato Transparente."
        canonicalPath="/sugestoes"
        jsonLd={buildBreadcrumbSchema([
          { name: 'Início', path: '/' },
          { name: 'Sugestões', path: '/sugestoes' },
        ])}
      />
      <SugestoesPanel />
    </>
  )
}
