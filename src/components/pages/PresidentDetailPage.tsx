import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PresidentDetailPanel } from '../panels/PresidentDetailPanel'
import { usePresidentDetail } from '../../hooks/usePresidentDetail'
import { useAppNavigation } from '../../hooks/useAppNavigation'

export function PresidentDetailPage() {
  const { presidentId } = useParams<{ presidentId: string }>()
  const navigate = useNavigate()
  const { goToPresidents } = useAppNavigation()
  const { loadingDetail, detailError, presidentDetail, loadPresidentDetail } = usePresidentDetail()

  useEffect(() => {
    if (!presidentId) {
      navigate('/presidente')
      return
    }

    void loadPresidentDetail(presidentId)
  }, [presidentId, navigate, loadPresidentDetail])

  if (!loadingDetail && !detailError && !presidentDetail) {
    return <div>Perfil não encontrado</div>
  }

  return (
    <PresidentDetailPanel
      presidentDetail={presidentDetail}
      loading={loadingDetail}
      error={detailError}
      onBack={goToPresidents}
    />
  )
}
