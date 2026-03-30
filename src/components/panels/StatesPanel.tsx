import brazilMap from '@svg-maps/brazil'
import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { STATES } from '../../constants/states'
import { AppButton } from '../common/AppButton'

type StatesPanelProps = {
  selectedUf: string | null
  onSelectState: (uf: string, name: string) => void
}

const stateNameByUf = new Map(STATES.map((state) => [state.uf, state.name]))

type BrazilLocation = {
  id: string
  name: string
  path: string
}

const mapLocations = brazilMap.locations as BrazilLocation[]

export function StatesPanel({ selectedUf, onSelectState }: StatesPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Calcula as posições dos rótulos de UF dentro de cada estado
  useEffect(() => {
    if (!svgRef.current) return

    const paths = svgRef.current.querySelectorAll('[data-state-id]')
    paths.forEach((pathEl) => {
      const path = pathEl as SVGPathElement
      const stateId = path.getAttribute('data-state-id')
      const textEl = svgRef.current?.querySelector(
        `[data-text-for="${stateId}"]`,
      ) as SVGTextElement | null

      if (textEl && path.getTotalLength) {
        // Coleta múltiplos pontos ao longo do caminho para encontrar o centroide
        const samplePoints = 50
        let sumX = 0
        let sumY = 0
        const length = path.getTotalLength()

        for (let i = 0; i < samplePoints; i++) {
          const point = path.getPointAtLength((length * i) / samplePoints)
          sumX += point.x
          sumY += point.y
        }

        const centerX = sumX / samplePoints
        const centerY = sumY / samplePoints

        textEl.setAttribute('x', String(centerX))
        textEl.setAttribute('y', String(centerY))
      }
    })
  }, [])
  const handleKeyDown = (
    event: KeyboardEvent<SVGPathElement>,
    uf: string,
    name: string,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    onSelectState(uf, name)
  }

  return (
    <div className="panel active" id="panel-states">
      <div className="section-header">
        <div className="section-title">Selecione o Estado no mapa</div>
      </div>

      <div className="states-map-container">
        <svg
          aria-label="Mapa do Brasil com estados clicáveis"
          className="brazil-map"
          ref={svgRef}
          role="img"
          viewBox={brazilMap.viewBox}
        >
          {mapLocations.map((location) => {
            const uf = location.id.toUpperCase()
            const name = stateNameByUf.get(uf) ?? location.name
            const isSelected = selectedUf === uf

            return (
              <g key={location.id}>
                <path
                  aria-label={`Selecionar ${name}`}
                  aria-pressed={isSelected}
                  className={`map-state ${isSelected ? 'selected' : ''}`}
                  d={location.path}
                  data-state-id={location.id}
                  onClick={() => onSelectState(uf, name)}
                  onKeyDown={(event) => handleKeyDown(event, uf, name)}
                  role="button"
                  tabIndex={0}
                >
                  <title>{`${name} (${uf})`}</title>
                </path>
                <text
                  className="map-state-label"
                  data-text-for={location.id}
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

        <p className="states-map-hint">
          Clique em um estado para carregar os deputados da UF selecionada.
        </p>
      </div>

      <div className="states-list-container">
        <div className="section-title states-list-title">Ou selecione pela lista</div>
        <div className="state-grid">
          {STATES.map((state) => (
            <AppButton
              className={`state-btn ${selectedUf === state.uf ? 'selected' : ''}`}
              key={state.uf}
              onClick={() => onSelectState(state.uf, state.name)}
              type="button"
            >
              <span className="state-uf">{state.uf}</span>
              <span className="state-name">{state.name}</span>
            </AppButton>
          ))}
        </div>
      </div>
    </div>
  )
}
