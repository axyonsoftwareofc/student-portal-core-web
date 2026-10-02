# Responsividade mobile — Sub-projeto 2a: tela de aula e exercícios

Data: 2026-10-02
Status: aguardando revisão do usuário

## Contexto

Continuação da missão de tornar o app usável no celular. O sub-projeto 1 (base compartilhada) foi mesclado no PR #53 e, ao eliminar a rolagem horizontal do `<main>`, expôs que alguns controles da tela de aula estavam fora da tela e passaram a ser inalcançáveis.

O sub-projeto 2 (área do aluno) foi dividido em dois PRs:

- **2a (este documento):** tela de aula (`/aluno/estudar/[modulo]/[aula]`) e exercícios interativos.
- **2b:** telas de lista e perfil (dashboard, estudar, trilhas, jornada, fórum, comunidade, notas, desempenho, perfil, aulas ao vivo). Ciclo próprio depois deste.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Divisão do sub-projeto 2 | 2a (aula e exercícios) primeiro; 2b (listas e perfil) depois |
| Barra de navegação de baixo no celular | Contador "5 / 61" no lugar das bolinhas; bolinhas só em `md+` |
| Exercício "Classificar" | Layout responsivo e toque para classificar (selecionar o item e tocar na categoria), mantendo o arrastar no desktop |
| Largura mínima alvo | 375px (também 360px) |

## Levantamento visual (375px, aluno logado, aula "O Que é Programação?", 61 conteúdos)

Medido no navegador, incluindo uma varredura automática de todos os 61 conteúdos (clique em cada chip, medindo o que passa da largura da tela fora de contêineres com rolagem própria):

| # | Problema | Onde | Alcance |
|---|---|---|---|
| 1 | O botão "Próximo" fica fora da tela (x 836 a 912 em tela de 375px). A barra de baixo tem 61 bolinhas de 8×8px em fila, 744px de largura, num contêiner de 343px. Com o `overflow-x-hidden` do PR #53 o botão ficou inalcançável | `[aula]/page.tsx` linhas 371-415 | todos os 61 conteúdos |
| 2 | As bolinhas têm 8×8px, impossíveis de tocar | idem | todos |
| 3 | Área de toque pequena: "Anterior" (22px de altura), links do breadcrumb (22px), botão de anotações (42×30) | `[aula]/page.tsx` | todos |
| 4 | Exercício "Classificar": categorias em 2 a 3 colunas por `style` inline em qualquer largura, passando da tela; só funciona arrastando (`draggable`/`onDrop`), sem alternativa por toque | `InteractiveExercise.tsx` `CategorizeExercise` (~linha 1995) | 7 conteúdos |
| 5 | Exercício "Conectar": o `<select>` fica ao lado do rótulo e passa da tela (182 a 412px) | `InteractiveExercise.tsx` `MatchingExercise` (~linha 822) | 6 conteúdos |
| 6 | Código inline longo no markdown não quebra linha (463px) | `components/common/markdown-renderer.tsx` linha 142 | 1 conteúdo (artigo) |
| 7 | Link "Voltar ao módulo" do último conteúdo fora da tela (efeito do item 1) | `[aula]/page.tsx` linha 407 | último conteúdo |

Sem overflow nos tipos: arrastar e soltar (que já tem toque por `onClick`), lacunas, ordenar, verdadeiro/falso, saída do código, depuração, múltipla seleção e completar código. A faixa de chips dos conteúdos já rola dentro do próprio contêiner (`overflow-x-auto`).

## Design

### 1. Barra de navegação de baixo
Em `app/(dashboard)/aluno/estudar/[modulo]/[aula]/page.tsx` (bloco "Navigation Footer"):
- Entre "Anterior" e "Próximo" (ou "Voltar ao módulo"), o contador `{activeContentIndex + 1} / {contents.length}` aparece só abaixo de `md`; as bolinhas aparecem só de `md` para cima (`hidden md:flex`).
- Os botões de navegação ganham área de toque de pelo menos 44px (`min-h-11`), e a barra passa a ter `gap-2`. O desktop não muda.

### 2. Toque no cabeçalho da aula
- Os dois links do breadcrumb e o botão de anotações passam para pelo menos 44px de área de toque no celular, sem mudar o aspecto visual no desktop.
- O painel de anotações já é `w-full` no celular; conferir que o botão de fechar fica alcançável.

### 3. Código inline no markdown
Em `components/common/markdown-renderer.tsx`, o `<code>` inline ganha `[overflow-wrap:anywhere]`.

### 4. Exercício "Conectar"
Em `MatchingExercise`, o rótulo e o `<select>` empilham no celular (`flex-col sm:flex-row`), com o select ocupando a largura toda.

### 5. Exercício "Classificar"
Em `CategorizeExercise`:
- O contêiner das categorias troca o `style={{ gridTemplateColumns }}` por classes responsivas: 1 coluna no celular e, de `sm` para cima, `min(nº de categorias, 3)` colunas (mapeadas por classes estáticas do Tailwind).
- **Toque para classificar:** novo estado do item selecionado. Tocar num item não classificado o seleciona (anel destacado; tocar de novo desmarca); tocar numa categoria coloca o item selecionado nela. O arrastar continua funcionando. É o mesmo padrão que `DragDropExercise` já usa com `onClick`.
- Uma dica curta aparece só no celular: "Toque num item e depois na categoria".

## Verificação

Não há suíte de testes no projeto. Verificar com:
- `pnpm exec tsc --noEmit` e `pnpm build` sem erros novos.
- No navegador, em 375px e 360px, uma varredura automática de todos os conteúdos da aula medida e das outras quatro aulas do mesmo módulo: nenhum elemento fora da tela (fora de contêineres com rolagem própria) e o "Próximo" visível.
- Teste interativo do "Classificar": tocar num item, tocar numa categoria e conferir que o item muda de lugar; tocar num item já classificado o devolve (comportamento que a tela já tem, se existir).
- Medir as áreas de toque: Anterior, Próximo, links do breadcrumb e botão de anotações com pelo menos 44px de altura.
- Em 1280px: bolinhas visíveis, categorias em colunas e layout igual ao de antes.

## Fora de escopo

- Telas de lista e perfil (sub-projeto 2b).
- Correção de tipos de exercício que não apresentaram overflow.
- Substituir o arrastar por uma biblioteca de gestos de toque.
- Mudança de estilo visual além do necessário.

## Pendências para o plano

- Confirmar como itens já classificados voltam para a lista (clique, botão de remover) em `CategorizeExercise`, para o toque ser coerente com isso.
- Confirmar se o botão de anotações e os links do breadcrumb são usados em outro lugar além da tela de aula.
- A branch `feat/mobile-aula` já foi criada a partir da `main` atualizada (pós PR #53).
