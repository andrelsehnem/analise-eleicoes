import brazilMap from '@svg-maps/brazil'
import type { KeyboardEvent } from 'react'
import { useEffect, useRef } from 'react'
import { STATES } from '../../constants/states'
import type { OfficeType } from '../../types/camara'
import { AppButton } from '../common/AppButton'

type StatesPanelProps = {
  selectedUf: string | null
  selectedOffice: OfficeType
  onChangeOffice: (office: OfficeType) => void
  onSelectState: (uf: string, name: string) => void
}

const OFFICE_OPTIONS: Array<{ value: OfficeType; label: string; implemented: boolean }> = [
  { value: 'deputado-federal', label: 'Deputado Federal', implemented: true },
  { value: 'deputado-estadual', label: 'Deputado Estadual', implemented: false },
  { value: 'senador', label: 'Senador', implemented: false },
  { value: 'presidente', label: 'Presidente', implemented: true },
]

const OFFICE_BADGE_VARIANT: 'discrete' | 'highlight' = 'discrete'

const stateNameByUf = new Map(STATES.map((state) => [state.uf, state.name]))

type BrazilLocation = {
  id: string
  name: string
  path: string
}

const mapLocations = brazilMap.locations as BrazilLocation[]

export function StatesPanel({
  selectedUf,
  selectedOffice,
  onChangeOffice,
  onSelectState,
}: StatesPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const isStateSelectionEnabled = selectedOffice === 'deputado-federal'

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
    if (!isStateSelectionEnabled) {
      return
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    onSelectState(uf, name)
  }

  return (
    <div className="panel active" id="panel-states">
      <div className="section-header">
        <h1 className="section-title">Selecione o tipo e o estado</h1>
      </div>

      <p className="president-panel-description">
        Escolha um cargo e uma UF para abrir uma consulta pública com dados oficiais. Este fluxo
        ajuda a comparar representantes por estado antes da decisão de voto.
      </p>

      <div className="office-filter-container">
        <div className="office-filter-label">Tipo de cargo</div>
        <div className="office-filter-buttons" role="group" aria-label="Tipo de cargo">
          {OFFICE_OPTIONS.map((option) => (
            <AppButton
              key={option.value}
              type="button"
              className={`office-filter-btn ${selectedOffice === option.value ? 'selected' : ''}`}
              aria-pressed={selectedOffice === option.value}
              onClick={() => onChangeOffice(option.value)}
            >
              <span>{option.label}</span>
              {!option.implemented && (
                <span
                  className={`office-filter-badge office-filter-badge--${OFFICE_BADGE_VARIANT}`}
                  aria-label="Recurso em breve"
                >
                  {OFFICE_BADGE_VARIANT === 'highlight' ? '⏳ Em breve' : 'Em breve'}
                </span>
              )}
            </AppButton>
          ))}
        </div>
      </div>

      <div className={`states-map-container ${!isStateSelectionEnabled ? 'is-disabled' : ''}`}>
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
                  aria-disabled={!isStateSelectionEnabled}
                  aria-pressed={isSelected}
                  className={`map-state ${isSelected ? 'selected' : ''} ${
                    !isStateSelectionEnabled ? 'disabled' : ''
                  }`}
                  d={location.path}
                  data-state-id={location.id}
                  onClick={() => {
                    if (!isStateSelectionEnabled) {
                      return
                    }

                    onSelectState(uf, name)
                  }}
                  onKeyDown={(event) => handleKeyDown(event, uf, name)}
                  role="button"
                  tabIndex={isStateSelectionEnabled ? 0 : -1}
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
          {isStateSelectionEnabled
            ? 'Clique em um estado para carregar os deputados federais da UF selecionada.'
            : 'Consulta por este cargo estará disponível em breve. No momento, a busca por estado está disponível para Deputado Federal.'}
        </p>
      </div>

      <div className="states-list-container">
        <h2 className="section-title states-list-title">Ou selecione pela lista</h2>
        <div className="state-grid">
          {STATES.map((state) => (
            <AppButton
              className={`state-btn ${selectedUf === state.uf ? 'selected' : ''}`}
              disabled={!isStateSelectionEnabled}
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
