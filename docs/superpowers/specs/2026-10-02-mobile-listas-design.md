# Responsividade mobile — Sub-projeto 2b: telas de lista e perfil do aluno

Data: 2026-10-02
Status: aguardando revisão do usuário

## Contexto

Continuação da missão de tornar o app usável no celular. Já estão mesclados: a base compartilhada (PR #53) e a tela de aula com exercícios (PR #54). Este documento cobre o sub-projeto 2b: as telas de lista e perfil da área do aluno.

Telas auditadas (375px, aluno logado, e 768px para as principais): dashboard, estudar (trilhas, fases e módulo), trilhas e detalhe da trilha, jornada, aulas ao vivo, notas, desempenho, fórum (lista, nova pergunta e detalhe), comunidade e perfil.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Divisão do sub-projeto 2 | 2a (aula e exercícios) já mesclado; 2b (listas e perfil) é este |
| Telas sem dados na conta de teste | Corrigir e testar só o que dá para medir; as demais ficam registradas como "não verificadas" |
| Áreas de toque | 44px no celular com o padrão `min-h-11 sm:min-h-0` (o desktop não muda), igual ao dos PRs anteriores |
| Largura mínima alvo | 375px (também 360px) |

## Levantamento (375px, aluno logado)

| # | Problema | Onde | Evidência |
|---|---|---|---|
| 1 | O seletor de status do fórum (Todas / Abertas / Respondidas / Resolvidas) passa da tela e "Resolvidas" fica cortado; os botões têm 34px | `components/student/forum/ForumFilters.tsx` | medido |
| 2 | Na pergunta do fórum, um link longo (URL) tem 446px e passa da tela, porque links no markdown não quebram linha. O mesmo vale para links em artigos de aula | `components/common/markdown-renderer.tsx` | medido |
| 3 | Áreas de toque pequenas: menu da pergunta (36×36), voto (36px), "Marcar como melhor" (32px), "Voltar para o fórum" (23px), abas de Desempenho (38px), "Alterar" no Perfil (40px), "Ir para Estudar" (38px), link "Fase N: …" no módulo (22px) | vários | medido |
| 4 | Sem dados na conta de teste não foi possível exercitar: Jornada (sem estatísticas de gamificação, o cabeçalho de 3 colunas e a sequência de 7 dias não aparecem; mostra "Nenhuma trilha encontrada"), feed da Comunidade, Notas com anotações e gráficos de Desempenho | vários | não testável |

Em 768px nada passa da tela nas telas de lista medidas (dashboard, estudar, trilhas, fórum, desempenho).

## Design

### 1. Filtros do fórum
Em `ForumFilters.tsx`:
- O contêiner do seletor de status passa de `flex gap-1 p-1 bg-gray-800 rounded-lg` para `grid grid-cols-2 gap-1 p-1 bg-gray-800 rounded-lg sm:flex`, e cada botão ganha `min-h-11 sm:min-h-0`.
- O seletor de módulo: contêiner `relative w-full sm:w-auto`, `select` com `w-full sm:w-auto` e `min-h-11 sm:min-h-0`; o `min-w-[200px]` passa a valer só de `sm` para cima (`sm:min-w-[200px]`).
- O botão "Minhas perguntas" ganha `w-full sm:w-auto` e `min-h-11 sm:min-h-0`.

### 2. Links longos no markdown
Em `components/common/markdown-renderer.tsx`, o `className` do `<a>` ganha `[overflow-wrap:anywhere]`.

### 3. Áreas de toque de 44px no celular
Padrão `min-h-11 sm:min-h-0` (e `min-w-11 sm:min-w-0` em botões só de ícone), sem mudar o visual no desktop:
- Links "Voltar": `QuestionDetail.tsx` ("Voltar para o fórum"), `app/(dashboard)/aluno/forum/nova/page.tsx` e o link de volta de `app/(dashboard)/aluno/estudar/[modulo]/page.tsx` (rótulo "Fase N: …").
- Fórum: menus `⋮` em `QuestionDetail.tsx` (`p-2`) e `AnswerCard.tsx` (`p-1.5`), botão de voto e "Marcar como melhor" em `AnswerCard.tsx`.
- Abas de Desempenho: `components/student/performance/PerformanceTabs.tsx`.
- "Alterar" senha: `ChangePasswordSection` (usado em `aluno/perfil/page.tsx`).
- "Ir para Estudar" em `app/(dashboard)/aluno/trilhas/[id]/page.tsx`.

## Verificação

Não há suíte de testes no projeto. Verificar com:
- `pnpm exec tsc --noEmit` e `pnpm build` sem erros novos.
- No navegador, em 375px e 360px, logado como aluno: o seletor de status do fórum cabe e "Resolvidas" aparece; a URL longa da pergunta quebra linha; os elementos da lista do item 3 têm pelo menos 44px de altura; nenhuma rota de lista tem conteúdo fora da tela (fora de contêineres com rolagem própria).
- Em 768px e 1280px, conferir que nada mudou.

## Fora de escopo

- Jornada, Comunidade com feed, Notas com anotações e gráficos de Desempenho com dados: ficam descritos no PR como "não verificados".
- Acessibilidade por teclado dos componentes do fórum.
- Variante de toque por ponteiro (`pointer-coarse:`) em vez de largura.

## Pendências para o plano

- Localizar o arquivo de `ChangePasswordSection` e o link "Voltar para Trilhas" de `trilhas/[id]` (não estava entre os achados medidos; incluir só se estiver abaixo de 44px).
- Confirmar que `Button` com `size="sm"` aceita `className` para sobrescrever a altura.
- A branch `feat/mobile-listas` já foi criada a partir da `main` atualizada.
