# GSC Phase 3 — Guia Prático de Execução

## Status Atual ✅

| Item | Descrição |
|------|-----------|
| **GSC Verification Code** | Pronto para integração (`src/constants/seo.ts`) |
| **Build Pipeline** | Verificação GSC incluída via variável de ambiente |
| **Sitemap** | 558 URLs geradas automaticamente |
| **robots.txt** | Já com diretiva Sitemap |
| **Prerender** | 558 páginas com metadata per-route |

---

## 🚀 Passo 1: Obter Token do Google Search Console

1. Acesse: https://search.google.com/search-console
2. Clique **"Adicionar Propriedade"** (canto superior esquerdo)
3. Escolha **"URL"** e insira: `https://www.mandatotransparente.com.br`
4. Na próxima tela, clique **"Meta tag"** (não use arquivo HTML)
5. Google fornecerá algo como:
   ```html
   <meta name="google-site-verification" content="abcd1234efgh5678ijkl9012mnop3456" />
   ```
6. **Copie apenas o valor entre aspas** (ex: `abcd1234efgh5678ijkl9012mnop3456`)

### ✋ Não feche essa página! Você precisará dela no Passo 3.

---

## 🔧 Passo 2: Configurar Variável de Ambiente

Crie ou atualize um arquivo `.env` na raiz do projeto:

```bash
# .env
VITE_GSC_VERIFICATION_TOKEN=abcd1234efgh5678ijkl9012mnop3456
```

**Importante:**
- Nunca faça commit do `.env` com o token real (já está em `.env.example`)
- Se usar Vercel: Configure a variável em **Settings → Environment Variables**

---

## 🏗️ Passo 3: Fazer Build & Deploy

Na sua máquina local:

```bash
# Verificar que o .env foi lido corretamente
npm run build

# Output esperado: "Prerender estático concluído para [N] rotas"
# O meta tag GSC será incluído na homepage apenas
```

Depois de fazer deploy para Vercel/produção:

```bash
# Verifique que o meta tag está presente na homepage:
curl -s https://www.mandatotransparente.com.br/ | grep "google-site-verification"
# Deve retornar: <meta name="google-site-verification" content="...seu_token...">
```

---

## ✅ Passo 4: Confirmar Verificação no GSC

1. **Volte para** https://search.google.com/search-console (página que deixou aberta)
2. Clique botão **"Verificar"** (na seção de meta tag)
3. Google processará (pode levar 1–2 minutos)
4. Se bem-sucedido: **"Propriedade verificada"** ✅

**Se falhar:**
- Verifique se o deploy já está ao vivo e acessível
- Limpe cache do navegador (Ctrl+Shift+Del)
- Aguarde 5 minutos e tente novamente
- Verifique se o meta tag está 100% correto (sem espaços extras)

---

## 📋 Passo 5: Submeter Sitemap

Após a verificação com sucesso:

1. **Menu esquerdo** do GSC → **"Sitemaps"**
2. Campo "Novo sitemap"
3. Insira: `sitemap.xml`
4. Clique **"Enviar"**

**Status esperado** após ~5 min:
- ✅ "Sucesso" ou "Sucesso com avisos"
- URLs indexadas: 550–558
- Erros: 0 críticos (algumas "descobertas não indexadas" é normal)

---

## 🔍 Passo 6: Acompanhar Indexação (48–72h)

No GSC, aguarde 2–3 dias e verifique:

### **Seção "Cobertura"**
- [ ] 550+ URLs com status **"OK"**
- [ ] <10 URLs com status **"Descoberto – ainda não indexado"**
- [ ] 0 erros críticos

### **Seção "Performance"**
- [ ] Começarão a aparecer queries (ex: "deputado SP", "senador")
- [ ] CTR (Click-Through Rate) inicial
- [ ] Posição média de ranking

### **Seção "Melhorias"**
- [ ] Verifique "Dados estruturados" → 3+ tipos de schema OK
  - WebSite
  - BreadcrumbList
  - Person (em páginas de detalhe)

---

## ⚠️ Troubleshooting

| Problema | Solução |
|----------|---------|
| **"Propriedade não verificada"** | Verifique se meta tag está no HTML; deploy pode estar em staging; aguarde 10 min |
| **Sitemap com 0 URLs indexadas** | Verifique em `robots.txt` se `Allow: /` está descommentado |
| **Muitos "404 não encontra código de status"** | Normal para políticos com ID inválido; canonicalização está funcionando |
| **Dados estruturados com avisos** | Não é bloqueador; Google indexará mesmo assim |

---

## 📊 Próximas Etapas (Phase 3b)

Após 1 semana de GSC ativo:

- [ ] **Performance Baseline**: Registrar impressões/CTR iniciais
- [ ] **Google Analytics 4**: Integrar com GA4 para tracking detalhado
- [ ] **Core Web Vitals**: Verificar métricas de performance
- [ ] **Console Errors**: Monitorar avisos/erros de crawl no GSC

---

## 📞 Suporte Rápido

- **Google Search Console Help**: https://support.google.com/webmasters
- **Schema.org Tester**: https://search.google.com/test/rich-results
- **Verificação de Robots**: https://support.google.com/webmasters/answer/6062598
- **Documentação do Projeto**: [gsc-setup-phase3.md](gsc-setup-phase3.md)

---

## ✨ Checklist Final

- [ ] Token obtido do GSC
- [ ] `.env` configurado localmente
- [ ] Build realizado com sucesso
- [ ] Deploy feito para produção
- [ ] Meta tag verificado no HTML da homepage
- [ ] GSC propriedade verificada ✅
- [ ] Sitemap enviado ao GSC
- [ ] Aguardando indexação (48–72h)
