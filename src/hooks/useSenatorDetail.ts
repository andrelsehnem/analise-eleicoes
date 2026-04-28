import { useCallback, useState } from 'react'
import { fetchSenatorDetailBundle } from '../api/camaraApi'
import type { SenatorDetail } from '../types/camara'

export function useSenatorDetail() {
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [senatorDetail, setSenatorDetail] = useState<SenatorDetail | null>(null)

  const loadSenatorDetail = useCallback(async (id: string) => {
    setLoadingDetail(true)
    setDetailError('')

    try {
      const detail = await fetchSenatorDetailBundle(id)
      setSenatorDetail(detail)
    } catch {
      setDetailError('Erro ao carregar detalhes do senador.')
      setSenatorDetail(null)
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  const clearSenatorDetailState = useCallback(() => {
    setLoadingDetail(false)
    setDetailError('')
    setSenatorDetail(null)
  }, [])

  return {
    loadingDetail,
    detailError,
    senatorDetail,
    loadSenatorDetail,
    clearSenatorDetailState,
  }
}
