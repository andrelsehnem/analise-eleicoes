import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { STATES } from '../../constants/states'
import { useAppNavigation } from '../../hooks/useAppNavigation'
import { useGeneralInfo } from '../../hooks/useGeneralInfo'
import { normalizeSearchText } from '../../utils/format'
import { buildBreadcrumbSchema, buildCollectionPageSchema } from '../../utils/seo'
import { SeoHead } from '../common/SeoHead'
import { GeneralInfoPanel } from '../panels/GeneralInfo/GeneralInfoPanel'

export function GeneralInfoPage() {
  const { uf } = useParams<{ uf?: string }>()
  const navigate = useNavigate()
  const { goToStateSelection } = useAppNavigation()
  const [stateSearch, setStateSearch] = useState('')

  const normalizedUf = uf?.trim().toUpperCase() || ''
  const hasSelectedUf = Boolean(normalizedUf)

  useEffect(() => {
    if (!hasSelectedUf) {
      return
    }

    const isValidUf = STATES.some((state) => state.uf === normalizedUf)

    if (!isValidUf) {
      navigate('/informacoes-gerais', { replace: true })
    }
  }, [hasSelectedUf, navigate, normalizedUf])

  const selectedStateName =
    STATES.find((state) => state.uf === normalizedUf)?.name || 'Estado não encontrado'

  const { stats, officeStats, selectedStateStats, loadingGeneralInfo, generalInfoError, loadGeneralInfo } =
    useGeneralInfo(normalizedUf)

  useEffect(() => {
    void loadGeneralInfo()
  }, [loadGeneralInfo])

  const filteredStates = useMemo(() => {
    const query = normalizeSearchText(stateSearch)

    if (!query) {
      return STATES
    }

    return STATES.filter((state) => {
      const normalizedUfValue = normalizeSearchText(state.uf)
      const normalizedName = normalizeSearchText(state.name)
      return normalizedUfValue.includes(query) || normalizedName.includes(query)
    })
  }, [stateSearch])

  const pageTitle = hasSelectedUf
    ? `Quantos senadores e deputados têm em ${selectedStateName} (${normalizedUf})`
    : 'Informações gerais por estado e cargo'

  const pageDescription = hasSelectedUf
    ? `Consulte quantos senadores, deputados federais e deputados estaduais têm em ${selectedStateName}, com distribuição por cargo e partido.`
    : 'Consulte números gerais de políticos por estado e por cargo, com distribuição por partido e indicadores consolidados.'

  const canonicalPath = hasSelectedUf ? `/informacoes-gerais/${normalizedUf.toLowerCase()}` : '/informacoes-gerais'

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        jsonLd={[
          buildBreadcrumbSchema([
            { name: 'Início', path: '/' },
            { name: 'Informações gerais', path: '/informacoes-gerais' },
            ...(hasSelectedUf
              ? [{ name: selectedStateName, path: `/informacoes-gerais/${normalizedUf.toLowerCase()}` }]
              : []),
          ]),
          buildCollectionPageSchema(pageTitle, pageDescription, canonicalPath),
        ]}
      />
      <GeneralInfoPanel
        selectedUf={normalizedUf}
        selectedStateName={selectedStateName}
        stateSearch={stateSearch}
        stateOptions={filteredStates}
        stats={stats}
        officeStats={officeStats}
        selectedStateStats={selectedStateStats}
        loading={loadingGeneralInfo}
        error={generalInfoError}
        onStateSearchChange={setStateSearch}
        onClearSelectedUf={() => {
          navigate('/informacoes-gerais')
        }}
        onBack={goToStateSelection}
      />
    </>
  )
}
