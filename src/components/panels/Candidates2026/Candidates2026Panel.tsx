import { useEffect, useRef } from 'react'
import brazilMap from '@svg-maps/brazil'
import { Link } from 'react-router-dom'
import { STATES } from '../../../constants/states'
import './Candidates2026Panel.css'

type BrazilLocation = {
  id: string
  name: string
  path: string
}

const OFFICES = [
  'Presidente',
  'Governador',
  'Senador',
  'Deputado Federal',
  'Deputado Estadual/Distrital',
] as const

const mapLocations = brazilMap.locations as BrazilLocation[]
const stateNameByUf = new Map(STATES.map((state) => [state.uf, state.name]))

export function Candidates2026Panel() {
  const svgRef = useRef<SVGSVGElement>(null)

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
          <strong>Consulta à Presidência disponível</strong>
          <p>
            A lista de candidatos a Presidente já usa os registros oficiais da Justiça
            Eleitoral. Os demais cargos serão liberados gradualmente.
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
          <span className="candidates-2026-locked-label">4 opções em breve</span>
        </div>

        <div className="candidates-2026-offices" aria-label="Cargos das Eleições 2026">
          {OFFICES.map((office) => {
            if (office === 'Presidente') {
              return (
                <Link
                  className="candidates-2026-office candidates-2026-office-link"
                  key={office}
                  to="/candidatos-2026/presidente"
                >
                  <span>{office}</span>
                  <span className="candidates-2026-office-arrow" aria-hidden="true">›</span>
                </Link>
              )
            }

            return (
              <button
                className="candidates-2026-office"
                disabled
                aria-disabled="true"
                key={office}
                type="button"
              >
                <span>{office}</span>
                <span className="candidates-2026-office-lock" aria-hidden="true">🔒</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="candidates-2026-section" aria-labelledby="candidates-states-title">
        <div className="candidates-2026-section-heading">
          <div>
            <span className="candidates-2026-eyebrow">Para cargos estaduais</span>
            <h2 id="candidates-states-title">Escolha o estado</h2>
          </div>
          <span className="candidates-2026-locked-label">🔒 Mapa bloqueado</span>
        </div>

        <div className="candidates-2026-map-shell" aria-describedby="candidates-map-hint">
          <svg
            aria-label="Prévia indisponível do mapa do Brasil por estados"
            className="candidates-2026-map"
            ref={svgRef}
            role="img"
            viewBox={brazilMap.viewBox}
          >
            {mapLocations.map((location) => {
              const uf = location.id.toUpperCase()
              const name = stateNameByUf.get(uf) ?? location.name

              return (
                <g key={location.id}>
                  <path
                    aria-disabled="true"
                    aria-label={`${name} indisponível`}
                    className="candidates-2026-map-state"
                    d={location.path}
                    data-candidate-state={location.id}
                    role="button"
                    tabIndex={-1}
                  >
                    <title>{`${name} (${uf}) — em breve`}</title>
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
                </g>
              )
            })}
          </svg>
          <p id="candidates-map-hint">
            A seleção pelo mapa estará disponível com a publicação dos registros oficiais.
          </p>
        </div>

        <h3 className="candidates-2026-list-title">Ou selecione pela lista</h3>
        <div className="candidates-2026-state-grid" aria-label="Estados indisponíveis">
          {STATES.map((state) => (
            <button
              className="candidates-2026-state"
              disabled
              aria-disabled="true"
              key={state.uf}
              type="button"
            >
              <span className="candidates-2026-state-uf">{state.uf}</span>
              <span className="candidates-2026-state-name">{state.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
