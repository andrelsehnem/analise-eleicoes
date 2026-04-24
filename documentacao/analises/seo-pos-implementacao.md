# Plano pós-implementação SEO técnico

## Objetivo

Consolidar os ganhos já implementados e preparar uma fase 2 com aumento de cobertura orgânica, sem regressão de performance ou UX.

## Situação atual (entregue)

- Metadados dinâmicos por rota implementados.
- JSON-LD base implementado (WebSite, Organization, BreadcrumbList, CollectionPage e Person em detalhes).
- Sitemap e robots publicados para rotas estáticas.
- Code-splitting por rota ativado.
- Domínio canônico com `www` forçado via redirect permanente no deploy.

## Próximos passos priorizados

### Sprint atual (curto prazo)

1. Validar em produção:
   - `https://mandatotransparente.com.br` deve redirecionar para `https://www.mandatotransparente.com.br` com status 301.
   - `https://www.mandatotransparente.com.br/robots.txt` acessível.
   - `https://www.mandatotransparente.com.br/sitemap.xml` acessível.
2. Executar auditoria Lighthouse em produção (mobile e desktop) para Home, Estado e Presidência.
3. Validar JSON-LD por rota no Rich Results Test (home, lista por estado, lista presidência, detalhes).

### Próxima sprint (fase 2 SEO)

1. Expandir sitemap para páginas dinâmicas controladas:
   - detalhes de presidência (`/presidente/:id`) gerados a partir da base local.
2. Avaliar geração de sitemap dinâmica por script de build.
3. Enriquecer conteúdo editorial em páginas de lista com FAQ curta orientada à intenção de busca.
4. Medir CTR e cobertura de indexação no Google Search Console e ajustar títulos/descriptions com base em dados reais.

## Critérios de sucesso

- 100% das URLs públicas estáticas com canonical consistente e indexáveis.
- Redirecionamento canônico funcionando para todos os caminhos.
- Sem regressão de build/lint.
- CLS e LCP sem piora relevante após mudanças (comparação Lighthouse baseline x produção).

## Checklist operacional

- [ ] Publicar deploy com `vercel.json` atualizado.
- [ ] Conferir headers e status code das URLs canônicas.
- [ ] Submeter sitemap no Search Console.
- [ ] Registrar baseline de métricas CWV para acompanhamento quinzenal.
