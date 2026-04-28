import type { Senator } from '../../types/camara'
import { FALLBACK_AVATAR } from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { Loader } from '../common/Loader'

type SenatorsPanelProps = {
  stateName: string
  allSenatorsCount: number
  search: string
  onSearchChange: (value: string) => void
  loading: boolean
  error: string
  senators: Senator[]
  onBack: () => void
  onSelectSenator: (senator: Senator) => void
}

export function SenatorsPanel({
  stateName,
  allSenatorsCount,
  search,
  onSearchChange,
  loading,
  error,
  senators,
  onBack,
  onSelectSenator,
}: SenatorsPanelProps) {
  return (
    <div className="panel active" id="panel-senators">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar
      </AppButton>

      <div className="section-header">
        <h1 className="section-title" id="senators-title">
          Senadores de {stateName}
        </h1>
        <div className="section-count" id="senators-count">
          {allSenatorsCount} senador{allSenatorsCount === 1 ? '' : 'es'}
        </div>
      </div>

      <p className="president-panel-description">
        Filtre por nome ou partido para encontrar senadores da UF selecionada e abrir o perfil
        com dados públicos de atuação no Senado.
      </p>

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          id="senator-search"
          placeholder="Buscar por nome ou partido..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}

      {!loading && !error && senators.length === 0 && (
        <EmptyState icon="🔎" message="Nenhum senador encontrado." />
      )}

      {!loading && !error && senators.length > 0 && (
        <div className="deputy-grid">
          {senators.map((senator) => (
            <AppButton
              className="deputy-card"
              key={senator.id}
              onClick={() => onSelectSenator(senator)}
              type="button"
            >
              <img
                className="deputy-photo"
                src={senator.urlFoto || FALLBACK_AVATAR}
                alt={senator.nome}
                width={60}
                height={60}
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_AVATAR
                }}
              />
              <div className="deputy-info">
                <div className="deputy-name">{senator.nome}</div>
                <div className="deputy-party">{senator.siglaPartido}</div>
                <div className="deputy-meta">
                  {senator.siglaUf} · {senator.email || 'sem e-mail'}
                </div>
              </div>
              <div className="deputy-arrow">›</div>
            </AppButton>
          ))}
        </div>
      )}
    </div>
  )
}
