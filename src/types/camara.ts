export type StateItem = {
  uf: string
  name: string
}

export type Deputy = {
  id: number
  nome: string
  siglaPartido: string
  siglaUf: string
  email?: string
  urlFoto?: string
}

export type DeputyInfo = {
  escolaridade?: string
  dataNascimento?: string
  ultimoStatus?: {
    nomeEleitoral?: string
    siglaPartido?: string
    siglaUf?: string
    email?: string
    urlFoto?: string
  }
}

export type Proposition = {
  siglaTipo?: string
  numero?: number
  ano?: number
  ementa?: string
  statusProposicao?: {
    descricaoSituacao?: string
    dataHora?: string
  }
}

export type Vote = {
  voto?: string
  descricao?: string
  proposicaoObjeto?: string
  dataHoraVoto?: string
}

export type Panel = 'landing' | 'states' | 'deputies' | 'detail'
export type Tab = 'proposicoes' | 'votacoes'
