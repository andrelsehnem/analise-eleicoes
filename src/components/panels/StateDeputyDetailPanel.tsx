import type { StateDeputy } from '../../types/camara'
import { FALLBACK_AVATAR } from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { Loader } from '../common/Loader'

type StateDeputyDetailPanelProps = {
  deputy: StateDeputy | null
  loading: boolean
  error: string
  onBack: () => void
}

export function StateDeputyDetailPanel({ deputy, loading, error, onBack }: StateDeputyDetailPanelProps) {
  const hasGeneralInfo = Boolean(deputy?.email || deputy?.telefone || deputy?.urlPerfil)

  return (
    <div className="panel active" id="panel-state-deputy-detail">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar
      </AppButton>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}
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
              <h1 className="deputy-detail-name">{deputy.nome}</h1>
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
