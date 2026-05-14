# Arquitetura e Rotas

## Modelo arquitetural atual

- O app está organizado em rotas (`react-router-dom`) no arquivo `src/App.tsx`.
- Cada rota renderiza uma página (`components/pages`) dentro do `AppLayout`.
- As páginas coordenam hooks de estado e dados, e delegam UI para painéis (`components/panels`).

## Rotas implementadas

- `/` → `LandingPage`
- `/busca` → `SearchPage`
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
- `/sugestoes` → `SugestoesPage`

## SEO técnico por rota

- Metadados (`title`, `description`, `canonical`, Open Graph e Twitter) são definidos por rota via componente `SeoHead` em `src/components/common/SeoHead.tsx`.
- O domínio canônico adotado é `https://www.mandatotransparente.com.br`.
- Rotas dinâmicas geram metadados com fallback seguro quando o conteúdo ainda está carregando.
- A rota 404 aplica `robots="noindex,nofollow"`.

## Indexação

- `public/robots.txt` permite rastreamento e aponta para o sitemap.
- `public/sitemap.xml` contém apenas rotas estáticas públicas nesta fase:
	- `/`
	- `/por-estado`
	- `/presidente`
	- `/sobre`
	- `/privacidade`
	- `/sugestoes`

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
- `useDeputyDetail`: detalhe, proposições paginadas, votos, órgãos.
- `useSenators`: lista/busca de senadores por UF.
- `useSenatorDetail`: detalhe de senador com mandatos, comissões e cargos.
- `useStateDeputies`: lista/busca de deputados estaduais por UF (PR, SC, RS, SP, RJ, MG e ES; PR segue em integração gradual de fonte).
- `usePresidents`: lista e busca em presidência.
- `usePresidentDetail`: detalhe de presidente/vice.

## Composição de layout

- `AppLayout` estrutura cabeçalho, hero, navegação de etapas (quando aplicável) e conteúdo.
- O banner de cookies é renderizado globalmente no `AppLayout`, com persistência de decisão em localStorage.
- Algumas rotas não usam StepsNav (`showStepsNav={false}`), especialmente presidência e sobre.
