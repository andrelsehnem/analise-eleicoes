import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PresidentDetailPanel } from '../panels/PresidentDetailPanel'
import { usePresidentDetail } from '../../hooks/usePresidentDetail'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { SeoHead } from '../common/SeoHead'
import { buildAbsoluteUrl, buildBreadcrumbSchema } from '../../utils/seo'

export function PresidentDetailPage() {
  const { presidentId } = useParams<{ presidentId: string }>()
  const navigate = useNavigate()
  const { goToPresidents } = useAppNavigation()
  const { loadingDetail, detailError, presidentDetail, loadPresidentDetail } = usePresidentDetail()
  const profileName = presidentDetail?.nome || 'Perfil da presidência'
  const detailPath = presidentId ? `/presidente/${presidentId}` : '/presidente'
  const profileDescription = presidentDetail
    ? `Veja dados públicos, resumo e mandatos de ${presidentDetail.nome}, ${presidentDetail.cargo.toLowerCase()}.`
    : 'Veja dados públicos de presidente e vice-presidente com fontes oficiais.'

  useEffect(() => {
    if (!presidentId) {
      navigate('/presidente')
      return
    }

    void loadPresidentDetail(presidentId)
  }, [presidentId, navigate, loadPresidentDetail])

  if (!loadingDetail && !detailError && !presidentDetail) {
    return (
      <>
        <SeoHead
          title="Perfil da presidência não encontrado"
          description="O perfil solicitado não foi encontrado. Volte para a lista de presidência e escolha outro nome."
        />
        <div>Perfil não encontrado</div>
      </>
    )
  }

  return (
    <>
      <SeoHead
        title={presidentDetail ? `Perfil de ${profileName}` : 'Perfil da presidência'}
        description={profileDescription}
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Presidência', path: '/presidente' },
            { name: profileName, path: detailPath },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profileName,
            jobTitle: presidentDetail?.cargo || 'Presidência da República',
            url: buildAbsoluteUrl(detailPath),
          },
        ]}
      />
      <PresidentDetailPanel
        presidentDetail={presidentDetail}
        loading={loadingDetail}
        error={detailError}
        onBack={goToPresidents}
      />
    </>
  )
}
