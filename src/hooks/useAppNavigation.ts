import { useNavigate } from 'react-router-dom'
import type { Deputy, President } from '../types/camara'

export function useAppNavigation() {
  const navigate = useNavigate()

  function goToHome() {
    navigate('/')
  }

  function goToStateSelection() {
    navigate('/por-estado')
  }

  function goToDeputies(uf: string) {
    navigate(`/por-estado/${uf.toLowerCase()}/deputado-federal`)
  }

  function goToPresidents() {
    navigate('/presidente')
  }

  function goToDeputyDetail(uf: string, deputy: Deputy) {
    navigate(`/por-estado/${uf.toLowerCase()}/deputado-federal/${deputy.id}`, {
      state: { selectedDeputy: deputy },
    })
  }

  function goToPresidentDetail(president: President) {
    navigate(`/presidente/${president.id}`, {
      state: { selectedPresident: president },
    })
  }

  function goToPresidentDetailById(id: string) {
    navigate(`/presidente/${id}`)
  }

  function goToSobre() {
    navigate('/sobre')
  }

  function goBack() {
    navigate(-1)
  }

  return {
    goToHome,
    goToStateSelection,
    goToDeputies,
    goToPresidents,
    goToDeputyDetail,
    goToPresidentDetail,
    goToPresidentDetailById,
    goToSobre,
    goBack,
  }
}
