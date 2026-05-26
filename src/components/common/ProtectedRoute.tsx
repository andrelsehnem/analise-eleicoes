import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Loader } from './Loader'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authStatus } = useAuth()
  const location = useLocation()

  if (authStatus === 'loading') {
    return <Loader />
  }

  if (authStatus !== 'authenticated') {
    const redirectParam = encodeURIComponent(`${location.pathname}${location.search || ''}`)
    return <Navigate to={`/login?redirect=${redirectParam}`} replace={true} />
  }

  return <>{children}</>
}
