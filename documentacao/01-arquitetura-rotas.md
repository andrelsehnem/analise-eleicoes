# Arquitetura e Rotas

## Modelo arquitetural atual

- O app está organizado em rotas (`react-router-dom`) no arquivo `src/App.tsx`.
- Cada rota renderiza uma página (`components/pages`) dentro do `AppLayout`.
- As páginas coordenam hooks de estado e dados, e delegam UI para painéis (`components/panels`).

## Rotas implementadas

- `/` → `LandingPage`
- `/por-estado` → `StateSelectionPage`
- `/por-estado/:uf/deputado-federal` → `DeputiesListPage`
- `/por-estado/:uf/deputado-federal/:deputyId` → `DeputyDetailPage`
- `/presidente` → `PresidentsListPage`
- `/presidente/:presidentId` → `PresidentDetailPage`
- `/sobre` → `SobrePage`

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
- `useDeputyDetail`: detalhe, proposições paginadas, votos, órgãos.
- `usePresidents`: lista e busca em presidência.
- `usePresidentDetail`: detalhe de presidente/vice.

## Composição de layout

- `AppLayout` estrutura cabeçalho, hero, navegação de etapas (quando aplicável) e conteúdo.
- Algumas rotas não usam StepsNav (`showStepsNav={false}`), especialmente presidência e sobre.
