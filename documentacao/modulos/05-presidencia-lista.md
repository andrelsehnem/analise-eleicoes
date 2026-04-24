# Módulo: Presidência (Lista)

## Objetivo

Exibir diretório da Presidência da República com presidente e vice para acesso rápido aos perfis.

## Implementação

- Página: `src/components/pages/PresidentsListPage.tsx`
- Hook: `src/hooks/usePresidents.ts`
- Painel: `src/components/panels/PresidentsPanel.tsx`

## Comportamento atual

- Carrega dados locais de `fetchPresidents` (constantes do projeto).
- Monta cards para presidente e vice no mesmo diretório.
- Busca textual por:
  - nome
  - cargo
  - partido
  - dados do vice

## Navegação

- Clique em card abre rota `/presidente/:presidentId`.
