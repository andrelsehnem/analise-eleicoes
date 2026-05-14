# Analise-Eleicoes

Aplicação web SPA para consulta pública de políticos brasileiros, com foco atual em deputados federais por estado e consulta da Presidência da República.

## Stack

- React 19 + TypeScript (strict)
- Vite
- React Router DOM
- ESLint (`typescript-eslint`)
- CSS puro
- `@svg-maps/brazil`

## Funcionalidades implementadas

- Landing com entrada para busca por estado
- Busca global por nome, partido e cargo com filtros clicáveis
- Seleção de estado por mapa do Brasil e lista de UFs
- Lista de deputados federais por UF com busca por nome/partido
- Lista de senadores por UF com busca por nome/partido
- Detalhe de deputado com:
  - dados gerais
  - proposições com filtros e carregamento incremental
  - votos por proposição
  - órgãos de atuação
- Lista e detalhe da Presidência (presidente e vice)
- Página Sobre
- Página de Privacidade e Cookies
- Página de Sugestões com envio para endpoint serverless

## Funcionalidades não implementadas (roadmap)

- Favoritos
- Comparação entre políticos
- Consulta para deputado estadual
- Candidatos futuros

Detalhes em `documentacao/roadmap-nao-implementado.md`.

## Rotas principais

- `/`
- `/busca`
- `/por-estado`
- `/por-estado/deputado-federal`
- `/por-estado/deputado-estadual`
- `/senadores/:uf`
- `/senador/:senatorId`
- `/presidente`
- `/presidente/:presidentId`
- `/sobre`
- `/privacidade`
- `/sugestoes`

## Fontes de dados

- API Dados Abertos da Câmara: `https://dadosabertos.camara.leg.br/api/v2`
- Wikipedia REST (resumo complementar da Presidência): `https://pt.wikipedia.org/api/rest_v1/page/summary`
- Dados locais em `src/constants/presidents.ts`

## Como executar

### Pré-requisitos

- Node.js 20+
- npm

### Comandos

```bash
npm install
npm run dev
```

Outros comandos:

```bash
npm run build
npm run lint
npm run preview
```

## Estrutura resumida

```text
src/
  api/
  components/
    common/
    layout/
    pages/
    panels/
  constants/
  hooks/
  types/
  utils/
```

## Documentação detalhada

A documentação técnica e funcional consolidada está em `documentacao/`.

## Integrações globais no shell HTML

- Scripts de rastreamento são carregados somente após consentimento explícito no banner de cookies.
- O banner usa localStorage para registrar decisão de aceite/rejeição e ocultação temporária por 30 dias ao fechar no `X`.
- O carregamento condicional de scripts está em `src/utils/trackingConsent.ts`.
- IDs opcionais para GA/GTM podem ser configurados via `VITE_GA_MEASUREMENT_ID` e `VITE_GTM_CONTAINER_ID`.
- Ao alterar scripts externos de rastreamento, ajuste também a política de segurança em `vercel.json` para liberar os domínios necessários no CSP.
