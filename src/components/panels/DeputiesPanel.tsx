import type { Deputy } from '../../types/camara'
import { Link } from 'react-router-dom'
import { FALLBACK_AVATAR } from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { Loader } from '../common/Loader'

type DeputiesPanelProps = {
  stateName: string
  allDeputiesCount: number
  search: string
  onSearchChange: (value: string) => void
  loading: boolean
  error: string
  deputies: Deputy[]
  onBack: () => void
}

export function DeputiesPanel({
  stateName,
  allDeputiesCount,
  search,
  onSearchChange,
  loading,
  error,
  deputies,
  onBack,
}: DeputiesPanelProps) {
  return (
    <div className="panel active" id="panel-deputies">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar
      </AppButton>

      <div className="section-header">
        <h1 className="section-title" id="deputies-title">
          Deputados do {stateName}
        </h1>
        <div className="section-count" id="deputies-count">
          {allDeputiesCount} deputados
        </div>
      </div>

      <p className="president-panel-description">
        Filtre por nome ou partido para encontrar deputados federais da UF selecionada e acessar
        o perfil completo de atuação legislativa.
      </p>

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          id="deputy-search"
          placeholder="Buscar por nome ou partido..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}

      {!loading && !error && deputies.length === 0 && (
        <EmptyState icon="🔍" message="Nenhum deputado encontrado." />
      )}

      {!loading && !error && deputies.length > 0 && (
        <div className="deputy-grid">
          {deputies.map((deputy) => (
            <Link
              className="deputy-card"
              key={deputy.id}
              state={{ selectedDeputy: deputy }}
              to={`/por-estado/${deputy.siglaUf.toLowerCase()}/deputado-federal/${deputy.id}`}
            >
              <img
                className="deputy-photo"
                src={deputy.urlFoto || FALLBACK_AVATAR}
                alt={deputy.nome}
                width={60}
                height={60}
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_AVATAR
                }}
              />
              <div className="deputy-info">
                <div className="deputy-name">{deputy.nome}</div>
                <div className="deputy-party">{deputy.siglaPartido}</div>
                <div className="deputy-meta">
                  {deputy.siglaUf} · {deputy.email || 'sem e-mail'}
                </div>
              </div>
              <div className="deputy-arrow">›</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
