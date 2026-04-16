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
  //sexo?: string
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
  id?: number
  uri?: string
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

export type PropositionVote = {
  votacaoId: string
  voto: string
  deputadoId?: number
  deputadoNome: string
  siglaPartido?: string
  siglaUf?: string
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

export type President = {
  id: string
  nome: string
  cargo: string
  siglaPartido: string
  abrangencia: string
  periodo: string
  wikipediaTitle: string
  email?: string
  urlFoto?: string
  officialWebsite?: string
  vice?: {
    id: string
    nome: string
    cargo: string
    siglaPartido?: string
    periodo?: string
    urlFoto?: string
    officialWebsite?: string
  }
}

export type PresidentTerm = {
  titulo: string
  inicio: string
  fim?: string
  vice?: string
  resumo?: string
}

export type PresidentLink = {
  label: string
  url: string
}

export type PresidentDetail = President & {
  descricao?: string
  resumo: string
  fonteResumoUrl?: string
  nomeCivil?: string
  dataNascimento?: string
  naturalidade?: string
  posseAtual?: string
  partido?: string
  mandatos: PresidentTerm[]
  links: PresidentLink[]
}

export type OfficeType =
  | 'deputado-federal'
  | 'deputado-estadual'
  | 'senador'
  | 'presidente'

export type Panel = 'landing' | 'states' | 'deputies' | 'detail'
export type Tab = 'proposicoes' | 'votacoes'
