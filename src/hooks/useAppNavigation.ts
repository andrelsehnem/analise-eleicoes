import { useNavigate } from 'react-router-dom'
import type { Deputy, OfficeType, President, Senator } from '../types/camara'

export function useAppNavigation() {
  const navigate = useNavigate()

  function goToHome() {
    navigate('/')
  }

  function goToStateSelection(office?: OfficeType) {
    if (office) {
      navigate(`/por-estado/${office}`)
      return
    }

    navigate('/por-estado')
  }

  function goToDeputies(uf: string) {
    navigate(`/por-estado/${uf.toLowerCase()}/deputado-federal`)
  }

  function goToSenators(uf: string) {
    navigate(`/senadores/${uf.toLowerCase()}`)
  }

  function goToPresidents() {
    navigate('/presidente')
  }

  function goToDeputyDetail(uf: string, deputy: Deputy) {
    navigate(`/por-estado/${uf.toLowerCase()}/deputado-federal/${deputy.id}`, {
      state: { selectedDeputy: deputy },
    })
  }

  function goToSenatorDetail(uf: string, senator: Senator) {
    navigate(`/senador/${senator.id}`, {
      state: { selectedSenator: senator, selectedUf: uf.toUpperCase() },
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

  function goToSugestoes() {
    navigate('/sugestoes')
  }

  function goBack() {
    navigate(-1)
  }

  return {
    goToHome,
    goToStateSelection,
    goToDeputies,
    goToSenators,
    goToPresidents,
    goToDeputyDetail,
    goToSenatorDetail,
    goToPresidentDetail,
    goToPresidentDetailById,
    goToSobre,
    goToSugestoes,
    goBack,
  }
}
