import { Link } from 'react-router-dom'
import type { StateDeputy } from '../../types/camara'
import { FALLBACK_AVATAR } from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { FavoriteStarButton } from '../common/FavoriteStarButton'
import { Loader } from '../common/Loader'

type StateDeputiesPanelProps = {
  stateName: string
  allDeputiesCount: number
  search: string
  onSearchChange: (value: string) => void
  loading: boolean
  error: string
  deputies: StateDeputy[]
  favoriteKeys: Set<string>
  canFavorite: boolean
  savingFavorite: boolean
  favoritesError: string
  onToggleFavorite: (deputy: StateDeputy) => Promise<void>
  onClearFavoritesError: () => void
  onBack: () => void
}

function getFavoriteKey(deputy: StateDeputy): string {
  return `deputados-estaduais:${deputy.id}`
}

export function StateDeputiesPanel({
  stateName,
  allDeputiesCount,
  search,
  onSearchChange,
  loading,
  error,
  deputies,
  favoriteKeys,
  canFavorite,
  savingFavorite,
  favoritesError,
  onToggleFavorite,
  onClearFavoritesError,
  onBack,
}: StateDeputiesPanelProps) {
  return (
    <div className="panel active" id="panel-state-deputies">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar
      </AppButton>

      <div className="section-header">
        <h1 className="section-title">Deputados estaduais de {stateName}</h1>
        <div className="section-count">{allDeputiesCount} deputados</div>
      </div>

      <p className="president-panel-description">
        Filtre por nome ou partido para encontrar deputados estaduais da UF selecionada.
      </p>

      {!canFavorite && (
        <p className="search-favorites-hint" role="status" aria-live="polite">
          Entre na sua conta para favoritar políticos.
        </p>
      )}

      {favoritesError && (
        <div className="search-favorites-error-wrap">
          <ErrorBox message={favoritesError} />
          <button className="party-filter-clear" type="button" onClick={onClearFavoritesError}>
            Fechar
          </button>
        </div>
      )}

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          id="state-deputy-search"
          placeholder="Buscar por nome ou partido..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}

      {!loading && !error && deputies.length === 0 && (
        <EmptyState icon="🔍" message="Nenhum deputado estadual encontrado." />
      )}

      {!loading && !error && deputies.length > 0 && (
        <div className="deputy-grid">
          {deputies.map((deputy) => (
            <Link
              className="deputy-card"
              key={deputy.id}
              state={{ selectedDeputy: deputy }}
              to={`/por-estado/${deputy.siglaUf.toLowerCase()}/deputado-estadual/${deputy.id}`}
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
                <div className="deputy-name-row">
                  <div className="deputy-name">{deputy.nome}</div>
                  <FavoriteStarButton
                    isActive={favoriteKeys.has(getFavoriteKey(deputy))}
                    canFavorite={canFavorite}
                    disabled={savingFavorite}
                    onToggle={() => {
                      void onToggleFavorite(deputy)
                    }}
                  />
                </div>
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
