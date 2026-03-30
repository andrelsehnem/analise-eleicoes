import type { Deputy, DeputyInfo, Proposition, Vote } from '../../types/camara'
import { formatDate } from '../../utils/format'
import {
  FALLBACK_AVATAR,
  getPropositionBadgeClass,
  getPropositionStatusClass,
  getVotePillClass,
} from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { Loader } from '../common/Loader'

type DeputyDetailPanelProps = {
  selectedDeputy: Deputy | null
  deputyInfo: DeputyInfo | null
  propositions: Proposition[]
  votes: Vote[]
  activeTab: 'proposicoes' | 'votacoes'
  loading: boolean
  error: string
  onBack: () => void
  onChangeTab: (tab: 'proposicoes' | 'votacoes') => void
}

export function DeputyDetailPanel({
  selectedDeputy,
  deputyInfo,
  propositions,
  votes,
  activeTab,
  loading,
  error,
  onBack,
  onChangeTab,
}: DeputyDetailPanelProps) {
  const deputyDisplayName =
    deputyInfo?.ultimoStatus?.nomeEleitoral || selectedDeputy?.nome || 'Deputado'
  const deputyPhoto =
    deputyInfo?.ultimoStatus?.urlFoto || selectedDeputy?.urlFoto || FALLBACK_AVATAR
  const deputyParty =
    deputyInfo?.ultimoStatus?.siglaPartido || selectedDeputy?.siglaPartido || '-'
  const deputyUf = deputyInfo?.ultimoStatus?.siglaUf || selectedDeputy?.siglaUf || '-'
  const deputyEmail = deputyInfo?.ultimoStatus?.email

  const approvedCount = propositions.filter((item) => {
    const descricaoSituacao =
      item.statusProposicao?.descricaoSituacao?.toLowerCase() || ''

    return descricaoSituacao.includes('aprovad')
  }).length
  const simVotes = votes.filter((item) => item.voto === 'Sim').length
  const naoVotes = votes.filter((item) => item.voto === 'Não').length
  const abstentions = votes.length - simVotes - naoVotes
  const canRenderContent = !error && Boolean(selectedDeputy || deputyInfo)

  return (
    <div className="panel active" id="panel-detail">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar para lista
      </AppButton>

      {loading && <Loader />}
      {!loading && error && <ErrorBox message={error} />}

      {canRenderContent && (
        <>
          <div className="deputy-detail-header">
            <img
              className="deputy-detail-photo"
              src={deputyPhoto}
              alt={deputyDisplayName}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_AVATAR
              }}
            />
            <div className="deputy-detail-info">
              <div className="deputy-detail-name">{deputyDisplayName}</div>
              <div className="deputy-tags">
                <span className="tag tag-party">🏛 {deputyParty}</span>
                <span className="tag tag-state">📍 {deputyUf}</span>
                {deputyEmail && <span className="tag tag-email">✉ {deputyEmail}</span>}
              </div>
              <div className="deputy-extra">
                {deputyInfo?.escolaridade ? `Escolaridade: ${deputyInfo.escolaridade}` : ''}
                {deputyInfo?.escolaridade && deputyInfo?.dataNascimento ? ' · ' : ''}
                {deputyInfo?.dataNascimento
                  ? `Nascimento: ${formatDate(deputyInfo.dataNascimento)}`
                  : ''}
              </div>
            </div>
          </div>

          <div className="score-card">
            <div className="score-item">
              <span className="score-num">{propositions.length}</span>
              <span className="score-label">Proposições</span>
            </div>
            <div className="score-divider" />
            <div className="score-item">
              <span className="score-num score-approved">{approvedCount}</span>
              <span className="score-label">Aprovadas</span>
            </div>
            <div className="score-divider" />
            <div className="score-item">
              <span className="score-num score-sim">{simVotes}</span>
              <span className="score-label">Votos SIM</span>
            </div>
            <div className="score-divider" />
            <div className="score-item">
              <span className="score-num score-nao">{naoVotes}</span>
              <span className="score-label">Votos NÃO</span>
            </div>
            <div className="score-divider" />
            <div className="score-item">
              <span className="score-num score-abs">{abstentions}</span>
              <span className="score-label">Abstenções</span>
            </div>
          </div>

          <div className="tabs">
            <AppButton
              className={`tab-btn ${activeTab === 'proposicoes' ? 'active' : ''}`}
              onClick={() => onChangeTab('proposicoes')}
              type="button"
            >
              📄 Projetos Autorais ({propositions.length})
            </AppButton>
            <AppButton
              className={`tab-btn ${activeTab === 'votacoes' ? 'active' : ''}`}
              onClick={() => onChangeTab('votacoes')}
              type="button"
            >
              🗳 Votações Registradas ({votes.length})
            </AppButton>
          </div>

          {activeTab === 'proposicoes' && (
            <div id="tab-proposicoes">
              {propositions.length === 0 && (
                <EmptyState icon="📭" message="Nenhuma proposição encontrada." />
              )}

              {propositions.length > 0 && (
                <div className="prop-list">
                  {propositions.map((proposition, index) => {
                    const status =
                      proposition.statusProposicao?.descricaoSituacao || 'Em tramitação'
                    const tipo = proposition.siglaTipo || 'PL'
                    return (
                      <div
                        className="prop-item"
                        key={`${tipo}-${proposition.numero}-${proposition.ano}-${index}`}
                      >
                        <div className="prop-top">
                          <span className={`prop-badge ${getPropositionBadgeClass(tipo)}`}>
                            {tipo} {proposition.numero}/{proposition.ano}
                          </span>
                          <div className="prop-title">
                            {proposition.ementa || 'Ementa não disponível'}
                          </div>
                        </div>
                        <div className="prop-status">
                          <div className={`status-dot ${getPropositionStatusClass(status)}`} />
                          <div className="status-text">{status}</div>
                          {proposition.statusProposicao?.dataHora && (
                            <div className="prop-year">
                              {formatDate(proposition.statusProposicao.dataHora)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'votacoes' && (
            <div id="tab-votacoes">
              {votes.length === 0 && (
                <EmptyState icon="🗳" message="Nenhuma votação registrada encontrada." />
              )}

              {votes.length > 0 && (
                <div className="votes-list">
                  {votes.map((vote, index) => {
                    const voto = vote.voto || 'Ausente'
                    return (
                      <div className="vote-item" key={`${vote.dataHoraVoto}-${vote.voto}-${index}`}>
                        <span className={`vote-pill ${getVotePillClass(voto)}`}>{voto}</span>
                        <div className="vote-desc">
                          {vote.descricao || vote.proposicaoObjeto || 'Votação sem descrição'}
                        </div>
                        <div className="vote-date">
                          {vote.dataHoraVoto ? formatDate(vote.dataHoraVoto) : ''}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
