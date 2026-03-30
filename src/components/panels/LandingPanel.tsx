import { AppButton } from '../common/AppButton'
import './LandingPanel.css'

interface LandingPanelProps {
  onStartSearch: () => void
}

export function LandingPanel({ onStartSearch }: LandingPanelProps) {
  return (
    <div className="landing-panel">
      <div className="landing-content">
        <h2 className="landing-title">Análise de Deputados Federais</h2>
        <p className="landing-description">
          Explore informações detalhadas sobre deputados federais brasileiros, suas proposições e votações.
        </p>

        <div className="landing-features">
          <div className="feature">
            <div className="feature-icon">🗺️</div>
            <h3>Selecione por Estado</h3>
            <p>Escolha um estado e veja todos seus deputados federais</p>
          </div>

          <div className="feature">
            <div className="feature-icon">🔍</div>
            <h3>Busque Deputados</h3>
            <p>Encontre deputados específicos por nome ou partido</p>
          </div>

          <div className="feature">
            <div className="feature-icon">📋</div>
            <h3>Veja Detalhes</h3>
            <p>Acesse proposições, votações e informações pessoais</p>
          </div>
        </div>

        <div className="landing-actions">
          <AppButton
            onClick={onStartSearch}
            className="landing-button"
            aria-label="Iniciar busca de deputados"
          >
            Iniciar Busca
          </AppButton>
        </div>
      </div>
    </div>
  )
}
