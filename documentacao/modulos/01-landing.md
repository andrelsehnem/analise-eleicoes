# Módulo: Landing

## Objetivo

Apresentar formas de pesquisa e iniciar o fluxo principal de consulta.

## Implementação

- Página: `src/components/pages/LandingPage.tsx`
- Painel: `src/components/panels/LandingPanel/LandingPanel.tsx`

## Comportamento atual

- Card ativo: **Selecione por estado** (aciona navegação para `/por-estado`).
- Cards marcados como **Em breve**:
  - buscar por partido
  - buscar por cargo
  - buscar por nome
  - candidatos 2026

## Acessibilidade

- Card principal com `role="button"`, `tabIndex={0}` e suporte a Enter/Espaço.
