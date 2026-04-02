import type {
  Deputy,
  DeputyInfo,
  DeputyOrgan,
  Profession,
  Proposition,
  Vote,
} from '../../types/camara'
import { formatDate } from '../../utils/format'
import {
  FALLBACK_AVATAR,
  getPropositionBadgeClass,
  getPropositionStatusClass,
  getVotePillClass,
} from '../../utils/ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { Loader } from '../common/Loader'

type DeputyDetailPanelProps = {
  selectedDeputy: Deputy | null
  deputyInfo: DeputyInfo | null
  professions: Profession[]
  propositions: Proposition[]
  filterContextKey: string
  includeRequirements: boolean
  hasMorePropositions: boolean
  loadingMorePropositions: boolean
  votes: Vote[]
  orgaos: DeputyOrgan[]
  loadingOrgaos: boolean
  orgaosError: string
  activeTab: 'proposicoes' | 'votacoes'
  loading: boolean
  error: string
  onBack: () => void
  onChangeTab: (tab: 'proposicoes' | 'votacoes') => void
  onToggleIncludeRequirements: () => void
  onLoadMorePropositions: () => void
  onOpenOrgaosModal: () => void
}

export function DeputyDetailPanel({
  selectedDeputy,
  deputyInfo,
  professions,
  propositions,
  filterContextKey,
  includeRequirements,
  hasMorePropositions,
  loadingMorePropositions,
  votes,
  orgaos,
  loadingOrgaos,
  orgaosError,
  activeTab,
  loading,
  error,
  onBack,
  onChangeTab,
  onToggleIncludeRequirements,
  onLoadMorePropositions,
  onOpenOrgaosModal,
}: DeputyDetailPanelProps) {
  const [isOrgaosModalOpen, setIsOrgaosModalOpen] = useState(false)
  const [selectedPropositionTypes, setSelectedPropositionTypes] = useState<string[]>([])
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const lastFilterContextKeyRef = useRef<string>('')
  const seenPropositionTypesRef = useRef<string[]>([])

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!sentinel || !hasMorePropositions || loadingMorePropositions) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (entry.isIntersecting) {
          onLoadMorePropositions()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [hasMorePropositions, loadingMorePropositions, onLoadMorePropositions])

  function getPropositionTypeLabel(proposition: Proposition) {
    return proposition.siglaTipo?.toUpperCase().trim() || 'OUTROS'
  }

  function getPropositionUrl(proposition: Proposition) {
    if (proposition.id) {
      return `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposition.id}`
    }

    return proposition.uri || ''
  }

  function ensureUrl(value: string) {
    if (/^https?:\/\//i.test(value)) {
      return value
    }

    return `https://${value}`
  }

  function formatBirthPlace(municipio?: string, uf?: string) {
    if (municipio && uf) {
      return `${municipio}/${uf}`
    }

    return municipio || uf || ''
  }

  function formatCabinetAddress(info: DeputyInfo | null) {
    const parts = [info?.gabinete?.nome, info?.gabinete?.predio, info?.gabinete?.sala]
      .filter(Boolean)
      .join(' · ')

    if (!parts) {
      return ''
    }

    return info?.gabinete?.andar ? `${parts} (andar ${info.gabinete.andar})` : parts
  }

  function getSocialMeta(value: string) {
    const normalizedUrl = ensureUrl(value)

    try {
      const hostname = new URL(normalizedUrl).hostname.toLowerCase().replace('www.', '')

      if (hostname.includes('instagram')) {
        return { url: normalizedUrl, name: 'Instagram', icon: '📸' }
      }

      if (hostname.includes('facebook')) {
        return { url: normalizedUrl, name: 'Facebook', icon: '📘' }
      }

      if (hostname.includes('x.com') || hostname.includes('twitter')) {
        return { url: normalizedUrl, name: 'X', icon: '✖' }
      }

      if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
        return { url: normalizedUrl, name: 'YouTube', icon: '▶️' }
      }

      if (hostname.includes('tiktok')) {
        return { url: normalizedUrl, name: 'TikTok', icon: '🎵' }
      }

      if (hostname.includes('linkedin')) {
        return { url: normalizedUrl, name: 'LinkedIn', icon: '💼' }
      }

      if (hostname.includes('threads')) {
        return { url: normalizedUrl, name: 'Threads', icon: '🧵' }
      }
    } catch {
      return { url: normalizedUrl, name: 'Rede social', icon: '🔗' }
    }

    return { url: normalizedUrl, name: 'Rede social', icon: '🔗' }
  }

  function summarizeProfessions(items: Profession[]) {
    const uniqueTitles = Array.from(
      new Set(
        items
          .map((item) => item.titulo || item.nome)
          .map((value) => value?.trim())
          .filter(Boolean),
      ),
    ) as string[]

    if (uniqueTitles.length === 0) {
      return ''
    }

    const preview = uniqueTitles.slice(0, 3)
    const remaining = uniqueTitles.length - preview.length

    return remaining > 0 ? `${preview.join(', ')} e +${remaining}` : preview.join(', ')
  }

  function formatOrganPeriod(dataInicio?: string, dataFim?: string) {
    if (dataInicio && dataFim) {
      return `${formatDate(dataInicio)} até ${formatDate(dataFim)}`
    }

    if (dataInicio) {
      return `Desde ${formatDate(dataInicio)}`
    }

    if (dataFim) {
      return `Até ${formatDate(dataFim)}`
    }

    return ''
  }

  function handleOpenOrgaosModal() {
    setIsOrgaosModalOpen(true)
    onOpenOrgaosModal()
  }

  function handleCloseOrgaosModal() {
    setIsOrgaosModalOpen(false)
  }

  function handleTogglePropositionType(type: string) {
    setSelectedPropositionTypes((currentTypes) => {
      if (currentTypes.includes(type)) {
        return currentTypes.filter((currentType) => currentType !== type)
      }

      return [...currentTypes, type]
    })
  }

  const propositionTypes = useMemo(() => {
    return Array.from(new Set(propositions.map((item) => getPropositionTypeLabel(item)))).sort(
      (leftType, rightType) => leftType.localeCompare(rightType, 'pt-BR'),
    )
  }, [propositions])

  useEffect(() => {
    const isNewContext = lastFilterContextKeyRef.current !== filterContextKey

    setSelectedPropositionTypes((currentTypes) => {
      if (isNewContext) {
        lastFilterContextKeyRef.current = filterContextKey
        seenPropositionTypesRef.current = propositionTypes
        return propositionTypes
      }

      const previousSeenTypes = seenPropositionTypesRef.current
      const preservedTypes = currentTypes.filter((type) => propositionTypes.includes(type))
      const newTypes = propositionTypes.filter((type) => !previousSeenTypes.includes(type))

      seenPropositionTypesRef.current = propositionTypes

      return [...preservedTypes, ...newTypes]
    })
  }, [filterContextKey, propositionTypes])

  const filteredPropositions = useMemo(() => {
    if (selectedPropositionTypes.length === 0) {
      return []
    }

    return propositions.filter((item) => {
      const type = getPropositionTypeLabel(item)
      return selectedPropositionTypes.includes(type)
    })
  }, [propositions, selectedPropositionTypes])

  const deputyDisplayName =
    deputyInfo?.ultimoStatus?.nomeEleitoral || selectedDeputy?.nome || 'Deputado'
  const deputyPhoto =
    deputyInfo?.ultimoStatus?.urlFoto || selectedDeputy?.urlFoto || FALLBACK_AVATAR
  const deputyParty =
    deputyInfo?.ultimoStatus?.siglaPartido || selectedDeputy?.siglaPartido || '-'
  const deputyUf = deputyInfo?.ultimoStatus?.siglaUf || selectedDeputy?.siglaUf || '-'
  const deputyEmail = deputyInfo?.ultimoStatus?.email || selectedDeputy?.email
  const deputyCivilName = deputyInfo?.nomeCivil
  const deputyCpf = deputyInfo?.cpf
  const deputyBirthDate = deputyInfo?.dataNascimento
  const deputyBirthPlace = formatBirthPlace(
    deputyInfo?.municipioNascimento,
    deputyInfo?.ufNascimento,
  )
  const deputyWebsite = deputyInfo?.urlWebsite
  const deputyEducation = deputyInfo?.escolaridade
  const deputyCabinetEmail = deputyInfo?.gabinete?.email
  const deputyCabinetPhone = deputyInfo?.gabinete?.telefone
  const deputyCabinetAddress = formatCabinetAddress(deputyInfo)
  const deputySocialLinks = (deputyInfo?.redeSocial || []).filter(Boolean)
  const deputySocialTags = deputySocialLinks.map((social) => getSocialMeta(social))
  const deputyProfessions = summarizeProfessions(professions)
  const hasGeneralInfo = Boolean(
    deputyCivilName ||
      deputyCpf ||
      deputyEducation ||
      deputyProfessions ||
      deputyBirthDate ||
      deputyBirthPlace ||
      deputyEmail ||
      deputyCabinetEmail ||
      deputyCabinetPhone ||
      deputyCabinetAddress ||
        deputyWebsite,
  )

  const approvedCount = filteredPropositions.filter((item) => {
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
                {/*deputyEmail && <span className="tag tag-email">✉ {deputyEmail}</span>*/}
                {deputySocialTags.map((social, index) => (
                  <a
                    className="tag tag-social"
                    href={social.url}
                    key={`${social.url}-${index}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span aria-hidden="true">{social.icon}</span>
                    {social.name}
                  </a>
                ))}
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

          {hasGeneralInfo && (
            <section className="deputy-general-info" aria-label="Informações gerais do deputado">
              <h3 className="deputy-general-info-title">Informações gerais</h3>
              <div className="deputy-general-info-grid">
                {deputyCivilName && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Nome civil</span>
                    <span className="deputy-general-value">{deputyCivilName}</span>
                  </p>
                )}

                {deputyCpf && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">CPF</span>
                    <span className="deputy-general-value">{deputyCpf}</span>
                  </p>
                )}

                {deputyEducation && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Escolaridade</span>
                    <span className="deputy-general-value">{deputyEducation}</span>
                  </p>
                )}

                {deputyProfessions && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Profissões</span>
                    <span className="deputy-general-value">{deputyProfessions}</span>
                  </p>
                )}

                {deputyBirthDate && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Nascimento</span>
                    <span className="deputy-general-value">{formatDate(deputyBirthDate)}</span>
                  </p>
                )}

                {deputyBirthPlace && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Naturalidade</span>
                    <span className="deputy-general-value">{deputyBirthPlace}</span>
                  </p>
                )}

                {deputyEmail && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">E-mail</span>
                    <span className="deputy-general-value">{deputyEmail}</span>
                  </p>
                )}

                {deputyCabinetEmail && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">E-mail do gabinete</span>
                    <span className="deputy-general-value">{deputyCabinetEmail}</span>
                  </p>
                )}

                {deputyCabinetPhone && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Telefone do gabinete</span>
                    <span className="deputy-general-value">{deputyCabinetPhone}</span>
                  </p>
                )}

                {deputyCabinetAddress && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Endereço do gabinete</span>
                    <span className="deputy-general-value">{deputyCabinetAddress}</span>
                  </p>
                )}

                {deputyWebsite && (
                  <p className="deputy-general-item">
                    <span className="deputy-general-label">Site</span>
                    <a
                      className="deputy-general-link"
                      href={ensureUrl(deputyWebsite)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {deputyWebsite}
                    </a>
                  </p>
                )}

                <div className="deputy-general-item">
                  <span className="deputy-general-label">Órgãos</span>
                  <AppButton
                    className="deputy-organs-btn"
                    onClick={handleOpenOrgaosModal}
                    type="button"
                  >
                    Ver órgãos
                  </AppButton>
                </div>
              </div>
            </section>
          )}

          {isOrgaosModalOpen && (
            <div
              className="deputy-organs-modal-overlay"
              role="presentation"
              onClick={handleCloseOrgaosModal}
            >
              <section
                className="deputy-organs-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Órgãos em que o deputado atua"
                onClick={(event) => {
                  event.stopPropagation()
                }}
              >
                <div className="deputy-organs-modal-header">
                  <h3>Órgãos</h3>
                  <AppButton
                    className="deputy-organs-close-btn"
                    onClick={handleCloseOrgaosModal}
                    type="button"
                  >
                    Fechar
                  </AppButton>
                </div>

                {loadingOrgaos && <Loader />}
                {!loadingOrgaos && orgaosError && <ErrorBox message={orgaosError} />}

                {!loadingOrgaos && !orgaosError && orgaos.length === 0 && (
                  <EmptyState icon="🏛" message="Nenhum órgão encontrado." />
                )}

                {!loadingOrgaos && !orgaosError && orgaos.length > 0 && (
                  <div className="deputy-organs-list">
                    {orgaos.map((orgao, index) => {
                      const orgaoNome = orgao.siglaOrgao || orgao.nomeOrgao || 'Órgão'
                      const period = formatOrganPeriod(orgao.dataInicio, orgao.dataFim)

                      return (
                        <article
                          className="deputy-organs-item"
                          key={`${orgaoNome}-${orgao.titulo}-${orgao.dataInicio}-${index}`}
                        >
                          <p className="deputy-organs-name">{orgaoNome}</p>
                          {orgao.nomeOrgao && orgao.siglaOrgao && (
                            <p className="deputy-organs-fullname">{orgao.nomeOrgao}</p>
                          )}
                          {orgao.titulo && <p className="deputy-organs-role">{orgao.titulo}</p>}
                          {period && <p className="deputy-organs-period">{period}</p>}
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          <div className="score-card">
            <div className="score-item">
              <span className="score-num">
                {propositions.length}
                {hasMorePropositions && <span className="score-num-partial">+</span>}
              </span>
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
              📄 Projetos Autorais ({filteredPropositions.length}{hasMorePropositions ? '+' : ''})
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
              <div className="prop-controls">
                <AppButton
                  className={`prop-requirements-toggle ${includeRequirements ? 'active' : ''}`}
                  onClick={onToggleIncludeRequirements}
                  type="button"
                  aria-pressed={includeRequirements}
                >
                  {includeRequirements ? 'Ocultar requerimentos' : 'Mostrar requerimentos'}
                </AppButton>

                {propositionTypes.length > 0 && (
                  <div className="prop-types-filter" aria-label="Filtro por tipo de proposição">
                    {propositionTypes.map((type) => {
                      const isSelected = selectedPropositionTypes.includes(type)
                      const badgeClass = getPropositionBadgeClass(type)

                      return (
                        <AppButton
                          key={type}
                          className={`prop-type-tag ${badgeClass} ${isSelected ? 'active' : ''}`}
                          onClick={() => handleTogglePropositionType(type)}
                          type="button"
                          aria-pressed={isSelected}
                        >
                          {type}
                        </AppButton>
                      )
                    })}
                  </div>
                )}
              </div>

              {filteredPropositions.length === 0 && (
                <EmptyState icon="📭" message="Nenhuma proposição encontrada." />
              )}

              {filteredPropositions.length > 0 && (
                <div className="prop-list">
                  {filteredPropositions.map((proposition, index) => {
                    const status =
                      proposition.statusProposicao?.descricaoSituacao || 'Em tramitação'
                    const tipo = getPropositionTypeLabel(proposition)
                    const propositionUrl = getPropositionUrl(proposition)
                    return (
                      <div
                        className="prop-item"
                        key={`${tipo}-${proposition.numero}-${proposition.ano}-${index}`}
                      >
                        <div className="prop-top">
                          {propositionUrl ? (
                            <a
                              className={`prop-badge prop-badge-link ${getPropositionBadgeClass(tipo)}`}
                              href={propositionUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="Abrir página da proposição"
                            >
                              {tipo} {proposition.numero}/{proposition.ano}
                            </a>
                          ) : (
                            <span className={`prop-badge ${getPropositionBadgeClass(tipo)}`}>
                              {tipo} {proposition.numero}/{proposition.ano}
                            </span>
                          )}
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

              {hasMorePropositions && (
                <div
                  ref={sentinelRef}
                  className="prop-infinite-sentinel"
                  aria-hidden="true"
                />
              )}

              {loadingMorePropositions && (
                <div className="prop-loading-more">
                  <Loader />
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
