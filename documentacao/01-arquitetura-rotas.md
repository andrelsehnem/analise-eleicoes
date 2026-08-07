# Arquitetura e Rotas

## Modelo arquitetural atual

- O app está organizado em rotas (`react-router-dom`) no arquivo `src/App.tsx`.
- Cada rota renderiza uma página (`components/pages`) dentro do `AppLayout`.
- As páginas coordenam hooks de estado e dados, e delegam UI para painéis (`components/panels`).

## Rotas implementadas

- `/` → `LandingPage`
- `/busca` → `SearchPage`
- `/informacoes-gerais` → `GeneralInfoPage`
- `/informacoes-gerais/:uf` → `GeneralInfoPage`
- `/por-estado` → `StateSelectionPage`
- `/por-estado/:office` → `StateSelectionPage`
- `/por-estado/:uf/deputado-federal` → `DeputiesListPage`
- `/por-estado/:uf/deputado-federal/:deputyId` → `DeputyDetailPage`
- `/por-estado/:uf/deputado-estadual` → `StateDeputiesListPage`
- `/por-estado/:uf/deputado-estadual/:deputyId` → `StateDeputyDetailPage`
- `/senadores/:uf` → `SenatorsListPage`
- `/senador/:senatorId` → `SenatorDetailPage`
- `/presidente` → `PresidentsListPage`
- `/presidente/:presidentId` → `PresidentDetailPage`
- `/sobre` → `SobrePage`
- `/privacidade` → `PrivacyPolicyPage`
- `/termos` → `TermosPage`
- `/sugestoes` → `SugestoesPage`
- `/login` → `LoginPage`
- `/perfil` → `ProfilePage` (rota protegida)

## Autenticação e proteção de rota

- A aplicação usa Firebase Auth no cliente para iniciar login (Google e e-mail/senha).
- Após autenticar no Firebase, o frontend envia o ID token para o backend em `/api/auth/session`.
- O backend valida o token com Firebase Admin e cria cookie de sessão `mt_session` (httpOnly).
- A rota `/perfil` é protegida por `ProtectedRoute`; sem sessão válida, o usuário é redirecionado para `/login`.
- O estado global de autenticação é centralizado por `AuthProvider`.

## SEO técnico por rota

- Metadados (`title`, `description`, `canonical`, Open Graph e Twitter) são definidos por rota via componente `SeoHead` em `src/components/common/SeoHead.tsx`.
- O domínio canônico adotado é `https://www.mandatotransparente.com.br`.
- Rotas dinâmicas geram metadados com fallback seguro quando o conteúdo ainda está carregando.
- A rota 404 aplica `robots="noindex,nofollow"`.

## Indexação

- `public/robots.txt` permite rastreamento e aponta para o sitemap.
- `public/sitemap.xml` é gerado automaticamente via script e inclui rotas públicas estáticas e dinâmicas (listas e detalhes por UF/cargo).
- `public/prerender-routes.json` é derivado do sitemap e define as rotas para prerender estático no build.
- O prerender estático injeta fallback HTML sem JS em cada rota para disponibilizar conteúdo editorial mínimo e contexto de dados públicos aos crawlers.
- As páginas legais (`/privacidade` e `/termos`) são incluídas no sitemap e no manifest de prerender.

## Performance de carregamento

- As páginas de rota em `src/App.tsx` usam `React.lazy` + `Suspense` para code-splitting por rota.
- O fallback de carregamento mantém o fluxo visual via `Loader`.

## Responsabilidades por camada

### `components/pages`

- Faz validação de parâmetros de rota (ex.: UF e IDs).
- Dispara carregamento de dados nos hooks.
- Encaminha callbacks de navegação (`useAppNavigation`).

### `components/panels`

- Camada visual principal de cada fluxo.
- Exibe estados de loading, erro e vazio.
- Mantém interações de UI local (modais, filtros visuais, tabs locais).

### `hooks`

- `useAppNavigation`: centraliza navegação por rota.
- `useDeputies`: lista/busca de deputados por UF.
- `useGlobalSearch`: busca global por nome, partido e cargo (deputados federais, estaduais e senadores via índice local).
- `useFavoritePoliticians`: leitura e atualização de favoritos da busca global no perfil autenticado.
- `useDeputyDetail`: detalhe, proposições paginadas, votos, órgãos.
- `useSenators`: lista/busca de senadores por UF.
- `useSenatorDetail`: detalhe de senador com mandatos, comissões e cargos.
- `useStateDeputies`: lista/busca de deputados estaduais por UF (cobertura nacional).
- `usePresidents`: lista e busca em presidência.
- `usePresidentDetail`: detalhe de presidente/vice.

## Comportamento da rota `/busca`

- Cada card de resultado possui ação de estrela para favoritar/desfavoritar.
- A estrela fica ao lado do nome do político.
- Favoritos são persistidos no perfil do usuário (Firestore) via `PUT /api/profile`.
- Usuários não autenticados visualizam a estrela desabilitada.

## Comportamento de favoritos em outras rotas

- A estrela de favoritar também está presente em listas por estado e perfis de detalhe.
- Rotas cobertas: deputados federais, deputados estaduais, senadores e presidência (incluindo vice).
- O mesmo estado de autenticação e persistência é reaproveitado em todas as rotas.

## Composição de layout

- `AppLayout` estrutura cabeçalho, hero, navegação de etapas (quando aplicável) e conteúdo.
- O banner de cookies é renderizado globalmente no `AppLayout`, com persistência de decisão em localStorage.
- Algumas rotas não usam StepsNav (`showStepsNav={false}`), especialmente presidência e sobre.
