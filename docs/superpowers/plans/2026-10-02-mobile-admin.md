# Responsividade mobile — Área do admin (sub-projeto 3) — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir no celular (375px e 360px) o estouro dos cartões de Aulas ao Vivo, a faixa de bolinhas do modal "Visualizar" aula e as áreas de toque abaixo de 44px na área do admin, incluindo o botão de fechar dos modais.

**Architecture:** Só ajustes de classes Tailwind (e um contador de texto no modal de pré-visualização) em componentes existentes, sem componente novo e sem dependência. O padrão de toque é `min-h-11 sm:min-h-0` (44px no celular, tamanho original a partir de `sm`), e `min-w-11 sm:min-w-0` em botões só de ícone, o mesmo dos PRs #54 e #55.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, pnpm.

## Global Constraints

- Largura mínima alvo: 375px, e também 360px, sem elemento fora da tela (fora de contêineres com rolagem própria).
- Áreas de toque de pelo menos 44px de altura no celular com o padrão `min-h-11 sm:min-h-0` (e `min-w-11 sm:min-w-0` em botões só de ícone). A partir de `sm` o aspecto visual não muda.
- Navegação do modal "Visualizar" aula: contador "N / total" no celular; bolinhas só em `md+` (mesma solução do PR #54).
- A tabela de Relatórios fica como está (rola dentro do contêiner). A rota `/admin/aulas/[id]/preview` não é tocada.
- Sem mudança de estilo visual além do necessário.
- O projeto não tem framework de testes nem config de ESLint. Verificação: `pnpm exec tsc --noEmit` (baseline: 0 erros), `pnpm build` e medição no navegador. Não adicionar dependências.
- Código novo segue o estilo do arquivo: indentação de 4 espaços, aspas simples em `components/admin/` e `app/(dashboard)/admin/`, aspas duplas em `components/ui/` e `components/common/page-header.tsx`, comentários curtos em português.
- Commits sem linhas de coautoria e sem menção a ferramentas de IA, no usuário `wernersaboia-code`.
- Em todos os "troque X por Y" abaixo, X é o texto exato atual do arquivo. Se não for encontrado, pare e reporte (não adivinhe).

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `components/admin/live-classes/LiveClassCard.tsx` | Modificar | Título não estoura; menu `⋮` e links com 44px |
| `components/admin/lessons/LessonPreviewModal.tsx` | Modificar | Contador no celular; fechar e Anterior/Próximo com 44px |
| `components/ui/dialog.tsx` | Modificar | Botão de fechar com 44×44 no celular |
| `components/ui/Modal.tsx` | Modificar | Botão "✕" com 44×44 no celular |
| `components/ui/button.tsx` | Modificar | Tamanho `default` com 44px no celular |
| `components/common/page-header.tsx` | Modificar | Botões de ação com 44px no celular |
| `app/(dashboard)/admin/alunos/page.tsx` | Modificar | "Novo Aluno", abas de status, ações dos cartões |
| `app/(dashboard)/admin/modulos/page.tsx` | Modificar | "Novo Módulo", título, Editar/Excluir |
| `app/(dashboard)/admin/aulas/page.tsx` | Modificar | "Nova Aula", Visualizar/Editar/Excluir |
| `app/(dashboard)/admin/modulos/[id]/page.tsx` | Modificar | Voltar, Editar/Excluir do módulo, Nova Aula, ícones das aulas |
| `app/(dashboard)/admin/trilhas/page.tsx` | Modificar | "Ver Fases", "Ver Módulos" |
| `app/(dashboard)/admin/fases/page.tsx` | Modificar | Link "Módulos" |
| `app/(dashboard)/admin/dashboard/page.tsx` | Modificar | "Ver todas →", "Ver todos →" |
| `app/(dashboard)/admin/correcoes/page.tsx` | Modificar | Abas de filtro |
| `app/(dashboard)/admin/configuracoes/page.tsx` | Modificar | Remover, Promover, Restaurar padrão, Salvar |
| `components/admin/StudentForm.tsx`, `ModuleForm.tsx`, `LessonForm.tsx` | Modificar | Cancelar e enviar com 44px |
| `components/admin/leads/LeadsFilters.tsx`, `LeadCard.tsx`, `LeadDetailsModal.tsx` | Modificar | Abas, "Ver detalhes", fechar, email e telefone |
| `components/admin/reports/ReportsHeader.tsx` | Modificar | Semana/Mês/Ano, Exportar, atualizar |
| `components/admin/announcements/AnnouncementCard.tsx` | Modificar | Menu `⋮` |
| `components/admin/payments/payment-card.tsx`, `batch-payment-dialog.tsx`, `payment-form.tsx` | Modificar | Ícones, "Marcar Pago", fechar, "Desmarcar todos", status |
| `components/admin/EnrollmentManager.tsx` | Modificar | Fechar |
| `components/admin/lessons/LessonEditorModal.tsx` | Modificar | Fechar, "Adicionar", "Fechar" do rodapé |
| `components/admin/submissions/SubmissionReviewModal.tsx` | Modificar | Fechar |

---

### Task 0: Branch e linha de base

**Files:** nenhum arquivo do projeto muda.

- [ ] **Step 1: Confirmar a branch e a identidade**

Run: `git branch --show-current && git config user.name && git status --short`
Expected: `feat/mobile-admin`, `wernersaboia-code`, e só o plano como não rastreado. O spec já está commitado nessa branch.

- [ ] **Step 2: Linha de base de tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 3: Commit do plano**

```bash
git add docs/superpowers/plans/2026-10-02-mobile-admin.md
git commit -m "docs: plano da área do admin no celular (sub-projeto 3)"
```

---

### Task 1: Cartões de Aulas ao Vivo e modal "Visualizar" aula

**Files:**
- Modify: `components/admin/live-classes/LiveClassCard.tsx`
- Modify: `components/admin/lessons/LessonPreviewModal.tsx`

**Interfaces:** nenhuma nova. No modal, `activeIndex` e `contents` já existem no escopo do rodapé.

- [ ] **Step 1: Título do cartão de aula ao vivo**

Em `LiveClassCard.tsx`:

1. Troque
```tsx
                <div className="flex items-start gap-3 flex-1">
```
por
```tsx
                <div className="flex items-start gap-3 flex-1 min-w-0">
```

2. Troque
```tsx
                            <h3 className="font-semibold text-white">
```
por
```tsx
                            <h3 className="font-semibold text-white [overflow-wrap:anywhere]">
```

3. Menu `⋮`: troque
```tsx
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
```
por
```tsx
                        className="inline-flex min-h-11 min-w-11 items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors sm:min-h-0 sm:min-w-0"
```

4. Links "Entrar"/"Ver Gravação" (2 ocorrências, use substituição de todas): troque
```
inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
```
por
```
inline-flex min-h-11 items-center gap-1.5 px-3 py-1.5 rounded-lg sm:min-h-0
```

- [ ] **Step 2: Botão de fechar do modal de pré-visualização**

Em `LessonPreviewModal.tsx`, troque
```tsx
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
```
por
```tsx
                        className="inline-flex min-h-11 min-w-11 items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors sm:min-h-0 sm:min-w-0"
```
(Se houver mais de uma ocorrência no arquivo, mude só a do botão com `<X className="h-5 w-5" ...>` do cabeçalho.)

- [ ] **Step 3: Rodapé de navegação**

Ainda em `LessonPreviewModal.tsx`, substitua o bloco inteiro do rodapé:
```tsx
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800/50">
                        <button
                            onClick={goToPrev}
                            disabled={activeIndex === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                            Anterior
                        </button>

                        <div className="flex items-center gap-1">
```
por
```tsx
                    <div className="flex items-center justify-between gap-2 px-4 py-4 border-t border-gray-800/50 sm:px-6">
                        <button
                            onClick={goToPrev}
                            disabled={activeIndex === 0}
                            className="inline-flex min-h-11 shrink-0 items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors md:min-h-0"
                        >
                            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                            Anterior
                        </button>

                        {/* Celular: contador de posição */}
                        <span className="text-sm text-gray-500 md:hidden">
                            {activeIndex + 1} / {contents.length}
                        </span>

                        {/* Tablet e desktop: bolinhas de navegação */}
                        <div className="hidden min-w-0 items-center gap-1 overflow-x-auto py-1 [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden">
```
e, no botão "Próximo" logo abaixo, troque
```tsx
                            disabled={activeIndex === contents.length - 1}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
```
por
```tsx
                            disabled={activeIndex === contents.length - 1}
                            className="inline-flex min-h-11 shrink-0 items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors md:min-h-0"
```
As bolinhas em si (`h-2 rounded-full ...`) não mudam; acrescente só `shrink-0` ao `className` delas para não encolherem dentro do contêiner com rolagem:
```tsx
                                    className={`h-2 shrink-0 rounded-full transition-all ${
```

- [ ] **Step 4: Tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 5: Commit**

```bash
git add components/admin/live-classes/LiveClassCard.tsx components/admin/lessons/LessonPreviewModal.tsx
git commit -m "fix(mobile): cartões de aula ao vivo cabem em 360px e pré-visualização de aula com contador"
```

---

### Task 2: Componentes compartilhados (fechar dos modais, Button, PageHeader)

**Files:**
- Modify: `components/ui/dialog.tsx`
- Modify: `components/ui/Modal.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `components/common/page-header.tsx`

**Interfaces:** nenhuma nova. Atenção: só o tamanho `default` do `Button` muda. **Não** mude o tamanho `icon` (o botão de menu do header passa `h-11 w-11` no `className`, e um `sm:h-10` no `icon` o encolheria no tablet).

- [ ] **Step 1: Fechar do `Dialog`**

Em `components/ui/dialog.tsx`, troque
```tsx
                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70
```
por
```tsx
                    <DialogPrimitive.Close className="absolute right-1 top-1 inline-flex min-h-11 min-w-11 items-center justify-center sm:right-4 sm:top-4 sm:min-h-0 sm:min-w-0 rounded-sm opacity-70
```
(o resto da string de classes continua igual). O ícone de 16px fica centralizado em 44×44 a 4px da borda, ou seja, quase na mesma posição visual de antes.

- [ ] **Step 2: Fechar do `Modal`**

Em `components/ui/Modal.tsx`, troque
```tsx
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
```
por
```tsx
                                    <button
                                        onClick={onClose}
                                        aria-label="Fechar"
                                        className="-mr-3 inline-flex min-h-11 min-w-11 items-center justify-center text-gray-400 hover:text-white transition-colors sm:mr-0 sm:min-h-0 sm:min-w-0"
                                    >
```

- [ ] **Step 3: Tamanho `default` do `Button`**

Em `components/ui/button.tsx`, troque
```tsx
                default: "h-10 px-4 py-2",
```
por
```tsx
                default: "h-11 px-4 py-2 sm:h-10",
```

- [ ] **Step 4: Ações do `PageHeader`**

Em `components/common/page-header.tsx`, troque
```tsx
                                    "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors sm:w-auto",
```
por
```tsx
                                    "flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors sm:min-h-0 sm:w-auto",
```

- [ ] **Step 5: Tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 6: Commit**

```bash
git add components/ui/dialog.tsx components/ui/Modal.tsx components/ui/button.tsx components/common/page-header.tsx
git commit -m "fix(mobile): botão de fechar dos modais e botões padrão com 44px no celular"
```

---

### Task 3: Áreas de toque nas páginas de conteúdo e alunos

**Files:**
- Modify: `app/(dashboard)/admin/alunos/page.tsx`
- Modify: `app/(dashboard)/admin/modulos/page.tsx`
- Modify: `app/(dashboard)/admin/aulas/page.tsx`
- Modify: `app/(dashboard)/admin/modulos/[id]/page.tsx`
- Modify: `app/(dashboard)/admin/trilhas/page.tsx`
- Modify: `app/(dashboard)/admin/fases/page.tsx`
- Modify: `app/(dashboard)/admin/dashboard/page.tsx`
- Modify: `components/admin/StudentForm.tsx`, `components/admin/ModuleForm.tsx`, `components/admin/LessonForm.tsx`

**Interfaces:** nenhuma nova.

- [ ] **Step 1: Botões "Novo …" de Alunos, Módulos e Aulas**

Nos três arquivos `alunos/page.tsx`, `modulos/page.tsx` e `aulas/page.tsx` (1 ocorrência em cada), troque
```
w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5
```
por
```
w-full sm:w-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 sm:min-h-0
```

- [ ] **Step 2: Alunos — abas e ações dos cartões**

Em `alunos/page.tsx`:
1. Abas de status: troque
```
`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
```
por
```
`inline-flex min-h-11 items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors sm:min-h-0 ${
```
2. Ações dos cartões (7 ocorrências, todas dentro do bloco `block lg:hidden`; use substituição de todas): troque
```
inline-flex items-center gap-1 text-xs
```
por
```
inline-flex min-h-11 items-center gap-1 text-xs sm:min-h-0
```

- [ ] **Step 3: Módulos e Aulas — ações dos cartões**

Em `modulos/page.tsx` e `aulas/page.tsx` (3 ocorrências em cada; use substituição de todas), troque
```
inline-flex items-center gap-1 text-sm
```
por
```
inline-flex min-h-11 items-center gap-1 text-sm sm:min-h-0
```
Em `modulos/page.tsx`, o link do título do módulo: troque
```tsx
                                            className="text-base sm:text-lg font-semibold text-white hover:text-sky-400 transition-colors"
```
por
```tsx
                                            className="inline-flex min-h-11 items-center text-base sm:min-h-0 sm:text-lg font-semibold text-white hover:text-sky-400 transition-colors"
```

- [ ] **Step 4: Detalhe do módulo**

Em `app/(dashboard)/admin/modulos/[id]/page.tsx`:
1. Links "Voltar para Módulos" (2 ocorrências: erro e página normal). Troque
```
className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
```
por
```
className="inline-flex min-h-11 items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors sm:min-h-0"
```
e
```
className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
```
por
```
className="inline-flex min-h-11 items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors sm:min-h-0"
```
2. Editar/Excluir do módulo: nas duas strings que começam com `inline-flex items-center gap-2 px-3 py-2 rounded-lg border`, troque o início
```
inline-flex items-center gap-2 px-3 py-2 rounded-lg border
```
por
```
inline-flex min-h-11 items-center gap-2 px-3 py-2 rounded-lg border sm:min-h-0
```
(2 ocorrências; substituição de todas).
3. "Nova Aula": troque
```
className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
```
por
```
className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors sm:min-h-0"
```
4. Ícones Editar/Excluir das aulas: troque
```
className="p-2 text-gray-500 hover:text-sky-400 transition-colors"
```
por
```
className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-500 hover:text-sky-400 transition-colors sm:min-h-0 sm:min-w-0"
```
e
```
className="p-2 text-gray-500 hover:text-rose-400 transition-colors"
```
por
```
className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-500 hover:text-rose-400 transition-colors sm:min-h-0 sm:min-w-0"
```

- [ ] **Step 5: Trilhas, Fases e Dashboard**

1. `trilhas/page.tsx` (2 ocorrências; substituição de todas): troque `inline-flex items-center gap-1 text-sm` por `inline-flex min-h-11 items-center gap-1 text-sm sm:min-h-0`.
2. `fases/page.tsx`: troque
```
className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sm text-sky-400 hover:bg-sky-500/20 transition-colors"
```
por
```
className="inline-flex min-h-11 items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sm text-sky-400 hover:bg-sky-500/20 transition-colors sm:min-h-0"
```
3. `dashboard/page.tsx` (2 ocorrências, "Ver todas →" e "Ver todos →"; substituição de todas): troque
```
className="text-sm text-gray-400 transition-colors hover:text-sky-400"
```
por
```
className="inline-flex min-h-11 items-center text-sm text-gray-400 transition-colors hover:text-sky-400 sm:min-h-0"
```
Antes, confirme com busca que essa string só aparece nesses dois links; se aparecer em outro lugar, troque só os dois.

- [ ] **Step 6: Formulários de aluno, módulo e aula**

Em `components/admin/StudentForm.tsx`, `ModuleForm.tsx` e `LessonForm.tsx` (2 ocorrências em cada: Cancelar e enviar; substituição de todas), troque
```
px-4 py-2.5 text-sm font-medium
```
por
```
min-h-11 px-4 py-2.5 text-sm font-medium sm:min-h-0
```

- [ ] **Step 7: Tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 8: Commit**

```bash
git add "app/(dashboard)/admin/alunos/page.tsx" "app/(dashboard)/admin/modulos/page.tsx" "app/(dashboard)/admin/aulas/page.tsx" "app/(dashboard)/admin/modulos/[id]/page.tsx" "app/(dashboard)/admin/trilhas/page.tsx" "app/(dashboard)/admin/fases/page.tsx" "app/(dashboard)/admin/dashboard/page.tsx" components/admin/StudentForm.tsx components/admin/ModuleForm.tsx components/admin/LessonForm.tsx
git commit -m "fix(mobile): áreas de toque de 44px em alunos, trilhas, fases, módulos e aulas do admin"
```

---

### Task 4: Áreas de toque em leads, correções, relatórios, avisos, pagamentos, configurações e modais

**Files:**
- Modify: `components/admin/leads/LeadsFilters.tsx`, `components/admin/leads/LeadCard.tsx`, `components/admin/leads/LeadDetailsModal.tsx`
- Modify: `app/(dashboard)/admin/correcoes/page.tsx`
- Modify: `components/admin/reports/ReportsHeader.tsx`
- Modify: `components/admin/announcements/AnnouncementCard.tsx`
- Modify: `components/admin/payments/payment-card.tsx`, `components/admin/payments/batch-payment-dialog.tsx`, `components/admin/payments/payment-form.tsx`
- Modify: `app/(dashboard)/admin/configuracoes/page.tsx`
- Modify: `components/admin/EnrollmentManager.tsx`, `components/admin/lessons/LessonEditorModal.tsx`, `components/admin/submissions/SubmissionReviewModal.tsx`

**Interfaces:** nenhuma nova.

- [ ] **Step 1: Leads**

1. `LeadsFilters.tsx`: troque `'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',` por `'min-h-11 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 sm:min-h-0',`.
2. `LeadCard.tsx`: troque
```
className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all duration-200"
```
por
```
className="flex-shrink-0 inline-flex min-h-11 min-w-11 items-center justify-center p-2 rounded-lg text-gray-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all duration-200 sm:min-h-0 sm:min-w-0"
```
3. `LeadDetailsModal.tsx`:
   - Fechar: troque `className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"` por `className="inline-flex min-h-11 min-w-11 items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors sm:min-h-0 sm:min-w-0"`.
   - Email: troque `className="text-sky-400 hover:underline">{lead.email}</a>` por `className="inline-flex min-h-11 min-w-0 items-center text-sky-400 hover:underline [overflow-wrap:anywhere] sm:min-h-0">{lead.email}</a>`.
   - Telefone: troque `className="text-emerald-400 hover:underline"` por `className="inline-flex min-h-11 items-center text-emerald-400 hover:underline sm:min-h-0"`.

- [ ] **Step 2: Correções**

Em `correcoes/page.tsx`, troque
```
`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
```
por
```
`inline-flex min-h-11 items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors sm:min-h-0 ${
```

- [ ] **Step 3: Relatórios**

Em `ReportsHeader.tsx`:
1. Semana/Mês/Ano: troque `` className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${ `` por `` className={`min-h-11 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:min-h-0 ${ ``.
2. Exportar: troque
```
className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
```
por
```
className="flex min-h-11 items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white sm:min-h-0"
```
3. Atualizar (ícone): troque
```
className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-2 text-gray-400
```
por
```
className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-2 sm:min-h-0 sm:min-w-0 text-gray-400
```

- [ ] **Step 4: Avisos**

Em `AnnouncementCard.tsx`, troque
```
className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
```
por
```
className="inline-flex min-h-11 min-w-11 items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors sm:min-h-0 sm:min-w-0"
```

- [ ] **Step 5: Pagamentos**

1. `payment-card.tsx`:
   - "Marcar Pago": troque `className="flex-1 rounded-lg bg-emerald-600/20 px-3 py-2` por `className="flex-1 min-h-11 rounded-lg bg-emerald-600/20 px-3 py-2 sm:min-h-0`.
   - Ícones (3 ocorrências; substituição de todas): troque `rounded-lg bg-gray-800 p-2 ` por `inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-gray-800 p-2 sm:min-h-0 sm:min-w-0 ` (note o espaço final em ambos).
2. `batch-payment-dialog.tsx`:
   - Fechar: troque `className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"` por `className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white sm:min-h-0 sm:min-w-0"`.
   - "Desmarcar/Selecionar todos": troque `className="text-xs font-medium text-sky-400 hover:text-sky-300"` por `className="min-h-11 text-xs font-medium text-sky-400 hover:text-sky-300 sm:min-h-0"`.
3. `payment-form.tsx`:
   - Fechar: troque `className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"` por `className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors sm:min-h-0 sm:min-w-0"`.
   - Botões de status (dentro de `grid grid-cols-4 gap-2`): troque `` className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${ `` por `` className={`min-h-11 px-3 py-2 text-sm font-medium rounded-lg border transition-colors sm:min-h-0 ${ ``.

- [ ] **Step 6: Configurações**

Em `configuracoes/page.tsx`:
1. Remover: troque `className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-rose-400` por `className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm text-rose-400 sm:min-h-0 sm:min-w-0`.
2. Promover: troque `className="flex-shrink-0 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-emerald-400` por `className="flex-shrink-0 flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs text-emerald-400 sm:min-h-0 sm:min-w-0`.
3. Restaurar padrão: troque `className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"` por `className="flex min-h-11 items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors sm:min-h-0"`.
4. Salvar: troque `className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium` por `className="flex min-h-11 items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium sm:min-h-0`.

- [ ] **Step 7: Fechar dos modais próprios e editor de aula**

1. `EnrollmentManager.tsx`: troque `className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"` por `className="inline-flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors sm:min-h-0 sm:min-w-0"`.
2. `SubmissionReviewModal.tsx` e `LessonEditorModal.tsx` (botão com `<X className="h-5 w-5" ...>` do cabeçalho): troque `className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"` por `className="inline-flex min-h-11 min-w-11 items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors sm:min-h-0 sm:min-w-0"`.
3. `LessonEditorModal.tsx`:
   - "Adicionar": troque `className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition-colors"` por `className="inline-flex min-h-11 items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition-colors sm:min-h-0"`.
   - "Fechar" do rodapé: troque `className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"` por `className="min-h-11 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors sm:min-h-0"`.
   - Os quatro ícones de cada conteúdo (subir, descer, editar, excluir) **não** mudam: com 44px eles não cabem na linha do conteúdo em 360px (fora do spec).

- [ ] **Step 8: Tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 9: Commit**

```bash
git add components/admin/leads "app/(dashboard)/admin/correcoes/page.tsx" components/admin/reports/ReportsHeader.tsx components/admin/announcements/AnnouncementCard.tsx components/admin/payments "app/(dashboard)/admin/configuracoes/page.tsx" components/admin/EnrollmentManager.tsx components/admin/lessons/LessonEditorModal.tsx components/admin/submissions/SubmissionReviewModal.tsx
git commit -m "fix(mobile): áreas de toque de 44px em leads, correções, relatórios, pagamentos, configurações e modais do admin"
```

---

### Task 5: Verificação no navegador e PR

Esta task é executada pelo controlador (precisa da sessão de admin no navegador embutido); não delegue a um subagente.

- [ ] **Step 1: Build**

Pare o servidor de desenvolvimento se estiver rodando (`pnpm build` sobrescreve `.next`), rode `pnpm exec tsc --noEmit` e `pnpm build`, e suba `pnpm dev` em segundo plano. Expected: 0 erros e `Compiled successfully`.

- [ ] **Step 2: Medição em 375px e 360px**

Com o navegador embutido logado como admin e o viewport emulado (375×812, depois 360×800), abra cada rota abaixo e execute o script. Rotas: `/admin/dashboard`, `/admin/alunos`, `/admin/leads`, `/admin/trilhas`, `/admin/fases`, `/admin/modulos`, `/admin/modulos/864647f5-569c-4311-a34c-8914ff365454`, `/admin/aulas`, `/admin/aulas-ao-vivo`, `/admin/correcoes`, `/admin/avisos`, `/admin/destaques`, `/admin/pagamentos`, `/admin/relatorios`, `/admin/configuracoes`.

```js
await new Promise(r => setTimeout(r, 2500));
const m = document.querySelector('main');
const sc = (e) => { for (let p = e.parentElement; p && p !== m; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth) return true; } return false; };
const clipped = [...m.querySelectorAll('*')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > innerWidth + 1 && !e.closest('.pointer-events-none') && !sc(e); });
const small = [...m.querySelectorAll('a, button, select, input:not([type=hidden]):not([type=checkbox]):not([type=file])')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.height < 44 && !e.closest('footer'); }).map(e => e.tagName + ':' + (e.innerText || e.getAttribute('aria-label') || e.title || e.placeholder || '').trim().replace(/\s+/g, ' ').slice(0, 24) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
({ iw: innerWidth, doc: document.documentElement.scrollWidth, clipped: clipped.length, clippedTop: clipped.slice(0, 3).map(e => e.tagName + ' ' + Math.round(e.getBoundingClientRect().right)), small: [...new Set(small)] })
```
Expected em todas: `doc` igual a `iw`, `clipped: 0`. Em `small` só podem sobrar itens fora do escopo: campos de busca e `select` de 40–44px, o input "Buscar aluno..." de Relatórios e os botões de status do detalhe do lead (42px). Qualquer outro item é falha da implementação.

- [ ] **Step 3: Modais**

Em 375px, abra e meça o botão de fechar (≥ 44×44 esperado) e os botões do rodapé (≥ 44 de altura):
- `/admin/alunos`: "Novo Aluno" (`Modal`), "Cursos" (`EnrollmentManager`).
- `/admin/avisos`: "Novo Aviso" (`Dialog`).
- `/admin/pagamentos`: "Novo Pagamento" e "Gerar em Lote".
- `/admin/leads`: "Ver detalhes".
- `/admin/aulas`: "Editar" (editor) e "Visualizar". No modal "Visualizar", confirme que aparece o contador "1 / N", que nenhum elemento passa de `innerWidth`, e que Anterior/Próximo têm ≥ 44 de altura. Clique em "Próximo" e confira "2 / N".

- [ ] **Step 4: Tablet e desktop**

Em 768×900 e 1280×800, abra `/admin/aulas`, clique em "Visualizar" e confirme que as bolinhas aparecem e o contador não. Confira em `/admin/alunos` e `/admin/modulos` que botões e links voltaram à altura original (sem `min-height` de 44px a partir de `sm`), e que nada passa da tela. Restaure o viewport com `resize_window` preset `desktop`.

- [ ] **Step 5: Revisão do diff e PR**

Run: `git diff main --stat`
Expected: só os arquivos do mapa de arquivos e os dois documentos de `docs/superpowers/`. Nenhum `.env*`, `.next` ou `tsconfig.tsbuildinfo`.

Depois:
```bash
git push -u origin feat/mobile-admin
gh pr create --repo axyonsoftwareofc/student-portal-core-web --base main --head feat/mobile-admin --title "fix(mobile): área do admin no celular" --body "$(cat <<'EOF'
## O que muda

Quarto PR da missão mobile, sub-projeto 3: área do admin (medida em 375px e 360px).

- **Aulas ao Vivo:** os cartões passavam da tela em 360px; agora o título quebra linha.
- **Pré-visualização de aula:** a faixa de bolinhas estourava a tela; no celular aparece o contador "N / total" (bolinhas só a partir de `md`).
- **Botão de fechar dos modais:** 44×44 no celular (`Dialog`, `Modal` e modais próprios). Também vale para os modais do aluno que usam esses componentes.
- **Áreas de toque de 44px no celular** (a partir de `sm` nada muda): ações dos cartões de alunos, módulos, aulas e pagamentos; abas de filtro de alunos, leads, correções e relatórios; menus `⋮`; links de trilhas, fases e dashboard; botões de formulários e o tamanho padrão do `Button`.

Spec e plano em `docs/superpowers/`.

## Como testar

1. Logado como admin, em 360px, abrir `/admin/aulas-ao-vivo`: os cartões cabem na tela.
2. Em `/admin/aulas`, "Visualizar" uma aula: aparece "1 / N" e nada rola para o lado.
3. Conferir os botões das listas e o fechar dos modais: pelo menos 44px no celular.
4. Em 768px e 1280px o visual continua como antes.

Verificação feita: `tsc --noEmit` sem erros, `next build` ok e medição no navegador em todas as rotas do admin, em 375px e 360px, com conferência em 768px e 1280px. Não há suíte de testes no projeto.

## Fora do escopo

Tabela de Relatórios (continua rolando dentro do contêiner), ícones de cada conteúdo no editor de aula e a rota órfã `/admin/aulas/[id]/preview`.
EOF
)"
```
Expected: URL do PR impressa, sem assinatura de ferramenta no corpo.

- [ ] **Step 6: Merge só com autorização**

Pergunte ao usuário se pode mesclar. Com o "sim": `gh pr merge --merge --delete-branch`, depois `git checkout main && git pull`. Se o GitHub bloquear por proteção de branch, revisão exigida ou checks pendentes, **não contorne**: informe o usuário. Encerre o `pnpm dev` subido para as medições.

---

## Auto-revisão do plano contra o spec

- **§1 Cartões de Aulas ao Vivo (`min-w-0`, título quebra linha):** Task 1, Step 1.
- **§2 Modal "Visualizar" (contador, bolinhas em `md+`, Anterior/Próximo com 44px, `px-4 sm:px-6`):** Task 1, Steps 2–3.
- **§3 Fechar dos modais:** `Dialog` e `Modal` na Task 2; modais próprios (`LessonPreviewModal`, `LeadDetailsModal`, `batch-payment-dialog`, `payment-form`, `EnrollmentManager`, `SubmissionReviewModal`, `LessonEditorModal`) nas Tasks 1 e 4. Pendência resolvida: o "Fechar" de 16×16 é o do `Dialog` compartilhado (Aulas ao Vivo, Avisos e Destaques usam `Dialog`), e o "✕" de 14×26 é o do `Modal`.
- **§4 Áreas de toque:** Alunos, Módulos, Aulas, detalhe do módulo, Trilhas, Fases, Dashboard e formulários na Task 3; Leads, Correções, Relatórios, Avisos, Pagamentos, Configurações e editor de aula na Task 4. Pendência resolvida: os botões de 40px de Aulas ao Vivo, Avisos e Destaques (e Cancelar/Salvar desses formulários) vêm do `Button` padrão (`h-10`), tratado na Task 2; os de 42px são classes próprias (`py-2.5`), tratadas em cada uso (Tasks 2 e 3).
- **Desvios conscientes:** o tamanho `icon` do `Button` não muda (evita encolher o menu do header no tablet); os ícones de cada conteúdo no editor de aula e os botões de status do detalhe do lead (42px) ficam de fora e estão listados no PR.
- **Verificação do spec** (`tsc`, `build`, 375/360px, 768 e 1280px): Task 5.
- **Consistência:** todas as mudanças usam `min-h-11 … sm:min-h-0` (e `min-w-11 … sm:min-w-0` em ícones), exceto Anterior/Próximo do modal, que usam `md:min-h-0` como no PR #54.
