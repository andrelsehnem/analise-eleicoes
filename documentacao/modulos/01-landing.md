# Módulo: Landing

## Objetivo

Apresentar formas de pesquisa e iniciar o fluxo principal de consulta.

## Implementação

- Página: `src/components/pages/LandingPage.tsx`
- Painel: `src/components/panels/LandingPanel/LandingPanel.tsx`

## Comportamento atual

- Card ativo: **Selecione por estado** (aciona navegação para `/por-estado`).
- Cards ativos:
  - **Busque por partido** (aciona navegação para `/busca`)
  - **Busque por cargo** (aciona navegação para `/busca`)
  - **Busque por nome** (aciona navegação para `/busca`)
- Cards marcados como **Em breve**:
  - buscar por cargo
  - candidatos 2026

## Acessibilidade

- Cards ativos com `role="button"`, `tabIndex={0}` e suporte a Enter/Espaço.
