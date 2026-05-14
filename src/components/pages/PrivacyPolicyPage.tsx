import { SeoHead } from '../common/SeoHead'
import { PrivacyPolicyPanel } from '../panels/PrivacyPolicy/PrivacyPolicyPanel'
import { buildBreadcrumbSchema } from '../../utils/seo'

export function PrivacyPolicyPage() {
  return (
    <>
      <SeoHead
        title="Política de Privacidade e Cookies"
        description="Entenda como o Mandato Transparente trata privacidade, consentimento de cookies e carregamento de scripts de rastreamento."
        canonicalPath="/privacidade"
        jsonLd={buildBreadcrumbSchema([
          { name: 'Início', path: '/' },
          { name: 'Privacidade', path: '/privacidade' },
        ])}
      />
      <PrivacyPolicyPanel />
    </>
  )
}
