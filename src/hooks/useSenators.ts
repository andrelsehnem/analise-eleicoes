import { useCallback, useMemo, useState } from 'react'
import { fetchSenatorsByState } from '../api/camaraApi'
import type { Senator } from '../types/camara'

export function useSenators() {
  const [allSenators, setAllSenators] = useState<Senator[]>([])
  const [search, setSearch] = useState('')
  const [loadingSenators, setLoadingSenators] = useState(false)
  const [senatorsError, setSenatorsError] = useState('')

  const filteredSenators = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return allSenators
    }

    return allSenators.filter(
      (senator) =>
        senator.nome.toLowerCase().includes(query) ||
        senator.siglaPartido.toLowerCase().includes(query),
    )
  }, [allSenators, search])

  const loadSenators = useCallback(async (uf: string) => {
    setLoadingSenators(true)
    setSenatorsError('')

    try {
      const senators = await fetchSenatorsByState(uf)
      setAllSenators(senators)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Formato de dados da API do Senado')) {
          setSenatorsError('⚠ A API do Senado retornou um formato inesperado. Tente novamente em instantes.')
        } else if (error.message.includes('interpretar os dados de senadores')) {
          setSenatorsError('⚠ Não foi possível processar os dados dos senadores para esta UF no momento.')
        } else if (error.message.includes('Falha na API')) {
          setSenatorsError('⚠ O serviço de dados do Senado está indisponível no momento.')
        } else {
          setSenatorsError('⚠ Erro ao carregar senadores. Verifique a conexão.')
        }
      } else {
        setSenatorsError('⚠ Erro ao carregar senadores. Verifique a conexão.')
      }

      setAllSenators([])
    } finally {
      setLoadingSenators(false)
    }
  }, [])

  const clearSenatorsState = useCallback(() => {
    setAllSenators([])
    setSearch('')
    setSenatorsError('')
  }, [])

  const findSenatorById = useCallback(
    (id: string) => {
      return allSenators.find((item) => item.id === id) || null
    },
    [allSenators],
  )

  return {
    allSenators,
    search,
    loadingSenators,
    senatorsError,
    filteredSenators,
    setSearch,
    loadSenators,
    clearSenatorsState,
    findSenatorById,
  }
}
