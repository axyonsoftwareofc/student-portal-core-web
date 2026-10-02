# Responsividade mobile — Telas de lista e perfil (2b) — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir no celular (375px e 360px) o seletor de status do fórum que corta "Resolvidas", os links longos que passam da tela no markdown e as áreas de toque abaixo de 44px nas telas de fórum, desempenho, perfil, trilha e módulo.

**Architecture:** Só ajustes de classes Tailwind em componentes existentes, sem componente novo e sem dependência. O padrão de toque é `min-h-11 sm:min-h-0` (44px no celular, tamanho original a partir de `sm`), o mesmo usado nos PRs anteriores.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, pnpm.

## Global Constraints

- Largura mínima alvo: 375px, e também 360px, sem elemento fora da tela (fora de contêineres com rolagem própria).
- Áreas de toque de pelo menos 44px de altura no celular com o padrão `min-h-11 sm:min-h-0` (e `min-w-11 sm:min-w-0` em botões só de ícone). A partir de `sm` o aspecto visual não muda.
- Seletor de status do fórum: grade 2×2 no celular (`grid grid-cols-2 gap-1 sm:flex`); seletor de módulo e "Minhas perguntas" ocupam a largura toda no celular (`w-full sm:w-auto`), e o `min-w-[200px]` do módulo vale só de `sm` para cima.
- Links no markdown quebram linha (`[overflow-wrap:anywhere]`).
- Sem mudança de estilo visual além do necessário; não mexer em Jornada, Comunidade, Notas nem nos gráficos de Desempenho (sem dados na conta de teste: ficam "não verificados").
- O projeto não tem framework de testes nem config de ESLint. Verificação: `pnpm exec tsc --noEmit` (baseline: 0 erros), `pnpm build` e medição no navegador. Não adicionar dependências.
- Código novo segue o estilo do repositório: indentação de 4 espaços, aspas simples nos arquivos de `components/` e `app/(dashboard)/aluno/`, comentários curtos em português.
- Commits sem linhas de coautoria e sem menção a ferramentas de IA, no usuário `wernersaboia-code`.

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `components/student/forum/ForumFilters.tsx` | Modificar | Filtros do fórum no celular |
| `components/common/markdown-renderer.tsx` | Modificar | Links longos quebram linha |
| `components/student/forum/QuestionDetail.tsx` | Modificar | Link "Voltar" e menu `⋮` da pergunta |
| `components/student/forum/AnswerCard.tsx` | Modificar | Menu `⋮`, voto e "Marcar como melhor" |
| `app/(dashboard)/aluno/forum/nova/page.tsx` | Modificar | Link "Voltar para o fórum" |
| `components/student/performance/PerformanceTabs.tsx` | Modificar | Abas de Desempenho |
| `components/student/profile/ChangePasswordSection.tsx` | Modificar | Botão "Alterar" |
| `app/(dashboard)/aluno/trilhas/[id]/page.tsx` | Modificar | Botão "Ir para Estudar" |
| `app/(dashboard)/aluno/estudar/[modulo]/page.tsx` | Modificar | Link de volta ("Fase N: …") |

---

### Task 0: Branch e linha de base

**Files:** nenhum arquivo do projeto muda.

- [ ] **Step 1: Confirmar a branch e a identidade**

Run: `git branch --show-current && git config user.name && git config user.email && git status --short`
Expected: `feat/mobile-listas`, `wernersaboia-code`, `193748113+wernersaboia-code@users.noreply.github.com`, e só aparecem como não rastreados os arquivos de `docs/superpowers/` desta missão. Se a branch não for `feat/mobile-listas`, crie-a a partir da `main` atualizada: `git checkout main && git pull && git checkout -b feat/mobile-listas`.

- [ ] **Step 2: Linha de base de tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 3: Commit do spec e do plano**

```bash
git add docs/superpowers/specs/2026-10-02-mobile-listas-design.md docs/superpowers/plans/2026-10-02-mobile-listas.md
git commit -m "docs: spec e plano das telas de lista no celular (sub-projeto 2b)"
```

---

### Task 1: Filtros do fórum e links longos no markdown

**Files:**
- Modify: `components/student/forum/ForumFilters.tsx`
- Modify: `components/common/markdown-renderer.tsx`

**Interfaces:** nenhuma nova.

- [ ] **Step 1: Seletor de status**

Em `components/student/forum/ForumFilters.tsx`:

1. Troque o contêiner do seletor de status:
```tsx
                <div className="flex gap-1 p-1 bg-gray-800 rounded-lg">
```
por:
```tsx
                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-800 rounded-lg sm:flex">
```

2. No `cn(...)` de cada botão de status, troque a primeira string:
```tsx
                                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
```
por:
```tsx
                                'min-h-11 px-3 py-1.5 rounded-md text-sm font-medium transition-all sm:min-h-0',
```

- [ ] **Step 2: Módulo e "Minhas perguntas"**

No mesmo arquivo:

1. O contêiner do seletor de módulo (o `<div className="relative">` que vem logo antes de `<Filter className="absolute left-3 ...`):
```tsx
                <div className="relative">
```
vira:
```tsx
                <div className="relative w-full sm:w-auto">
```

2. No `cn(...)` do `<select>` do módulo, troque:
```tsx
                            'pl-10 pr-8 py-2.5 rounded-lg appearance-none',
```
por:
```tsx
                            'w-full min-h-11 pl-10 pr-8 py-2.5 rounded-lg appearance-none sm:w-auto sm:min-h-0',
```
e troque:
```tsx
                            'transition-all min-w-[200px]'
```
por:
```tsx
                            'transition-all sm:min-w-[200px]'
```

3. No `cn(...)` do botão "Minhas perguntas", troque:
```tsx
                            'px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
```
por:
```tsx
                            'min-h-11 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all sm:min-h-0 sm:w-auto',
```

4. No botão "Limpar filtros" (`<Button variant="ghost" size="sm" ...>`), troque o `className`:
```tsx
                        className="text-gray-400 hover:text-white"
```
por:
```tsx
                        className="h-11 text-gray-400 hover:text-white sm:h-8"
```

- [ ] **Step 3: Links longos no markdown**

Em `components/common/markdown-renderer.tsx`, no componente `a`, troque o `className`:

```tsx
                            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
```

por:

```tsx
                            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors [overflow-wrap:anywhere]"
```

- [ ] **Step 4: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 5: Commit**

```bash
git add components/student/forum/ForumFilters.tsx components/common/markdown-renderer.tsx
git commit -m "fix(mobile): filtros do fórum cabem na tela e links longos quebram linha"
```

---

### Task 2: Áreas de toque no fórum

**Files:**
- Modify: `components/student/forum/QuestionDetail.tsx`
- Modify: `components/student/forum/AnswerCard.tsx`
- Modify: `app/(dashboard)/aluno/forum/nova/page.tsx`

**Interfaces:** nenhuma nova.

- [ ] **Step 1: QuestionDetail**

Em `components/student/forum/QuestionDetail.tsx`:

1. No `<Link href="/aluno/forum" ...>` ("Voltar para o fórum"), troque o `className`:
```tsx
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
```
por:
```tsx
                className="inline-flex min-h-11 items-center gap-2 text-gray-400 hover:text-white transition-colors sm:min-h-0"
```

2. No botão do menu `⋮` (o que chama `setIsMenuOpen(!isMenuOpen)` e contém `<MoreVertical className="h-5 w-5" />`), troque o `className`:
```tsx
                                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
```
por:
```tsx
                                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-gray-500 hover:text-white hover:bg-gray-800 transition-colors sm:min-h-0 sm:min-w-0"
```

- [ ] **Step 2: AnswerCard**

Em `components/student/forum/AnswerCard.tsx`:

1. No botão do menu `⋮` (contém `<MoreVertical className="h-4 w-4" />`), troque o `className`:
```tsx
                            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
```
por:
```tsx
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 transition-colors sm:min-h-0 sm:min-w-0"
```

2. No botão de voto, no `cn(...)`, troque a primeira string:
```tsx
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
```
por:
```tsx
                        'inline-flex min-h-11 items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all sm:min-h-0',
```

3. No `<Button variant="ghost" size="sm" onClick={handleMarkBest} ...>` ("Marcar como melhor"), troque o `className`:
```tsx
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
```
por:
```tsx
                        className="h-11 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30 sm:h-8"
```

- [ ] **Step 3: Nova pergunta**

Em `app/(dashboard)/aluno/forum/nova/page.tsx`, no `<Link href="/aluno/forum" ...>` ("Voltar para o fórum"), troque o `className`:
```tsx
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
```
por:
```tsx
                className="inline-flex min-h-11 items-center gap-2 text-gray-400 hover:text-white transition-colors sm:min-h-0"
```

- [ ] **Step 4: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 5: Commit**

```bash
git add components/student/forum/QuestionDetail.tsx components/student/forum/AnswerCard.tsx "app/(dashboard)/aluno/forum/nova/page.tsx"
git commit -m "fix(mobile): áreas de toque de 44px no fórum"
```

---

### Task 3: Áreas de toque em Desempenho, Perfil, Trilha e Módulo

**Files:**
- Modify: `components/student/performance/PerformanceTabs.tsx`
- Modify: `components/student/profile/ChangePasswordSection.tsx`
- Modify: `app/(dashboard)/aluno/trilhas/[id]/page.tsx`
- Modify: `app/(dashboard)/aluno/estudar/[modulo]/page.tsx`

**Interfaces:** nenhuma nova.

- [ ] **Step 1: Abas de Desempenho**

Em `components/student/performance/PerformanceTabs.tsx`, no `cn(...)` do botão da aba, troque a primeira string:
```tsx
                            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
```
por:
```tsx
                            'flex min-h-11 flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all sm:min-h-0',
```

- [ ] **Step 2: "Alterar" senha**

Em `components/student/profile/ChangePasswordSection.tsx`, no botão "Alterar" (o que fica ao lado do texto "Senha" e "••••••••"), troque o `className`:
```tsx
                        className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
```
por:
```tsx
                        className="min-h-11 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors sm:min-h-0"
```

- [ ] **Step 3: "Ir para Estudar"**

Em `app/(dashboard)/aluno/trilhas/[id]/page.tsx`, no `<Link href="/aluno/estudar" ...>` ("Ir para Estudar"), troque o `className`:
```tsx
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
```
por:
```tsx
                        className="mt-3 inline-flex min-h-11 items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors sm:min-h-0"
```

- [ ] **Step 4: Link de volta do módulo**

Em `app/(dashboard)/aluno/estudar/[modulo]/page.tsx`, no `<Link href={backLink} ...>` (o que mostra `{backLabel}`), troque o `className`:
```tsx
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
```
por:
```tsx
                    className="inline-flex min-h-11 items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors sm:min-h-0"
```
(Se a mesma string aparecer em outro `<Link>` do arquivo, edite somente o que tem `href={backLink}`.)

- [ ] **Step 5: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 6: Commit**

```bash
git add components/student/performance/PerformanceTabs.tsx components/student/profile/ChangePasswordSection.tsx "app/(dashboard)/aluno/trilhas/[id]/page.tsx" "app/(dashboard)/aluno/estudar/[modulo]/page.tsx"
git commit -m "fix(mobile): áreas de toque de 44px em Desempenho, Perfil, Trilha e Módulo"
```

---

### Task 4: Verificação no navegador, PR e merge

Esta task é executada pelo controlador (precisa da sessão de aluno no navegador embutido); não delegue a um subagente.

- [ ] **Step 1: Build**

Pare o servidor de desenvolvimento (`pnpm build` sobrescreve `.next`), rode `pnpm exec tsc --noEmit` e `pnpm build`, e suba `pnpm dev` de novo. Expected: 0 erros e `Compiled successfully`.

- [ ] **Step 2: Fórum em 375px e 360px**

Com o viewport emulado, abra `/aluno/forum` e execute (espere o conteúdo carregar antes de medir):

```js
const dl = Date.now() + 25000; let m;
while (Date.now() < dl) { m = document.querySelector('main'); if (m && m.innerText.length > 250) break; await new Promise(r => setTimeout(r, 400)); }
m = document.querySelector('main');
const status = [...m.querySelectorAll('button')].filter(b => /^(Todas|Abertas|Respondidas|Resolvidas)$/.test(b.innerText.trim()));
const sel = m.querySelector('select');
const mine = [...m.querySelectorAll('button')].find(b => /Minhas perguntas/.test(b.innerText));
({
    iw: innerWidth,
    statusButtons: status.map(b => ({ t: b.innerText.trim(), right: Math.round(b.getBoundingClientRect().right), h: Math.round(b.getBoundingClientRect().height) })),
    allInside: status.every(b => b.getBoundingClientRect().right <= innerWidth),
    selectW: sel && Math.round(sel.getBoundingClientRect().width), selectH: sel && Math.round(sel.getBoundingClientRect().height),
    mineW: mine && Math.round(mine.getBoundingClientRect().width), mineH: mine && Math.round(mine.getBoundingClientRect().height),
})
```
Expected: `allInside: true` com 4 botões de altura ≥ 44 (grade 2×2), `selectW` quase a largura da tela (≥ 300) com altura ≥ 44, e "Minhas perguntas" (se existir) com altura ≥ 44.

- [ ] **Step 3: Detalhe da pergunta**

Abra `/aluno/forum/0d39818b-46bb-4ee9-b232-8bafcfc9b4a1` (ou o único link de pergunta da lista) e execute:

```js
const dl = Date.now() + 25000; let m;
while (Date.now() < dl) { m = document.querySelector('main'); if (m && m.innerText.length > 300 && !/Carregando/.test(m.innerText)) break; await new Promise(r => setTimeout(r, 400)); }
m = document.querySelector('main');
const sc = (e) => { for (let p = e.parentElement; p && p !== m; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
const clipped = [...m.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > innerWidth + 1 && !e.closest('[aria-hidden="true"]') && !e.closest('.fixed') && !sc(e); });
const small = [...m.querySelectorAll('a, button, select, input, textarea')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.height < 44 && !e.closest('footer') && !e.closest('.markdown-content'); }).map(e => e.tagName + ':' + (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
({ clipped: clipped.length, clippedTop: clipped.slice(0, 3).map(e => e.tagName + '.' + String(e.className).slice(0, 45) + ' w' + Math.round(e.getBoundingClientRect().width)), smallCount: small.length, small: small.slice(0, 8) })
```
Expected: `clipped: 0` (a URL longa agora quebra linha) e `smallCount: 0` (voltar, menu `⋮`, voto e "Marcar como melhor" com 44px ou mais). Links dentro do texto da pergunta (`.markdown-content`) ficam fora da conta de propósito.

- [ ] **Step 4: Outras telas**

Em 375px, meça a altura dos elementos abaixo (todos ≥ 44 esperado) com `getBoundingClientRect().height`:
- `/aluno/desempenho`: as 3 abas (botões dentro do contêiner `rounded-lg bg-gray-900/50`).
- `/aluno/perfil`: o botão "Alterar".
- `/aluno/trilhas/d6e407f7-13df-4f54-abd4-27744344ac08`: o link "Ir para Estudar".
- `/aluno/estudar/864647f5-569c-4311-a34c-8914ff365454`: o link de volta ("Fase 1: …").
- `/aluno/forum/nova`: o link "Voltar para o fórum".
Em cada rota, confirme também que não há conteúdo fora da tela (mesmo critério do Step 3).

- [ ] **Step 5: Tablet e desktop**

Em 768×900 e 1280×800, abra `/aluno/forum` e confirme: o seletor de status volta a ser uma linha (`display: flex`), a altura dos botões de status volta ao valor original (sem `min-height` de 44px) e nada passa da tela. Em 1280px, abra `/aluno/desempenho` e confira que as abas não ganharam altura mínima de 44px. Restaure o viewport com `resize_window` preset `desktop`.

- [ ] **Step 6: Revisão do diff e PR**

Run: `git diff main --stat`
Expected: só os nove arquivos do mapa de arquivos e os dois documentos de `docs/superpowers/`. Nenhum `.env*`, `.next` ou `tsconfig.tsbuildinfo`.

Depois:
```bash
git push -u origin feat/mobile-listas
gh pr create --repo axyonsoftwareofc/student-portal-core-web --base main --head feat/mobile-listas --title "fix(mobile): telas de lista e perfil do aluno no celular" --body "$(cat <<'EOF'
## O que muda

Terceiro PR da missão mobile, parte 2b: telas de lista e perfil do aluno (itens medidos em 375px).

- **Fórum:** o seletor de status (Todas / Abertas / Respondidas / Resolvidas) cortava "Resolvidas" e agora é uma grade 2×2 no celular; módulo e "Minhas perguntas" ocupam a largura toda.
- **Markdown:** links longos (URLs) passavam da tela e agora quebram linha. Vale também para links dentro de artigos de aula.
- **Áreas de toque de 44px no celular** (a partir de `sm` nada muda): links "Voltar" (pergunta, nova pergunta, módulo), menus `⋮`, voto e "Marcar como melhor" no fórum, abas de Desempenho, "Alterar" senha no Perfil e "Ir para Estudar" na trilha.

Spec e plano em `docs/superpowers/`.

## Como testar

1. Logado como aluno, em 375px e 360px, abrir `/aluno/forum`: os quatro botões de status aparecem em 2×2, sem corte.
2. Abrir uma pergunta com link longo: o link quebra linha e nada rola para o lado.
3. Conferir os botões acima: todos com pelo menos 44px de altura no celular.
4. Em 768px e 1280px o visual continua como antes.

Verificação feita: `tsc --noEmit` sem erros, `next build` ok e medição no navegador nas telas acima, em 375px e 360px, com conferência em 768px e 1280px. Não há suíte de testes no projeto.

## Não verificado

Jornada (cabeçalho de 3 colunas e sequência de 7 dias), feed da Comunidade, Notas com anotações e gráficos de Desempenho com dados: a conta de teste não tem esses dados, então ficam sem verificação neste PR.
EOF
)"
```
Expected: URL do PR impressa, sem assinatura de ferramenta no corpo.

- [ ] **Step 7: Merge (autorizado pelo usuário)**

Run: `gh pr merge --merge --delete-branch`
Expected: PR mesclado. Se o GitHub bloquear por proteção de branch, revisão exigida ou checks pendentes, **não contorne**: informe o usuário.

- [ ] **Step 8: Voltar para a main e encerrar o servidor**

Run: `git checkout main && git pull`
Expected: `main` atualizada. Encerre o `pnpm dev` que foi subido para as medições.

---

## Auto-revisão do plano contra o spec

- **§1 Filtros do fórum (grade 2×2, módulo e "Minhas perguntas" em largura total, `min-w-[200px]` só em `sm+`):** Task 1, Steps 1 e 2 (inclui o botão "Limpar filtros" com 44px).
- **§2 Links longos no markdown:** Task 1, Step 3.
- **§3 Áreas de toque:** links "Voltar" (pergunta e nova pergunta: Task 2; módulo: Task 3), menus, voto e "Marcar como melhor" (Task 2), abas de Desempenho, "Alterar" e "Ir para Estudar" (Task 3).
- **Verificação do spec** (`tsc`, `build`, 375/360px, 768 e 1280px): Task 4.
- **Pendências do spec:** `ChangePasswordSection` localizado em `components/student/profile/`; o link "Voltar para Trilhas" de `trilhas/[id]` não estava abaixo de 44px na medição e ficou de fora; `Button size="sm"` tem `h-8` e o `className` `h-11 sm:h-8` o sobrescreve via `cn`/twMerge (mesmo mecanismo já usado em PRs anteriores).
- **Consistência de nomes:** todas as classes usam o mesmo padrão `min-h-11 ... sm:min-h-0` (ou `h-11 sm:h-8` para `Button size="sm"`).
