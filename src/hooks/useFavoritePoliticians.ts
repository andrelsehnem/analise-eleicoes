import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchProfile, updateProfileFavorites } from '../api/profileApi'
import type { FavoritePolitician, GlobalSearchItem } from '../types/camara'

const FAVORITES_LIMIT = 100

function normalizeFavoriteKey(grupo: string, id: string): string {
  return `${grupo}:${id}`
}

export function mapGlobalSearchItemToFavorite(item: GlobalSearchItem): FavoritePolitician {
  return {
    id: item.id,
    nome: item.nome,
    estado: item.estado,
    partido: item.partido,
    grupo: item.grupo,
    cargo: item.cargo,
  }
}

export function getFavoritePoliticianKey(item: Pick<FavoritePolitician, 'grupo' | 'id'>): string {
  return normalizeFavoriteKey(item.grupo, item.id)
}

type UseFavoritePoliticiansParams = {
  isAuthenticated: boolean
}

export function useFavoritePoliticians({ isAuthenticated }: UseFavoritePoliticiansParams) {
  const [favorites, setFavorites] = useState<FavoritePolitician[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)
  const [savingFavorite, setSavingFavorite] = useState(false)
  const [favoritesError, setFavoritesError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    let isMounted = true

    async function loadFavorites() {
      setLoadingFavorites(true)
      setFavoritesError('')

      try {
        const profile = await fetchProfile()

        if (!isMounted) {
          return
        }

        setFavorites(profile.favorites || [])
      } catch (error) {
        if (!isMounted) {
          return
        }

        setFavorites([])
        setFavoritesError(error instanceof Error ? error.message : 'Não foi possível carregar favoritos.')
      } finally {
        if (isMounted) {
          setLoadingFavorites(false)
        }
      }
    }

    void loadFavorites()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  const visibleFavorites = useMemo(() => {
    return isAuthenticated ? favorites : []
  }, [favorites, isAuthenticated])
  const visibleError = isAuthenticated ? favoritesError : ''
  const isLoadingVisible = isAuthenticated ? loadingFavorites : false
  const isSavingVisible = isAuthenticated ? savingFavorite : false

  const favoriteKeys = useMemo(() => {
    return new Set(visibleFavorites.map((item) => normalizeFavoriteKey(item.grupo, item.id)))
  }, [visibleFavorites])

  const isFavorite = useCallback((item: Pick<FavoritePolitician, 'grupo' | 'id'>) => {
    return favoriteKeys.has(normalizeFavoriteKey(item.grupo, item.id))
  }, [favoriteKeys])

  const toggleFavorite = useCallback(async (item: FavoritePolitician) => {
    if (!isAuthenticated || savingFavorite) {
      return
    }

    const itemKey = normalizeFavoriteKey(item.grupo, item.id)
    const alreadyFavorite = favoriteKeys.has(itemKey)

    if (!alreadyFavorite && favorites.length >= FAVORITES_LIMIT) {
      setFavoritesError('Você atingiu o limite de 100 favoritos.')
      return
    }

    const candidateFavorite: FavoritePolitician = {
      id: item.id,
      nome: item.nome,
      estado: item.estado,
      partido: item.partido,
      grupo: item.grupo,
      cargo: item.cargo,
    }
    const nextFavorites = alreadyFavorite
      ? favorites.filter((favorite) => normalizeFavoriteKey(favorite.grupo, favorite.id) !== itemKey)
      : [candidateFavorite, ...favorites]

    setFavoritesError('')
    setSavingFavorite(true)
    setFavorites(nextFavorites)

    try {
      const profile = await updateProfileFavorites(nextFavorites)
      setFavorites(profile.favorites || nextFavorites)
    } catch (error) {
      setFavorites(favorites)
      setFavoritesError(error instanceof Error ? error.message : 'Não foi possível atualizar favoritos.')
    } finally {
      setSavingFavorite(false)
    }
  }, [favoriteKeys, favorites, isAuthenticated, savingFavorite])

  const clearFavoritesError = useCallback(() => {
    setFavoritesError('')
  }, [])

  return {
    favorites: visibleFavorites,
    favoriteKeys,
    loadingFavorites: isLoadingVisible,
    savingFavorite: isSavingVisible,
    favoritesError: visibleError,
    isFavorite,
    toggleFavorite,
    clearFavoritesError,
  }
}
