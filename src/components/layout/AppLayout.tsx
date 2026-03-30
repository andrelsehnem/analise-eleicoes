import type { ReactNode } from 'react'
import { AppHeader } from '../layout/AppHeader'
import { Disclaimer } from '../layout/Disclaimer'
import { HeroSection } from '../layout/HeroSection'
import { StepsNav } from '../layout/StepsNav'
import { useParams } from 'react-router-dom'
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
  const { uf, deputyId } = useParams<{ uf?: string; deputyId?: string }>()

  const stateName =
    uf && STATES.find((state) => state.uf.toLowerCase() === uf.toLowerCase())
      ?.name

  const panel =
    !uf || !deputyId ? 'states' : deputyId ? 'detail' : 'deputies'

  return (
    <div className="app">
      <AppHeader />

      <div className="main">
        <HeroSection />

        {showStepsNav && (
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
      </div>

      <Disclaimer />
    </div>
  )
}
