import type { President, PresidentDetail } from '../types/camara'

export const PRESIDENTS: President[] = [
  {
    id: 'luiz-inacio-lula-da-silva',
    nome: 'Luiz Inácio Lula da Silva',
    cargo: 'Presidente da República',
    siglaPartido: 'PT',
    abrangencia: 'Brasil',
    periodo: '2023 - atual',
    wikipediaTitle: 'Luiz_Inácio_Lula_da_Silva',
    urlFoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/330px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg',
    officialWebsite: 'https://www.gov.br/planalto/pt-br/presidencia/presidente-da-republica',
    vice: {
      id: 'geraldo-alckmin',
      nome: 'Geraldo Alckmin',
      cargo: 'Vice-Presidente da República',
      siglaPartido: 'PSB',
      periodo: '2023 - atual',
      urlFoto:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Geraldo_Alckmin_-_2023_%28cropped%29.jpg/330px-Geraldo_Alckmin_-_2023_%28cropped%29.jpg',
      officialWebsite: 'https://www.gov.br/vicepresidencia/pt-br',
    },
  },
]

export const PRESIDENT_DETAIL_BY_ID: Record<string, PresidentDetail> = {
  'luiz-inacio-lula-da-silva': {
    id: 'luiz-inacio-lula-da-silva',
    nome: 'Luiz Inácio Lula da Silva',
    cargo: 'Presidente da República',
    siglaPartido: 'PT',
    abrangencia: 'Brasil',
    periodo: '2023 - atual',
    wikipediaTitle: 'Luiz_Inácio_Lula_da_Silva',
    urlFoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg/330px-Foto_oficial_de_Luiz_In%C3%A1cio_Lula_da_Silva_%28ombros%29_denoise.jpg',
    officialWebsite: 'https://www.gov.br/planalto/pt-br/presidencia/presidente-da-republica',
    vice: {
      id: 'geraldo-alckmin',
      nome: 'Geraldo Alckmin',
      cargo: 'Vice-Presidente da República',
      siglaPartido: 'PSB',
      periodo: '2023 - atual',
      urlFoto:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Geraldo_Alckmin_-_2023_%28cropped%29.jpg/330px-Geraldo_Alckmin_-_2023_%28cropped%29.jpg',
      officialWebsite: 'https://www.gov.br/vicepresidencia/pt-br',
    },
    descricao: '39.º presidente do Brasil',
    resumo:
      'Luiz Inácio Lula da Silva exerce a Presidência da República desde 2023 e já havia ocupado o cargo entre 2003 e 2010.',
    fonteResumoUrl: 'https://pt.wikipedia.org/wiki/Luiz_In%C3%A1cio_Lula_da_Silva',
    nomeCivil: 'Luiz Inácio da Silva',
    dataNascimento: '1945-10-27',
    naturalidade: 'Caetés/PE',
    posseAtual: '2023-01-01',
    partido: 'Partido dos Trabalhadores (PT)',
    mandatos: [
      {
        titulo: '39.º presidente do Brasil',
        inicio: '2023-01-01',
        vice: 'Geraldo Alckmin',
        resumo: 'Mandato iniciado em 1º de janeiro de 2023.',
      },
      {
        titulo: '35.º presidente do Brasil',
        inicio: '2003-01-01',
        fim: '2011-01-01',
        vice: 'José Alencar',
        resumo: 'Dois mandatos presidenciais consecutivos entre 2003 e 2010.',
      },
    ],
    links: [
      {
        label: 'Página oficial da Presidência',
        url: 'https://www.gov.br/planalto/pt-br/presidencia/presidente-da-republica',
      },
      {
        label: 'Palácio do Planalto',
        url: 'https://www.gov.br/planalto/pt-br',
      },
      {
        label: 'Resumo na Wikipedia',
        url: 'https://pt.wikipedia.org/wiki/Luiz_In%C3%A1cio_Lula_da_Silva',
      },
    ],
  },
  'geraldo-alckmin': {
    id: 'geraldo-alckmin',
    nome: 'Geraldo Alckmin',
    cargo: 'Vice-Presidente da República',
    siglaPartido: 'PSB',
    abrangencia: 'Brasil',
    periodo: '2023 - atual',
    wikipediaTitle: 'Geraldo_Alckmin',
    urlFoto:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Geraldo_Alckmin_-_2023_%28cropped%29.jpg/330px-Geraldo_Alckmin_-_2023_%28cropped%29.jpg',
    officialWebsite: 'https://www.gov.br/vicepresidencia/pt-br',
    descricao: 'Vice-presidente do Brasil',
    resumo:
      'Geraldo Alckmin exerce a Vice-Presidência da República desde 2023, integrando a chapa eleita para o mandato federal iniciado em 2023.',
    fonteResumoUrl: 'https://pt.wikipedia.org/wiki/Geraldo_Alckmin',
    nomeCivil: 'Geraldo José Rodrigues Alckmin Filho',
    dataNascimento: '1952-11-07',
    naturalidade: 'Pindamonhangaba/SP',
    posseAtual: '2023-01-01',
    partido: 'Partido Socialista Brasileiro (PSB)',
    mandatos: [
      {
        titulo: 'Vice-Presidente da República',
        inicio: '2023-01-01',
        resumo: 'Mandato iniciado em 1º de janeiro de 2023.',
      },
      {
        titulo: 'Governador de São Paulo',
        inicio: '2011-01-01',
        fim: '2018-04-06',
        resumo: 'Exerceu o governo paulista em diferentes períodos, com reeleições consecutivas.',
      },
    ],
    links: [
      {
        label: 'Página oficial da Vice-Presidência',
        url: 'https://www.gov.br/vicepresidencia/pt-br',
      },
      {
        label: 'Resumo na Wikipedia',
        url: 'https://pt.wikipedia.org/wiki/Geraldo_Alckmin',
      },
    ],
  },
}
