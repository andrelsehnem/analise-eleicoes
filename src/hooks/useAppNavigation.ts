import { useNavigate } from 'react-router-dom'
import type { Deputy, OfficeType, President, Senator, StateDeputy } from '../types/camara'

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

  function goToStateDeputies(uf: string) {
    navigate(`/por-estado/${uf.toLowerCase()}/deputado-estadual`)
  }

  function goToSenators(uf: string) {
    navigate(`/senadores/${uf.toLowerCase()}`)
  }

  function goToPresidents() {
    navigate('/presidente')
  }

  function goToGlobalSearch() {
    navigate('/busca')
  }

  function goToGeneralInfo(uf?: string) {
    if (uf) {
      navigate(`/informacoes-gerais/${uf.toLowerCase()}`)
      return
    }

    navigate('/informacoes-gerais')
  }

  function goToDeputyDetail(uf: string, deputy: Deputy) {
    navigate(`/por-estado/${uf.toLowerCase()}/deputado-federal/${deputy.id}`, {
      state: { selectedDeputy: deputy },
    })
  }

  function goToStateDeputyDetail(uf: string, deputy: StateDeputy) {
    navigate(`/por-estado/${uf.toLowerCase()}/deputado-estadual/${deputy.id}`, {
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
    goToStateDeputies,
    goToSenators,
    goToPresidents,
    goToGlobalSearch,
    goToGeneralInfo,
    goToDeputyDetail,
    goToStateDeputyDetail,
    goToSenatorDetail,
    goToPresidentDetail,
    goToPresidentDetailById,
    goToSobre,
    goToSugestoes,
    goBack,
  }
}
