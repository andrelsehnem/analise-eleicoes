# Visão Geral do Sistema (estado atual)

## Objetivo

Aplicação SPA para consulta pública de políticos brasileiros, com foco atual em:

- Deputados federais por estado (lista e detalhe).
- Deputados estaduais por estado (lista e detalhe).
- Senadores por estado (lista e detalhe).
- Busca global por nome e partido.
- Presidência da República (presidente e vice, lista e detalhe).
- Login de usuário com Firebase (Google e e-mail/senha).
- Perfil de usuário protegido por sessão segura (cookie httpOnly).
- Candidatos às eleições (planejado).

## Fluxos implementados

1. Entrada na landing.
2. Navegação para seleção por estado.
3. Consulta de deputados federais por UF.
4. Abertura de detalhe do deputado (dados, proposições, votos e órgãos).
5. Consulta da Presidência (lista e perfil detalhado).
6. Consulta de deputados estaduais por UF.
7. Consulta de senadores por UF.
8. Busca global de políticos.
9. Acesso à página Sobre.
10. Login de usuário em `/login`.
11. Acesso ao perfil em `/perfil` com proteção de rota.

## Funcionalidades em produção vs. planejadas

- **Implementadas:** deputado federal (lista/detalhe), deputado estadual (lista/detalhe), senador (lista/detalhe), presidência, busca global, sobre, privacidade, sugestões, login e perfil protegido.
- **Não implementadas:** favoritos, comparação e candidatos futuros.

## Stack real identificada

- React 19 + TypeScript
- Vite
- React Router DOM
- ESLint (`typescript-eslint`)
- CSS puro
- `@svg-maps/brazil`
- Firebase Auth (cliente)
- Firebase Admin (backend serverless)
