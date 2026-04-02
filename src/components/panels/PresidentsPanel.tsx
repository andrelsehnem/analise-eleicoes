import type { President } from '../../types/camara'
import { FALLBACK_AVATAR } from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { Loader } from '../common/Loader'

type PresidentDirectoryCard = {
  id: string
  nome: string
  cargo: string
  siglaPartido: string
  periodo: string
  urlFoto?: string
  onClick?: () => void
}

type PresidentsPanelProps = {
  search: string
  onSearchChange: (value: string) => void
  loading: boolean
  error: string
  presidents: President[]
  onBack: () => void
  onSelectPresident: (id: string) => void
}

export function PresidentsPanel({
  search,
  onSearchChange,
  loading,
  error,
  presidents,
  onBack,
  onSelectPresident,
}: PresidentsPanelProps) {
  const directoryCards: PresidentDirectoryCard[] = presidents.flatMap((president) => {
    const presidentCard: PresidentDirectoryCard = {
      id: president.id,
      nome: president.nome,
      cargo: president.cargo,
      siglaPartido: president.siglaPartido,
      periodo: president.periodo,
      urlFoto: president.urlFoto,
      onClick: () => onSelectPresident(president.id),
    }

    const viceCard: PresidentDirectoryCard[] = president.vice
      ? [
          {
            id: president.vice.id,
            nome: president.vice.nome,
            cargo: president.vice.cargo,
            siglaPartido: president.vice.siglaPartido || 'Partido não informado',
            periodo: president.vice.periodo || president.periodo,
            urlFoto: president.vice.urlFoto,
            onClick: () => onSelectPresident(president.vice!.id),
          },
        ]
      : []

    return [presidentCard, ...viceCard]
  })

  return (
    <div className="panel active" id="panel-presidents">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar
      </AppButton>

      <div className="section-header">
        <div className="section-title" id="presidents-title">
          Presidência da República
        </div>
        <div className="section-count" id="presidents-count">
          {directoryCards.length} cargo{directoryCards.length === 1 ? '' : 's'}
        </div>
      </div>

      <p className="president-panel-description">
        Consulte o presidente e o vice-presidente atuais, com acesso rápido ao mandato,
        partido e fontes públicas relacionadas.
      </p>

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          id="president-search"
          placeholder="Buscar por nome, cargo ou partido do presidente e vice..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}

      {!loading && !error && presidents.length === 0 && (
        <EmptyState icon="🇧🇷" message="Nenhum presidente encontrado." />
      )}

      {!loading && !error && directoryCards.length > 0 && (
        <div className="deputy-grid">
          {directoryCards.map((card) => {
            const content = (
              <>
                <img
                  className="deputy-photo"
                  src={card.urlFoto || FALLBACK_AVATAR}
                  alt={card.nome}
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_AVATAR
                  }}
                />
                <div className="deputy-info">
                  <div className="deputy-name">{card.nome}</div>
                  <div className="deputy-party">{card.siglaPartido}</div>
                  <div className="deputy-meta">
                    {card.cargo} · {card.periodo}
                  </div>
                  <div className="president-card-link">Abrir perfil detalhado</div>
                </div>
                <div className="deputy-arrow">›</div>
              </>
            )

            return (
              <AppButton
                className="deputy-card president-card"
                key={card.id}
                onClick={card.onClick}
                type="button"
              >
                {content}
              </AppButton>
            )
          })}
        </div>
      )}
    </div>
  )
}
