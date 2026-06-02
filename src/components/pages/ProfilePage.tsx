import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteAccount, fetchProfile, updateProfile } from '../../api/profileApi'
import { useFavoritePoliticians } from '../../hooks/useFavoritePoliticians'
import { useAuth } from '../../hooks/useAuth'
import { EmptyState } from '../common/EmptyState'
import type { FavoritePolitician, ProfileData } from '../../types/camara'
import { buildBreadcrumbSchema } from '../../utils/seo'
import { AppButton } from '../common/AppButton'
import { ErrorBox } from '../common/ErrorBox'
import { FavoriteStarButton } from '../common/FavoriteStarButton'
import { Loader } from '../common/Loader'
import { SeoHead } from '../common/SeoHead'
import './ProfilePage.css'

type ProfileTab = 'favorites' | 'settings'

type CountItem = {
  label: string
  count: number
}

type FavoriteGroup = {
  label: string
  items: FavoritePolitician[]
}

function getFavoritePath(grupo: string, id: string, estado: string): string {
  if (grupo === 'deputados-federais') {
    return estado ? `/por-estado/${estado.toLowerCase()}/deputado-federal/${id}` : '/perfil'
  }

  if (grupo === 'deputados-estaduais') {
    return estado ? `/por-estado/${estado.toLowerCase()}/deputado-estadual/${id}` : '/perfil'
  }

  if (grupo === 'senadores') {
    return `/senador/${id}`
  }

  return `/presidente/${id}`
}

function getFavoriteSubtitle(grupo: string, estado: string): string {
  if (grupo === 'deputados-federais') {
    return `Deputado federal · ${estado}`
  }

  if (grupo === 'deputados-estaduais') {
    return `Deputado estadual · ${estado}`
  }

  if (grupo === 'senadores') {
    return `Senador · ${estado || 'UF não informada'}`
  }

  return 'Presidência · Brasil'
}

function getFavoriteBadge(grupo: string): string {
  if (grupo === 'deputados-federais') {
    return 'Deputado federal'
  }

  if (grupo === 'deputados-estaduais') {
    return 'Deputado estadual'
  }

  if (grupo === 'senadores') {
    return 'Senador'
  }

  return 'Presidência'
}

function getOfficeLabel(cargo: string): string {
  if (cargo === 'deputado-federal') {
    return 'Deputado federal'
  }

  if (cargo === 'deputado-estadual') {
    return 'Deputado estadual'
  }

  if (cargo === 'senador') {
    return 'Senador'
  }

  return 'Presidente'
}

function sortCountItems(items: CountItem[]): CountItem[] {
  return [...items].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count
    }

    return left.label.localeCompare(right.label, 'pt-BR')
  })
}

function getFavoriteGroupLabel(grupo: string): string {
  if (grupo === 'deputados-federais') {
    return 'Deputados federais'
  }

  if (grupo === 'deputados-estaduais') {
    return 'Deputados estaduais'
  }

  if (grupo === 'senadores') {
    return 'Senadores'
  }

  return 'Presidência'
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { logout, refreshUser, authStatus } = useAuth()
  const { favorites, loadingFavorites, savingFavorite, favoritesError, toggleFavorite, clearFavoritesError } = useFavoritePoliticians({
    isAuthenticated: authStatus === 'authenticated',
  })
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState<ProfileTab>('favorites')

  const favoriteStats = useMemo(() => {
    const partyCounts = new Map<string, number>()
    const officeCounts = new Map<string, number>()

    for (const favorite of favorites) {
      partyCounts.set(favorite.partido, (partyCounts.get(favorite.partido) || 0) + 1)
      officeCounts.set(favorite.cargo, (officeCounts.get(favorite.cargo) || 0) + 1)
    }

    return {
      total: favorites.length,
      parties: sortCountItems(Array.from(partyCounts.entries()).map(([label, count]) => ({ label, count }))),
      offices: sortCountItems(Array.from(officeCounts.entries()).map(([label, count]) => ({ label: getOfficeLabel(label), count }))),
    }
  }, [favorites])

  const favoriteGroups = useMemo((): FavoriteGroup[] => {
    const order = ['deputados-federais', 'deputados-estaduais', 'senadores', 'presidentes'] as const
    const groupedFavorites = new Map<string, typeof favorites>()

    for (const favorite of favorites) {
      const currentGroup = groupedFavorites.get(favorite.grupo) || []
      groupedFavorites.set(favorite.grupo, [...currentGroup, favorite])
    }

    return order
      .map((grupo) => ({
        label: getFavoriteGroupLabel(grupo),
        items: groupedFavorites.get(grupo) || [],
      }))
      .filter((group) => group.items.length > 0)
  }, [favorites])

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setLoadingProfile(true)
      setError('')

      try {
        const loadedProfile = await fetchProfile()

        if (!isMounted) {
          return
        }

        setProfile(loadedProfile)
        setDisplayNameInput(loadedProfile.displayName)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar seu perfil.')
      } finally {
        if (isMounted) {
          setLoadingProfile(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProfile(true)
    setError('')
    setSuccessMessage('')

    try {
      const updated = await updateProfile(displayNameInput)
      setProfile(updated)
      setDisplayNameInput(updated.displayName)
      setSuccessMessage('Perfil atualizado com sucesso.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar seu perfil.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleLogout() {
    setError('')
    setSuccessMessage('')

    try {
      await logout()
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Não foi possível sair da conta.')
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Tem certeza que deseja deletar sua conta? Esta ação deleta todos os seus dados da base, ela é permanente e não pode ser desfeita.',
    )

    if (!confirmed) {
      return
    }

    setDeletingAccount(true)
    setError('')
    setSuccessMessage('')

    try {
      await deleteAccount()
      await refreshUser()
      navigate('/login', { replace: true })
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível deletar a conta.')
    } finally {
      setDeletingAccount(false)
    }
  }

  if (loadingProfile || loadingFavorites) {
    return <Loader />
  }

  return (
    <>
      <SeoHead
        title="Meu perfil"
        description="Gerencie suas informações de perfil no Mandato Transparente com autenticação segura."
        canonicalPath="/perfil"
        jsonLd={buildBreadcrumbSchema([
          { name: 'Início', path: '/' },
          { name: 'Perfil', path: '/perfil' },
        ])}
      />

      <section className="profile-panel" aria-labelledby="titulo-perfil">
        <div className="section-header">
          <h1 className="section-title" id="titulo-perfil">Meu perfil</h1>
        </div>

        <p className="profile-description">Navegue entre seus políticos favoritados e as configurações da conta.</p>

        <div className="profile-tabs" role="tablist" aria-label="Seções do perfil">
          <button
            aria-controls="perfil-favoritos"
            aria-selected={activeTab === 'favorites'}
            className={`profile-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            id="perfil-favoritos-tab"
            onClick={() => setActiveTab('favorites')}
            role="tab"
            type="button"
          >
            Favoritos
          </button>
          <button
            aria-controls="perfil-configuracoes"
            aria-selected={activeTab === 'settings'}
            className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
            id="perfil-configuracoes-tab"
            onClick={() => setActiveTab('settings')}
            role="tab"
            type="button"
          >
            Configurações
          </button>
        </div>

        {activeTab === 'favorites' ? (
          <section aria-labelledby="perfil-favoritos-tab" className="profile-tabpanel" id="perfil-favoritos" role="tabpanel">
            <p className="profile-description">Acompanhe rapidamente os políticos que você marcou como favoritos.</p>

            <div className="profile-favorites-summary" aria-label="Resumo dos favoritos">
              <div className="profile-summary-card">
                <span className="profile-summary-label">Total</span>
                <strong className="profile-summary-value">{favoriteStats.total}</strong>
              </div>

              <div className="profile-summary-block">
                <span className="profile-summary-label">Por cargo</span>
                <div className="profile-summary-chips" role="list" aria-label="Quantidade de favoritos por cargo">
                  {favoriteStats.offices.length > 0 ? (
                    favoriteStats.offices.map((item) => (
                      <span className="profile-summary-chip" key={item.label} role="listitem">
                        {item.label}: {item.count}
                      </span>
                    ))
                  ) : (
                    <span className="profile-summary-empty">Nenhum favorito cadastrado.</span>
                  )}
                </div>
              </div>

              <div className="profile-summary-block">
                <span className="profile-summary-label">Por partido</span>
                <div className="profile-summary-chips" role="list" aria-label="Quantidade de favoritos por partido">
                  {favoriteStats.parties.length > 0 ? (
                    favoriteStats.parties.map((item) => (
                      <span className="profile-summary-chip" key={item.label} role="listitem">
                        {item.label}: {item.count}
                      </span>
                    ))
                  ) : (
                    <span className="profile-summary-empty">Nenhum favorito cadastrado.</span>
                  )}
                </div>
              </div>
            </div>

            {favoritesError ? (
              <div className="search-favorites-error-wrap">
                <ErrorBox message={favoritesError} />
                <button className="party-filter-clear" type="button" onClick={clearFavoritesError}>
                  Fechar
                </button>
              </div>
            ) : null}

            {favorites.length === 0 ? (
              <EmptyState icon="⭐" message="Você ainda não favoritou nenhum político. Use a busca ou as listas para salvar os perfis que deseja acompanhar." />
            ) : (
              <div className="profile-favorite-groups">
                {favoriteGroups.map((group) => (
                  <section className="profile-favorite-group" key={group.label} aria-labelledby={`profile-favorite-group-${group.label}`}>
                    <div className="profile-favorite-group-header">
                      <h2 className="profile-favorite-group-title" id={`profile-favorite-group-${group.label}`}>
                        {group.label}
                      </h2>
                      <span className="profile-favorite-group-count">
                        {group.items.length} {group.items.length === 1 ? 'favorito' : 'favoritos'}
                      </span>
                    </div>

                    <div className="deputy-grid profile-favorites-grid">
                      {group.items.map((favorite) => (
                        <Link
                          className="deputy-card profile-favorite-card"
                          key={`${favorite.grupo}-${favorite.id}`}
                          state={favorite.grupo === 'senadores' && favorite.estado ? { selectedUf: favorite.estado.toUpperCase(), fromProfileFavorites: true } : undefined}
                          to={getFavoritePath(favorite.grupo, favorite.id, favorite.estado)}
                        >
                          <div className="deputy-info">
                            <div className="deputy-name-row">
                              <div className="deputy-name">{favorite.nome}</div>
                              <FavoriteStarButton
                                isActive={true}
                                canFavorite={true}
                                disabled={savingFavorite}
                                onToggle={() => {
                                  void toggleFavorite(favorite)
                                }}
                              />
                            </div>
                            <div className="deputy-party">{favorite.partido}</div>
                            <div className="deputy-meta">{getFavoriteSubtitle(favorite.grupo, favorite.estado)}</div>
                          </div>
                          <div className="deputy-arrow">›</div>
                          <span className="profile-favorite-badge">{getFavoriteBadge(favorite.grupo)}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section aria-labelledby="perfil-configuracoes-tab" className="profile-tabpanel" id="perfil-configuracoes" role="tabpanel">
            <p className="profile-description">
              Seus dados são protegidos por sessão segura no servidor. Atualize seu nome de exibição abaixo.
            </p>

            {error ? <ErrorBox message={error} /> : null}
            {successMessage ? <p className="profile-success">{successMessage}</p> : null}

            <form className="profile-form" onSubmit={handleSubmit} noValidate>
              <div className="profile-field">
                <label htmlFor="profile-name">Nome</label>
                <input
                  id="profile-name"
                  name="profile-name"
                  type="text"
                  minLength={2}
                  maxLength={80}
                  value={displayNameInput}
                  onChange={(event) => setDisplayNameInput(event.target.value)}
                  required={true}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">E-mail</label>
                <input
                  id="profile-email"
                  name="profile-email"
                  type="email"
                  value={profile?.email || ''}
                  readOnly={true}
                  disabled={true}
                />
              </div>

              <div className="profile-actions">
                <AppButton className="profile-save-button" type="submit" disabled={savingProfile || deletingAccount}>
                  {savingProfile ? 'Salvando...' : 'Salvar alterações'}
                </AppButton>
                <AppButton className="profile-logout-button" onClick={handleLogout} type="button" disabled={savingProfile || deletingAccount}>
                  Sair
                </AppButton>
                <AppButton className="profile-delete-button" onClick={handleDeleteAccount} type="button" disabled={savingProfile || deletingAccount}>
                  {deletingAccount ? 'Deletando conta...' : 'Deletar conta'}
                </AppButton>
              </div>
            </form>
          </section>
        )}
      </section>
    </>
  )
}
