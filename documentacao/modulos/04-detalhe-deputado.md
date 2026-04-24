# Módulo: Detalhe de Deputado

## Objetivo

Exibir perfil completo do deputado e dados legislativos relacionados.

## Implementação

- Página: `src/components/pages/DeputyDetailPage.tsx`
- Hook: `src/hooks/useDeputyDetail.ts`
- Painel: `src/components/panels/DeputyDetailPanel.tsx`
- API: `src/api/camaraApi.ts`

## Seções funcionais implementadas

1. **Identidade e contato**
   - nome eleitoral/civil, partido, UF, e-mail, gabinete, escolaridade, nascimento.
2. **Redes sociais e site**
   - normalização de URL e identificação de plataforma (Instagram, Facebook, X, etc.).
3. **Profissões**
   - resumo com deduplicação e preview.
4. **Proposições**
   - listagem paginada por scroll/infinite loading.
   - filtro por tipo de proposição.
   - toggle para incluir/excluir requerimentos (`REQ`).
5. **Votações por proposição**
   - modal com agrupamento por voto (Sim, Não, Abstenção, etc.).
6. **Órgãos**
   - modal de órgãos do deputado com período de atuação.

## Regras de carregamento

- Detalhe inicial com `fetchDeputyDetailBundle`.
- Paginação incremental com `fetchDeputyPropositionsPage`.
- Carregamento sob demanda de votos e órgãos quando o usuário abre os modais.
- Controle de concorrência no hook para evitar sobrescrever estado com resposta antiga.

## Tratamento de falhas

- Mensagens de erro específicas para detalhe, proposições adicionais, votos e órgãos.
