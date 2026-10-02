# Responsividade mobile — Páginas públicas (sub-projeto 4) — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nas páginas públicas, evitar o zoom do iPhone ao focar campos (fonte de 16px no celular) e levar a 44px no celular os links dos formulários, os botões de mostrar senha, o header, o logo e os links do rodapé.

**Architecture:** Só ajustes de classes Tailwind (e de `aria-label`/`alt` no logo) em arquivos existentes, mais uma troca de `text-sm` por `text-[1rem] sm:text-sm` na regra global de `.form-input`. Padrão de toque `min-h-11 sm:min-h-0` (e `min-w-11 sm:min-w-0` em itens só de ícone), o mesmo dos PRs anteriores.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, pnpm.

## Global Constraints

- Largura mínima alvo: 375px, e também 360px, sem elemento fora da tela.
- Áreas de toque de pelo menos 44px de altura no celular com o padrão `min-h-11 sm:min-h-0` (e `min-w-11 sm:min-w-0` em itens só de ícone). A partir de `sm` o aspecto visual não muda.
- Campos `.form-input`, `.form-textarea`, `.form-multiselect`, `.form-select`: `text-[1rem] sm:text-sm` (16px no celular, 14px a partir de `sm`).
- Links sociais do rodapé continuam com `href="#"`; só ganham área de toque.
- Logo: `aria-label="Code Plus"` e `alt="Code Plus"`.
- Sem mudança de estilo visual além do necessário.
- O projeto não tem framework de testes nem config de ESLint. Verificação: `pnpm exec tsc --noEmit` (baseline: 0 erros), `pnpm build` e medição no navegador. Não adicionar dependências.
- Código novo segue o estilo do arquivo (indentação e aspas como estão).
- Commits sem linhas de coautoria e sem menção a ferramentas de IA, no usuário `wernersaboia-code`.
- Em todos os "troque X por Y", X é o texto exato atual do arquivo, com a quantidade de ocorrências indicada (1 quando não dito). Se não for encontrado ou a contagem for outra, pare e reporte (não adivinhe).

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `app/css/style.css` | Modificar | Fonte dos campos (regra que vale) |
| `app/css/additional-styles/utility-patterns.css` | Modificar | Fonte dos campos (cópia da regra) |
| `components/ui/header.tsx` | Modificar | "Entrar" e "Inscreva-se" com 44px |
| `components/ui/logo.tsx` | Modificar | Logo com 44×44 e rótulo "Code Plus" |
| `components/ui/footer.tsx` | Modificar | Links sociais com 44×44 |
| `app/(auth)/signin/page.tsx` | Modificar | "Esqueceu?" e "Criar conta" |
| `app/(auth)/signup/page.tsx` | Modificar | Mostrar senha e "Entrar" |
| `app/(auth)/reset-password/page.tsx` | Modificar | "Voltar para login" e "Fazer login" |
| `app/(auth)/update-password/page.tsx` | Modificar | Mostrar senha (2) |
| `app/(auth)/inscreva-se/page.tsx` | Modificar | "Já é aluno? Fazer login" |
| `app/(auth)/convite/[token]/page.tsx` | Modificar | Mostrar senha (2), "Ir para Login", "Fazer login" |

---

### Task 0: Branch e linha de base

**Files:** nenhum arquivo do projeto muda.

- [ ] **Step 1: Confirmar a branch e a identidade**

Run: `git branch --show-current && git config user.name && git status --short`
Expected: `feat/mobile-publicas`, `wernersaboia-code`, e só o plano como não rastreado. O spec já está commitado nessa branch.

- [ ] **Step 2: Linha de base de tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 3: Commit do plano**

```bash
git add docs/superpowers/plans/2026-10-02-mobile-publicas.md
git commit -m "docs: plano das páginas públicas no celular (sub-projeto 4)"
```

---

### Task 1: Fonte dos campos, header, logo e rodapé

**Files:**
- Modify: `app/css/style.css`
- Modify: `app/css/additional-styles/utility-patterns.css`
- Modify: `components/ui/header.tsx`
- Modify: `components/ui/logo.tsx`
- Modify: `components/ui/footer.tsx`

**Interfaces:** nenhuma nova.

- [ ] **Step 1: Fonte dos campos**

Nos dois arquivos de CSS (1 ocorrência em cada), troque
```
@apply rounded-lg px-4 py-2.5 text-sm text-gray-200;
```
por
```
@apply rounded-lg px-4 py-2.5 text-[1rem] text-gray-200 sm:text-sm;
```
(Só essa linha, que pertence ao bloco `.form-input, .form-textarea, .form-multiselect, .form-select`.)

- [ ] **Step 2: Header**

Em `components/ui/header.tsx`, nos dois links (as classes estão quebradas em várias linhas):
1. Troque
```
                    className="btn-sm border border-sky-400 text-sky-400
```
por
```
                    className="btn-sm min-h-11 sm:min-h-0 border border-sky-400 text-sky-400
```
2. Troque
```
                    className="btn-sm bg-linear-to-t from-sky-500 to-sky-400
```
por
```
                    className="btn-sm min-h-11 sm:min-h-0 bg-linear-to-t from-sky-500 to-sky-400
```

- [ ] **Step 3: Logo**

Em `components/ui/logo.tsx`, troque
```tsx
    <Link href="/" className="inline-flex shrink-0" aria-label="Cruip">
      <Image src={logo} alt="Cruip Logo" width={32} height={32} />
```
por
```tsx
    <Link href="/" className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center sm:min-h-0 sm:min-w-0" aria-label="Code Plus">
      <Image src={logo} alt="Code Plus" width={32} height={32} />
```

- [ ] **Step 4: Rodapé**

Em `components/ui/footer.tsx` (3 ocorrências; substituição de todas), troque
```
className="flex items-center justify-center text-indigo-500 transition hover:text-indigo-400"
```
por
```
className="flex min-h-11 min-w-11 items-center justify-center text-indigo-500 transition hover:text-indigo-400 sm:min-h-0 sm:min-w-0"
```

- [ ] **Step 5: Tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 6: Commit**

```bash
git add app/css/style.css app/css/additional-styles/utility-patterns.css components/ui/header.tsx components/ui/logo.tsx components/ui/footer.tsx
git commit -m "fix(mobile): campos com 16px no celular e header, logo e rodapé com áreas de toque de 44px"
```

---

### Task 2: Páginas de autenticação

**Files:**
- Modify: `app/(auth)/signin/page.tsx`
- Modify: `app/(auth)/signup/page.tsx`
- Modify: `app/(auth)/reset-password/page.tsx`
- Modify: `app/(auth)/update-password/page.tsx`
- Modify: `app/(auth)/inscreva-se/page.tsx`
- Modify: `app/(auth)/convite/[token]/page.tsx`

**Interfaces:** nenhuma nova.

- [ ] **Step 1: Botões de mostrar senha (5 no total)**

Em `signup/page.tsx` (1 ocorrência), `update-password/page.tsx` (2) e `convite/[token]/page.tsx` (2), substituição de todas, troque
```
className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-400 transition-colors"
```
por
```
className="absolute right-0 top-1/2 -translate-y-1/2 inline-flex min-h-11 min-w-11 items-center justify-center text-gray-400 hover:text-sky-400 transition-colors sm:right-3 sm:min-h-0 sm:min-w-0"
```

- [ ] **Step 2: Folga no campo de senha**

1. `signup/page.tsx` (1): troque `className="form-input w-full pr-10"` por `className="form-input w-full pr-12! sm:pr-10!"`.
2. `update-password/page.tsx` (2; substituição de todas): troque `focus:ring-sky-400/40 pr-10"` por `focus:ring-sky-400/40 pr-12! sm:pr-10!"`.
3. `convite/[token]/page.tsx` (2; substituição de todas): troque `px-4 py-2.5 pr-10 text-white` por `px-4 py-2.5 pr-12 sm:pr-10 text-white`.

- [ ] **Step 3: Login**

Em `signin/page.tsx`:
1. "Esqueceu?": troque `className="text-sm text-sky-400 hover:underline"` por `className="inline-flex min-h-11 items-center text-sm text-sky-400 hover:underline sm:min-h-0"`.
2. "Criar conta": troque `<Link className="font-medium text-sky-400 hover:underline" href="/signup">` por `<Link className="inline-flex min-h-11 items-center font-medium text-sky-400 hover:underline sm:min-h-0" href="/signup">`.

- [ ] **Step 4: Cadastro**

Em `signup/page.tsx`, "Entrar": troque `<Link className="font-medium text-sky-400 hover:underline" href="/signin">` por `<Link className="inline-flex min-h-11 items-center font-medium text-sky-400 hover:underline sm:min-h-0" href="/signin">`.

- [ ] **Step 5: Recuperação de senha e convite ("Fazer login")**

1. `reset-password/page.tsx`, "Voltar para login": troque `className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"` por `className="inline-flex min-h-11 items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors sm:min-h-0"`.
2. `reset-password/page.tsx` (1) e `convite/[token]/page.tsx` (1), "Fazer login": troque `className="text-sky-400 hover:text-sky-300 transition-colors"` por `className="inline-flex min-h-11 items-center text-sky-400 hover:text-sky-300 transition-colors sm:min-h-0"`.
3. `convite/[token]/page.tsx`, "Ir para Login": troque `className="inline-block rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors"` por `className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors sm:min-h-0"`.

- [ ] **Step 6: Inscrição**

Em `inscreva-se/page.tsx`, "Já é aluno? Fazer login": troque `className="text-sm text-gray-400 hover:text-sky-400 transition-colors"` por `className="inline-flex min-h-11 items-center gap-1 text-sm text-gray-400 hover:text-sky-400 transition-colors sm:min-h-0"`. (Antes, confirme que essa string só aparece nesse link; se aparecer mais de uma vez, mude só o `Link` com `href="/signin"`.) O `gap-1` repõe o espaço entre "Já é aluno?" e "Fazer login": em `inline-flex`, o texto e o `<span>` viram itens separados e o espaço no fim do texto é descartado.

- [ ] **Step 7: Tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 8: Commit**

```bash
git add "app/(auth)"
git commit -m "fix(mobile): áreas de toque de 44px nos links e no botão de mostrar senha das páginas de login"
```

---

### Task 3: Verificação no navegador e PR

Esta task é executada pelo controlador (precisa do navegador embutido); não delegue a um subagente.

- [ ] **Step 1: Build**

Pare o servidor de desenvolvimento se estiver rodando (e confirme que nenhum `next` desta pasta ficou escutando nas portas 3000–3002), rode `pnpm exec tsc --noEmit` e `pnpm build`, e suba `pnpm dev` em segundo plano. Expected: 0 erros e build concluído.

- [ ] **Step 2: Medição em 375px e 360px**

Para cada rota `/`, `/signin`, `/signup`, `/reset-password`, `/update-password`, `/inscreva-se`, `/convite/token-invalido-teste`, carregue a página num `iframe` da largura alvo e meça:
- `document.documentElement.scrollWidth` igual à largura e nenhum elemento com `getBoundingClientRect().right > innerWidth` (fora de `[aria-hidden="true"]` e contêineres com rolagem própria);
- `offsetHeight >= 44` em todo `a`, `button`, `input`, `select`, `textarea` visível;
- `getComputedStyle(input).fontSize === '16px'` nos campos de signin, signup e reset-password.
Expected: tudo atendido. Em `/update-password` e no convite inválido não há campos (estado de erro) — as mudanças desses formulários ficam conferidas pelo código.

- [ ] **Step 3: Tablet e desktop**

Em 768px e 1280px, nas mesmas rotas: campos com `font-size: 14px`, `min-height` computado `0px` nos itens alterados e nada fora da tela. No `/signup`, o botão de mostrar senha volta a 16×16 a 12px da borda direita do campo.

- [ ] **Step 4: Revisão do diff e PR**

Run: `git diff main --stat`
Expected: só os arquivos do mapa de arquivos e os dois documentos de `docs/superpowers/`.

```bash
git push -u origin feat/mobile-publicas
gh pr create --repo axyonsoftwareofc/student-portal-core-web --base main --head feat/mobile-publicas --title "fix(mobile): páginas públicas no celular" --body "<corpo em português: o que muda, como testar, não verificado (formulários de nova senha e de convite válido, conferidos pelo código), sem assinatura de ferramenta>"
```

- [ ] **Step 5: Merge só com autorização**

Pergunte ao usuário se pode mesclar. Com o "sim": `gh pr merge --merge --delete-branch`, depois `git checkout main && git pull`. Se o GitHub bloquear, não contorne: informe o usuário. Encerre o `pnpm dev` e confirme que nenhum processo `next` desta pasta ficou escutando.

---

## Auto-revisão do plano contra o spec

- **§1 Fonte dos campos (`text-[1rem] sm:text-sm` nas duas definições; o tema define `text-base` como 15px):** Task 1, Step 1.
- **§2 Links dos formulários:** login (Task 2, Step 3), cadastro (Step 4), recuperação e convite (Step 5), inscrição (Step 6).
- **§3 Mostrar senha (`right-0 … sm:right-3`, 44×44, `pr-12 sm:pr-10`):** Task 2, Steps 1–2. Pendência resolvida: os campos com `pr-10` são 1 em signup, 2 em update-password e 2 no convite. Nos campos com `.form-input` o `pr-*` precisa do sufixo `!` (a regra `.form-input` fica fora das camadas e vence os utilitários).
- **§4 Header, logo (com `aria-label`/`alt` "Code Plus") e "Ir para Login":** Task 1, Steps 2–3; Task 2, Step 5.
- **§5 Rodapé:** Task 1, Step 4.
- **Verificação do spec:** Task 3.
- **Consistência:** todas as mudanças de toque usam `min-h-11 … sm:min-h-0` (e `min-w-11 … sm:min-w-0` em itens só de ícone).
