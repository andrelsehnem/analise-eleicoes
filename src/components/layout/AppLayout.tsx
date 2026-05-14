import type { ReactNode } from 'react'
import { AppHeader } from '../layout/AppHeader'
import { Disclaimer } from '../layout/Disclaimer'
import { HeroSection } from '../layout/HeroSection'
import { StepsNav } from '../layout/StepsNav'
import { CookieBanner } from '../common/CookieBanner'
import { useLocation, useParams } from 'react-router-dom'
import { STATES } from '../../constants/states'

interface AppLayoutProps {
  children: ReactNode
  showStepsNav?: boolean
  deputyName?: string | null
}

export function AppLayout({
  children,
  showStepsNav = false,
  deputyName = null,
}: AppLayoutProps) {
  const location = useLocation()
  const { pathname, state } = location
  const { uf, deputyId } = useParams<{ uf?: string; deputyId?: string }>()
  const shouldShowHero = pathname === '/'
  const hideStepsNavFromSearch = Boolean((state as { fromGlobalSearch?: boolean } | null)?.fromGlobalSearch)

  const stateName =
    uf && STATES.find((state) => state.uf.toLowerCase() === uf.toLowerCase())
      ?.name

  const panel =
    !uf || !deputyId ? 'states' : deputyId ? 'detail' : 'deputies'

  return (
    <div className="app">
      <AppHeader />

      <main className="main" id="conteudo-principal">
        {shouldShowHero && <HeroSection />}

        {showStepsNav && !hideStepsNavFromSearch && (
          <StepsNav
            panel={panel}
            selectedState={
              uf && stateName ? { uf: uf.toUpperCase(), name: stateName } : null
            }
            selectedDeputyName={deputyName}
            loadingDetail={false}
            onGoToStates={() => {
              /* handled by router */
            }}
            onGoToDeputies={() => {
              /* handled by router */
            }}
          />
        )}

        {children}
      </main>

      <CookieBanner />
      <Disclaimer />
    </div>
  )
}
