import { useEffect, useState, type FormEvent } from 'react'
import { fetchProfile, updateProfile } from '../../api/profileApi'
import type { ProfileData } from '../../types/camara'
import { buildBreadcrumbSchema } from '../../utils/seo'
import { AppButton } from '../common/AppButton'
import { ErrorBox } from '../common/ErrorBox'
import { Loader } from '../common/Loader'
import { SeoHead } from '../common/SeoHead'
import { useAuth } from '../../hooks/useAuth'
import './ProfilePage.css'

export function ProfilePage() {
  const { logout } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [displayNameInput, setDisplayNameInput] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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

  if (loadingProfile) {
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
            <AppButton className="profile-save-button" type="submit" disabled={savingProfile}>
              {savingProfile ? 'Salvando...' : 'Salvar alterações'}
            </AppButton>
            <AppButton className="profile-logout-button" onClick={handleLogout} type="button">
              Sair
            </AppButton>
          </div>
        </form>
      </section>
    </>
  )
}
