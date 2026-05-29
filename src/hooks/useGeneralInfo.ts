import { useCallback, useMemo, useState } from 'react'
import { fetchGeneralInfoStatistics } from '../api/camaraApi'
import type {
  GeneralInfoOfficeStats,
  GeneralInfoStateStats,
  GeneralInfoStatistics,
} from '../types/camara'

const OFFICE_ORDER = ['deputado-federal', 'deputado-estadual', 'senador'] as const

export function getOfficeLabel(office: (typeof OFFICE_ORDER)[number]): string {
  if (office === 'deputado-federal') {
    return 'Deputado federal'
  }

  if (office === 'deputado-estadual') {
    return 'Deputado estadual'
  }

  return 'Senador'
}

export function useGeneralInfo(selectedUf?: string) {
  const [stats, setStats] = useState<GeneralInfoStatistics | null>(null)
  const [loadingGeneralInfo, setLoadingGeneralInfo] = useState(false)
  const [generalInfoError, setGeneralInfoError] = useState('')

  const loadGeneralInfo = useCallback(async () => {
    setLoadingGeneralInfo(true)
    setGeneralInfoError('')

    try {
      const data = await fetchGeneralInfoStatistics()
      setStats(data)
    } catch {
      setStats(null)
      setGeneralInfoError('Erro ao carregar informações gerais. Tente novamente em instantes.')
    } finally {
      setLoadingGeneralInfo(false)
    }
  }, [])

  const normalizedUf = selectedUf?.trim().toUpperCase() || ''

  const selectedStateStats = useMemo<GeneralInfoStateStats | null>(() => {
    if (!stats || !normalizedUf) {
      return null
    }

    return stats.porUf.find((item) => item.uf === normalizedUf) || null
  }, [stats, normalizedUf])

  const officeStats = useMemo(() => {
    if (!stats) {
      return []
    }

    const byOffice = new Map(stats.porCargo.map((item) => [item.cargo, item]))

    return OFFICE_ORDER.map((office) => byOffice.get(office)).filter(
      (item): item is GeneralInfoOfficeStats => item !== undefined,
    )
  }, [stats])

  return {
    stats,
    officeStats,
    selectedStateStats,
    loadingGeneralInfo,
    generalInfoError,
    loadGeneralInfo,
  }
}
