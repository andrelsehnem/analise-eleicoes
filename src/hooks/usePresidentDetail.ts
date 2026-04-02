import { useCallback, useState } from 'react'
import { fetchPresidentDetail } from '../api/camaraApi'
import type { PresidentDetail } from '../types/camara'

export function usePresidentDetail() {
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [presidentDetail, setPresidentDetail] = useState<PresidentDetail | null>(null)

  const loadPresidentDetail = useCallback(async (id: string) => {
    setLoadingDetail(true)
    setDetailError('')

    try {
      const detail = await fetchPresidentDetail(id)
      setPresidentDetail(detail)
    } catch {
      setDetailError('Erro ao carregar os dados deste perfil.')
      setPresidentDetail(null)
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  return {
    loadingDetail,
    detailError,
    presidentDetail,
    loadPresidentDetail,
  }
}
