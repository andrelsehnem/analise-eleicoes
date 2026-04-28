# Módulo: Seleção por Estado e Cargo

## Objetivo

Permitir escolher tipo de cargo e estado para iniciar consulta de representantes.

## Implementação

- Página: `src/components/pages/StateSelectionPage.tsx`
- Painel: `src/components/panels/StatesPanel.tsx`
- Constantes: `src/constants/states.ts`

## Comportamento atual

- Cargos no filtro:
  - `deputado-federal` (**implementado**)
  - `senador` (**implementado**)
  - `presidente` (**implementado**, navega para `/presidente`)
  - `deputado-estadual` (**em breve**)
- Seleção por mapa SVG e por lista textual de UFs.
- Quando o cargo não está implementado, o mapa/lista ficam visualmente e funcionalmente desativados.

## Regras de navegação

- Seleção de UF com `deputado-federal` leva para `/por-estado/:uf/deputado-federal`.
- Seleção de UF com `senador` leva para `/senadores/:uf`.
- Seleção de `presidente` ignora UF e leva para `/presidente`.
