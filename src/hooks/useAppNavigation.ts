import { useNavigate } from 'react-router-dom'
import type { Deputy } from '../types/camara'

export function useAppNavigation() {
  const navigate = useNavigate()

  function goToHome() {
    navigate('/')
  }

  function goToStateSelection() {
    navigate('/federal-por-estado')
  }

  function goToDeputies(uf: string) {
    navigate(`/federal-por-estado/${uf.toLowerCase()}/deputados`)
  }

  function goToDeputyDetail(uf: string, deputy: Deputy) {
    navigate(`/federal-por-estado/${uf.toLowerCase()}/deputados/${deputy.id}`, {
      state: { selectedDeputy: deputy },
    })
  }

  function goBack() {
    navigate(-1)
  }

  return {
    goToHome,
    goToStateSelection,
    goToDeputies,
    goToDeputyDetail,
    goBack,
  }
}
