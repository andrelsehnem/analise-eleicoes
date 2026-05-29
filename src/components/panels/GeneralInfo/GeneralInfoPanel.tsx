import { Link } from 'react-router-dom'
import type {
  GeneralInfoOfficeStats,
  GeneralInfoPartyCount,
  GeneralInfoStateStats,
  GeneralInfoStatistics,
} from '../../../types/camara'
import { AppButton } from '../../common/AppButton'
import { EmptyState } from '../../common/EmptyState'
import { ErrorBox } from '../../common/ErrorBox'
import { Loader } from '../../common/Loader'
import { getOfficeLabel } from '../../../hooks/useGeneralInfo'
import './GeneralInfoPanel.css'

type StateOption = {
  uf: string
  name: string
}

type GeneralInfoPanelProps = {
  selectedUf: string
  selectedStateName: string
  stateSearch: string
  stateOptions: StateOption[]
  stats: GeneralInfoStatistics | null
  officeStats: GeneralInfoOfficeStats[]
  selectedStateStats: GeneralInfoStateStats | null
  loading: boolean
  error: string
  onStateSearchChange: (value: string) => void
  onClearSelectedUf: () => void
  onBack: () => void
}

const NUMBER_FORMATTER = new Intl.NumberFormat('pt-BR')

function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

function PartyList({ parties }: { parties: GeneralInfoPartyCount[] }) {
  const topParties = parties.slice(0, 10)

  if (topParties.length === 0) {
    return <EmptyState icon="🏛️" message="Nenhum partido encontrado para este recorte." />
  }

  return (
    <div className="general-info-party-list" role="list" aria-label="Partidos por quantidade">
      {topParties.map((party) => (
        <div className="general-info-party-item" key={party.partido} role="listitem">
          <div>
            <div className="general-info-party-name">{party.partido}</div>
            <div className="general-info-party-percent">{formatPercent(party.percentual)}</div>
          </div>
          <div className="general-info-party-total">{formatNumber(party.total)}</div>
        </div>
      ))}
    </div>
  )
}

export function GeneralInfoPanel({
  selectedUf,
  selectedStateName,
  stateSearch,
  stateOptions,
  stats,
  officeStats,
  selectedStateStats,
  loading,
  error,
  onStateSearchChange,
  onClearSelectedUf,
  onBack,
}: GeneralInfoPanelProps) {
  const stateScopeLabel = selectedUf ? `${selectedStateName} (${selectedUf})` : 'Brasil'
  const totalInScope = selectedStateStats?.total ?? stats?.totalPoliticos ?? 0
  const partiesInScope = selectedStateStats?.porPartido.length ?? stats?.totalPartidosUnicos ?? 0

  const officeScope = selectedStateStats
    ? officeStats.map((office) => ({
        cargo: office.cargo,
        total: selectedStateStats.porCargo[office.cargo].total,
        percentual: selectedStateStats.porCargo[office.cargo].percentualNoEstado,
      }))
    : officeStats.map((office) => ({
        cargo: office.cargo,
        total: office.total,
        percentual: office.percentualDoTotal,
      }))

  return (
    <div className="panel active" id="panel-general-info">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar
      </AppButton>

      <div className="section-header">
        <h1 className="section-title" id="general-info-title">
          Informações gerais por estado
        </h1>
        <div className="section-count" id="general-info-count">
          {formatNumber(totalInScope)} político{totalInScope === 1 ? '' : 's'}
        </div>
      </div>

      <p className="president-panel-description">
        Consulte totais por UF e por cargo com base no índice local da aplicação, com distribuição
        por partido e destaques nacionais.
      </p>

      <div className="search-box">
        <span className="search-icon">🔎</span>
        <input
          type="text"
          id="general-info-state-search"
          placeholder="Buscar UF ou nome do estado..."
          value={stateSearch}
          onChange={(event) => onStateSearchChange(event.target.value)}
        />
      </div>

      <div className="general-info-state-actions">
        <Link className={`state-btn ${selectedUf ? '' : 'selected'}`} to="/informacoes-gerais">
          <span className="state-uf">BR</span>
          <span className="state-name">Visão nacional</span>
        </Link>
        {selectedUf && (
          <button className="party-filter-clear" type="button" onClick={onClearSelectedUf}>
            Limpar UF selecionada
          </button>
        )}
      </div>

      <div className="state-grid general-info-state-grid">
        {stateOptions.map((state) => (
          <Link
            className={`state-btn ${selectedUf === state.uf ? 'selected' : ''}`}
            key={state.uf}
            to={`/informacoes-gerais/${state.uf.toLowerCase()}`}
          >
            <span className="state-uf">{state.uf}</span>
            <span className="state-name">{state.name}</span>
          </Link>
        ))}
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}
      {!loading && !error && !stats && (
        <EmptyState icon="📊" message="Não foi possível carregar as informações gerais." />
      )}

      {!loading && !error && stats && (
        <>
          <section className="general-info-section" aria-labelledby="general-info-scope-title">
            <h2 className="section-title" id="general-info-scope-title">
              Recorte atual: {stateScopeLabel}
            </h2>
            <div className="general-info-kpi-grid">
              <article className="general-info-kpi-card">
                <div className="general-info-kpi-label">Total de políticos</div>
                <div className="general-info-kpi-value">{formatNumber(totalInScope)}</div>
              </article>
              <article className="general-info-kpi-card">
                <div className="general-info-kpi-label">Partidos no recorte</div>
                <div className="general-info-kpi-value">{formatNumber(partiesInScope)}</div>
              </article>
              <article className="general-info-kpi-card">
                <div className="general-info-kpi-label">Média por UF (Brasil)</div>
                <div className="general-info-kpi-value">{stats.mediaPoliticosPorUf.toFixed(1)}</div>
              </article>
              <article className="general-info-kpi-card">
                <div className="general-info-kpi-label">UF com maior quantidade</div>
                <div className="general-info-kpi-value">
                  {stats.destaques.ufComMaiorQuantidade?.uf || 'N/D'}
                </div>
                <div className="general-info-kpi-subvalue">
                  {stats.destaques.ufComMaiorQuantidade
                    ? `${formatNumber(stats.destaques.ufComMaiorQuantidade.total)} políticos`
                    : 'Sem dados'}
                </div>
              </article>
            </div>
          </section>

          <section className="general-info-section" aria-labelledby="general-info-office-title">
            <h2 className="section-title" id="general-info-office-title">
              Quantidade por cargo
            </h2>
            <div className="general-info-office-grid">
              {officeScope.map((office) => (
                <article className="general-info-office-card" key={office.cargo}>
                  <div className="general-info-office-label">{getOfficeLabel(office.cargo)}</div>
                  <div className="general-info-office-total">{formatNumber(office.total)}</div>
                  <div className="general-info-office-percent">{formatPercent(office.percentual)}</div>
                </article>
              ))}
            </div>
          </section>

          <section className="general-info-section" aria-labelledby="general-info-party-title">
            <h2 className="section-title" id="general-info-party-title">
              Quantidade por partido (top 10)
            </h2>
            <PartyList parties={selectedStateStats?.porPartido ?? stats.porPartido} />
          </section>
        </>
      )}
    </div>
  )
}
