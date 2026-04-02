# GitHub Copilot – Instruções do Projeto

## Visão Geral

**Analise-Eleicoes** é uma aplicação web SPA para consulta e análise de políticos brasileiros por estado. Os dados são consumidos em tempo real de APIs publicas, focando em presidentes, senadores, deputados federais e estaduais. O objetivo é fornecer uma ferramenta de fácil acesso para eleitores conhecerem o histórico de seus representantes antes das eleições.

O usuário possui algumas opções de navegação para encontrar políticos:

1. **Selecionar a forma de pesquisa** – por estado ou busca direta
2. **Selecionar estado** – mapa interativo do Brasil (SVG)
3. **Listar políticos** – lista com busca por nome
4. **Detalhar político** – informações pessoais, proposições e votações

---

## Stack Tecnológica

- **Framework:** React 18 com TypeScript (modo estrito)
- **Bundler:** Vite
- **Linting:** ESLint com `typescript-eslint`
- **Mapa:** `@svg-maps/brazil`
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
    panels/      # Painéis de navegação (StatesPanel, DeputiesPanel, DeputyDetailPanel)
  constants/     # Dados estáticos (lista de estados)
  hooks/         # Hooks customizados de lógica de negócio
  types/         # Tipos TypeScript compartilhados (camara.ts)
  utils/         # Utilitários puros (format.ts, ui.ts)
```

---

## Convenções de Código

- **Linguagem da interface:** Português do Brasil
- **Exportações nomeadas** em todos os componentes e hooks (sem `export default`)
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
type Panel       = 'states' | 'deputies' | 'detail'
type Tab         = 'proposicoes' | 'votacoes'
```

---

## API (`src/api/camaraApi.ts`)

- Base URL: `https://dadosabertos.camara.leg.br/api/v2`
- Todas as respostas têm envelope `{ dados: T }`
- Funções exportadas:
  - `fetchDeputiesByState(uf: string): Promise<Deputy[]>`
  - `fetchDeputyDetailBundle(id: number): Promise<{ info, propositions, votes }>`
- Erros de HTTP lançam `Error` com mensagem em português

---

## Hooks (`src/hooks/`)

| Hook | Responsabilidade |
|---|---|
| `useCamaraData` | Composição central; controla `panel`, `selectedState`, `selectedDeputy` e ações de navegação |
| `useDeputies` | Carrega/filtra lista de deputados por UF |
| `useDeputyDetail` | Carrega detalhes, proposições e votações de um deputado |

---

## Boas Práticas ao Gerar Código

1. **Novos componentes** devem ir em `src/components/common/` (genérico) ou no painel/layout correto e devem ter seu próprio arquvio `.css` para estilos específicos, sempre seguindo o padrão do projeto para cores e fontes.
2. **Novos hooks** devem ir em `src/hooks/` e seguir o padrão `use<Nome>`.
3. **Novos tipos** devem ser adicionados em `src/types/camara.ts`.
4. **Novas chamadas de API** devem ser adicionadas em `src/api/camaraApi.ts` usando a função `fetchApi<T>` interna.
5. **Textos na UI** devem estar em português do Brasil.
6. **Acessibilidade:** manter atributos `aria-*`, `role` e suporte a teclado nos elementos interativos.
7. **CSS:** adicionar estilos no arquivo `.css` correspondente ao componente; usar variáveis CSS já definidas quando disponíveis. Nunca utilizar tailwind.
8. **Não instalar** bibliotecas de estado global (Redux, Zustand etc.) sem discussão prévia.
9. Manter o código **compatível com TypeScript strict mode** (`"strict": true`).
10. Sempre que necessário, realizar perguntas para melhorar a compreensão do requisito antes de gerar código.
11. Ao adicionar novas fontes de dados, inserir de onde vem a fonte na página "Sobre".