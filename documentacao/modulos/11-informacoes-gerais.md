# Módulo: Informações Gerais por UF

## Objetivo

Disponibilizar uma visão consolidada de políticos por estado e por cargo sem chamadas de API em runtime.

A rota permite comparar quantidades por UF, distribuição por cargo e partidos com carregamento rápido.

## Rotas

- `/informacoes-gerais`
- `/informacoes-gerais/:uf`

## Implementação

- Página: `src/components/pages/GeneralInfoPage.tsx`
- Painel: `src/components/panels/GeneralInfo/GeneralInfoPanel.tsx`
- Hook: `src/hooks/useGeneralInfo.ts`
- API local: `fetchGeneralInfoStatistics()` em `src/api/camaraApi.ts`

## Fonte de dados

- Arquivo estático: `public/statistics-index.json`
- Geração: `scripts/generate-politicians-index.mjs`
- Base de agregação: `public/politicians-index.json`

## Indicadores exibidos

- Total de políticos no recorte atual
- Quantidade de partidos no recorte
- Quantidade por cargo:
  - deputado federal
  - deputado estadual
  - senador
- Quantidade por partido (top 10)
- Destaques nacionais:
  - UF com maior quantidade
  - partido com maior quantidade

## Observações

- A tela funciona com carregamento estático local para manter desempenho previsível.
