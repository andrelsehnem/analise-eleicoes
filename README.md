# Analise-Eleicoes

Aplicação web SPA para consulta pública de políticos brasileiros.

## Stack

- React 19 + TypeScript (strict)
- Vite
- React Router DOM
- ESLint (`typescript-eslint`)
- CSS puro
- `@svg-maps/brazil`

## Funcionalidades implementadas

- Landing com entrada para busca por estado
- Busca global por nome, partido e cargo
- Seleção de estado por mapa e lista de UFs
- Lista e detalhe de deputados federais
- Lista e detalhe de deputados estaduais
- Lista e detalhe de senadores
- Lista e detalhe da presidência
- Página Sobre
- Página de Privacidade e Cookies
- Página de Sugestões com endpoint serverless
- Login de usuário com Firebase (Google e e-mail/senha)
- Página de perfil protegida por sessão segura em cookie httpOnly

## Rotas principais

- `/`
- `/busca`
- `/por-estado`
- `/por-estado/:office`
- `/por-estado/:uf/deputado-federal`
- `/por-estado/:uf/deputado-federal/:deputyId`
- `/por-estado/:uf/deputado-estadual`
- `/por-estado/:uf/deputado-estadual/:deputyId`
- `/senadores/:uf`
- `/senador/:senatorId`
- `/presidente`
- `/presidente/:presidentId`
- `/sobre`
- `/privacidade`
- `/sugestoes`
- `/login`
- `/perfil`

## Como executar

### Pré-requisitos

- Node.js 20+
- npm ou pnpm

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

Geração de arquivos estáticos:

- O comando build já executa automaticamente a geração de:
  - politicians-index.json (inclui statistics-index.json)
  - sitemap.xml
  - prerender-routes.json
  - páginas de prerender em dist
- Para executar somente a geração estática sem rebuild, use:

```bash
npm run generate:static
```

## Configuração de autenticação Firebase

Para habilitar login e perfil, configure as variáveis abaixo no `.env` (veja [.env.example](.env.example)):

- Frontend (`VITE_*`):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
- Backend (Firebase Admin):
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
  - ou `FIREBASE_SERVICE_ACCOUNT_JSON`
- Segurança de sessão:
  - `AUTH_SESSION_TTL_MS`
  - `AUTH_RATE_LIMIT_MAX`
  - `PROFILE_RATE_LIMIT_MAX`

Fluxo implementado:

- Login Google com Firebase Auth
- Login e-mail/senha
- Criação automática de conta ao tentar login com e-mail inexistente
- Troca de ID token por sessão segura no backend (`/api/auth/session`)
- Proteção da rota `/perfil` com redirecionamento para `/login`

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
