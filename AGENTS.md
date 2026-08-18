# Repository Guidelines

## Project Structure & Module Organization

The React 19 + TypeScript SPA lives in `src/`. Route views are in `src/components/pages/`, domain UI in `src/components/panels/`, shared controls in `src/components/common/`, and page framing in `src/components/layout/`. Keep business state and side effects in `src/hooks/`; shared types belong in `src/types/camara.ts`, API clients in `src/api/`, and pure helpers in `src/utils/`. Vercel handlers are under `api/`. Static assets and generated search/SEO indexes live in `public/`; generation scripts are in `scripts/`. Update `documentacao/` when changing architecture, data sources, or user flows. Analise também o arquivo `claude.md` para entender o projeto.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies using the committed pnpm lockfile.
- `pnpm dev`: start the Vite development server.
- `pnpm lint`: run ESLint across the repository.
- `pnpm build`: type-check, build the app, and regenerate static indexes, sitemap, routes, and prerendered pages.
- `pnpm preview`: serve the production build locally.
- `pnpm generate:static`: refresh generated public and prerender artifacts without a full rebuild.

Use Node.js 20 or newer. Prefer pnpm so lockfiles do not drift.

## Coding Style & Naming Conventions

TypeScript runs in strict mode. Use explicit prop and return types, avoid `any`, handle promises with `async`/`await`, and prefer named exports. Components use PascalCase `.tsx` filenames; hooks follow `useName`; pure modules use `.ts`. Keep components presentational and move stateful behavior into hooks. Write interface text and user-facing errors in Brazilian Portuguese. Add component-specific styles in a neighboring `.css` file, reuse existing CSS variables, and do not introduce Tailwind or a global-state library without discussion. Preserve keyboard support and `aria-*` attributes.

## Testing Guidelines

No automated test framework or coverage threshold is currently configured. Before submitting changes, run `pnpm lint` and `pnpm build`, then manually exercise affected routes using `pnpm dev` or `pnpm preview`. If adding tests, colocate them as `*.test.ts` or `*.test.tsx` and add the runner command to `package.json` and this guide.

## Commit & Pull Request Guidelines

History mixes short Portuguese summaries with Conventional Commit prefixes. Prefer focused messages such as `feat: adiciona filtro por partido` or `fix: corrige sessão expirada`. Pull requests should explain the user-visible change, list validation performed, link related issues, and include screenshots for UI/CSS work. Note generated files and documentation updates explicitly.

## Security & Configuration

Copy `.env.example` for local configuration. Never commit `.env`, Firebase service-account JSON, private keys, tokens, or production credentials. Keep frontend-safe settings under `VITE_*`; server secrets must remain in deployment environment variables.
