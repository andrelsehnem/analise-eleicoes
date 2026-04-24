import { LandingPanel } from '../panels/LandingPanel/LandingPanel'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { SeoHead } from '../common/SeoHead'
import { buildOrganizationSchema, buildWebSiteSchema } from '../../utils/seo'

export function LandingPage() {
  const { goToStateSelection } = useAppNavigation()

  return (
    <>
      <SeoHead
        title="Mandato Transparente"
        description="Consulte o histórico de atuação de deputados federais e presidência com dados públicos oficiais antes de votar."
        jsonLd={[buildWebSiteSchema(), buildOrganizationSchema()]}
      />
      <LandingPanel onStartSearch={goToStateSelection} />
    </>
  )
}
