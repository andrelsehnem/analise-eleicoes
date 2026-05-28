import { useEffect, useRef, useState } from 'react'
import {
  fetchSenatorApartes,
  fetchSenatorDiscursos,
  fetchSenatorFiliacoes,
  fetchSenatorLicencas,
  fetchSenatorLiderancas,
  fetchSenatorMateriasAutoria,
  fetchSenatorMateriasRelatoria,
  fetchSenatorVotacoes,
} from '../../api/camaraApi'
import type {
  FavoritePolitician,
  SenatorAparte,
  SenatorCommission,
  SenatorDetail,
  SenatorFiliacao,
  SenatorLicenca,
  SenatorLideranca,
  SenatorMateriaAutoria,
  SenatorMateriaRelatoria,
  SenatorOffice,
  SenatorTerm,
  SenatorVotacao,
} from '../../types/camara'
import { formatDate } from '../../utils/format'
import { FALLBACK_AVATAR } from '../../utils/ui'
import { AppButton } from '../common/AppButton'
import { EmptyState } from '../common/EmptyState'
import { ErrorBox } from '../common/ErrorBox'
import { FavoriteStarButton } from '../common/FavoriteStarButton'
import { Loader } from '../common/Loader'

type SenatorDetailPanelProps = {
  senatorDetail: SenatorDetail | null
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

type ServiceLinkView = {
  nome: string
  descricao?: string
  url: string
  titulo: string
}

const FRIENDLY_SERVICE_TITLES: Record<string, string> = {
  ApartesParlamentar: 'Apartes',
  CargoParlamentar: 'Cargos',
  DiscursosParlamentar: 'Discursos',
  FiliacaoParlamentar: 'Filiação partidária',
  HistoricoAcademicoParlamentar: 'Histórico acadêmico',
  LicencaParlamentar: 'Licenças',
  LiderancaParlamentar: 'Lideranças',
  MandatoParlamentar: 'Mandatos',
  MateriasAutoriaParlamentar: 'Matérias de autoria',
  MateriasRelatoriaParlamentar: 'Matérias de relatoria',
  MembroComissaoParlamentar: 'Participação em comissões',
  ProfissaoParlamentar: 'Profissões',
  VotacaoParlamentar: 'Votações',
}

function getFriendlyServiceTitle(name: string): string {
  const mappedTitle = FRIENDLY_SERVICE_TITLES[name]

  if (mappedTitle) {
    return mappedTitle
  }

  return name
    .replace(/Parlamentar$/, '')
    .replace(/([a-zà-ú])([A-ZÀ-Ú])/g, '$1 $2')
    .trim()
}

function ensureUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return `https://${value}`
}

function getTermPeriod(term: SenatorTerm) {
  const periods = term.legislaturas
    .map((legislatura) => {
      if (!legislatura.inicio && !legislatura.fim) {
        return ''
      }

      if (legislatura.inicio && legislatura.fim) {
        return `${formatDate(legislatura.inicio)} até ${formatDate(legislatura.fim)}`
      }

      if (legislatura.inicio) {
        return `Desde ${formatDate(legislatura.inicio)}`
      }

      return `Até ${formatDate(legislatura.fim)}`
    })
    .filter(Boolean)

  return periods.join(' · ')
}

function getNaturalidadeLabel(city?: string, state?: string) {
  if (city && state) {
    return `${city}/${state}`
  }

  return city || state || ''
}

type ServiceDataState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'apartes'; items: SenatorAparte[] }
  | { kind: 'discursos'; items: SenatorAparte[] }
  | { kind: 'filiacoes'; items: SenatorFiliacao[] }
  | { kind: 'licencas'; items: SenatorLicenca[] }
  | { kind: 'cargos'; items: SenatorOffice[] }
  | { kind: 'liderancas'; items: SenatorLideranca[] }
  | { kind: 'mandatos'; items: SenatorTerm[] }
  | { kind: 'autorias'; items: SenatorMateriaAutoria[] }
  | { kind: 'relatorias'; items: SenatorMateriaRelatoria[] }
  | { kind: 'comissoes'; items: SenatorCommission[] }
  | { kind: 'votacoes'; items: SenatorVotacao[] }

export function SenatorDetailPanel({
  senatorDetail,
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
}: SenatorDetailPanelProps) {
  const canRenderContent = !error && Boolean(senatorDetail)
  const [selectedService, setSelectedService] = useState<ServiceLinkView | null>(null)
  const [serviceData, setServiceData] = useState<ServiceDataState>({ kind: 'idle' })
  const abortRef = useRef<AbortController | null>(null)

  const serviceLinks: ServiceLinkView[] = senatorDetail
    ? senatorDetail.links.map((link) => ({
        ...link,
        titulo: getFriendlyServiceTitle(link.nome),
      }))
    : []

  function handleSelectService(link: ServiceLinkView) {
    setSelectedService(link)

    if (link.nome === 'CargoParlamentar') {
      setServiceData({ kind: 'cargos', items: senatorDetail?.cargos ?? [] })
      return
    }

    if (link.nome === 'MandatoParlamentar') {
      setServiceData({ kind: 'mandatos', items: senatorDetail?.mandatos ?? [] })
      return
    }

    if (link.nome === 'MembroComissaoParlamentar') {
      setServiceData({ kind: 'comissoes', items: senatorDetail?.comissoes ?? [] })
      return
    }

    const asyncServices = {
      ApartesParlamentar: {
        kind: 'apartes' as const,
        fetch: fetchSenatorApartes,
        errorMsg: 'Erro ao carregar apartes.',
      },
      DiscursosParlamentar: {
        kind: 'discursos' as const,
        fetch: fetchSenatorDiscursos,
        errorMsg: 'Erro ao carregar discursos.',
      },
      FiliacaoParlamentar: {
        kind: 'filiacoes' as const,
        fetch: fetchSenatorFiliacoes,
        errorMsg: 'Erro ao carregar filiações.',
      },
      LicencaParlamentar: {
        kind: 'licencas' as const,
        fetch: fetchSenatorLicencas,
        errorMsg: 'Erro ao carregar licenças.',
      },
      LiderancaParlamentar: {
        kind: 'liderancas' as const,
        fetch: fetchSenatorLiderancas,
        errorMsg: 'Erro ao carregar lideranças.',
      },
      MateriasAutoriaParlamentar: {
        kind: 'autorias' as const,
        fetch: fetchSenatorMateriasAutoria,
        errorMsg: 'Erro ao carregar matérias de autoria.',
      },
      MateriasRelatoriaParlamentar: {
        kind: 'relatorias' as const,
        fetch: fetchSenatorMateriasRelatoria,
        errorMsg: 'Erro ao carregar matérias de relatoria.',
      },
      VotacaoParlamentar: {
        kind: 'votacoes' as const,
        fetch: fetchSenatorVotacoes,
        errorMsg: 'Erro ao carregar votações.',
      },
    }

    const asyncDef = asyncServices[link.nome as keyof typeof asyncServices]
    if (asyncDef) {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setServiceData({ kind: 'loading' })

      asyncDef
        .fetch(link.url)
        .then((items) => {
          if (!controller.signal.aborted) {
            setServiceData({ kind: asyncDef.kind, items } as ServiceDataState)
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setServiceData({ kind: 'error', message: asyncDef.errorMsg })
          }
        })
      return
    }

    setServiceData({ kind: 'idle' })
  }

  function handleCloseService() {
    abortRef.current?.abort()
    setSelectedService(null)
    setServiceData({ kind: 'idle' })
  }

  useEffect(() => {
    if (!selectedService) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseService()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [selectedService])

  return (
    <div className="panel active" id="panel-senator-detail">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar para lista
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

      {!loading && !error && !senatorDetail && (
        <EmptyState icon="🏛" message="Perfil de senador não encontrado." />
      )}

      {canRenderContent && senatorDetail && (
        <>
          <div className="deputy-detail-header">
            <img
              className="deputy-detail-photo"
              src={senatorDetail.urlFoto || FALLBACK_AVATAR}
              alt={senatorDetail.nome}
              width={100}
              height={100}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_AVATAR
              }}
            />
            <div className="deputy-detail-info">
              <div className="detail-name-row">
                <h1 className="deputy-detail-name">{senatorDetail.nome}</h1>
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
                <span className="tag tag-party">🏛 {senatorDetail.siglaPartido}</span>
                <span className="tag tag-state">📍 {senatorDetail.siglaUf}</span>
                {senatorDetail.membroMesa && <span className="tag tag-social">Mesa Diretora</span>}
                {senatorDetail.membroLideranca && (
                  <span className="tag tag-social">Liderança</span>
                )}
              </div>
              <div className="deputy-extra">
                {senatorDetail.nomeCompleto || ''}
                {senatorDetail.nomeCompleto && senatorDetail.dataNascimento ? ' · ' : ''}
                {senatorDetail.dataNascimento
                  ? `Nascimento: ${formatDate(senatorDetail.dataNascimento)}`
                  : ''}
              </div>
            </div>
          </div>

          <section className="deputy-general-info" aria-label="Informações gerais do senador">
            <h3 className="deputy-general-info-title">Informações gerais</h3>
            <div className="deputy-general-info-grid">
              {senatorDetail.nomeCompleto && (
                <p className="deputy-general-item">
                  <span className="deputy-general-label">Nome completo</span>
                  <span className="deputy-general-value">{senatorDetail.nomeCompleto}</span>
                </p>
              )}

              {senatorDetail.dataNascimento && (
                <p className="deputy-general-item">
                  <span className="deputy-general-label">Nascimento</span>
                  <span className="deputy-general-value">
                    {formatDate(senatorDetail.dataNascimento)}
                  </span>
                </p>
              )}

              {getNaturalidadeLabel(senatorDetail.naturalidade, senatorDetail.ufNaturalidade) && (
                <p className="deputy-general-item">
                  <span className="deputy-general-label">Naturalidade</span>
                  <span className="deputy-general-value">
                    {getNaturalidadeLabel(senatorDetail.naturalidade, senatorDetail.ufNaturalidade)}
                  </span>
                </p>
              )}

              {senatorDetail.email && (
                <p className="deputy-general-item">
                  <span className="deputy-general-label">E-mail</span>
                  <span className="deputy-general-value">{senatorDetail.email}</span>
                </p>
              )}

              {senatorDetail.telefone && (
                <p className="deputy-general-item">
                  <span className="deputy-general-label">Telefone</span>
                  <span className="deputy-general-value">{senatorDetail.telefone}</span>
                </p>
              )}

              {senatorDetail.enderecoParlamentar && (
                <p className="deputy-general-item">
                  <span className="deputy-general-label">Endereço parlamentar</span>
                  <span className="deputy-general-value">{senatorDetail.enderecoParlamentar}</span>
                </p>
              )}

              {senatorDetail.urlPagina && (
                <p className="deputy-general-item">
                  <span className="deputy-general-label">Página oficial</span>
                  <a
                    className="deputy-general-link"
                    href={ensureUrl(senatorDetail.urlPagina)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir perfil no Senado
                  </a>
                </p>
              )}

              {senatorDetail.urlPaginaParticular && (
                <p className="deputy-general-item">
                  <span className="deputy-general-label">Site pessoal</span>
                  <a
                    className="deputy-general-link"
                    href={ensureUrl(senatorDetail.urlPaginaParticular)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {senatorDetail.urlPaginaParticular}
                  </a>
                </p>
              )}
            </div>
          </section>

          <div className="president-section-grid">
            <section className="president-section-card" aria-label="Mandatos do senador">
              <h3 className="deputy-general-info-title">Mandatos</h3>
              {senatorDetail.mandatos.length === 0 ? (
                <EmptyState icon="📜" message="Nenhum mandato encontrado." />
              ) : (
                <div className="president-term-list">
                  {senatorDetail.mandatos.map((mandato) => {
                    const partidos = mandato.partidos
                      .map((partido) => partido.sigla || partido.nome)
                      .filter(Boolean)
                      .join(', ')

                    return (
                      <article
                        className="president-term-item"
                        key={`${mandato.codigoMandato || ''}-${mandato.uf}-${getTermPeriod(mandato)}`}
                      >
                        <div className="president-term-title">
                          {mandato.participacao || 'Mandato'} · {mandato.uf}
                        </div>
                        {getTermPeriod(mandato) && (
                          <div className="president-term-period">{getTermPeriod(mandato)}</div>
                        )}
                        {partidos && <div className="president-term-meta">Partidos: {partidos}</div>}
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="president-section-card" aria-label="Comissões do senador">
              <h3 className="deputy-general-info-title">Comissões</h3>
              {senatorDetail.comissoes.length === 0 ? (
                <EmptyState icon="🧾" message="Nenhuma comissão encontrada." />
              ) : (
                <div className="president-term-list">
                  {senatorDetail.comissoes.map((comissao) => (
                    <article
                      className="president-term-item"
                      key={`${comissao.codigo || comissao.sigla || ''}-${comissao.inicio || ''}-${comissao.fim || ''}`}
                    >
                      <div className="president-term-title">
                        {comissao.sigla ? `${comissao.sigla} · ` : ''}
                        {comissao.nome || 'Comissão'}
                      </div>
                      <div className="president-term-meta">
                        {(comissao.participacao || 'Participação não informada')}
                        {comissao.casa ? ` · ${comissao.casa}` : ''}
                      </div>
                      {(comissao.inicio || comissao.fim) && (
                        <div className="president-term-period">
                          {comissao.inicio ? formatDate(comissao.inicio) : 'Início não informado'}
                          {' até '}
                          {comissao.fim ? formatDate(comissao.fim) : 'atual'}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {serviceLinks.length > 0 && (
            <section className="president-section-card" aria-label="Links e serviços do senador">
              <h3 className="deputy-general-info-title">Links e serviços</h3>
              <div className="president-links-list">
                {serviceLinks.map((link) => (
                  <AppButton
                    className="tag tag-social president-link-chip"
                    key={link.url}
                    onClick={() => handleSelectService(link)}
                    type="button"
                  >
                    🔎 {link.titulo}
                  </AppButton>
                ))}
              </div>
            </section>
          )}

          {selectedService && (
            <div
              className="senator-service-modal-overlay"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  handleCloseService()
                }
              }}
            >
              <div
                className="senator-service-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="senator-service-modal-title"
              >
                <header className="senator-service-modal-header">
                  <div>
                    <h4 className="senator-service-modal-title" id="senator-service-modal-title">
                      {selectedService.titulo}
                    </h4>
                    <p className="senator-service-modal-subtitle">Serviço de dados do Senado</p>
                  </div>
                  <AppButton
                    className="senator-service-modal-close-btn"
                    onClick={handleCloseService}
                    type="button"
                  >
                    ✕ Fechar
                  </AppButton>
                </header>

                <div className="senator-service-modal-content">
                  {serviceData.kind === 'loading' && <Loader />}

                  {serviceData.kind === 'error' && <ErrorBox message={serviceData.message} />}

                  {serviceData.kind === 'apartes' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="🎙" message="Nenhum aparte encontrado." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((aparte) => (
                            <article className="president-term-item" key={aparte.codigo}>
                              <div className="president-term-title">
                                {aparte.tipoDescricao || 'Pronunciamento'}
                              </div>
                              {aparte.data && (
                                <div className="president-term-period">{formatDate(aparte.data)}</div>
                              )}
                              {aparte.orador?.nome && (
                                <div className="president-term-meta">
                                  Orador: {aparte.orador.nome}
                                  {aparte.orador.siglaPartido ? ` (${aparte.orador.siglaPartido}` : ''}
                                  {aparte.orador.uf ? `/${aparte.orador.uf})` : (aparte.orador.siglaPartido ? ')' : '')}
                                </div>
                              )}
                              {aparte.textoResumo && (
                                <div className="president-term-meta">{aparte.textoResumo}</div>
                              )}
                              {aparte.urlTexto && (
                                <a
                                  className="deputy-general-link"
                                  href={aparte.urlTexto}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Ver texto completo →
                                </a>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'discursos' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="🎤" message="Nenhum discurso encontrado." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((discurso) => (
                            <article className="president-term-item" key={discurso.codigo}>
                              <div className="president-term-title">
                                {discurso.tipoDescricao || 'Discurso'}
                              </div>
                              {discurso.data && (
                                <div className="president-term-period">{formatDate(discurso.data)}</div>
                              )}
                              {discurso.orador?.nome && (
                                <div className="president-term-meta">
                                  Orador: {discurso.orador.nome}
                                  {discurso.orador.siglaPartido ? ` (${discurso.orador.siglaPartido}` : ''}
                                  {discurso.orador.uf ? `/${discurso.orador.uf})` : (discurso.orador.siglaPartido ? ')' : '')}
                                </div>
                              )}
                              {discurso.textoResumo && (
                                <div className="president-term-meta">{discurso.textoResumo}</div>
                              )}
                              {discurso.urlTexto && (
                                <a
                                  className="deputy-general-link"
                                  href={discurso.urlTexto}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Ver texto completo →
                                </a>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'filiacoes' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="🗂" message="Nenhuma filiação encontrada." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((filiacao, idx) => (
                            <article className="president-term-item" key={`${filiacao.siglaPartido}-${filiacao.dataFiliacao ?? idx}`}>
                              <div className="president-term-title">
                                {filiacao.nomePartido || filiacao.siglaPartido}
                              </div>
                              <div className="president-term-period">
                                {filiacao.dataFiliacao ? formatDate(filiacao.dataFiliacao) : 'Início não informado'}
                                {' até '}
                                {filiacao.dataDesfiliacao ? formatDate(filiacao.dataDesfiliacao) : 'atual'}
                              </div>
                              {filiacao.nomePartido && (
                                <div className="president-term-meta">Sigla: {filiacao.siglaPartido}</div>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'licencas' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="📋" message="Nenhuma licença encontrada." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((licenca) => (
                            <article className="president-term-item" key={licenca.codigo}>
                              <div className="president-term-title">
                                {licenca.descricaoTipo || licenca.siglaTipo || 'Licença'}
                              </div>
                              <div className="president-term-period">
                                {licenca.dataInicio ? formatDate(licenca.dataInicio) : 'Início não informado'}
                                {' até '}
                                {licenca.dataFim ? formatDate(licenca.dataFim) : 'Fim não informado'}
                              </div>
                              {licenca.siglaTipo && licenca.descricaoTipo && (
                                <div className="president-term-meta">Tipo: {licenca.siglaTipo}</div>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'cargos' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="🏅" message="Nenhum cargo encontrado." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((cargo, index) => (
                            <article
                              className="president-term-item"
                              key={`${cargo.codigo ?? ''}-${cargo.cargo ?? ''}-${index}`}
                            >
                              <div className="president-term-title">
                                {cargo.cargo || 'Cargo não informado'}
                              </div>
                              {(cargo.inicio || cargo.fim) && (
                                <div className="president-term-period">
                                  {cargo.inicio ? formatDate(cargo.inicio) : 'Início não informado'}
                                  {' até '}
                                  {cargo.fim ? formatDate(cargo.fim) : 'atual'}
                                </div>
                              )}
                              {cargo.comissao && (
                                <div className="president-term-meta">Sigla: {cargo.comissao}</div>
                              )}
                              {cargo.nomeComissao && (
                                <div className="president-term-meta">Comissão: {cargo.nomeComissao}</div>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'liderancas' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="🧭" message="Nenhuma liderança encontrada." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((lideranca, index) => (
                            <article
                              className="president-term-item"
                              key={`${lideranca.tipo ?? ''}-${lideranca.dataInicio ?? ''}-${index}`}
                            >
                              <div className="president-term-title">
                                {lideranca.tipo || 'Liderança não informada'}
                              </div>
                              {(lideranca.dataInicio || lideranca.dataFim) && (
                                <div className="president-term-period">
                                  {lideranca.dataInicio ? formatDate(lideranca.dataInicio) : 'Início não informado'}
                                  {' até '}
                                  {lideranca.dataFim ? formatDate(lideranca.dataFim) : 'atual'}
                                </div>
                              )}
                              {(lideranca.partido?.sigla || lideranca.partido?.nome) && (
                                <div className="president-term-meta">
                                  Partido: {lideranca.partido.sigla || lideranca.partido.nome}
                                </div>
                              )}
                              {(lideranca.bloco?.sigla || lideranca.bloco?.nome) && (
                                <div className="president-term-meta">
                                  Bloco: {lideranca.bloco.sigla || lideranca.bloco.nome}
                                </div>
                              )}
                              {lideranca.casa && (
                                <div className="president-term-meta">Casa: {lideranca.casa}</div>
                              )}
                              {lideranca.ordemVice && (
                                <div className="president-term-meta">Ordem de vice-liderança: {lideranca.ordemVice}</div>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'mandatos' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="📜" message="Nenhum mandato encontrado." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((mandato, index) => {
                            const partidos = mandato.partidos
                              .map((partido) => partido.sigla || partido.nome)
                              .filter(Boolean)
                              .join(', ')

                            return (
                              <article
                                className="president-term-item"
                                key={`${mandato.codigoMandato ?? ''}-${mandato.uf}-${index}`}
                              >
                                <div className="president-term-title">
                                  {mandato.participacao || 'Mandato'} · {mandato.uf}
                                </div>
                                {getTermPeriod(mandato) && (
                                  <div className="president-term-period">{getTermPeriod(mandato)}</div>
                                )}
                                {partidos && (
                                  <div className="president-term-meta">Partidos: {partidos}</div>
                                )}
                              </article>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'comissoes' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="🧾" message="Nenhuma comissão encontrada." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((comissao, index) => (
                            <article
                              className="president-term-item"
                              key={`${comissao.codigo ?? comissao.sigla ?? ''}-${index}`}
                            >
                              <div className="president-term-title">
                                {comissao.nome || comissao.sigla || 'Comissão'}
                              </div>
                              {(comissao.inicio || comissao.fim) && (
                                <div className="president-term-period">
                                  {comissao.inicio ? formatDate(comissao.inicio) : 'Início não informado'}
                                  {' até '}
                                  {comissao.fim ? formatDate(comissao.fim) : 'atual'}
                                </div>
                              )}
                              {comissao.participacao && (
                                <div className="president-term-meta">Participação: {comissao.participacao}</div>
                              )}
                              {comissao.sigla && comissao.nome && (
                                <div className="president-term-meta">Sigla: {comissao.sigla}</div>
                              )}
                              {comissao.casa && (
                                <div className="president-term-meta">Casa: {comissao.casa}</div>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'autorias' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="📝" message="Nenhuma matéria de autoria encontrada." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((materia, index) => (
                            <article
                              className="president-term-item"
                              key={`${materia.codigoMateria ?? materia.identificacao ?? ''}-${index}`}
                            >
                              <div className="president-term-title">
                                {materia.identificacao || 'Matéria sem identificação'}
                              </div>
                              {materia.data && (
                                <div className="president-term-period">{formatDate(materia.data)}</div>
                              )}
                              <div className="president-term-meta">
                                Participação: {materia.indicadorAutorPrincipal ? 'Autor principal' : 'Coautor'}
                                {materia.indicadorOutrosAutores ? ' · Com outros autores' : ''}
                              </div>
                              {materia.ementa && (
                                <div className="president-term-meta">Ementa: {materia.ementa}</div>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'relatorias' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="📚" message="Nenhuma matéria de relatoria encontrada." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((relatoria, index) => (
                            <article
                              className="president-term-item"
                              key={`${relatoria.codigoMateria ?? relatoria.identificacao ?? ''}-${index}`}
                            >
                              <div className="president-term-title">
                                {relatoria.identificacao || 'Matéria sem identificação'}
                              </div>
                              {(relatoria.dataDesignacao || relatoria.dataDestituicao) && (
                                <div className="president-term-period">
                                  {relatoria.dataDesignacao ? formatDate(relatoria.dataDesignacao) : 'Início não informado'}
                                  {' até '}
                                  {relatoria.dataDestituicao ? formatDate(relatoria.dataDestituicao) : 'atual'}
                                </div>
                              )}
                              {relatoria.tipoRelator && (
                                <div className="president-term-meta">Tipo: {relatoria.tipoRelator}</div>
                              )}
                              {(relatoria.comissao?.sigla || relatoria.comissao?.nome) && (
                                <div className="president-term-meta">
                                  Comissão: {relatoria.comissao.sigla || relatoria.comissao.nome}
                                  {relatoria.comissao.sigla && relatoria.comissao.nome
                                    ? ` — ${relatoria.comissao.nome}`
                                    : ''}
                                </div>
                              )}
                              {relatoria.motivoDestituicao && (
                                <div className="president-term-meta">Motivo de destituição: {relatoria.motivoDestituicao}</div>
                              )}
                              {relatoria.ementa && (
                                <div className="president-term-meta">Ementa: {relatoria.ementa}</div>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'votacoes' && (
                    <>
                      {serviceData.items.length === 0 ? (
                        <EmptyState icon="🗳" message="Nenhuma votação encontrada." />
                      ) : (
                        <div className="president-term-list">
                          {serviceData.items.map((votacao, index) => (
                            <article
                              className="president-term-item"
                              key={`${votacao.codigoSessaoVotacao ?? votacao.descricaoVotacao ?? ''}-${index}`}
                            >
                              <div className="president-term-title">
                                {votacao.descricaoVotacao || 'Votação sem descrição'}
                              </div>
                              {votacao.dataSessao && (
                                <div className="president-term-period">{formatDate(votacao.dataSessao)}</div>
                              )}
                              {votacao.descricaoResultado && (
                                <div className="president-term-meta">Resultado: {votacao.descricaoResultado}</div>
                              )}
                              {votacao.siglaVoto && (
                                <div className="president-term-meta">
                                  Voto: {votacao.siglaVoto}
                                  {votacao.descricaoVoto ? ` — ${votacao.descricaoVoto}` : ''}
                                </div>
                              )}
                              {(votacao.totalSim || votacao.totalNao || votacao.totalAbstencao) && (
                                <div className="president-term-meta">
                                  Votos — Sim: {votacao.totalSim || '0'} · Não: {votacao.totalNao || '0'} · Abstenção: {votacao.totalAbstencao || '0'}
                                </div>
                              )}
                              {votacao.materia?.identificacao && (
                                <div className="president-term-meta">Matéria: {votacao.materia.identificacao}</div>
                              )}
                              {votacao.votacaoSecreta && (
                                <div className="president-term-meta">🔒 Votação secreta</div>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {serviceData.kind === 'idle' && (
                    <>
                      <p className="senator-service-modal-description">
                        Consulte os dados completos deste serviço diretamente no endpoint oficial.
                      </p>
                      <p className="senator-service-modal-description">
                        {selectedService.descricao || 'Descrição não informada para este serviço.'}
                      </p>
                      <span className="senator-service-modal-endpoint-label">Endpoint do serviço</span>
                      <div className="senator-service-modal-endpoint">{selectedService.url}</div>
                    </>
                  )}
                </div>

                <footer className="senator-service-modal-actions">
                  <a
                    className="tag tag-social president-link-chip"
                    href={ensureUrl(selectedService.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir dados em nova aba
                  </a>
                  <AppButton
                    className="deputy-organs-btn"
                    onClick={handleCloseService}
                    type="button"
                  >
                    Fechar
                  </AppButton>
                </footer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
