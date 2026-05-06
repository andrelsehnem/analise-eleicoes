# Skill: Finalizar Implementação

## Objetivo

Executar uma revisão de fechamento após qualquer implementação, garantindo que:

1. o que foi implementado seja identificado corretamente;
2. a documentação técnica seja criada/atualizada;
3. o arquivo `.github/copilot-instructions.md` seja atualizado quando houver desalinhamento.

## Como chamar

Use no chat uma instrução como:

- **"Executar skill finalizar-implementacao"**
- **"Rodar skill de finalização"**

Opcionalmente informe escopo:

- feature/fluxo alvo;
- arquivos/pastas impactados;
- se deve atualizar também `README.md`.

## Entradas esperadas

- Contexto da implementação concluída.
- Arquivos alterados (via diff/changed files).
- Estado atual de `documentacao/` e `.github/copilot-instructions.md`.

## Protocolo de execução

1. **Mapear implementação concluída**
   - Levantar arquivos alterados.
   - Identificar funcionalidades afetadas (rota, página, painel, hook, API, tipos, utilitários).

2. **Validar cobertura documental**
   - Verificar se já existe documentação correspondente em `documentacao/`.
   - Criar ou atualizar arquivos necessários sem duplicação.
   - Registrar comportamento implementado, limitações e decisões técnicas.

3. **Atualizar documentação funcional/técnica**
   - Atualizar índice em `documentacao/README.md` quando novos documentos forem criados.
   - Atualizar módulos/arquitetura/API/roadmap quando impactados.

4. **Auditar instruções do Copilot**
   - Comparar mudanças implementadas com `.github/copilot-instructions.md`.
   - Ajustar instruções somente quando necessário (stack, arquitetura, fluxos, convenções, estrutura).

5. **(Opcional) Auditar README**
   - Se a implementação afetar onboarding, rotas públicas, stack ou escopo funcional, atualizar `README.md`.

6. **Checklist final de entrega**
   - Confirmar que documentação e instruções ficaram consistentes com o código.
   - Listar o que foi atualizado e o que permaneceu pendente para próxima iteração.
   - Se uma nova API de listagem de políticos foi integrada (senadores, deputados estaduais, vereadores, etc.), verificar se `scripts/generate-politicians-index.mjs` foi atualizado com o novo grupo e se a URL foi registrada na tabela de *URLs de API de Listagem* em `.github/copilot-instructions.md`.

## Critérios de qualidade

- Não inventar funcionalidades não implementadas.
- Separar claramente “implementado” vs “roadmap/em breve”.
- Manter textos em Português do Brasil.
- Preferir alterações mínimas e objetivas.
- Preservar estrutura e estilo existentes do projeto.

## Saída esperada

Ao concluir a skill, retornar:

1. resumo das funcionalidades verificadas;
2. arquivos de documentação criados/atualizados;
3. ajustes aplicados em `.github/copilot-instructions.md` (se houver);
4. pendências ou recomendações.
