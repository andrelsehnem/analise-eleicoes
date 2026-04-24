import type { PresidentDetail } from '../../types/camara'
import { formatDate } from '../../utils/format'
import { FALLBACK_AVATAR } from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { ErrorBox } from '../common/ErrorBox'
import { Loader } from '../common/Loader'

type PresidentDetailPanelProps = {
  presidentDetail: PresidentDetail | null
  loading: boolean
  error: string
  onBack: () => void
}

function ensureUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return `https://${value}`
}

export function PresidentDetailPanel({
  presidentDetail,
  loading,
  error,
  onBack,
}: PresidentDetailPanelProps) {
  const canRenderContent = !error && Boolean(presidentDetail)

  return (
    <div className="panel active" id="panel-president-detail">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar para lista
      </AppButton>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}

      {canRenderContent && presidentDetail && (
        <PresidentDetailContent key={presidentDetail.id} presidentDetail={presidentDetail} />
      )}
    </div>
  )
}

type PresidentDetailContentProps = {
  presidentDetail: PresidentDetail
}

function PresidentDetailContent({ presidentDetail }: PresidentDetailContentProps) {
  const isViceProfile = presidentDetail.cargo.toLowerCase().includes('vice')
  const profileLabel = isViceProfile ? 'vice-presidente' : 'presidente'
  const mandatesTitle = isViceProfile ? 'Mandatos no Executivo' : 'Mandatos presidenciais'

  return (
    <>
      <div className="president-detail-layout">
        <div className="deputy-detail-header president-detail-header">
          <img
            className="deputy-detail-photo"
            src={presidentDetail.urlFoto || FALLBACK_AVATAR}
            alt={presidentDetail.nome}
            width={100}
            height={100}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_AVATAR
            }}
          />
          <div className="deputy-detail-info">
            <h1 className="deputy-detail-name">{presidentDetail.nome}</h1>
            {presidentDetail.descricao && (
              <div className="president-detail-subtitle">{presidentDetail.descricao}</div>
            )}
            <div className="deputy-tags">
              <span className="tag tag-party">🏛 {presidentDetail.siglaPartido}</span>
              <span className="tag tag-state">🇧🇷 {presidentDetail.abrangencia}</span>
              <span className="tag president-tag-term">🗓 {presidentDetail.periodo}</span>
            </div>
            <div className="deputy-extra">
              {presidentDetail.posseAtual
                ? `Posse atual: ${formatDate(presidentDetail.posseAtual)}`
                : ''}
              {presidentDetail.posseAtual && presidentDetail.dataNascimento ? ' · ' : ''}
              {presidentDetail.dataNascimento
                ? `Nascimento: ${formatDate(presidentDetail.dataNascimento)}`
                : ''}
            </div>
          </div>
        </div>

        {presidentDetail.vice && (
          <aside className="president-vice-card" aria-label="Vice-presidente atual">
            <div className="president-vice-card-label">Vice-presidente</div>
            <div className="president-vice-card-content">
              <img
                className="president-vice-photo"
                src={presidentDetail.vice.urlFoto || FALLBACK_AVATAR}
                alt={presidentDetail.vice.nome}
                width={72}
                height={72}
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_AVATAR
                }}
              />
              <div>
                <div className="president-vice-name">{presidentDetail.vice.nome}</div>
                <div className="president-vice-role">{presidentDetail.vice.cargo}</div>
                <div className="president-vice-meta">
                  {presidentDetail.vice.siglaPartido || 'Sem partido informado'}
                  {presidentDetail.vice.periodo ? ` · ${presidentDetail.vice.periodo}` : ''}
                </div>
                {presidentDetail.vice.officialWebsite && (
                  <a
                    className="deputy-general-link"
                    href={ensureUrl(presidentDetail.vice.officialWebsite)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Acessar página oficial do vice
                  </a>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      <section className="deputy-general-info" aria-label={`Informações gerais do ${profileLabel}`}>
        <h3 className="deputy-general-info-title">Informações gerais</h3>
        <div className="deputy-general-info-grid">
          {presidentDetail.nomeCivil && (
            <p className="deputy-general-item">
              <span className="deputy-general-label">Nome civil</span>
              <span className="deputy-general-value">{presidentDetail.nomeCivil}</span>
            </p>
          )}

          {presidentDetail.partido && (
            <p className="deputy-general-item">
              <span className="deputy-general-label">Partido</span>
              <span className="deputy-general-value">{presidentDetail.partido}</span>
            </p>
          )}

          {presidentDetail.dataNascimento && (
            <p className="deputy-general-item">
              <span className="deputy-general-label">Nascimento</span>
              <span className="deputy-general-value">
                {formatDate(presidentDetail.dataNascimento)}
              </span>
            </p>
          )}

          {presidentDetail.naturalidade && (
            <p className="deputy-general-item">
              <span className="deputy-general-label">Naturalidade</span>
              <span className="deputy-general-value">{presidentDetail.naturalidade}</span>
            </p>
          )}

          {presidentDetail.posseAtual && (
            <p className="deputy-general-item">
              <span className="deputy-general-label">Posse atual</span>
              <span className="deputy-general-value">
                {formatDate(presidentDetail.posseAtual)}
              </span>
            </p>
          )}

          {presidentDetail.vice && (
            <p className="deputy-general-item">
              <span className="deputy-general-label">Vice-presidente atual</span>
              <span className="deputy-general-value">{presidentDetail.vice.nome}</span>
            </p>
          )}

          {presidentDetail.officialWebsite && (
            <p className="deputy-general-item">
              <span className="deputy-general-label">Site oficial</span>
              <a
                className="deputy-general-link"
                href={ensureUrl(presidentDetail.officialWebsite)}
                target="_blank"
                rel="noreferrer"
              >
                {presidentDetail.officialWebsite}
              </a>
            </p>
          )}
        </div>
      </section>

      <section className="president-section-card" aria-label={`Resumo do ${profileLabel}`}>
        <h3 className="deputy-general-info-title">Resumo público</h3>
        <p className="president-summary">{presidentDetail.resumo}</p>
        {presidentDetail.fonteResumoUrl && (
          <a
            className="president-source-link"
            href={ensureUrl(presidentDetail.fonteResumoUrl)}
            target="_blank"
            rel="noreferrer"
          >
            Ver fonte do resumo
          </a>
        )}
      </section>

      <div className="president-section-grid">
        <section className="president-section-card" aria-label={mandatesTitle}>
          <h3 className="deputy-general-info-title">{mandatesTitle}</h3>
          <div className="president-term-list">
            {presidentDetail.mandatos.map((mandato) => (
              <article className="president-term-item" key={`${mandato.titulo}-${mandato.inicio}`}>
                <div className="president-term-title">{mandato.titulo}</div>
                <div className="president-term-period">
                  {formatDate(mandato.inicio)}
                  {mandato.fim ? ` até ${formatDate(mandato.fim)}` : ' até o momento'}
                </div>
                {mandato.vice && (
                  <div className="president-term-meta">Vice: {mandato.vice}</div>
                )}
                {mandato.resumo && (
                  <p className="president-term-summary">{mandato.resumo}</p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="president-section-card" aria-label="Links e fontes">
          <h3 className="deputy-general-info-title">Links e fontes</h3>
          <div className="president-links-list">
            {presidentDetail.links.map((link) => (
              <a
                className="tag tag-social president-link-chip"
                href={ensureUrl(link.url)}
                key={link.url}
                target="_blank"
                rel="noreferrer"
              >
                🔗 {link.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
