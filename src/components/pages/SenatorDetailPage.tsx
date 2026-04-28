import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useSenatorDetail } from '../../hooks/useSenatorDetail'
import { buildAbsoluteUrl, buildBreadcrumbSchema } from '../../utils/seo'
import { SeoHead } from '../common/SeoHead'
import { SenatorDetailPanel } from '../panels/SenatorDetailPanel'

type SenatorDetailLocationState = {
  selectedUf?: string
}

export function SenatorDetailPage() {
  const { senatorId } = useParams<{ senatorId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { goToSenators, goToStateSelection } = useAppNavigation()
  const { loadingDetail, detailError, senatorDetail, loadSenatorDetail } = useSenatorDetail()
  const locationState = location.state as SenatorDetailLocationState | null

  useEffect(() => {
    if (!senatorId) {
      navigate('/por-estado')
      return
    }

    void loadSenatorDetail(senatorId)
  }, [senatorId, navigate, loadSenatorDetail])

  const profileName = senatorDetail?.nome || 'Perfil de senador'
  const profileDescription = senatorDetail
    ? `Veja dados públicos, mandatos e comissões de ${senatorDetail.nome}, senador por ${senatorDetail.siglaUf}.`
    : 'Veja dados públicos de senadores por estado com fontes oficiais do Senado Federal.'
  const detailPath = senatorId ? `/senador/${senatorId}` : '/por-estado'

  function handleBack() {
    const ufFromDetail = senatorDetail?.siglaUf
    const ufFromState = locationState?.selectedUf
    const targetUf = ufFromDetail || ufFromState

    if (targetUf) {
      goToSenators(targetUf)
      return
    }

    goToStateSelection()
  }

  if (!loadingDetail && !detailError && !senatorDetail) {
    return (
      <>
        <SeoHead
          title="Perfil de senador não encontrado"
          description="O perfil solicitado não foi encontrado. Volte para a lista de senadores e escolha outro nome."
        />
        <div>Perfil não encontrado</div>
      </>
    )
  }

  return (
    <>
      <SeoHead
        title={senatorDetail ? `Perfil de ${profileName}` : 'Perfil de senador'}
        description={profileDescription}
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Seleção por estado', path: '/por-estado' },
            {
              name: senatorDetail ? `Senadores de ${senatorDetail.siglaUf}` : 'Lista de senadores',
              path: senatorDetail ? `/senadores/${senatorDetail.siglaUf.toLowerCase()}` : '/por-estado',
            },
            { name: profileName, path: detailPath },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profileName,
            jobTitle: 'Senador',
            url: buildAbsoluteUrl(detailPath),
          },
        ]}
      />
      <SenatorDetailPanel
        senatorDetail={senatorDetail}
        loading={loadingDetail}
        error={detailError}
        onBack={handleBack}
      />
    </>
  )
}
