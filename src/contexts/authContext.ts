import { createContext } from 'react'
import type { AuthProfile } from '../types/camara'

export type AuthContextValue = {
  user: AuthProfile | null
  authStatus: 'loading' | 'authenticated' | 'unauthenticated'
  authError: string
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearAuthError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
