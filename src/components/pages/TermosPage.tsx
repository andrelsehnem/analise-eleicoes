import { SeoHead } from '../common/SeoHead'
import { TermosDeUsoPanel } from '../panels/TermosDeUso/TermosDeUsoPanel'
import { buildBreadcrumbSchema } from '../../utils/seo'

export function TermosPage() {
  return (
    <>
      <SeoHead
        title="Termos de Uso"
        description="Leia os Termos de Uso do Mandato Transparente. Conheça os direitos, responsabilidades e restrições ao utilizar nossa plataforma de análise de políticos."
        canonicalPath="/termos"
        jsonLd={buildBreadcrumbSchema([
          { name: 'Início', path: '/' },
          { name: 'Termos de Uso', path: '/termos' },
        ])}
      />
      <TermosDeUsoPanel />
    </>
  )
}
