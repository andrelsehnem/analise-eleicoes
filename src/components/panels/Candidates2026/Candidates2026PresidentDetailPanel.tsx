import type { PresidentialCandidateDetail } from '../../../types/camara'
import { formatDate } from '../../../utils/format'
import { FALLBACK_AVATAR } from '../../../utils/ui'
import { AppButton } from '../../common/AppButton'
import { ErrorBox } from '../../common/ErrorBox'
import { Loader } from '../../common/Loader'
import './Candidates2026PresidentDetailPanel.css'

type Candidates2026PresidentDetailPanelProps = {
  candidate: PresidentialCandidateDetail | null
  error: string
  loading: boolean
  sourceUrl: string
  onBack: () => void
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

function formatBirthPlace(candidate: PresidentialCandidateDetail): string {
  if (candidate.municipioNascimento && candidate.ufNascimento) {
    return `${candidate.municipioNascimento}/${candidate.ufNascimento}`
  }

  return candidate.municipioNascimento || candidate.ufNascimento
}

export function Candidates2026PresidentDetailPanel({
  candidate,
  error,
  loading,
  sourceUrl,
  onBack,
}: Candidates2026PresidentDetailPanelProps) {
  return (
    <div className="panel active candidate-2026-detail" id="panel-candidate-president-detail">
      <AppButton className="back-btn" onClick={onBack} type="button">
        ← Voltar para candidatos
      </AppButton>

      {loading && <Loader message="Consultando perfil da candidatura no TSE..." />}
      {!loading && error && <ErrorBox message={error} />}

      {!loading && !error && candidate && (
        <CandidateDetailContent candidate={candidate} sourceUrl={sourceUrl} />
      )}
    </div>
  )
}

type CandidateDetailContentProps = {
  candidate: PresidentialCandidateDetail
  sourceUrl: string
}

function CandidateDetailContent({ candidate, sourceUrl }: CandidateDetailContentProps) {
  const birthPlace = formatBirthPlace(candidate)
  const status = candidate.situacao || candidate.situacaoCandidatura || 'Situação não informada'

  return (
    <>
      <div className="deputy-detail-header candidate-2026-detail-header">
        <img
          alt={candidate.nomeUrna}
          className="deputy-detail-photo"
          height={100}
          src={candidate.fotoUrl || FALLBACK_AVATAR}
          width={100}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_AVATAR
          }}
        />
        <div className="deputy-detail-info">
          <div className="candidate-2026-detail-kicker">Candidatura à Presidência · Eleições 2026</div>
          <h1 className="deputy-detail-name">{candidate.nomeUrna}</h1>
          <div className="candidate-2026-detail-civil-name">{candidate.nomeCompleto}</div>
          <div className="deputy-tags">
            <span className="tag tag-party">{candidate.numero} · {candidate.partido}</span>
            <span className="tag tag-state">🇧🇷 Brasil</span>
            <span className="tag candidate-2026-status-tag">{status}</span>
          </div>
          <div className="deputy-extra">
            {candidate.nomePartido || 'Partido não informado'}
            {candidate.coligacao ? ` · ${candidate.coligacao}` : ''}
          </div>
        </div>
      </div>

      <section className="deputy-general-info" aria-label="Informações gerais da candidatura">
        <h2 className="deputy-general-info-title">Informações gerais</h2>
        <div className="deputy-general-info-grid">
          <DetailItem label="Nome civil" value={candidate.nomeCompleto} />
          <DetailItem label="Cargo" value={candidate.cargo} />
          <DetailItem label="Partido" value={candidate.nomePartido || candidate.partido} />
          <DetailItem label="Número" value={String(candidate.numero)} />
          <DetailItem label="Situação do pedido" value={status} />
          <DetailItem label="Situação na totalização" value={candidate.situacaoTotalizacao} />
          <DetailItem label="Coligação/federação" value={candidate.coligacao} />
          <DetailItem label="Composição" value={candidate.composicaoColigacao} />
          <DetailItem
            label="Nascimento"
            value={candidate.dataNascimento ? formatDate(candidate.dataNascimento) : ''}
          />
          <DetailItem label="Naturalidade" value={birthPlace} />
          <DetailItem label="Ocupação" value={candidate.ocupacao} />
          <DetailItem label="Escolaridade" value={candidate.escolaridade} />
          <DetailItem label="Nacionalidade" value={candidate.nacionalidade} />
          <DetailItem label="Estado civil" value={candidate.estadoCivil} />
          <DetailItem label="Gênero" value={candidate.sexo} />
          <DetailItem label="Cor/raça declarada" value={candidate.corRaca} />
        </div>
      </section>

      <div className="candidate-2026-finance-grid">
        <section className="president-section-card" aria-label="Dados financeiros declarados">
          <h2 className="deputy-general-info-title">Dados financeiros declarados</h2>
          <div className="candidate-2026-stat-list">
            <StatItem label="Total de bens declarados" value={formatCurrency(candidate.totalBens)} />
            <StatItem label="Gastos de campanha" value={formatCurrency(candidate.gastoCampanha)} />
            <StatItem
              label="Gastos no primeiro turno"
              value={formatCurrency(candidate.gastoCampanhaPrimeiroTurno)}
            />
            <StatItem
              label="Gastos no segundo turno"
              value={formatCurrency(candidate.gastoCampanhaSegundoTurno)}
            />
          </div>
        </section>

        <section className="president-section-card candidate-2026-source-card" aria-label="Fonte oficial">
          <h2 className="deputy-general-info-title">Fonte oficial</h2>
          <p>
            Dados publicados pelo Tribunal Superior Eleitoral. A situação da candidatura e os
            valores podem mudar durante o processo eleitoral.
          </p>
          {sourceUrl && (
            <a className="deputy-general-link" href={sourceUrl} rel="noopener noreferrer" target="_blank">
              Abrir perfil completo no DivulgaCandContas ↗
            </a>
          )}
        </section>
      </div>

      <section className="president-section-card" aria-label="Bens declarados">
        <div className="candidate-2026-assets-heading">
          <h2 className="deputy-general-info-title">Bens declarados</h2>
          <span>{candidate.bens.length} registro{candidate.bens.length === 1 ? '' : 's'}</span>
        </div>
        {candidate.bens.length === 0 ? (
          <p className="candidate-2026-empty-copy">Nenhum bem informado na consulta atual.</p>
        ) : (
          <div className="candidate-2026-assets-list">
            {candidate.bens.map((asset) => (
              <article className="candidate-2026-asset" key={`${asset.ordem}-${asset.descricao}`}>
                <div>
                  <div className="candidate-2026-asset-type">{asset.tipo || 'Bem declarado'}</div>
                  <p>{asset.descricao || 'Descrição não informada.'}</p>
                </div>
                <strong>{formatCurrency(asset.valor)}</strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

type DetailItemProps = {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  if (!value) {
    return null
  }

  return (
    <p className="deputy-general-item">
      <span className="deputy-general-label">{label}</span>
      <span className="deputy-general-value">{value}</span>
    </p>
  )
}

type StatItemProps = {
  label: string
  value: string
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="candidate-2026-stat-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
