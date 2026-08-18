import {
  federalDeputyConfig,
  governorConfig,
  senatorConfig,
  stateDeputyConfig,
} from './_lib/officeConfigs.js'
import {
  createStateCandidateDetailHandler,
  createStateCandidatesListHandler,
} from './_lib/stateCandidates.js'

const configs = {
  governadores: governorConfig,
  senadores: senatorConfig,
  'deputados-federais': federalDeputyConfig,
  'deputados-estaduais': stateDeputyConfig,
}

export default async function handler(req, res) {
  const rawOffice = Array.isArray(req.query?.office) ? req.query.office[0] : req.query?.office
  const office = typeof rawOffice === 'string' ? rawOffice.trim() : ''
  const config = configs[office]

  if (!config) {
    return res.status(400).json({ message: 'Cargo eleitoral inválido.' })
  }

  const rawId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id
  const hasCandidateId = typeof rawId === 'string' && rawId.trim() !== ''
  const officeHandler = hasCandidateId
    ? createStateCandidateDetailHandler(config)
    : createStateCandidatesListHandler(config)

  return officeHandler(req, res)
}
