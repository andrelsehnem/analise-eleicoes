# Fontes de Dados e API

## Fontes utilizadas

1. **Câmara dos Deputados (Dados Abertos)**
   - Base: `https://dadosabertos.camara.leg.br/api/v2`
   - Uso: deputados, detalhe, profissões, órgãos, proposições, votações.
2. **Wikipedia REST (pt-BR)**
   - Base: `https://pt.wikipedia.org/api/rest_v1/page/summary`
   - Uso: enriquecimento de resumo/foto/fonte no detalhe da presidência.
3. **Senado Federal (Dados Abertos)**
   - Base: `https://legis.senado.leg.br/dadosabertos`
   - Uso: lista de senadores em exercício por UF, detalhe de senador, mandatos, comissões e cargos.
4. **Assembleias Legislativas Estaduais (Sul + Sudeste)**
   - RS: `https://ww4.al.rs.gov.br:5000/listarDestaqueDeputados`
   - SC: `https://www.alesc.sc.gov.br/post_team-sitemap.xml` + páginas `/deputado/{slug}`
   - PR: `https://www.assembleia.pr.leg.br` (fonte oficial em integração gradual)
   - SP: `https://legis-api-portal.pub.al.sp.gov.br/parlamentar-portal` (filtro por legislatura atual e em exercício)
   - RJ: `https://www.alerj.rj.gov.br/Deputados/QuemSao` (scraping da lista oficial da legislatura atual)
   - MG: `https://www.almg.gov.br/a-assembleia/deputados/inicial/` (scraping da lista oficial)
   - ES: `http://www.al.es.gov.br/Deputado/Lista` (scraping da lista oficial; HTTP por limitação de certificado TLS na origem HTTPS)
   - Uso: geração do grupo `deputados-estaduais` no índice local (`public/politicians-index.json`).
5. **Dados locais do projeto**
   - `src/constants/presidents.ts`
   - Uso: diretório de presidente/vice e fallback de detalhe.
6. **Cloudflare Turnstile**
   - Base: `https://challenges.cloudflare.com/turnstile/v0/siteverify`
   - Uso: validação anti-spam no envio de sugestões.
7. **Resend API**
   - Base: `https://api.resend.com/emails`
   - Uso: entrega por e-mail das sugestões recebidas no formulário.

## Funções públicas em `src/api/camaraApi.ts`

- `fetchDeputiesByState(uf)`
- `fetchDeputyPropositionsPage(id, page, options)`
- `fetchDeputyDetailBundle(id, options)`
- `fetchDeputyOrgaos(id)`
- `fetchPropositionVotes(propositionId)`
- `fetchPresidents()`
- `fetchPresidentDetail(id)`
- `fetchStateDeputiesByState(uf)`
- `fetchSenatorsByState(uf)`
- `fetchSenatorDetailBundle(id)`

## Endpoint interno de sugestões

- Arquivo: `api/sugestoes.js`
- Método: `POST /api/sugestoes`
- Payload:
   - `nome` (obrigatório)
   - `telefone` (opcional)
   - `email` (opcional)
   - `assunto` (obrigatório)
   - `descricao` (obrigatório)
   - `captchaToken` (obrigatório)
- Resposta de sucesso: `{ success: true, message: string }`
- Regras de proteção:
   - validação de conteúdo e limites de tamanho
   - verificação de captcha no Turnstile
   - rate limit em memória por IP (janela de 10 minutos)

## Regras relevantes de negócio

- Proposições são filtradas para o período de mandato atual (`2022` a `2026`).
- Requerimentos (`REQ`) podem ser incluídos/excluídos por flag (`includeRequirements`).
- Paginação de proposições usa tamanho fixo de 100 itens por página.
- Votos de proposição são agregados de múltiplas votações e ordenados por data decrescente.

## Estratégias de robustez

- `fetchApi<T>` centraliza tratamento de erro HTTP.
- Uso de `Promise.allSettled` em pontos sensíveis para tolerância a falhas parciais.
- Cache em memória para reduzir chamadas repetidas:
  - detalhe de deputado
  - órgãos do deputado
  - votos por proposição
  - detalhe de presidência
   - lista de senadores por UF
   - detalhe de senador
