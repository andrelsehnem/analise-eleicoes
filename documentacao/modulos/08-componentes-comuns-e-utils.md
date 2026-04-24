# Módulo: Componentes Comuns, Layout e Utilitários

## Componentes comuns

Local: `src/components/common`

- `AppButton`: botão base reutilizável.
- `Loader`: estado de carregamento.
- `ErrorBox`: exibição padronizada de erro.
- `EmptyState`: estado vazio com ícone/mensagem.
- `SeoHead`: metadados SEO por rota (`title`, `description`, `canonical`, Open Graph/Twitter e JSON-LD).

## Layout

Local: `src/components/layout`

- `AppLayout`: estrutura principal das páginas.
- `AppHeader`, `HeroSection`, `StepsNav`, `Disclaimer`: blocos visuais compartilhados.

## Utilitários

Local: `src/utils`

- `format.ts`: normalização/formatação de datas e strings de apoio.
- `ui.ts`: classes de badge/status, fallback de avatar e helpers de UI.
- `seo.ts`: helpers para URL canônica, `BreadcrumbList`, `WebSite`, `Organization` e `CollectionPage`.

## Papel no sistema

- Reduzir duplicação visual e padronizar estados de interface.
- Centralizar detalhes de apresentação para manter os painéis mais focados em fluxo.
