# Módulo: Lista de Deputados

## Objetivo

Listar deputados federais da UF selecionada e permitir filtro textual.

## Implementação

- Página: `src/components/pages/DeputiesListPage.tsx`
- Hook: `src/hooks/useDeputies.ts`
- Painel: `src/components/panels/DeputiesPanel.tsx`

## Comportamento atual

- Validação de UF de rota; se inválida, redireciona para `/por-estado`.
- Carregamento de deputados por UF via API da Câmara.
- Busca local por:
  - nome do deputado
  - sigla do partido
- Exibição de estados de:
  - carregando (`Loader`)
  - erro (`ErrorBox`)
  - vazio (`EmptyState`)

## Navegação

- Clique no card do deputado abre detalhe em `/por-estado/:uf/deputado-federal/:deputyId`.
