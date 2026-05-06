import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { STATES } from '../../constants/states'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useStateDeputies } from '../../hooks/useStateDeputies'
import type { StateDeputy } from '../../types/camara'
import { SeoHead } from '../common/SeoHead'
import { StateDeputyDetailPanel } from '../panels/StateDeputyDetailPanel'
import { buildBreadcrumbSchema, buildPersonProfileSchema } from '../../utils/seo'

type StateDeputyDetailLocationState = {
  selectedDeputy?: StateDeputy
  fromGlobalSearch?: boolean
}

const ENABLED_UFS = new Set(['PR', 'SC', 'RS', 'SP', 'RJ', 'MG', 'ES'])

export function StateDeputyDetailPage() {
  const { uf, deputyId } = useParams<{ uf: string; deputyId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { goToStateDeputies } = useAppNavigation()
  const { allDeputies, loadingDeputies, deputiesError, loadDeputies, findDeputyById } = useStateDeputies()
  const locationState = location.state as StateDeputyDetailLocationState | null
  const fromGlobalSearch = Boolean(locationState?.fromGlobalSearch)
  const selectedDeputyFromState = locationState?.selectedDeputy

  useEffect(() => {
    if (!uf || !deputyId) {
      navigate('/por-estado/deputado-estadual')
      return
    }

    const normalizedUf = uf.toUpperCase()
    const isValidUf = STATES.some((state) => state.uf === normalizedUf)

    if (!isValidUf || !ENABLED_UFS.has(normalizedUf)) {
      navigate('/por-estado/deputado-estadual')
      return
    }

    const hasDeputyInMemory = allDeputies.some((item) => item.id === deputyId)

    if (!selectedDeputyFromState && !hasDeputyInMemory) {
      void loadDeputies(normalizedUf)
    }
  }, [uf, deputyId, navigate, allDeputies, loadDeputies, selectedDeputyFromState])

  const selectedDeputy = useMemo(() => {
    if (!deputyId) return null
    return selectedDeputyFromState || findDeputyById(deputyId)
  }, [deputyId, selectedDeputyFromState, findDeputyById])

  const normalizedUf = uf?.toUpperCase() ?? ''
  const stateName = STATES.find((state) => state.uf === normalizedUf)?.name || normalizedUf
  const deputyName = selectedDeputy?.nome || 'Deputado estadual'
  const detailPath = uf && deputyId
    ? `/por-estado/${uf.toLowerCase()}/deputado-estadual/${deputyId}`
    : '/por-estado/deputado-estadual'

  const personSchema = buildPersonProfileSchema({
    name: deputyName,
    jobTitle: 'Deputado Estadual',
    path: detailPath,
    imageUrl: selectedDeputy?.urlFoto,
    party: selectedDeputy?.siglaPartido,
    worksFor: 'Assembleia Legislativa Estadual',
  })

  if (!loadingDeputies && !selectedDeputy) {
    return (
      <>
        <SeoHead
          title="Deputado estadual não encontrado"
          description="O perfil solicitado não foi encontrado. Volte para a lista por estado e faça uma nova busca."
          canonicalPath={uf ? `/por-estado/${uf.toLowerCase()}/deputado-estadual` : '/por-estado/deputado-estadual'}
        />
        <div>Deputado estadual não encontrado</div>
      </>
    )
  }

  return (
    <>
      <SeoHead
        title={`Perfil de ${deputyName}`}
        description={`Acompanhe dados públicos de ${deputyName}${stateName ? `, representante de ${stateName}` : ''}.`}
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Seleção por estado', path: '/por-estado/deputado-estadual' },
            {
              name: stateName ? `Deputados estaduais de ${stateName}` : 'Lista de deputados estaduais',
              path: uf ? `/por-estado/${uf.toLowerCase()}/deputado-estadual` : '/por-estado/deputado-estadual',
            },
            { name: deputyName, path: detailPath },
          ]),
          personSchema,
        ]}
      />
      <StateDeputyDetailPanel
        deputy={selectedDeputy}
        loading={loadingDeputies}
        error={deputiesError}
        onBack={() => {
          if (fromGlobalSearch) {
            navigate('/busca')
            return
          }

          goToStateDeputies(uf || '')
        }}
      />
    </>
  )
}
