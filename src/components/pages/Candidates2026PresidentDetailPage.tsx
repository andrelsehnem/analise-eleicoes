import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePresidentialCandidateDetail } from '../../hooks/usePresidentialCandidateDetail'
import { buildBreadcrumbSchema, buildPersonProfileSchema } from '../../utils/seo'
import { SeoHead } from '../common/SeoHead'
import { Candidates2026PresidentDetailPanel } from '../panels/Candidates2026/Candidates2026PresidentDetailPanel'

export function Candidates2026PresidentDetailPage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const navigate = useNavigate()
  const { candidate, sourceUrl, loading, error, loadCandidate } =
    usePresidentialCandidateDetail()

  useEffect(() => {
    if (!candidateId || !/^\d{6,18}$/.test(candidateId)) {
      navigate('/candidatos-2026/presidente', { replace: true })
      return
    }

    void loadCandidate(candidateId)
  }, [candidateId, loadCandidate, navigate])

  const profileName = candidate?.nomeUrna || 'Candidato à Presidência'
  const detailPath = candidateId
    ? `/candidatos-2026/presidente/${candidateId}`
    : '/candidatos-2026/presidente'

  return (
    <>
      <SeoHead
        canonicalPath={detailPath}
        description={
          candidate
            ? `Consulte os dados eleitorais declarados por ${candidate.nomeUrna}, candidato à Presidência em 2026.`
            : 'Consulte dados oficiais de uma candidatura à Presidência nas Eleições 2026.'
        }
        title={`Perfil de ${profileName}`}
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Candidatos 2026', path: '/candidatos-2026' },
            { name: 'Presidência', path: '/candidatos-2026/presidente' },
            { name: profileName, path: detailPath },
          ]),
          buildPersonProfileSchema({
            name: profileName,
            jobTitle: 'Candidato à Presidência em 2026',
            path: detailPath,
            imageUrl: candidate?.fotoUrl,
            party: candidate?.partido,
            sameAs: sourceUrl ? [sourceUrl] : [],
            worksFor: candidate?.nomePartido,
          }),
        ]}
      />
      <Candidates2026PresidentDetailPanel
        candidate={candidate}
        error={error}
        loading={loading}
        sourceUrl={sourceUrl}
        onBack={() => navigate('/candidatos-2026/presidente')}
      />
    </>
  )
}
