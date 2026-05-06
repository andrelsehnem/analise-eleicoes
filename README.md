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
- Seleção de estado por mapa do Brasil e lista de UFs
- Lista de deputados federais por UF com busca por nome/partido
- Detalhe de deputado com:
  - dados gerais
  - proposições com filtros e carregamento incremental
  - votos por proposição
  - órgãos de atuação
- Lista e detalhe da Presidência (presidente e vice)
- Página Sobre
- Página de Sugestões com envio para endpoint serverless

## Funcionalidades não implementadas (roadmap)

- Busca direta global por nome
- Favoritos
- Comparação entre políticos
- Consulta funcional para senador e deputado estadual
- Candidatos futuros

Detalhes em `documentacao/roadmap-nao-implementado.md`.

## Rotas principais

- `/`
- `/por-estado`
- `/por-estado/:uf/deputado-federal`
- `/por-estado/:uf/deputado-federal/:deputyId`
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

## Variáveis de ambiente (Sugestões)

Frontend (Vite):

- `VITE_TURNSTILE_SITE_KEY`

Serverless (Vercel):

- `SITE_URL`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `SUGESTOES_DEST_EMAIL`
- `SUGESTOES_FROM_EMAIL` (opcional)
- `SUGESTOES_RATE_LIMIT_MAX` (opcional, padrão `5`)
- `BETTER_AUTH_SECRET` (futuro login; gere com 32+ caracteres)
- `BETTER_AUTH_TRUSTED_ORIGINS` (origens confiáveis separadas por vírgula)

## Checklist de deploy na Vercel

- Criar as variáveis de ambiente do frontend e backend com base em [.env.example](.env.example).
- Configurar `VITE_TURNSTILE_SITE_KEY` com a chave pública do Cloudflare Turnstile.
- Configurar `TURNSTILE_SECRET_KEY` com a chave secreta do Turnstile.
- Configurar `RESEND_API_KEY` e validar o domínio/remetente usado em `SUGESTOES_FROM_EMAIL`.
- Configurar `SUGESTOES_DEST_EMAIL` com a caixa que receberá as sugestões.
- Fazer deploy e testar o fluxo completo em [/sugestoes](src/App.tsx#L123-L131).
- Validar cenários de erro: captcha inválido, limite de requisições e falha de envio de e-mail.

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
