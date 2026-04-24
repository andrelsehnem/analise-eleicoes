# Skill: Auditoria SEO Técnica

## Objetivo

Executar uma auditoria completa de SEO técnico e on-page no repositório, posteriormente já implemente, com foco em:

1. qualidade semântica do HTML;
2. metadados por rota;
3. dados estruturados (Schema.org);
4. performance e Core Web Vitals;
5. indexação (`sitemap.xml` e `robots.txt`);
6. prevenção de conteúdo ralo (thin content).

## Como chamar

Use no chat uma instrução como:

- **"Executar skill auditoria-seo-tecnico"**
- **"Rodar skill de auditoria SEO"**
- **"Aplicar skill SEO técnico nas rotas públicas"**

## Modos de execução

- **Modo relatório (padrão):** analisa e entrega diagnóstico + sugestões com trechos de código.
- **Modo implementação:** além do relatório, aplica correções imediatas e valida build/lint quando possível.

Para forçar implementação, inclua no pedido: **"modo implementação"**.

## Entradas esperadas

- Código-fonte atualizado do projeto.
- Rotas públicas conhecidas (ou detectadas no roteador).
- Contexto de stack (React + Vite + TypeScript strict).
- Preferências de escopo (somente páginas públicas, incluir documentação, etc.).

## Protocolo de execução

1. **Mapear rotas e templates principais**
   - Identificar páginas públicas no roteador.
   - Levantar componentes com responsabilidade de título, conteúdo principal e links.

2. **Auditoria semântica e on-page**
   - Verificar hierarquia de `h1`–`h6` por página (um `h1` principal por tela).
   - Encontrar imagens sem `alt` e links com texto genérico (ex.: “clique aqui”, “saiba mais” sem contexto).
   - Sinalizar ausência de landmarks semânticos (`main`, `nav`, `header`, `footer`) quando aplicável.

3. **Meta-tags dinâmicas por rota**
   - Propor/implementar mecanismo centralizado para `title` e `meta description` únicos por página.
   - Definir fallback seguro para rotas sem conteúdo carregado.
   - Garantir consistência entre título da página e conteúdo visível.

4. **Schema.org (JSON-LD)**
   - Classificar o projeto (site/aplicação/ferramenta de consulta pública).
   - Gerar JSON-LD para Home e páginas principais (ex.: `WebSite`, `Organization`, `BreadcrumbList`, quando fizer sentido).
   - Inserir script de forma segura e reutilizável por rota.

5. **Performance e Core Web Vitals**
   - Revisar carregamento de JS, CSS e assets críticos.
   - Identificar riscos para LCP/INP/CLS (assets grandes, blocos síncronos, imagens sem dimensão, etc.).
   - Propor ações práticas: lazy loading, code-splitting por rota, preload/prefetch seletivo e otimização de imagens.

6. **Arquivos de indexação**
   - Verificar existência e consistência de `public/robots.txt` e `public/sitemap.xml`.
   - Se ausentes, gerar versão inicial baseada nas rotas públicas detectadas.
   - Validar se há bloqueios indevidos de indexação.

7. **Thin content e reforço editorial**
   - Identificar telas com pouco conteúdo textual útil para SEO.
   - Sugerir blocos mínimos (contexto da página, FAQ curta, orientação de uso) sem poluir UX.

8. **Entrega final**
   - Produzir relatório com prioridade (`Alta`, `Média`, `Baixa`), impacto esperado e esforço.
   - Incluir “correções imediatas” com snippets prontos para aplicar.

## Critérios de qualidade

- Não inventar rotas ou funcionalidades inexistentes.
- Manter textos da interface em Português do Brasil.
- Respeitar stack e convenções do projeto.
- Priorizar mudanças pequenas, seguras e com ganho real de SEO.
- Diferenciar claramente: **achados**, **sugestões** e **implementações realizadas**.

## Formato de saída esperado

Ao concluir a skill, retornar:

1. **Resumo executivo** (principais riscos e oportunidades).
2. **Checklist por tema** (semântica, meta-tags, schema, performance, indexação, thin content).
3. **Tabela de achados priorizados** (gravidade, página/arquivo, recomendação).
4. **Snippets de correção imediata** (com caminho de arquivo sugerido).
5. **Próximos passos** (o que implementar primeiro em até 1 sprint).

## Prompt base (aprimorado)

Use este prompt quando quiser executar a skill manualmente com contexto adicional:

"Aja como um Engenheiro de SEO Técnico e Desenvolvedor Full-Stack. Faça uma auditoria completa de SEO neste repositório React + Vite + TypeScript. Mapeie rotas públicas e analise semântica HTML (hierarquia de headings, imagens sem alt, links genéricos), meta-tags dinâmicas por rota, implementação de Schema.org JSON-LD, riscos de Core Web Vitals (LCP/INP/CLS), e arquivos de indexação (robots.txt/sitemap.xml). Identifique páginas com thin content e proponha blocos de conteúdo textual úteis sem comprometer UX. Entregue um relatório priorizado (Alta/Média/Baixa), com impacto, esforço, e snippets de correção imediata. Se eu pedir modo implementação, aplique as mudanças diretamente no código e valide com build/lint." 