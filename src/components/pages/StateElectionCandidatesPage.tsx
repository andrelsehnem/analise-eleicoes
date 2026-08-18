import { useCallback, useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getElectionOfficeLabel, getStateElectionOffice } from '../../constants/electionOffices'
import { STATES } from '../../constants/states'
import { useStateElectionCandidates } from '../../hooks/useStateElectionCandidates'
import type { StateElectionOffice } from '../../types/camara'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'
import { SeoHead } from '../common/SeoHead'
import { StateElectionCandidatesPanel } from '../panels/Candidates2026/StateElectionCandidatesPanel'

export function StateElectionCandidatesPage() {
  const { office: rawOffice = '', uf: rawUf = '' } = useParams<{ office: string; uf: string }>()
  const navigate = useNavigate()
  const config = getStateElectionOffice(rawOffice)
  const uf = rawUf.toUpperCase()
  const state = STATES.find((item) => item.uf === uf)
  const office = (config?.slug ?? 'governador') as StateElectionOffice
  const data = useStateElectionCandidates(office, uf)
  const { loadCandidates, setPage } = data

  const handlePageChange = useCallback((page: number) => {
    setPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setPage])

  useEffect(() => {
    if (config && state) void loadCandidates()
  }, [config, loadCandidates, state])

  if (!config || !state) return <Navigate replace to="/candidatos-2026" />
  const officeLabel = getElectionOfficeLabel(config, uf)
  const pagePath = `/candidatos-2026/${office}/${uf.toLowerCase()}`
  const title = `Candidatos a ${officeLabel} de ${state.name} em 2026`
  const description = `Consulte os candidatos a ${officeLabel} de ${state.name} nas Eleições 2026 com dados publicados pelo TSE.`

  return <>
    <SeoHead canonicalPath={pagePath} description={description} title={title}
      jsonLd={[buildBreadcrumbSchema([{ name: 'Início', path: '/' }, { name: 'Candidatos 2026', path: '/candidatos-2026' },
        { name: `${officeLabel} de ${state.name}`, path: pagePath }]),
      buildCollectionPageSchema(title, description, pagePath)]} />
    <StateElectionCandidatesPanel allCandidatesCount={data.allCandidates.length}
      candidates={data.candidates} filteredCount={data.filteredCount} error={data.error}
      loading={data.loading} office={office} officeLabel={officeLabel} page={data.page}
      search={data.search} stateName={state.name} totalPages={data.totalPages} uf={uf}
      onBack={() => navigate('/candidatos-2026')} onPageChange={handlePageChange} onSearchChange={data.setSearch} />
  </>
}
