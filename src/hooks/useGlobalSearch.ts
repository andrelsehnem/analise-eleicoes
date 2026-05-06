import { useCallback, useMemo, useState } from 'react'
import { fetchPoliticiansIndex } from '../api/camaraApi'
import type { GlobalSearchItem } from '../types/camara'
import { normalizeSearchText, scoreGlobalSearchMatch } from '../utils/format'

const OFFICE_ORDER = ['deputado-federal', 'senador'] as const

function getOfficeLabel(office: (typeof OFFICE_ORDER)[number]): string {
  return office === 'deputado-federal' ? 'Deputado federal' : 'Senador'
}

export function useGlobalSearch() {
  const [allItems, setAllItems] = useState<GlobalSearchItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedParty, setSelectedParty] = useState('')
  const [selectedOffice, setSelectedOffice] = useState('')
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchError, setSearchError] = useState('')

  const parties = useMemo(() => {
    const uniqueParties = new Set(allItems.map((item) => item.partido).filter(Boolean))
    return Array.from(uniqueParties).sort((left, right) => left.localeCompare(right, 'pt-BR'))
  }, [allItems])

  const offices = useMemo(
    () =>
      OFFICE_ORDER.filter((office) => allItems.some((item) => item.cargo === office)).map((office) => ({
        value: office,
        label: getOfficeLabel(office),
      })),
    [allItems],
  )

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeSearchText(search)
    const normalizedParty = normalizeSearchText(selectedParty)
    const normalizedOffice = normalizeSearchText(selectedOffice)

    const partyFilteredItems = normalizedParty
      ? allItems.filter((item) => normalizeSearchText(item.partido) === normalizedParty)
      : allItems

    const officeFilteredItems = normalizedOffice
      ? partyFilteredItems.filter((item) => normalizeSearchText(item.cargo) === normalizedOffice)
      : partyFilteredItems

    if (!normalizedQuery) {
      if (!normalizedParty && !normalizedOffice) {
        return []
      }

      return [...officeFilteredItems].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
    }

    return officeFilteredItems
      .map((item) => {
        const normalizedName = normalizeSearchText(item.nome)
        const normalizedItemParty = normalizeSearchText(item.partido)
        const normalizedItemOffice = normalizeSearchText(getOfficeLabel(item.cargo))
        const score = scoreGlobalSearchMatch({
          query: normalizedQuery,
          normalizedName,
          normalizedParty: normalizedItemParty,
          normalizedOffice: normalizedItemOffice,
        })

        return {
          item,
          score,
        }
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => {
        if (left.score !== right.score) {
          return right.score - left.score
        }

        return left.item.nome.localeCompare(right.item.nome, 'pt-BR')
      })
      .map((entry) => entry.item)
  }, [allItems, search, selectedParty, selectedOffice])

  const loadSearchIndex = useCallback(async () => {
    setLoadingSearch(true)
    setSearchError('')

    try {
      const data = await fetchPoliticiansIndex()
      setAllItems(data)
    } catch {
      setAllItems([])
      setSearchError('Erro ao carregar índice de políticos. Tente novamente em instantes.')
    } finally {
      setLoadingSearch(false)
    }
  }, [])

  const toggleParty = useCallback((party: string) => {
    setSelectedParty((currentParty) => (currentParty === party ? '' : party))
  }, [])

  const toggleOffice = useCallback((office: string) => {
    setSelectedOffice((currentOffice) => (currentOffice === office ? '' : office))
  }, [])

  const clearParty = useCallback(() => {
    setSelectedParty('')
  }, [])

  const clearOffice = useCallback(() => {
    setSelectedOffice('')
  }, [])

  return {
    allItems,
    parties,
    offices,
    search,
    selectedParty,
    selectedOffice,
    loadingSearch,
    searchError,
    filteredItems,
    setSearch,
    loadSearchIndex,
    toggleParty,
    toggleOffice,
    clearParty,
    clearOffice,
  }
}
