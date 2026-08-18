import './LandingPanel.css'
import { Link } from 'react-router-dom'

interface LandingPanelProps {
  onStartSearch: () => void
  onStartGlobalSearch: () => void
}

export function LandingPanel({ onStartSearch, onStartGlobalSearch }: LandingPanelProps) {
  return (
    <div className="landing-panel">
      <div className="landing-content">
        <h2 className="landing-title">Análise de políticos do Brasil</h2>
        <p className="landing-description">
          Explore informações detalhadas sobre politicos brasileiros, suas proposições e votações.
        </p>


        <div className="landing-features">
          <Link
            aria-label="Conhecer a área Candidatos 2026"
            className="feature feature-highlight feature-link"
            to="/candidatos-2026"
          >
            <div className="feature-icon">🗳️</div>
            <h3>Candidatos 2026</h3>
            <p>Conheça a futura consulta de candidatos das eleições de outubro de 2026</p>
          </Link>
          <div
            className="feature"
            role="button"
            tabIndex={0}
            aria-label="Iniciar busca por estado"
            onClick={onStartSearch}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onStartSearch()
              }
            }}
          >
            <div className="feature-icon">🗺️</div>
            <h3>Selecione por estado</h3>
            <p>Escolha um estado e veja todos seus políticos</p>
          </div>

          <div
            className="feature"
            role="button"
            tabIndex={0}
            aria-label="Iniciar busca por partido"
            onClick={onStartGlobalSearch}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onStartGlobalSearch()
              }
            }}
          >
            <div className="feature-icon">🏛️</div>
            <h3>Busque por partido</h3>
            <p>Encontre políticos filtrando por partido</p>
          </div>

          <div
            className="feature"
            role="button"
            tabIndex={0}
            aria-label="Iniciar busca por cargo"
            onClick={onStartGlobalSearch}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onStartGlobalSearch()
              }
            }}
          >
            <div className="feature-icon">📌</div>
            <h3>Busque por cargo</h3>
            <p>Filtre políticos de acordo com o cargo</p>
          </div>

          <div
            className="feature"
            role="button"
            tabIndex={0}
            aria-label="Iniciar busca por nome"
            onClick={onStartGlobalSearch}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onStartGlobalSearch()
              }
            }}
          >
            <div className="feature-icon">🔎</div>
            <h3>Busque por nome</h3>
            <p>Pesquise diretamente pelo nome do político</p>
          </div>

          
        </div>
      </div>
    </div>
  )
}
