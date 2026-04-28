# Phase 3 — Google Search Console Setup & Monitoring

## Status Pré-Verificação

| Item | Status | Detalhes |
|------|--------|----------|
| **robots.txt** | ✅ Pronto | `Allow: /` + `Sitemap:` pointing to official URL |
| **sitemap.xml** | ✅ Pronto | 566 URLs com `lastmod`, `changefreq`, `priority` |
| **Meta Tags** | ✅ Pronto | OG/Twitter/robots na index.html |
| **Prerender** | ✅ Pronto | 566 rotas com metadata per-route em `/dist/{path}/index.html` |
| **Canonical** | ✅ Pronto | 404 entities canonicalize para parent listing |

---

## 1. Verificação Google Search Console

### Opção A: Meta Tag (Simples, Recomendado)

1. **Acesse** [Google Search Console](https://search.google.com/search-console)
2. **Adicionar Propriedade** → `https://www.mandatotransparente.com.br` (use protocolo HTTPS)
3. **Verificar Propriedade** → Escolha "Meta tag"
4. **Google fornecerá um meta tag** como:
   ```html
   <meta name="google-site-verification" content="xyz123..." />
   ```

5. **Copie o `content=`** (valor de verificação)
6. **Adicione em** `src/components/common/SeoHead.tsx`:
   ```jsx
   // Inside useEffect, after title/description setup:
   if (isHomepage) {
     const googleVerification = document.querySelector('meta[name="google-site-verification"]');
     if (!googleVerification) {
       const meta = document.createElement('meta');
       meta.name = 'google-site-verification';
       meta.content = 'SEU_CONTENT_AQUI';
       document.head.appendChild(meta);
     }
   }
   ```

   Ou **mais simples**: adicione direto em `index.html`:
   ```html
   <meta name="google-site-verification" content="SEU_CONTENT_AQUI" />
   ```

7. **Volte ao GSC** → Clique "Verificar"
8. **Status muda para ✅ Verificada**

### Opção B: Arquivo HTML (Alternativa)

Se preferir evitar arquivo público, coloque em `public/google*.html`:
- Google Search Console fornece arquivo como `googleabc123def456.html`
- Coloque em `public/`
- O arquivo será servido em `https://www.mandatotransparente.com.br/googleabc123def456.html`

---

## 2. Submeter Sitemap

### Passo a Passo

1. **No Google Search Console** (após verificação):
   - Menu esquerdo → **Sitemaps**
   - Campo "Adicionar novo sitemap"
   - Insira: `sitemap.xml` (ele resolve para `https://www.mandatotransparente.com.br/sitemap.xml`)
   - Clique "Enviar"

2. **Status esperado**:
   - "Sucesso" ou "Sucesso com avisos" (normal se houver páginas 404 — isso é esperado, pois temos canonicalizações)

3. **Validação**: Google começará a rastrear as 566 URLs

---

## 3. Monitoramento de Indexação

### No Console, verifique após 48–72h:

| Seção | O que esperar |
|-------|---------------|
| **Cobertura** | 560–566 URLs indexadas; ~0–6 'Descobertos - ainda não indexados' (normais para conteúdo dinâmico) |
| **Erros** | 0 erros críticos; possível 1–2 'Não indexado' para páginas 404 canonicalizadas (✅ esperado) |
| **Avisos** | Verifique se há "Meta tags duplicadas" ou "Título/descrição duplicados" |

---

## 4. Schema.org Testing (Rich Results)

### Validar Estruturados de Dados

1. **Acesse** [Rich Results Test do Google](https://search.google.com/test/rich-results)
2. **Copie URL de amostra**:
   - Homepage: `https://www.mandatotransparente.com.br/`
   - Detalhe Deputado: `https://www.mandatotransparente.com.br/por-estado/sp/deputado-federal/123456` (ID real)
   - Detalhe Senador: `https://www.mandatotransparente.com.br/senador/35` (Jader Barbalho, ID de teste)
   - Detalhe Presidente: `https://www.mandatotransparente.com.br/presidente/luiz-inacio-lula-da-silva`

3. **Cole URL** no teste
4. **Resultados esperados**:
   - ✅ **WebSite schema**
   - ✅ **BreadcrumbList schema** (em páginas de detalhe)
   - ✅ **Person schema** (com imageUrl, affiliation, sameAs, worksFor)
   - ⚠️ **Sem erros críticos**; avisos normais (ex: falta de ratingValue — OK para este caso)

5. **Se houver erro**: Clicar em erro específico, ajustar `src/utils/seo.ts` ou `src/components/pages/*DetailPage.tsx`, rebuild

---

## 5. Configurar Alertas & Monitoramento

### Recomendações de Monitoramento

#### 5.1 Alerts no GSC

1. **Google Search Console** → **Settings** (engrenagem)
2. **Ative notificações por email** para:
   - Erros críticos de cobertura
   - Problemas de segurança
   - Mudanças em sitemaps

#### 5.2 Métricas Chave a Acompanhar

| Métrica | Frequência | Limite Alerta |
|---------|-----------|--------------|
| **Taxa de indexação** | Semanal | < 95% |
| **404 entity pages** | Diária | 3+ erros críticos (não deveria ocorrer) |
| **Tempo médio de rastreamento** | Semanal | > 5000ms |
| **Impressões de busca** | Semanal | ↓ 20% (queda anormal) |

#### 5.3 Queries a Esperar (primeiras semanas)

- "Deputado SP"
- "Senador Brasil"
- "[Nome de político]" (busca direta)
- "deputados federais 2022" (tema)
- "Mandato Transparente"

---

## 6. Próximos Passos Após GSC

### Fase 3b (Otimizações Adicionais)

- [ ] **Google Analytics 4**: Adicionar script de tracking (separado desta entrega)
- [ ] **Core Web Vitals**: Monitorar via PageSpeed Insights (métricas de performance)
- [ ] **Mobile-Friendly**: Validar responsividade com Ferramentas de Teste do Google
- [ ] **Autocomplete URLs**: Monitorar sugestões de busca por nome de político (GSC → Performance → "Lula", "Bolsonaro", etc.)

### Roadmap Futuro

- Phase 4: Query performance optimization (indexar senadores-estaduais, deputados-estaduais)
- Phase 5: Analytics dashboard com palavras-chave + CTR
- Phase 6: Backlink building & PR outreach

---

## Checklist para Execução

- [ ] **Verificação GSC completada** (meta tag ou arquivo)
- [ ] **Sitemap enviado** ao GSC
- [ ] **Status "Verificada"** confirmado no console
- [ ] **Aguardar 48–72h** para indexação inicial
- [ ] **Verificar Cobertura**: esperado 560+/566 indexadas
- [ ] **Testar Rich Results**: 3+ URLs com sucesso
- [ ] **Alertas ativados** no GSC

---

## Documentação de Referência

- [Google Search Console - Setup Guide](https://support.google.com/webmasters/answer/9128669)
- [Sitemap Protocol](https://www.sitemaps.org/)
- [schema.org Person](https://schema.org/Person)
- [BreadcrumbList](https://schema.org/BreadcrumbList)
