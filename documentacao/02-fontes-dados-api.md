# Fontes de Dados e API

## Candidaturas das Eleições 2026

- **Fonte:** Tribunal Superior Eleitoral — DivulgaCandContas.
- **Endpoint oficial consumido pelo backend:**
  `GET https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2026/BR/20322002026/1/candidatos`.
- **Endpoint interno:** `GET /api/candidatos-2026/presidentes`.
- **Detalhe interno:** `GET /api/candidatos-2026/presidentes/:id`, com dados pessoais
  públicos, situação, campanha e bens declarados; CPF, título eleitoral e e-mail não são expostos.
- Na Vercel, a rota pública de detalhe possui um rewrite explícito para a função dinâmica
  `api/candidatos-2026/presidentes/[id].js`, definido antes do fallback da SPA para `index.html`.
- **Cliente frontend:** `fetchPresidentialCandidates()` em `src/api/candidatesApi.ts`.
- O backend normaliza a resposta e expõe somente os campos necessários à interface, sem
  repassar identificadores pessoais presentes no payload original do TSE.
- A resposta bem-sucedida usa cache compartilhado de 30 minutos e tolera conteúdo obsoleto
  durante indisponibilidades temporárias da fonte.

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
4. **Assembleias Legislativas Estaduais (cobertura nacional)**
   - AC: `https://sapl.al.ac.leg.br/api/parlamentares/...` (integração via SAPL da casa)
   - AL: `https://sapl.al.al.leg.br/api/parlamentares/...` (integração via SAPL da casa)
   - AM: `https://sapl.al.am.leg.br/api/parlamentares/...` (integração via SAPL da casa)
   - AP: `https://www.al.ap.leg.br` + `pagina.php?pg=exibir_parlamentar&iddeputado=...` (scraping da lista oficial)
   - RS: `https://ww4.al.rs.gov.br:5000/listarDestaqueDeputados`
   - SC: `https://www.alesc.sc.gov.br/post_team-sitemap.xml` + páginas `/deputado/{slug}`
   - PR: `https://www.assembleia.pr.leg.br/deputados/conheca`
   - SP: `https://legis-api-portal.pub.al.sp.gov.br/parlamentar-portal` (filtro por legislatura atual e em exercício)
   - RJ: `https://www.alerj.rj.gov.br/Deputados/QuemSao` (scraping da lista oficial da legislatura atual)
   - MG: `https://www.almg.gov.br/a-assembleia/deputados/inicial/` (scraping da lista oficial)
   - ES: `http://www.al.es.gov.br/Deputado/Lista` (scraping da lista oficial; HTTP por limitação de certificado TLS na origem HTTPS)
   - DF: `https://www.cl.df.gov.br/deputados-2023-2026` (scraping da lista oficial da legislatura atual)
   - GO: `https://portal.al.go.leg.br/deputados/em-exercicio` (scraping da tabela oficial)
   - BA: `https://www.al.ba.gov.br/deputados` (scraping da lista oficial)
   - CE: `https://www.al.ce.gov.br/deputados` (scraping da lista oficial)
   - MA: `https://www.al.ma.leg.br/deputados` (scraping da lista oficial)
   - MS: `https://www.al.ms.gov.br` (scraping da lista de gabinetes na home)
   - MT: `https://www.al.mt.gov.br/parlamento/deputados` (scraping da lista oficial)
   - PA: `https://www.alepa.pa.gov.br/Home/Page/Deputados` (scraping da lista oficial)
   - PE: `https://www.alepe.pe.gov.br/parlamentares/` (scraping da lista oficial)
   - RN: `https://www.al.rn.leg.br/deputados` (scraping da lista oficial)
   - RO: `https://sapl.al.ro.leg.br/api/parlamentares/...` (integração via SAPL da casa)
   - RR: `https://sapl.al.rr.leg.br/api/parlamentares/...` (integração via SAPL da casa)
   - SE: `https://aleselegis.al.se.leg.br/spl/parlamentares.aspx` (scraping da lista oficial)
   - PI: `https://sapl.al.pi.leg.br/api/parlamentares/...` (integração via SAPL da casa)
   - PB: `https://sapl.al.pb.leg.br/api/parlamentares/...` (integração via SAPL da casa)
   - TO: `https://sapl.al.to.leg.br/api/parlamentares/...` (integração via SAPL da casa)
   - Uso: geração do grupo `deputados-estaduais` no índice local (`public/politicians-index.json`).
5. **Dados locais do projeto**
   - `src/constants/presidents.ts`
   - `public/politicians-index.json`
   - `public/statistics-index.json`
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
- `fetchPoliticiansIndex()`
- `fetchGeneralInfoStatistics()`
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

## Endpoints internos de autenticação e perfil

- `GET /api/auth/csrf`
   - emite token CSRF e cookie `mt_csrf`
- `POST /api/auth/session`
   - recebe ID token Firebase, valida no backend e cria cookie `mt_session` (httpOnly)
- `DELETE /api/auth/session`
   - encerra sessão e limpa cookies de autenticação
- `GET /api/auth/me`
   - valida sessão atual e retorna usuário autenticado
- `GET /api/profile`
   - retorna perfil do usuário autenticado
- `PUT /api/profile`
   - atualiza perfil do usuário autenticado
- `DELETE /api/profile`
   - exclui conta do usuário autenticado (registro no Firebase Auth e documento no Firestore), encerrando a sessão

Regras de proteção aplicadas:

- validação de origem confiável (`Origin`) para endpoints sensíveis
- token CSRF obrigatório em métodos mutáveis
- rate limit em memória por IP para auth/profile
- sessão em cookie httpOnly com `SameSite` e `Secure` em produção
- validação de sessão no backend via Firebase Admin

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
