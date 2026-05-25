# GitHub Copilot – Instruções do Projeto

## Visão Geral

**Analise-Eleicoes** é uma aplicação web SPA para consulta e análise de políticos brasileiros. O objetivo é fornecer uma ferramenta de fácil acesso para eleitores conhecerem o histórico de seus representantes antes das eleições.

No estado atual do projeto, os fluxos implementados são:

1. **Landing** com entrada para busca por estado
2. **Seleção por estado** via mapa SVG e lista de UFs
3. **Consulta de Deputado Federal por UF** (lista com busca por nome/partido)
4. **Detalhe de deputado** (dados gerais, proposições, votos e órgãos)
5. **Consulta de Deputado Estadual por UF** (lista com busca por nome/partido)
6. **Detalhe de deputado estadual**
7. **Consulta de Senadores por UF** (lista com busca por nome/partido)
8. **Detalhe de senador**
9. **Busca global** (nome/partido/cargo)
10. **Consulta da Presidência** (presidente e vice, lista e detalhe)
11. **Página Sobre**
12. **Política de Privacidade**
13. **Página de Sugestões**

Fluxos como favoritos, comparação e candidatos futuros serão implementados em versões futuras.

---

## Stack Tecnológica

- **Framework:** React 19 com TypeScript (modo estrito)
- **Bundler:** Vite
- **Linting:** ESLint com `typescript-eslint`
- **Roteamento:** `react-router-dom`
- **Mapa:** `@svg-maps/brazil`
- **Analytics:** `@vercel/analytics`
- **Sem biblioteca de estado global** (apenas `useState` / hooks customizados)
- **Sem biblioteca CSS externa** (CSS puro com variáveis customizadas)

---

## Estrutura de Pastas

```
src/
  api/           # Chamadas à API da Câmara (camaraApi.ts)
  assets/        # Ícones e imagens estáticas
  components/
    common/      # Componentes reutilizáveis (AppButton, Loader, ErrorBox, EmptyState)
    layout/      # Estrutura da página (AppHeader, HeroSection, StepsNav, Disclaimer)
    pages/       # Páginas por rota (LandingPage, StateSelectionPage, DeputiesListPage, etc.)
    panels/      # Painéis visuais por domínio (StatesPanel, DeputiesPanel, DeputyDetailPanel, etc.)
  constants/     # Dados estáticos (lista de estados)
  hooks/         # Hooks customizados de lógica de negócio
  types/         # Tipos TypeScript compartilhados (camara.ts)
  utils/         # Utilitários puros (format.ts, ui.ts)
```

---

## Convenções de Código

- **Linguagem da interface:** Português do Brasil
- **Preferir exportações nomeadas** em componentes e hooks; manter `export default` apenas quando já existente (ex.: `App.tsx`)
- **Tipos explícitos** em todos os props e retornos de função
- **Sem `any`** – usar tipos específicos ou `unknown`
- **Funções async** com `async/await`; nunca ignorar promises (sem floating promises)
- **Hooks customizados** encapsulam todo o estado e side effects; componentes são puramente apresentacionais
- Arquivos de componentes usam extensão `.tsx`; arquivos de lógica pura usam `.ts`

---

## Tipos Principais (`src/types/camara.ts`)

```ts
type StateItem   = { uf: string; name: string }
type Deputy      = { id: number; nome: string; siglaPartido: string; siglaUf: string; email?: string; urlFoto?: string }
type DeputyInfo  = { escolaridade?: string; dataNascimento?: string; ultimoStatus?: { ... } }
type Proposition = { siglaTipo?: string; numero?: number; ano?: number; ementa?: string; statusProposicao?: { ... } }
type Vote        = { voto?: string; descricao?: string; proposicaoObjeto?: string; dataHoraVoto?: string }
type President   = { id: string; nome: string; cargo: string; siglaPartido: string; periodo: string; ... }
type PresidentDetail = President & { resumo: string; mandatos: PresidentTerm[]; links: PresidentLink[]; ... }
type OfficeType  = 'deputado-federal' | 'deputado-estadual' | 'senador' | 'presidente'
type Panel       = 'landing' | 'states' | 'deputies' | 'detail'
type Tab         = 'proposicoes' | 'votacoes'
```

---

## API (`src/api/camaraApi.ts`)

- Base URL: `https://dadosabertos.camara.leg.br/api/v2`
- Todas as respostas têm envelope `{ dados: T }`
- Funções exportadas:
  - `fetchDeputiesByState(uf: string): Promise<Deputy[]>`
  - `fetchStateDeputiesByState(uf: string): Promise<StateDeputy[]>`
  - `fetchDeputyPropositionsPage(id: number, page: number, options?): Promise<DeputyPropositionsPage>`
  - `fetchDeputyDetailBundle(id: number, options?): Promise<{ info, professions, propositions, hasMorePropositions, propositionsPage }>`
  - `fetchDeputyOrgaos(id: number): Promise<DeputyOrgan[]>`
  - `fetchPropositionVotes(propositionId: number): Promise<PropositionVote[]>`
  - `fetchPresidents(): Promise<President[]>`
  - `fetchPresidentDetail(id: string): Promise<PresidentDetail>`
  - `fetchPoliticiansIndex(): Promise<GlobalSearchItem[]>`
  - `fetchSenatorsByState(uf: string): Promise<Senator[]>`
  - `fetchSenatorDetailBundle(id: string): Promise<SenatorDetail>`
- Erros de HTTP lançam `Error` com mensagem em português

### URLs de API de Listagem (usadas no índice de políticos)

| Grupo | URL |
|---|---|
| `deputados-federais` | `GET https://dadosabertos.camara.leg.br/api/v2/deputados` (por UF) |
| `senadores` | `GET https://legis.senado.leg.br/dadosabertos/senador/lista/atual` |
| `deputados-estaduais` | múltiplas fontes oficiais por UF (APIs e portais das assembleias), consolidadas em `scripts/generate-politicians-index.mjs` |

> **Ao integrar uma nova API com listagem de políticos:** adicionar um novo grupo em `scripts/generate-politicians-index.mjs` seguindo o padrão existente (função `load<Tipo>` + entrada no objeto `index`) e registrar a URL na tabela acima. O JSON `public/politicians-index.json` é gerado automaticamente no `pnpm build` e também via `pnpm generate:politicians`.

---

## Hooks (`src/hooks/`)

| Hook | Responsabilidade |
|---|---|
| `useAppNavigation` | Navegação por rotas da aplicação |
| `useDeputies` | Carrega/filtra lista de deputados por UF |
| `useStateDeputies` | Carrega/filtra lista de deputados estaduais por UF |
| `useDeputyDetail` | Carrega detalhes, proposições e votações de um deputado |
| `useGlobalSearch` | Busca global no índice local de políticos |
| `useSenators` | Carrega/filtra lista de senadores por UF |
| `useSenatorDetail` | Carrega detalhes do perfil de senador |
| `usePresidents` | Carrega/filtra lista de presidente e vice |
| `usePresidentDetail` | Carrega detalhes do perfil de presidente/vice |

Observação: `useCamaraData` existe como legado e não é o fluxo principal atual.

---

## Boas Práticas ao Gerar Código

1. **Novos componentes** devem ir em `src/components/common/` (genérico) ou no módulo correto (`pages`, `panels`, `layout`) e devem ter seu próprio arquivo `.css` para estilos específicos, sempre seguindo o padrão do projeto para cores e fontes.
2. **Novos hooks** devem ir em `src/hooks/` e seguir o padrão `use<Nome>`.
3. **Novos tipos** devem ser adicionados em `src/types/camara.ts`.
4. **Novas chamadas de API** devem ser adicionadas em `src/api/camaraApi.ts` usando a função `fetchApi<T>` interna.
5. **Textos na UI** devem estar em português do Brasil.
6. **Acessibilidade:** manter atributos `aria-*`, `role` e suporte a teclado nos elementos interativos.
7. **CSS:** adicionar estilos no arquivo `.css` correspondente ao componente; usar variáveis CSS já definidas quando disponíveis. Nunca utilizar tailwind.
8. **Não instalar** bibliotecas de estado global (Redux, Zustand etc.) sem discussão prévia.
9. Manter o código **compatível com TypeScript strict mode** (`"strict": true`).
10. Sempre que necessário, realizar perguntas para melhorar a compreensão do requisito antes de gerar código.
11. Ao adicionar novas fontes de dados, atualizar as referências em `documentacao/` e, quando aplicável, na página "Sobre".
12. **Ao integrar uma nova API de listagem de políticos** (senadores, deputados estaduais, etc.), adicionar o novo grupo em `scripts/generate-politicians-index.mjs` e registrar a URL na tabela de *URLs de API de Listagem* na seção **API** acima.

---

## Documentação do Projeto

- A documentação funcional e técnica consolidada fica em `documentacao/`.
- Antes de alterar arquitetura, API ou fluxos, atualizar os arquivos correspondentes nessa pasta.

---

## Skill de Pós-Implementação

- Skill disponível: `.github/skills/finalizar-implementacao.md`
- Quando finalizar uma entrega, você pode chamar no chat:
  - **"Executar skill finalizar-implementacao"**
  - **"Rodar skill de finalização"**
- A skill deve:
  1. verificar o que foi implementado;
  2. criar/atualizar documentação em `documentacao/`;
  3. ajustar `.github/copilot-instructions.md` quando houver desalinhamento com o código.