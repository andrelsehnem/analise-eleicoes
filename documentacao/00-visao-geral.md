# Visão Geral do Sistema (estado atual)

## Objetivo

Aplicação SPA para consulta pública de políticos brasileiros, com foco atual em:

- Deputados federais por estado (lista e detalhe).
- Presidência da República (presidente e vice, lista e detalhe).
- Deputados estaduais  por estado (lista e detalhe).
- Senadores
- Candidatos as eleições.

## Fluxos implementados

1. Entrada na landing.
2. Navegação para seleção por estado.
3. Consulta de deputados federais por UF.
4. Abertura de detalhe do deputado (dados, proposições, votos e órgãos).
5. Consulta da Presidência (lista e perfil detalhado).
6. Acesso à página Sobre.

## Funcionalidades em produção vs. planejadas

- **Implementadas:** seleção por estado para deputado federal, busca na lista, detalhe completo de deputado, presidência, sobre.
- **Parcial/indireta:** filtro de cargo existe na UI, mas apenas deputado federal e presidente possuem fluxo ativo.
- **Não implementadas:** senador, deputado estadual, favoritos, comparação, busca direta global por nome, candidatos futuros.

## Stack real identificada

- React 19 + TypeScript
- Vite
- React Router DOM
- ESLint (`typescript-eslint`)
- CSS puro
- `@svg-maps/brazil`
