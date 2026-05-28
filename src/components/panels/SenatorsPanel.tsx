import type { Senator } from '../../types/camara'
import { Link } from 'react-router-dom'
import { FALLBACK_AVATAR } from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { FavoriteStarButton } from '../common/FavoriteStarButton'
import { Loader } from '../common/Loader'

type SenatorsPanelProps = {
  stateName: string
  allSenatorsCount: number
  search: string
  onSearchChange: (value: string) => void
  loading: boolean
  error: string
  senators: Senator[]
  favoriteKeys: Set<string>
  canFavorite: boolean
  savingFavorite: boolean
  favoritesError: string
  onToggleFavorite: (senator: Senator) => Promise<void>
  onClearFavoritesError: () => void
  onBack: () => void
}

function getFavoriteKey(senator: Senator): string {
  return `senadores:${senator.id}`
}

export function SenatorsPanel({
  stateName,
  allSenatorsCount,
  search,
  onSearchChange,
  loading,
  error,
  senators,
  favoriteKeys,
  canFavorite,
  savingFavorite,
  favoritesError,
  onToggleFavorite,
  onClearFavoritesError,
  onBack,
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
            <Link
              className="deputy-card"
              key={senator.id}
              state={{ selectedUf: senator.siglaUf.toUpperCase() }}
              to={`/senador/${senator.id}`}
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
                <div className="deputy-name-row">
                  <div className="deputy-name">{senator.nome}</div>
                  <FavoriteStarButton
                    isActive={favoriteKeys.has(getFavoriteKey(senator))}
                    canFavorite={canFavorite}
                    disabled={savingFavorite}
                    onToggle={() => {
                      void onToggleFavorite(senator)
                    }}
                  />
                </div>
                <div className="deputy-party">{senator.siglaPartido}</div>
                <div className="deputy-meta">
                  {senator.siglaUf} · {senator.email || 'sem e-mail'}
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
