import type { FavoritePolitician, StateDeputy } from '../../types/camara'
import { FALLBACK_AVATAR } from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { FavoriteStarButton } from '../common/FavoriteStarButton'
import { Loader } from '../common/Loader'

type StateDeputyDetailPanelProps = {
  deputy: StateDeputy | null
  loading: boolean
  error: string
  favorite: FavoritePolitician | null
  isFavorite: boolean
  canFavorite: boolean
  savingFavorite: boolean
  favoritesError: string
  onBack: () => void
  onToggleFavorite: () => void
  onClearFavoritesError: () => void
}

export function StateDeputyDetailPanel({
  deputy,
  loading,
  error,
  favorite,
  isFavorite,
  canFavorite,
  savingFavorite,
  favoritesError,
  onBack,
  onToggleFavorite,
  onClearFavoritesError,
}: StateDeputyDetailPanelProps) {
  const hasGeneralInfo = Boolean(deputy?.email || deputy?.telefone || deputy?.urlPerfil)

  return (
    <div className="panel active" id="panel-state-deputy-detail">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar
      </AppButton>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}
      {favoritesError && (
        <div className="search-favorites-error-wrap">
          <ErrorBox message={favoritesError} />
          <button className="party-filter-clear" type="button" onClick={onClearFavoritesError}>
            Fechar
          </button>
        </div>
      )}
      {!loading && !error && !deputy && (
        <EmptyState icon="📭" message="Não foi possível carregar os dados deste deputado estadual." />
      )}

      {!loading && !error && deputy && (
        <>
          <div className="deputy-detail-header">
            <img
              className="deputy-detail-photo"
              src={deputy.urlFoto || FALLBACK_AVATAR}
              alt={deputy.nome}
              width={100}
              height={100}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_AVATAR
              }}
            />
            <div className="deputy-detail-info">
              <div className="detail-name-row">
                <h1 className="deputy-detail-name">{deputy.nome}</h1>
                {favorite && (
                  <FavoriteStarButton
                    isActive={isFavorite}
                    canFavorite={canFavorite}
                    disabled={savingFavorite}
                    onToggle={onToggleFavorite}
                  />
                )}
              </div>
              <div className="deputy-tags">
                <span className="tag tag-party">🏛 {deputy.siglaPartido || 'Sem partido'}</span>
                <span className="tag tag-state">📍 {deputy.siglaUf}</span>
              </div>
              <div className="deputy-extra">Deputado estadual · Dados públicos oficiais</div>
            </div>
          </div>

          {hasGeneralInfo && (
            <section className="deputy-general-info" aria-label="Informações gerais do deputado estadual">
              <h3 className="deputy-general-info-title">Informações gerais</h3>
              <div className="deputy-general-info-grid">
                {deputy.email && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">E-mail</span>
                    <span className="deputy-general-value">{deputy.email}</span>
                  </p>
                )}

                {deputy.telefone && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Telefone</span>
                    <span className="deputy-general-value">{deputy.telefone}</span>
                  </p>
                )}

                {deputy.urlPerfil && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Perfil oficial</span>
                    <a className="deputy-general-link" href={deputy.urlPerfil} target="_blank" rel="noreferrer noopener">
                      Ver na assembleia legislativa
                    </a>
                  </p>
                )}
              </div>
            </section>
          )}

          {!hasGeneralInfo && (
            <EmptyState
              icon="ℹ️"
              message="Ainda não há dados detalhados disponíveis neste perfil. Use o link oficial da assembleia quando disponível."
            />
          )}
        </>
      )}
    </div>
  )
}
