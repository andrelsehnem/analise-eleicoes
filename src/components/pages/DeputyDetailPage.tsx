import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { DeputyDetailPanel } from '../panels/DeputyDetailPanel'
import { useDeputies } from '../../hooks/useDeputies'
import { useDeputyDetail } from '../../hooks/useDeputyDetail'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { STATES } from '../../constants/states'
import type { Deputy } from '../../types/camara'

type DeputyDetailLocationState = {
  selectedDeputy?: Deputy
}

export function DeputyDetailPage() {
  const { uf, deputyId } = useParams<{ uf: string; deputyId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { goToDeputies } = useAppNavigation()
  const { findDeputyById, allDeputies, loadDeputies, loadingDeputies } = useDeputies()
  const {
    activeTab,
    loadingDetail,
    detailError,
    deputyInfo,
    professions,
    propositions,
    votes,
    orgaos,
    loadingOrgaos,
    orgaosError,
    setActiveTab,
    loadDeputyDetail,
    loadDeputyOrgaos,
  } = useDeputyDetail()
  const [isInitializing, setIsInitializing] = useState(true)
  const locationState = location.state as DeputyDetailLocationState | null
  const routeSelectedDeputy = locationState?.selectedDeputy || null

  // Validar UF e carregar dados
  useEffect(() => {
    if (!uf || !deputyId) {
      navigate('/federal-por-estado')
      return
    }

    const isValidUf = STATES.some(
      (state) => state.uf.toLowerCase() === uf.toLowerCase()
    )

    if (!isValidUf) {
      navigate('/federal-por-estado')
      return
    }

    const loadData = async () => {
      setIsInitializing(true)

      try {
        // Carregar deputados se não carregados
        if (!routeSelectedDeputy && allDeputies.length === 0) {
          await loadDeputies(uf.toUpperCase())
        }

        // Carregar detalhe do deputado
        const deputyIdNum = parseInt(deputyId, 10)
        if (!isNaN(deputyIdNum)) {
          await loadDeputyDetail(deputyIdNum)
        }
      } finally {
        setIsInitializing(false)
      }
    }

    void loadData()
  }, [uf, deputyId, navigate, routeSelectedDeputy])

  const deputyIdNum = parseInt(deputyId || '', 10)
  const selectedDeputy = findDeputyById(deputyIdNum) || routeSelectedDeputy
  const hasDeputyData = Boolean(selectedDeputy || deputyInfo)
  const isPageLoading = loadingDetail || (!routeSelectedDeputy && (isInitializing || loadingDeputies))

  if (!hasDeputyData && !isPageLoading && !detailError) {
    return <div>Deputado não encontrado</div>
  }

  function handleBack() {
    goToDeputies(uf || '')
  }

  function handleOpenOrgaosModal() {
    if (!Number.isNaN(deputyIdNum)) {
      void loadDeputyOrgaos(deputyIdNum)
    }
  }

  return (
    <DeputyDetailPanel
      selectedDeputy={selectedDeputy}
      deputyInfo={deputyInfo}
      professions={professions}
      propositions={propositions}
      votes={votes}
      orgaos={orgaos}
      loadingOrgaos={loadingOrgaos}
      orgaosError={orgaosError}
      activeTab={activeTab}
      loading={isPageLoading}
      error={detailError}
      onBack={handleBack}
      onChangeTab={setActiveTab}
      onOpenOrgaosModal={handleOpenOrgaosModal}
    />
  )
}
