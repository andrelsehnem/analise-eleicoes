# Apêndice: Hook Legado `useCamaraData`

## Status

- Arquivo existente: `src/hooks/useCamaraData.ts`
- Uso atual no projeto: **nenhum uso ativo** (apenas definição do próprio hook).

## Contexto

O hook representa uma arquitetura anterior, orientada por painel interno (`panel: 'landing' | 'states' | 'deputies' | 'detail'`) no estado local.

## Diferença para a arquitetura atual

- **Legado:** troca de painel via `setPanel`.
- **Atual:** troca de telas via rotas (`react-router-dom`) e páginas dedicadas.

## Recomendação técnica

- Manter como referência histórica de transição.
- Em próxima limpeza de código, avaliar remoção controlada para reduzir superfície de manutenção.
