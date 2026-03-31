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
  nomeCivil?: string
  cpf?: string
  sexo?: string
  urlWebsite?: string
  redeSocial?: string[]
  escolaridade?: string
  dataNascimento?: string
  municipioNascimento?: string
  ufNascimento?: string
  gabinete?: {
    nome?: string
    predio?: string
    sala?: string
    andar?: string
    telefone?: string
    email?: string
  }
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

export type Profession = {
  titulo?: string
  nome?: string
}

export type DeputyOrgan = {
  siglaOrgao?: string
  nomeOrgao?: string
  titulo?: string
  dataInicio?: string
  dataFim?: string
}

export type Panel = 'landing' | 'states' | 'deputies' | 'detail'
export type Tab = 'proposicoes' | 'votacoes'
