# Módulo: Presidência (Detalhe)

## Objetivo

Exibir perfil detalhado do presidente/vice com resumo público, mandatos e links oficiais.

## Implementação

- Página: `src/components/pages/PresidentDetailPage.tsx`
- Hook: `src/hooks/usePresidentDetail.ts`
- Painel: `src/components/panels/PresidentDetailPanel.tsx`
- API: `src/api/camaraApi.ts` (`fetchPresidentDetail`)

## Comportamento atual

- Busca base em constantes locais por ID.
- Tenta enriquecer dados com Wikipedia REST (`description`, `extract`, imagem e URL de fonte).
- Em falha da Wikipedia, mantém fallback local sem interromper o fluxo.

## Conteúdo exibido

- Identificação do perfil (nome, partido, período, abrangência).
- Bloco de informações gerais (nome civil, nascimento, naturalidade, posse, site).
- Resumo público com link da fonte.
- Lista de mandatos.
- Lista de links e fontes.
- Card lateral de vice-presidente quando aplicável.
