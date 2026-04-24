# Fontes de Dados e API

## Fontes utilizadas

1. **Câmara dos Deputados (Dados Abertos)**
   - Base: `https://dadosabertos.camara.leg.br/api/v2`
   - Uso: deputados, detalhe, profissões, órgãos, proposições, votações.
2. **Wikipedia REST (pt-BR)**
   - Base: `https://pt.wikipedia.org/api/rest_v1/page/summary`
   - Uso: enriquecimento de resumo/foto/fonte no detalhe da presidência.
3. **Dados locais do projeto**
   - `src/constants/presidents.ts`
   - Uso: diretório de presidente/vice e fallback de detalhe.

## Funções públicas em `src/api/camaraApi.ts`

- `fetchDeputiesByState(uf)`
- `fetchDeputyPropositionsPage(id, page, options)`
- `fetchDeputyDetailBundle(id, options)`
- `fetchDeputyOrgaos(id)`
- `fetchPropositionVotes(propositionId)`
- `fetchPresidents()`
- `fetchPresidentDetail(id)`

## Regras relevantes de negócio

- Proposições são filtradas para o período de mandato atual (`2022` a `2026`).
- Requerimentos (`REQ`) podem ser incluídos/excluídos por flag (`includeRequirements`).
- Paginação de proposições usa tamanho fixo de 100 itens por página.
- Votos de proposição são agregados de múltiplas votações e ordenados por data decrescente.

## Estratégias de robustez

- `fetchApi<T>` centraliza tratamento de erro HTTP.
- Uso de `Promise.allSettled` em pontos sensíveis para tolerância a falhas parciais.
- Cache em memória para reduzir chamadas repetidas:
  - detalhe de deputado
  - órgãos do deputado
  - votos por proposição
  - detalhe de presidência
