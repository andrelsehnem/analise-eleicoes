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

- O Social Bar da Adsterra é carregado globalmente em `index.html`, logo antes do fechamento do `body`, para ficar disponível em todas as rotas da SPA.
- Ao alterar scripts externos globais, também ajuste a política de segurança em `vercel.json` para liberar os domínios necessários no CSP.
