import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type UserCredential,
} from 'firebase/auth'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createServerSession, endServerSession, fetchCurrentSession } from '../api/authApi'
import { firebaseAuth, googleProvider, isFirebaseConfigured } from '../api/firebaseClient'
import { AuthContext, type AuthContextValue } from '../contexts/authContext'
import type { AuthProfile } from '../types/camara'

type AuthProviderProps = {
  children: ReactNode
}

const EMAIL_NOT_VERIFIED_ERROR = 'auth/email-not-verified'

type FirebaseAuthError = Error & { code?: string }

function getFirebaseAuthCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return ''
  }

  const withCode = error as FirebaseAuthError
  return typeof withCode.code === 'string' ? withCode.code.toLowerCase() : ''
}

function isTokenExpiredError(error: unknown): boolean {
  return error instanceof Error && error.message.toLowerCase().includes('auth/user-token-expired')
}

async function getFreshIdToken(user: UserCredential['user']): Promise<string> {
  try {
    return await user.getIdToken()
  } catch (error) {
    if (!isTokenExpiredError(error)) {
      throw error
    }

    await user.reload().catch(() => undefined)
    return await user.getIdToken()
  }
}

function normalizeAuthError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Não foi possível completar a autenticação.'
  }

  const authCode = getFirebaseAuthCode(error)
  const message = error.message.toLowerCase()

  if (authCode === 'auth/unauthorized-domain' || message.includes('auth/unauthorized-domain')) {
    return 'Login com Google indisponível neste domínio. Verifique os domínios autorizados no Firebase Authentication.'
  }

  if (authCode === 'auth/operation-not-allowed' || message.includes('auth/operation-not-allowed')) {
    return 'Login com Google não está habilitado neste ambiente. Ative o provedor Google no Firebase Authentication.'
  }

  if (authCode === 'auth/popup-blocked' || message.includes('auth/popup-blocked')) {
    return 'O navegador bloqueou a janela de login do Google. Permita pop-ups para continuar.'
  }

  if (authCode === 'auth/cancelled-popup-request' || message.includes('auth/cancelled-popup-request')) {
    return 'A solicitação de login foi interrompida. Tente novamente.'
  }

  if (message.includes('auth/invalid-credential')) {
    return 'E-mail ou senha inválidos.'
  }

  if (message.includes('auth/wrong-password')) {
    return 'Senha incorreta.'
  }

  if (message.includes('auth/email-already-in-use')) {
    return 'E-mail ou senha inválidos.'
  }

  if (message.includes('auth/too-many-requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }

  if (message.includes(EMAIL_NOT_VERIFIED_ERROR)) {
    return 'Confirme seu e-mail para concluir o login. Enviamos um link de verificação para sua caixa de entrada.'
  }

  if (message.includes('popup-closed-by-user')) {
    return 'Login com Google cancelado.'
  }

  return error.message
}

async function resolveEmailCredential(email: string, password: string): Promise<UserCredential> {
  if (!firebaseAuth) {
    throw new Error('Autenticação indisponível. Configure as variáveis VITE_FIREBASE_* no ambiente.')
  }

  try {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    await credential.user.reload()

    if (!credential.user.emailVerified) {
      await sendEmailVerification(credential.user).catch(() => undefined)
      throw new Error(EMAIL_NOT_VERIFIED_ERROR)
    }

    return credential
  } catch (error) {
    const isUserNotFound = error instanceof Error
      && (error.message.includes('auth/user-not-found') || error.message.includes('auth/invalid-credential'))

    if (!isUserNotFound) {
      throw error
    }

    const methods = await fetchSignInMethodsForEmail(firebaseAuth, email)

    if (methods.length > 0) {
      throw error
    }

    const created = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    const fallbackDisplayName = email.split('@')[0] || 'Usuário'

    await updateProfile(created.user, {
      displayName: fallbackDisplayName,
    })

    await sendEmailVerification(created.user).catch(() => undefined)

    throw new Error(EMAIL_NOT_VERIFIED_ERROR)
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthProfile | null>(null)
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [authError, setAuthError] = useState('')

  const refreshUser = useCallback(async () => {
    setAuthError('')

    if (!isFirebaseConfigured) {
      setUser(null)
      setAuthStatus('unauthenticated')
      return
    }

    try {
      const sessionUser = await fetchCurrentSession()

      if (!sessionUser) {
        setUser(null)
        setAuthStatus('unauthenticated')
        return
      }

      setUser(sessionUser)
      setAuthStatus('authenticated')
    } catch (error) {
      setUser(null)
      setAuthStatus('unauthenticated')
      setAuthError(normalizeAuthError(error))
    }
  }, [])

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      void refreshUser()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [refreshUser])

  const completeServerSession = useCallback(async (idToken: string) => {
    const sessionUser = await createServerSession(idToken)
    setUser(sessionUser)
    setAuthStatus('authenticated')
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setAuthError('')

    if (!firebaseAuth) {
      const error = 'Login indisponível: configure VITE_FIREBASE_API_KEY e demais variáveis Firebase no .env.'
      setAuthStatus('unauthenticated')
      setAuthError(error)
      throw new Error(error)
    }

    try {
      const credential = await signInWithPopup(firebaseAuth, googleProvider)
      const idToken = await getFreshIdToken(credential.user)
      await completeServerSession(idToken)
    } catch (error) {
      setAuthError(normalizeAuthError(error))
      setAuthStatus('unauthenticated')
      if (firebaseAuth) {
        await signOut(firebaseAuth).catch(() => undefined)
      }
      throw error
    }
  }, [completeServerSession])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthError('')

    if (!firebaseAuth) {
      const error = 'Login indisponível: configure VITE_FIREBASE_API_KEY e demais variáveis Firebase no .env.'
      setAuthStatus('unauthenticated')
      setAuthError(error)
      throw new Error(error)
    }

    try {
      const credential = await resolveEmailCredential(email, password)
      const idToken = await getFreshIdToken(credential.user)
      await completeServerSession(idToken)
    } catch (error) {
      setAuthError(normalizeAuthError(error))
      setAuthStatus('unauthenticated')
      if (firebaseAuth) {
        await signOut(firebaseAuth).catch(() => undefined)
      }
      throw error
    }
  }, [completeServerSession])

  const logout = useCallback(async () => {
    setAuthError('')

    try {
      await endServerSession()
    } catch (error) {
      setAuthError(normalizeAuthError(error))
      throw error
    } finally {
      setUser(null)
      setAuthStatus('unauthenticated')
      if (firebaseAuth) {
        await signOut(firebaseAuth).catch(() => undefined)
      }
    }
  }, [])

  const clearAuthError = useCallback(() => {
    setAuthError('')
  }, [])

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      authStatus,
      authError,
      signInWithGoogle,
      signInWithEmail,
      logout,
      refreshUser,
      clearAuthError,
    }),
    [authError, authStatus, clearAuthError, logout, refreshUser, signInWithEmail, signInWithGoogle, user],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
