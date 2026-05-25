import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isFirebaseConfigured } from '../../api/firebaseClient'
import { useAuth } from '../../hooks/useAuth'
import { buildBreadcrumbSchema } from '../../utils/seo'
import { AppButton } from '../common/AppButton'
import { ErrorBox } from '../common/ErrorBox'
import { SeoHead } from '../common/SeoHead'
import './LoginPage.css'

function resolveRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/perfil'
  }

  return value
}

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = useMemo(() => resolveRedirectPath(searchParams.get('redirect')), [searchParams])
  const { authStatus, authError, signInWithGoogle, signInWithEmail, clearAuthError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (authStatus === 'authenticated') {
      navigate(redirectPath, { replace: true })
    }
  }, [authStatus, navigate, redirectPath])

  useEffect(() => {
    clearAuthError()
  }, [clearAuthError])

  async function handleGoogleLogin() {
    setIsSubmitting(true)
    setLocalError('')

    try {
      await signInWithGoogle()
      navigate(redirectPath, { replace: true })
    } catch {
      setLocalError('Não foi possível entrar com Google no momento.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setLocalError('')

    if (!email.trim() || password.trim().length < 6) {
      setLocalError('Informe um e-mail válido e senha com pelo menos 6 caracteres.')
      setIsSubmitting(false)
      return
    }

    try {
      await signInWithEmail(email.trim(), password)
      navigate(redirectPath, { replace: true })
    } catch {
      setLocalError('Falha ao autenticar com e-mail e senha.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <SeoHead
        title="Entrar no perfil"
        description="Acesse seu perfil para salvar seus dados com autenticação segura via Firebase."
        canonicalPath="/login"
        jsonLd={buildBreadcrumbSchema([
          { name: 'Início', path: '/' },
          { name: 'Login', path: '/login' },
        ])}
      />

      <section className="auth-panel" aria-labelledby="titulo-login">
        <div className="section-header">
          <h1 className="section-title" id="titulo-login">Acesse seu perfil</h1>
        </div>

        <p className="auth-description">
          Entre com Google ou com e-mail e senha. Se o e-mail ainda não existir, a conta será criada automaticamente.
        </p>

        {!isFirebaseConfigured ? (
          <ErrorBox message="Login desabilitado no ambiente atual. Configure as variáveis VITE_FIREBASE_* para ativar autenticação." />
        ) : null}

        {authError ? <ErrorBox message={authError} /> : null}
        {localError ? <ErrorBox message={localError} /> : null}

        <div className="auth-google-wrap">
          <AppButton
            className="auth-google-button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting || !isFirebaseConfigured}
            type="button"
          >
            Continuar com Google
          </AppButton>
        </div>

        <div className="auth-divider" role="presentation">
          <span>ou</span>
        </div>

        <form className="auth-form" onSubmit={handleEmailSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              name="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required={true}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              name="login-password"
              type="password"
              autoComplete="current-password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required={true}
            />
          </div>

          <AppButton className="auth-submit-button" disabled={isSubmitting || !isFirebaseConfigured} type="submit">
            {isSubmitting ? 'Entrando...' : 'Entrar com e-mail'}
          </AppButton>
        </form>
      </section>
    </>
  )
}
