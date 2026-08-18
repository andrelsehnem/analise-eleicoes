import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getElectionOfficeLabel, getStateElectionOffice } from '../../constants/electionOffices'
import { STATES } from '../../constants/states'
import { useStateElectionCandidateDetail } from '../../hooks/useStateElectionCandidateDetail'
import type { StateElectionOffice } from '../../types/camara'
import { buildBreadcrumbSchema, buildPersonProfileSchema } from '../../utils/seo'
import { SeoHead } from '../common/SeoHead'
import { Candidates2026PresidentDetailPanel } from '../panels/Candidates2026/Candidates2026PresidentDetailPanel'

export function StateElectionCandidateDetailPage() {
  const { office: rawOffice = '', uf: rawUf = '', candidateId = '' } = useParams<{ office: string; uf: string; candidateId: string }>()
  const navigate = useNavigate()
  const config = getStateElectionOffice(rawOffice)
  const uf = rawUf.toUpperCase()
  const state = STATES.find((item) => item.uf === uf)
  const office = (config?.slug ?? 'governador') as StateElectionOffice
  const { candidate, sourceUrl, loading, error, loadCandidate } = useStateElectionCandidateDetail()
  const listPath = `/candidatos-2026/${office}/${uf.toLowerCase()}`

  useEffect(() => {
    if (config && state && /^\d{6,18}$/.test(candidateId)) void loadCandidate(office, uf, candidateId)
  }, [candidateId, config, loadCandidate, office, state, uf])

  if (!config || !state) return <Navigate replace to="/candidatos-2026" />
  if (!/^\d{6,18}$/.test(candidateId)) return <Navigate replace to={listPath} />
  const officeLabel = getElectionOfficeLabel(config, uf)
  const profileName = candidate?.nomeUrna || `Candidato a ${officeLabel}`
  const detailPath = `${listPath}/${candidateId}`

  return <>
    <SeoHead canonicalPath={detailPath} description={candidate
      ? `Consulte os dados eleitorais declarados por ${candidate.nomeUrna}, candidato a ${officeLabel} de ${state.name} em 2026.`
      : `Consulte dados oficiais de uma candidatura a ${officeLabel} de ${state.name} em 2026.`}
      title={`Perfil de ${profileName}`}
      jsonLd={[buildBreadcrumbSchema([{ name: 'Início', path: '/' }, { name: 'Candidatos 2026', path: '/candidatos-2026' },
        { name: `${officeLabel} de ${state.name}`, path: listPath }, { name: profileName, path: detailPath }]),
      buildPersonProfileSchema({ name: profileName, jobTitle: `Candidato a ${officeLabel} de ${state.name} em 2026`,
        path: detailPath, imageUrl: candidate?.fotoUrl, party: candidate?.partido,
        sameAs: sourceUrl ? [sourceUrl] : [], worksFor: candidate?.nomePartido })]} />
    <Candidates2026PresidentDetailPanel candidate={candidate} error={error} loading={loading}
      officeLabel={`${officeLabel} de ${state.name}`} jurisdictionLabel={`${uf} · ${state.name}`}
      sourceUrl={sourceUrl} onBack={() => navigate(listPath)} />
  </>
}
