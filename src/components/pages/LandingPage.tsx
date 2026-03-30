import { LandingPanel } from '../panels/LandingPanel'
import { useAppNavigation } from '../../hooks/useAppNavigation'

export function LandingPage() {
  const { goToStateSelection } = useAppNavigation()

  return <LandingPanel onStartSearch={goToStateSelection} />
}
