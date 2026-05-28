import type {
  Deputy,
  FavoritePolitician,
  President,
  PresidentDetail,
  Senator,
  SenatorDetail,
  StateDeputy,
} from '../types/camara'

const BRAZIL_UF = 'BR'

function normalizeParty(value: string | undefined): string {
  return value && value.trim() ? value.trim() : 'Sem partido'
}

export function toDeputyFavorite(deputy: Deputy): FavoritePolitician {
  return {
    id: String(deputy.id),
    nome: deputy.nome,
    estado: deputy.siglaUf.toUpperCase(),
    partido: normalizeParty(deputy.siglaPartido),
    grupo: 'deputados-federais',
    cargo: 'deputado-federal',
  }
}

export function toStateDeputyFavorite(deputy: StateDeputy): FavoritePolitician {
  return {
    id: deputy.id,
    nome: deputy.nome,
    estado: deputy.siglaUf.toUpperCase(),
    partido: normalizeParty(deputy.siglaPartido),
    grupo: 'deputados-estaduais',
    cargo: 'deputado-estadual',
  }
}

export function toSenatorFavorite(senator: Senator | SenatorDetail): FavoritePolitician {
  return {
    id: senator.id,
    nome: senator.nome,
    estado: senator.siglaUf.toUpperCase(),
    partido: normalizeParty(senator.siglaPartido),
    grupo: 'senadores',
    cargo: 'senador',
  }
}

export function toPresidentFavorite(president: President | PresidentDetail): FavoritePolitician {
  return {
    id: president.id,
    nome: president.nome,
    estado: BRAZIL_UF,
    partido: normalizeParty(president.siglaPartido),
    grupo: 'presidentes',
    cargo: 'presidente',
  }
}

export function toViceFavorite(vice: NonNullable<President['vice']>): FavoritePolitician {
  return {
    id: vice.id,
    nome: vice.nome,
    estado: BRAZIL_UF,
    partido: normalizeParty(vice.siglaPartido),
    grupo: 'presidentes',
    cargo: 'presidente',
  }
}
