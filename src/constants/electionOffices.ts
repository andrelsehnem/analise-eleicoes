import type { StateElectionOffice } from '../types/camara'

export type StateElectionOfficeConfig = {
  slug: StateElectionOffice
  apiSegment: string
  buttonLabel: string
  candidateLabel: string
  candidateLabelPlural: string
}

export const STATE_ELECTION_OFFICES: StateElectionOfficeConfig[] = [
  { slug: 'governador', apiSegment: 'governadores', buttonLabel: 'Governador', candidateLabel: 'Governador', candidateLabelPlural: 'Governador' },
  { slug: 'senador', apiSegment: 'senadores', buttonLabel: 'Senador', candidateLabel: 'Senador', candidateLabelPlural: 'Senador' },
  { slug: 'deputado-federal', apiSegment: 'deputados-federais', buttonLabel: 'Deputado Federal', candidateLabel: 'Deputado Federal', candidateLabelPlural: 'Deputado Federal' },
  { slug: 'deputado-estadual', apiSegment: 'deputados-estaduais', buttonLabel: 'Deputado Estadual/Distrital', candidateLabel: 'Deputado Estadual', candidateLabelPlural: 'Deputado Estadual' },
]

export function getStateElectionOffice(slug: string): StateElectionOfficeConfig | undefined {
  return STATE_ELECTION_OFFICES.find((office) => office.slug === slug)
}

export function getElectionOfficeLabel(config: StateElectionOfficeConfig, uf: string): string {
  return config.slug === 'deputado-estadual' && uf === 'DF'
    ? 'Deputado Distrital'
    : config.candidateLabel
}
