import type { PresidentialCandidate } from '../../../types/camara'
import { Link } from 'react-router-dom'
import { FALLBACK_AVATAR } from '../../../utils/ui'
import { AppButton } from '../../common/AppButton'
import { EmptyState } from '../../common/EmptyState'
import { ErrorBox } from '../../common/ErrorBox'
import { Loader } from '../../common/Loader'
import './Candidates2026PresidentsPanel.css'

type Candidates2026PresidentsPanelProps = {
  allCandidatesCount: number
  candidates: PresidentialCandidate[]
  error: string
  loading: boolean
  search: string
  onBack: () => void
  onSearchChange: (value: string) => void
}

export function Candidates2026PresidentsPanel({
  allCandidatesCount,
  candidates,
  error,
  loading,
  search,
  onBack,
  onSearchChange,
}: Candidates2026PresidentsPanelProps) {
  return (
    <div className="panel active candidates-presidents" id="panel-candidates-presidents">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar
      </AppButton>

      <div className="section-header">
        <h1 className="section-title" id="candidates-presidents-title">
          Candidatos à Presidência em 2026
        </h1>
        <div className="section-count" aria-live="polite">
          {allCandidatesCount} candidatura{allCandidatesCount === 1 ? '' : 's'}
        </div>
      </div>

      <p className="president-panel-description">
        Consulte os pedidos de candidatura publicados pela Justiça Eleitoral e abra o perfil
        oficial para conferir a situação atualizada.
      </p>

      <div className="candidates-presidents-source" role="note">
        <span aria-hidden="true">🏛️</span>
        <span>
          Fonte: Tribunal Superior Eleitoral — DivulgaCandContas. Os registros podem estar em
          análise e sofrer atualizações.
        </span>
      </div>

      <div className="search-box">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          aria-label="Buscar candidato à Presidência"
          id="presidential-candidate-search"
          placeholder="Buscar por nome, número, partido ou coligação..."
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {loading && <Loader message="Consultando candidaturas no TSE..." />}
      {!loading && error && <ErrorBox message={error} />}

      {!loading && !error && candidates.length === 0 && (
        <EmptyState icon="🔍" message="Nenhuma candidatura encontrada para esta busca." />
      )}

      {!loading && !error && candidates.length > 0 && (
        <div className="deputy-grid" aria-label="Candidatos à Presidência">
          {candidates.map((candidate) => (
            <Link
              aria-label={`Abrir perfil de ${candidate.nomeUrna}`}
              className="deputy-card candidates-presidents-card"
              key={candidate.id}
              state={{ selectedCandidate: candidate }}
              to={`/candidatos-2026/presidente/${candidate.id}`}
            >
              <img
                alt={candidate.nomeUrna}
                className="deputy-photo"
                height={60}
                loading="lazy"
                src={candidate.fotoUrl || FALLBACK_AVATAR}
                width={60}
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_AVATAR
                }}
              />
              <div className="deputy-info">
                <div className="deputy-name">{candidate.nomeUrna}</div>
                <div className="candidates-presidents-full-name">{candidate.nomeCompleto}</div>
                <div className="deputy-party">
                  {candidate.numero} · {candidate.partido || 'Partido não informado'}
                </div>
                <div className="deputy-meta">
                  {candidate.situacao || candidate.situacaoTotalizacao || 'Situação não informada'}
                </div>
                <div className="candidates-presidents-official-link">Abrir perfil detalhado</div>
              </div>
              <div className="deputy-arrow" aria-hidden="true">›</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
