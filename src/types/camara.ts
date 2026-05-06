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

export type Senator = {
  id: string
  codigoPublico?: string
  nome: string
  nomeCompleto?: string
  sexo?: string
  siglaPartido: string
  siglaUf: string
  email?: string
  telefone?: string
  urlFoto?: string
  urlPagina?: string
  urlPaginaParticular?: string
  blocoNome?: string
  blocoApelido?: string
  membroMesa?: boolean
  membroLideranca?: boolean
  descricaoParticipacao?: string
}

export type SenatorServiceLink = {
  nome: string
  descricao?: string
  url: string
}

export type SenatorTerm = {
  codigoMandato?: string
  uf: string
  participacao?: string
  legislaturas: Array<{
    numero?: string
    inicio?: string
    fim?: string
  }>
  partidos: Array<{
    sigla?: string
    nome?: string
    dataFiliacao?: string
  }>
}

export type SenatorCommission = {
  codigo?: string
  sigla?: string
  nome?: string
  casa?: string
  participacao?: string
  inicio?: string
  fim?: string
}

export type SenatorOffice = {
  codigo?: string
  cargo?: string
  comissao?: string
  nomeComissao?: string
  inicio?: string
  fim?: string
}

export type SenatorFiliacao = {
  siglaPartido: string
  nomePartido?: string
  dataFiliacao?: string
  dataDesfiliacao?: string
}

export type SenatorLicenca = {
  codigo: string
  dataInicio?: string
  dataFim?: string
  siglaTipo?: string
  descricaoTipo?: string
}

export type SenatorLideranca = {
  unidade?: string
  casa?: string
  tipo?: string
  ordemVice?: string
  dataInicio?: string
  dataFim?: string
  bloco?: {
    sigla?: string
    nome?: string
  }
  partido?: {
    sigla?: string
    nome?: string
  }
}

export type SenatorMateriaAutoria = {
  codigoMateria?: string
  identificacao?: string
  ementa?: string
  data?: string
  indicadorAutorPrincipal?: boolean
  indicadorOutrosAutores?: boolean
}

export type SenatorMateriaRelatoria = {
  codigoMateria?: string
  identificacao?: string
  ementa?: string
  data?: string
  tipoRelator?: string
  dataDesignacao?: string
  dataDestituicao?: string
  motivoDestituicao?: string
  comissao?: {
    sigla?: string
    nome?: string
  }
}

export type SenatorVotacao = {
  codigoSessaoVotacao?: string
  descricaoVotacao?: string
  descricaoResultado?: string
  dataSessao?: string
  siglaVoto?: string
  descricaoVoto?: string
  votacaoSecreta?: boolean
  totalSim?: string
  totalNao?: string
  totalAbstencao?: string
  materia?: {
    identificacao?: string
    ementa?: string
  }
}

export type SenatorAparte = {
  codigo: string
  tipoSigla?: string
  tipoDescricao?: string
  data?: string
  casa?: string
  textoResumo?: string
  urlTexto?: string
  orador?: {
    nome?: string
    siglaPartido?: string
    uf?: string
  }
  sessao?: {
    data?: string
    numero?: string
    tipo?: string
  }
}

export type SenatorDetail = Senator & {
  dataNascimento?: string
  naturalidade?: string
  ufNaturalidade?: string
  enderecoParlamentar?: string
  mandatos: SenatorTerm[]
  comissoes: SenatorCommission[]
  cargos: SenatorOffice[]
  links: SenatorServiceLink[]
}

export type PoliticiansIndexGroup = 'deputados-federais' | 'senadores'

export type PoliticianIndexItem = {
  id: string
  nome: string
  estado: string
  partido: string
}

export type PoliticiansIndex = {
  geradoEm: string
  'deputados-federais': PoliticianIndexItem[]
  senadores: PoliticianIndexItem[]
}

export type GlobalSearchItem = PoliticianIndexItem & {
  grupo: PoliticiansIndexGroup
  cargo: 'deputado-federal' | 'senador'
}

export type OfficeType =
  | 'deputado-federal'
  | 'deputado-estadual'
  | 'senador'
  | 'presidente'

export type Panel = 'landing' | 'states' | 'deputies' | 'detail'
export type Tab = 'proposicoes' | 'votacoes'

export type SuggestionPayload = {
  nome: string
  telefone?: string
  email?: string
  assunto: string
  descricao: string
  captchaToken: string
}

export type SuggestionSuccessResponse = {
  success: true
  message: string
}
