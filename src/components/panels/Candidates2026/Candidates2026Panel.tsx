import { useEffect, useRef, useState } from 'react'
import brazilMap from '@svg-maps/brazil'
import { Link } from 'react-router-dom'
import { STATES } from '../../../constants/states'
import { STATE_ELECTION_OFFICES, type StateElectionOfficeConfig } from '../../../constants/electionOffices'
import './Candidates2026Panel.css'

type BrazilLocation = {
  id: string
  name: string
  path: string
}

const mapLocations = brazilMap.locations as BrazilLocation[]
const stateNameByUf = new Map(STATES.map((state) => [state.uf, state.name]))

export function Candidates2026Panel() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedOffice, setSelectedOffice] = useState<StateElectionOfficeConfig | null>(null)

  useEffect(() => {
    const svg = svgRef.current

    if (!svg) {
      return
    }

    svg.querySelectorAll<SVGPathElement>('[data-candidate-state]').forEach((path) => {
      const stateId = path.dataset.candidateState
      const label = svg.querySelector<SVGTextElement>(`[data-candidate-label="${stateId}"]`)

      if (!label || !path.getTotalLength) {
        return
      }

      const samplePoints = 50
      const length = path.getTotalLength()
      let sumX = 0
      let sumY = 0

      for (let index = 0; index < samplePoints; index += 1) {
        const point = path.getPointAtLength((length * index) / samplePoints)
        sumX += point.x
        sumY += point.y
      }

      label.setAttribute('x', String(sumX / samplePoints))
      label.setAttribute('y', String(sumY / samplePoints))
    })
  }, [])

  return (
    <section className="candidates-2026 panel active" aria-labelledby="candidates-2026-title">
      <div className="candidates-2026-hero">
        <div className="candidates-2026-kicker">
          <span className="candidates-2026-kicker-dot" aria-hidden="true" />
          Eleições gerais
        </div>
        <div className="candidates-2026-heading">
          <div>
            <h1 id="candidates-2026-title">Candidatos <em>2026</em></h1>
            <p>
              Uma nova área para conhecer quem pretende representar você, organizada por cargo
              e por estado.
            </p>
          </div>
          <div className="candidates-2026-year" aria-hidden="true">26</div>
        </div>
      </div>

      <div className="candidates-2026-notice" role="status">
        <span className="candidates-2026-notice-icon" aria-hidden="true">✓</span>
        <div>
          <strong>Consultas das Eleições 2026 disponíveis</strong>
          <p>
            Consulte candidatos a Presidente, Governador, Senador e Deputados com dados oficiais
            publicados pela Justiça Eleitoral.
          </p>
          <Link className="candidates-2026-guide-link" to="/candidatos-2026/guia-eleicoes">
            Ver datas, ordem da urna e como votar
          </Link>
        </div>
        <span className="candidates-2026-coming-soon">Dados oficiais</span>
      </div>

      <div className="candidates-2026-section" aria-labelledby="candidates-offices-title">
        <div className="candidates-2026-section-heading">
          <div>
            <span className="candidates-2026-eyebrow">Primeiro passo</span>
            <h2 id="candidates-offices-title">Escolha o cargo</h2>
          </div>
        </div>

        <div className="candidates-2026-offices" aria-label="Cargos das Eleições 2026">
          <Link className="candidates-2026-office candidates-2026-office-link" to="/candidatos-2026/presidente">
            <span>Presidente</span><span className="candidates-2026-office-arrow" aria-hidden="true">›</span>
          </Link>
          {STATE_ELECTION_OFFICES.map((office) => (
              <button
                aria-pressed={selectedOffice?.slug === office.slug}
                className={`candidates-2026-office candidates-2026-office-link${selectedOffice?.slug === office.slug ? ' is-selected' : ''}`}
                key={office.slug}
                type="button"
                onClick={() => setSelectedOffice(office)}
              >
                <span>{office.buttonLabel}</span>
                <span className="candidates-2026-office-arrow" aria-hidden="true">↓</span>
              </button>
          ))}
        </div>
      </div>

      <div className="candidates-2026-section" aria-labelledby="candidates-states-title">
        <div className="candidates-2026-section-heading">
          <div>
            <span className="candidates-2026-eyebrow">Para cargos estaduais</span>
            <h2 id="candidates-states-title">Escolha o estado</h2>
          </div>
          <span className="candidates-2026-locked-label">
            {selectedOffice ? `${selectedOffice.buttonLabel} selecionado` : 'Selecione cargo acima'}
          </span>
        </div>

        <div className="candidates-2026-map-shell" aria-describedby="candidates-map-hint">
          <svg
            aria-label={selectedOffice ? 'Escolha um estado no mapa do Brasil' : 'Mapa do Brasil aguardando a seleção de um cargo'}
            className={`candidates-2026-map${selectedOffice ? ' is-enabled' : ''}`}
            ref={svgRef}
            role="img"
            viewBox={brazilMap.viewBox}
          >
            {mapLocations.map((location) => {
              const uf = location.id.toUpperCase()
              const name = stateNameByUf.get(uf) ?? location.name

              return (
                <g key={location.id}>
                  <Link key={location.id} to={selectedOffice ? `/candidatos-2026/${selectedOffice.slug}/${uf.toLowerCase()}` : '#'}
                    aria-disabled={!selectedOffice} tabIndex={selectedOffice ? 0 : -1}>
                  <path
                    aria-label={selectedOffice ? `Ver candidatos a ${selectedOffice.buttonLabel} de ${name}` : `${name} indisponível`}
                    className="candidates-2026-map-state"
                    d={location.path}
                    data-candidate-state={location.id}
                    role="button"
                    tabIndex={-1}
                  >
                    <title>{selectedOffice ? `Candidatos a ${selectedOffice.buttonLabel} de ${name} (${uf})` : `${name} (${uf}) — selecione um cargo`}</title>
                  </path>
                  <text
                    className="candidates-2026-map-label"
                    data-candidate-label={location.id}
                    dominantBaseline="middle"
                    pointerEvents="none"
                    textAnchor="middle"
                    x="0"
                    y="0"
                  >
                    {uf}
                  </text>
                  </Link>
                </g>
              )
            })}
          </svg>
          <p id="candidates-map-hint">
            {selectedOffice
              ? `Selecione uma UF para consultar as candidaturas a ${selectedOffice.buttonLabel}.`
              : 'Selecione um cargo para liberar o mapa e a lista de estados.'}
          </p>
        </div>

        <h3 className="candidates-2026-list-title">Ou selecione pela lista</h3>
        <div className="candidates-2026-state-grid" aria-label="Estados brasileiros">
          {STATES.map((state) => selectedOffice ? (
            <Link className="candidates-2026-state is-enabled" key={state.uf}
              to={`/candidatos-2026/${selectedOffice.slug}/${state.uf.toLowerCase()}`}>
              <span className="candidates-2026-state-uf">{state.uf}</span>
              <span className="candidates-2026-state-name">{state.name}</span>
            </Link>
          ) : (
            <button className="candidates-2026-state" disabled aria-disabled="true" key={state.uf} type="button">
              <span className="candidates-2026-state-uf">{state.uf}</span>
              <span className="candidates-2026-state-name">{state.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
