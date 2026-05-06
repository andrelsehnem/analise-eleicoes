import { Link } from 'react-router-dom'
import type { GlobalSearchItem } from '../../types/camara'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { Loader } from '../common/Loader'

type OfficeOption = {
  value: string
  label: string
}

type SearchPanelProps = {
  search: string
  selectedParty: string
  selectedOffice: string
  parties: string[]
  offices: OfficeOption[]
  totalCount: number
  loading: boolean
  error: string
  results: GlobalSearchItem[]
  onSearchChange: (value: string) => void
  onSelectParty: (party: string) => void
  onSelectOffice: (office: string) => void
  onClearParty: () => void
  onClearOffice: () => void
  onBack: () => void
}

function getCardSubtitle(item: GlobalSearchItem): string {
  if (item.grupo === 'deputados-federais') {
    return `Deputado federal · ${item.estado}`
  }

  if (item.grupo === 'deputados-estaduais') {
    return `Deputado estadual · ${item.estado}`
  }

  return `Senador · ${item.estado || 'UF não informada'}`
}

function getResultLink(item: GlobalSearchItem): string {
  if (item.grupo === 'deputados-federais') {
    return `/por-estado/${item.estado.toLowerCase()}/deputado-federal/${item.id}`
  }

  if (item.grupo === 'deputados-estaduais') {
    return `/por-estado/${item.estado.toLowerCase()}/deputado-estadual/${item.id}`
  }

  return `/senador/${item.id}`
}

export function SearchPanel({
  search,
  selectedParty,
  selectedOffice,
  parties,
  offices,
  totalCount,
  loading,
  error,
  results,
  onSearchChange,
  onSelectParty,
  onSelectOffice,
  onClearParty,
  onClearOffice,
  onBack,
}: SearchPanelProps) {
  const shouldShowHint = !loading && !error && !search.trim() && !selectedParty && !selectedOffice

  return (
    <div className="panel active" id="panel-global-search">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar
      </AppButton>

      <div className="section-header">
        <h1 className="section-title" id="global-search-title">
          Busca por nome, partido e cargo
        </h1>
        <div className="section-count" id="global-search-count">
          {totalCount} resultado{totalCount === 1 ? '' : 's'}
        </div>
      </div>

      <p className="president-panel-description">
        Digite o nome do político para busca em tempo real e refine os resultados por partido e cargo.
      </p>

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          id="global-search-input"
          placeholder="Buscar por nome, partido ou cargo..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="party-filter-wrap">
        <div className="party-filter-header">
          <span className="party-filter-title">Cargos</span>
          {selectedOffice && (
            <button className="party-filter-clear" type="button" onClick={onClearOffice}>
              Limpar
            </button>
          )}
        </div>
        <div className="party-filter-list" role="listbox" aria-label="Filtrar por cargo">
          {offices.map((office) => (
            <button
              key={office.value}
              type="button"
              className={`party-chip ${selectedOffice === office.value ? 'active' : ''}`}
              onClick={() => onSelectOffice(office.value)}
            >
              {office.label}
            </button>
          ))}
        </div>
      </div>

      <div className="party-filter-wrap">
        <div className="party-filter-header">
          <span className="party-filter-title">Partidos</span>
          {selectedParty && (
            <button className="party-filter-clear" type="button" onClick={onClearParty}>
              Limpar
            </button>
          )}
        </div>
        <div className="party-filter-list" role="listbox" aria-label="Filtrar por partido">
          {parties.map((party) => (
            <button
              key={party}
              type="button"
              className={`party-chip ${selectedParty === party ? 'active' : ''}`}
              onClick={() => onSelectParty(party)}
            >
              {party}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}

      {shouldShowHint && (
        <EmptyState
          icon="🔎"
          message="Digite um nome ou clique em um cargo ou partido para começar a busca global."
        />
      )}

      {!loading && !error && !shouldShowHint && results.length === 0 && (
        <EmptyState icon="📭" message="Nenhum político encontrado com os filtros informados." />
      )}

      {!loading && !error && results.length > 0 && (
        <div className="deputy-grid">
          {results.map((item) => (
            <Link
              className="deputy-card"
              key={`${item.grupo}-${item.id}`}
              state={
                item.grupo === 'senadores' && item.estado
                  ? { selectedUf: item.estado.toUpperCase(), fromGlobalSearch: true }
                  : { fromGlobalSearch: true }
              }
              to={getResultLink(item)}
            >
              <div className="deputy-info">
                <div className="deputy-name">{item.nome}</div>
                <div className="deputy-party">{item.partido}</div>
                <div className="deputy-meta">{getCardSubtitle(item)}</div>
              </div>
              <div className="deputy-arrow">›</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
