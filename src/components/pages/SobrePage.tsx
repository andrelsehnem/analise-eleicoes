import { SobrePanel } from '../panels/Sobre/SobrePanel'
import { SeoHead } from '../common/SeoHead'
import { buildBreadcrumbSchema } from '../../utils/seo'

export function SobrePage() {
  return (
    <>
      <SeoHead
        title="Sobre o projeto"
        description="Conheça a proposta do Mandato Transparente, as fontes oficiais de dados e o objetivo público da plataforma."
        jsonLd={buildBreadcrumbSchema([
          { name: 'Início', path: '/' },
          { name: 'Sobre', path: '/sobre' },
        ])}
      />
      <SobrePanel />
    </>
  )
}
