# Destaques no topo do dashboard do aluno — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O admin destaca exercícios existentes ou tarefas avulsas, segmentados por todos/trilha/fase/módulo, e eles aparecem no topo do dashboard do aluno até a entrega, desafixe ou expiração.

**Architecture:** Duas tabelas novas (`featured_items`, `featured_item_submissions`) com RLS no banco. A segmentação é resolvida no banco por uma função SQL (`featured_in_scope`), então o aluno só consegue ler o que vale para ele. O cliente segue o padrão dos avisos: hooks com Supabase, página de admin com dialog de formulário e um bloco novo no dashboard do aluno. A regra "já entregou" é calculada no hook do aluno por funções puras em `lib/featured-items.ts`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, Supabase (`@supabase/ssr`), `date-fns`, `lucide-react`, `sonner` (via `lib/toast.ts`), pnpm.

## Global Constraints

- Segmentação: `target` ∈ `all | track | phase | module` e `target_id`, no mesmo padrão dos avisos (`lib/types/announcements.ts`).
- Regra de visibilidade para o aluno: item ativo, não expirado, dentro da segmentação do aluno e ainda não entregue; se a entrega for devolvida (`RETURNED` na tarefa avulsa, `needs_revision` no exercício), o item volta ao topo daquele aluno.
- Prazo vencido não remove o item: ele fica no topo marcado como atrasado.
- Mostrar os 3 primeiros no dashboard, por prazo mais próximo, com "ver todos". Sem itens, o bloco não é renderizado.
- Falha ao carregar não derruba o dashboard: o bloco some e o erro vai para `console.error`.
- Erros de salvar e entregar aparecem em toast (`showToast` de `lib/toast.ts`).
- Componentes novos são responsivos (mobile primeiro): cartões empilhados, botões com área de toque confortável.
- O projeto **não tem framework de testes nem config de ESLint**. Verificação: `pnpm exec tsc --noEmit`, `pnpm build`, scripts de asserção em Node para a lógica pura e teste manual no navegador. Não adicionar dependências de teste.
- Não mexer na tabela `tasks` antiga, nos tipos `Task` não usados, nem na tela `correcoes`.
- Código novo segue o estilo do repositório: indentação de 4 espaços, aspas simples, comentários curtos em português, `'use client'` nos hooks e componentes interativos.

## Ajustes em relação ao spec

Ao ler o código, três pontos precisaram de ajuste fino. Eles não mudam o comportamento combinado:

1. **Exercício é uma aula, e a entrega é por conteúdo.** As submissões de exercício (`exercise_submissions`) são por `content_id` (um `lesson_contents` com `type='EXERCISE'`), não por aula. O destaque aponta para uma **aula** (`lesson_id`). Ela conta como entregue quando o aluno enviou **todos** os conteúdos `EXERCISE` da aula; se algum estiver `needs_revision`, o item volta. O seletor do admin lista só aulas que têm ao menos um conteúdo `EXERCISE`.
2. **Feedback na devolução.** Quando uma entrega é devolvida, o cartão do aluno mostra o feedback do admin, senão o aluno não saberia o que corrigir.
3. **Segmentação no banco.** A função `featured_in_scope` usa `enrollments` (status `ACTIVE`) → `phases.track_id` → `modules.phase_id`. A migration assume que `lessons.id`, `users.id`, `tracks.id`, `phases.id` e `modules.id` são `uuid`. Se a migration falhar por tipo, ajuste os tipos das colunas e rode de novo.

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `supabase/migrations/20261001000000_featured_items.sql` | Criar | Tabelas, constraints, funções e RLS |
| `lib/types/featured-items.ts` | Criar | Tipos de domínio |
| `lib/featured-items.ts` | Criar | Funções puras: prazo, ordenação, entrega, conversão de datas, payload |
| `hooks/useFeaturedItems.ts` | Criar | CRUD admin + entregas e correção |
| `components/admin/featured/FeaturedItemForm.tsx` | Criar | Formulário (exercício ou tarefa avulsa) |
| `components/admin/featured/FeaturedItemCard.tsx` | Criar | Linha da lista do admin |
| `components/admin/featured/FeaturedSubmissionsPanel.tsx` | Criar | Entregas de uma tarefa, nota e devolução |
| `components/admin/featured/index.ts` | Criar | Reexports |
| `app/(dashboard)/admin/destaques/page.tsx` | Criar | Página de admin |
| `config/navigation.ts` | Modificar | Item "Destaques" no menu do admin |
| `hooks/useStudentFeaturedItems.ts` | Criar | Lista visível do aluno e envio de tarefa |
| `components/student/dashboard/DashboardFeatured.tsx` | Criar | Bloco no topo do dashboard |
| `components/student/dashboard/FeaturedTaskSubmitDialog.tsx` | Criar | Modal de entrega da tarefa avulsa |
| `app/(dashboard)/aluno/dashboard/page.tsx` | Modificar | Renderizar o bloco acima dos avisos |
| `app/api/admin/delete-student/route.ts` | Modificar | Limpar entregas ao excluir aluno |

---

### Task 0: Branch, identidade e linha de base

**Files:** nenhum arquivo do projeto muda.

- [ ] **Step 1: Confirmar que o git funciona neste diretório**

Run: `git status --short`
Expected: lista `?? docs/` (spec e plano). Se aparecer `dubious ownership`, o usuário precisa rodar uma vez `git config --global --add safe.directory C:/Users/werne/WebstormProjects/student-portal-core-web` e você repete o comando.

- [ ] **Step 2: Configurar a identidade de commit deste repositório**

O usuário pediu que os commits saiam em nome da conta `wernersaboia-code`.

Run:
```bash
ID=$(gh api user --jq .id) && git config user.name "wernersaboia-code" && git config user.email "${ID}+wernersaboia-code@users.noreply.github.com" && git config user.name && git config user.email
```
Expected: imprime `wernersaboia-code` e `<id>+wernersaboia-code@users.noreply.github.com`.

- [ ] **Step 3: Criar a branch**

Run: `git checkout -b feat/destaques-dashboard`
Expected: `Switched to a new branch 'feat/destaques-dashboard'`

- [ ] **Step 4: Linha de base de tipos**

Run: `pnpm exec tsc --noEmit`
Expected: ideal é sair sem erros. Se já houver erros, **anote a contagem**: o objetivo das próximas tasks é não aumentá-la. Compare sempre com esta linha de base.

- [ ] **Step 5: Commit do spec e do plano**

Run:
```bash
git add docs/superpowers/specs/2026-10-01-destaques-design.md docs/superpowers/plans/2026-10-01-destaques.md
git commit -m "docs: spec e plano da funcionalidade de destaques no dashboard"
```
Expected: commit criado, sem linhas de coautoria.

---

### Task 1: Migration, tipos e funções puras

**Files:**
- Create: `supabase/migrations/20261001000000_featured_items.sql`
- Create: `lib/types/featured-items.ts`
- Create: `lib/featured-items.ts`

**Interfaces:**
- Produces (usado pelas Tasks 2 a 5):
  - Tipos: `FeaturedKind`, `FeaturedItem`, `FeaturedItemWithLesson`, `FeaturedSubmissionStatus`, `FeaturedItemSubmission`, `FeaturedItemSubmissionWithStudent`, `CreateFeaturedItemData`, `GradeSubmissionData`, `StudentFeaturedItem`, `LessonOption`.
  - Funções: `getDeadlineState`, `formatDeadline`, `compareByDeadline`, `isExerciseDelivered`, `isTaskDelivered`, `toDatetimeLocal`, `datetimeLocalToIso`, `toDateInput`, `endOfDayIso`, `toItemPayload`.

- [ ] **Step 1: Escrever a migration**

Create `supabase/migrations/20261001000000_featured_items.sql`:

```sql
-- Destaques no topo do dashboard do aluno

create table public.featured_items (
    id uuid primary key default gen_random_uuid(),
    kind text not null check (kind in ('exercise', 'task')),
    lesson_id uuid references public.lessons(id) on delete cascade,
    title text,
    description text,
    deadline timestamptz,
    target text not null default 'all' check (target in ('all', 'track', 'phase', 'module')),
    target_id uuid,
    expires_at timestamptz,
    is_active boolean not null default true,
    created_by uuid references public.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint featured_items_kind_fields check (
        (kind = 'exercise' and lesson_id is not null)
        or (kind = 'task' and lesson_id is null and title is not null
            and length(trim(title)) > 0 and description is not null)
    ),
    constraint featured_items_target_fields check (
        (target = 'all' and target_id is null)
        or (target <> 'all' and target_id is not null)
    )
);

create index featured_items_active_idx on public.featured_items (is_active, created_at desc);
create index featured_items_lesson_idx on public.featured_items (lesson_id);

create table public.featured_item_submissions (
    id uuid primary key default gen_random_uuid(),
    featured_item_id uuid not null references public.featured_items(id) on delete cascade,
    student_id uuid not null references public.users(id) on delete cascade,
    content text,
    link_url text,
    submitted_at timestamptz not null default now(),
    status text not null default 'SUBMITTED' check (status in ('SUBMITTED', 'GRADED', 'RETURNED')),
    grade numeric(4, 1) check (grade is null or (grade >= 0 and grade <= 10)),
    feedback text,
    graded_by uuid references public.users(id) on delete set null,
    graded_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint featured_item_submissions_has_answer check (
        (content is not null and length(trim(content)) > 0)
        or (link_url is not null and length(trim(link_url)) > 0)
    ),
    constraint featured_item_submissions_unique unique (featured_item_id, student_id)
);

create index featured_item_submissions_student_idx on public.featured_item_submissions (student_id);

-- Funções auxiliares (security definer para não depender das policies de outras tabelas)
create or replace function public.featured_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
    );
$$;

create or replace function public.featured_in_scope(p_target text, p_target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select case p_target
        when 'all' then true
        when 'track' then exists (
            select 1 from public.enrollments e
            where e.student_id = auth.uid() and e.status = 'ACTIVE' and e.track_id = p_target_id
        )
        when 'phase' then exists (
            select 1 from public.enrollments e
            join public.phases p on p.track_id = e.track_id
            where e.student_id = auth.uid() and e.status = 'ACTIVE' and p.id = p_target_id
        )
        when 'module' then exists (
            select 1 from public.enrollments e
            join public.phases p on p.track_id = e.track_id
            join public.modules m on m.phase_id = p.id
            where e.student_id = auth.uid() and e.status = 'ACTIVE' and m.id = p_target_id
        )
        else false
    end;
$$;

alter table public.featured_items enable row level security;
alter table public.featured_item_submissions enable row level security;

grant select, insert, update, delete on public.featured_items to authenticated;
grant select, insert, update, delete on public.featured_item_submissions to authenticated;

-- featured_items
create policy featured_items_admin_all on public.featured_items
    for all to authenticated
    using (public.featured_is_admin())
    with check (public.featured_is_admin());

create policy featured_items_student_select on public.featured_items
    for select to authenticated
    using (
        is_active
        and (expires_at is null or expires_at > now())
        and public.featured_in_scope(target, target_id)
    );

-- featured_item_submissions
create policy featured_submissions_admin_all on public.featured_item_submissions
    for all to authenticated
    using (public.featured_is_admin())
    with check (public.featured_is_admin());

create policy featured_submissions_student_select on public.featured_item_submissions
    for select to authenticated
    using (student_id = auth.uid());

create policy featured_submissions_student_insert on public.featured_item_submissions
    for insert to authenticated
    with check (
        student_id = auth.uid()
        and status = 'SUBMITTED'
        and grade is null
        and graded_by is null
        and graded_at is null
        and exists (
            select 1 from public.featured_items fi
            where fi.id = featured_item_id and fi.kind = 'task'
        )
    );

create policy featured_submissions_student_update on public.featured_item_submissions
    for update to authenticated
    using (student_id = auth.uid() and status in ('SUBMITTED', 'RETURNED'))
    with check (
        student_id = auth.uid()
        and status = 'SUBMITTED'
        and grade is null
        and graded_by is null
        and graded_at is null
    );
```

- [ ] **Step 2: Escrever os tipos**

Create `lib/types/featured-items.ts`:

```ts
// lib/types/featured-items.ts

import type { AnnouncementTarget } from '@/lib/types/announcements';

// Exercício existente (aula) ou tarefa avulsa
export type FeaturedKind = 'exercise' | 'task';

export type FeaturedSubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RETURNED';

export interface FeaturedItem {
    id: string;
    kind: FeaturedKind;
    lesson_id: string | null;
    title: string | null;
    description: string | null;
    deadline: string | null;
    target: AnnouncementTarget;
    target_id: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface FeaturedItemWithLesson extends FeaturedItem {
    lesson: {
        id: string;
        title: string;
        module_id: string;
    } | null;
}

export interface FeaturedItemSubmission {
    id: string;
    featured_item_id: string;
    student_id: string;
    content: string | null;
    link_url: string | null;
    submitted_at: string;
    status: FeaturedSubmissionStatus;
    grade: number | null;
    feedback: string | null;
    graded_by: string | null;
    graded_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface FeaturedItemSubmissionWithStudent extends FeaturedItemSubmission {
    student: {
        id: string;
        name: string;
        email: string;
    } | null;
}

// Dados do formulário do admin
export interface CreateFeaturedItemData {
    kind: FeaturedKind;
    lesson_id?: string | null;
    title?: string | null;
    description?: string | null;
    deadline?: string | null;
    target: AnnouncementTarget;
    target_id?: string | null;
    expires_at?: string | null;
}

export interface GradeSubmissionData {
    status: 'GRADED' | 'RETURNED';
    grade: number | null;
    feedback: string;
}

// Item já resolvido para o dashboard do aluno
export interface StudentFeaturedItem {
    id: string;
    kind: FeaturedKind;
    title: string;
    description: string | null;
    deadline: string | null;
    created_at: string;
    href: string | null;
    needsRevision: boolean;
    feedback: string | null;
}

// Opção do seletor de aulas com exercício
export interface LessonOption {
    id: string;
    label: string;
}
```

- [ ] **Step 3: Escrever as funções puras**

Create `lib/featured-items.ts`. Use **apenas** `import type` para tipos do projeto, para o arquivo rodar direto no Node no passo de verificação:

```ts
// lib/featured-items.ts
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CreateFeaturedItemData } from '@/lib/types/featured-items';

export type DeadlineState = 'none' | 'ok' | 'soon' | 'overdue';

const SOON_MS = 48 * 60 * 60 * 1000;

// Atrasado: prazo passou. Próximo: faltam 48h ou menos.
export function getDeadlineState(deadline: string | null, now: Date = new Date()): DeadlineState {
    if (!deadline) return 'none';
    const diff = new Date(deadline).getTime() - now.getTime();
    if (diff < 0) return 'overdue';
    if (diff <= SOON_MS) return 'soon';
    return 'ok';
}

export function formatDeadline(deadline: string): string {
    return format(new Date(deadline), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

// Prazo mais próximo primeiro; sem prazo vão para o fim; empate: mais recente primeiro
export function compareByDeadline(
    a: { deadline: string | null; created_at: string },
    b: { deadline: string | null; created_at: string }
): number {
    if (a.deadline && b.deadline) {
        const diff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (diff !== 0) return diff;
    } else if (a.deadline) {
        return -1;
    } else if (b.deadline) {
        return 1;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

interface DeliveryState {
    delivered: boolean;
    needsRevision: boolean;
}

// Exercício entregue = todos os conteúdos EXERCISE da aula têm submissão.
// Algum em needs_revision faz o item voltar. Aula sem conteúdos EXERCISE nunca conta como entregue.
export function isExerciseDelivered(
    contentIds: string[],
    statusByContent: Map<string, string>
): DeliveryState {
    if (contentIds.length === 0) return { delivered: false, needsRevision: false };
    if (contentIds.some((id: string) => statusByContent.get(id) === 'needs_revision')) {
        return { delivered: false, needsRevision: true };
    }
    return {
        delivered: contentIds.every((id: string) => statusByContent.has(id)),
        needsRevision: false,
    };
}

// Tarefa avulsa: qualquer entrega conta, exceto devolvida (RETURNED)
export function isTaskDelivered(status: string | undefined): DeliveryState {
    if (!status) return { delivered: false, needsRevision: false };
    if (status === 'RETURNED') return { delivered: false, needsRevision: true };
    return { delivered: true, needsRevision: false };
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

// ISO (UTC) -> valor de <input type="datetime-local"> no fuso local
export function toDatetimeLocal(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalToIso(value: string): string {
    return new Date(value).toISOString();
}

// ISO (UTC) -> valor de <input type="date"> no fuso local
export function toDateInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Expiração vale até o fim do dia escolhido
export function endOfDayIso(date: string): string {
    return new Date(`${date}T23:59:59`).toISOString();
}

// Normaliza o formulário para as constraints da tabela
export function toItemPayload(data: CreateFeaturedItemData) {
    const isExercise = data.kind === 'exercise';
    return {
        kind: data.kind,
        lesson_id: isExercise ? data.lesson_id ?? null : null,
        title: isExercise ? null : data.title?.trim() ?? null,
        description: isExercise ? null : data.description?.trim() ?? '',
        deadline: data.deadline || null,
        target: data.target,
        target_id: data.target === 'all' ? null : data.target_id ?? null,
        expires_at: data.expires_at || null,
    };
}
```

- [ ] **Step 4: Verificar a lógica pura com asserções (deve passar)**

Run (Node 24 executa `.ts` com remoção de tipos):
```bash
node --input-type=module -e "
import assert from 'node:assert/strict';
import * as f from './lib/featured-items.ts';

const now = new Date('2026-10-10T12:00:00.000Z');
assert.equal(f.getDeadlineState(null, now), 'none');
assert.equal(f.getDeadlineState('2026-10-09T12:00:00.000Z', now), 'overdue');
assert.equal(f.getDeadlineState('2026-10-11T12:00:00.000Z', now), 'soon');
assert.equal(f.getDeadlineState('2026-10-12T12:00:00.000Z', now), 'soon');
assert.equal(f.getDeadlineState('2026-10-13T12:00:00.000Z', now), 'ok');

const a = { deadline: '2026-10-12T00:00:00.000Z', created_at: '2026-10-01T00:00:00.000Z' };
const b = { deadline: '2026-10-11T00:00:00.000Z', created_at: '2026-10-02T00:00:00.000Z' };
const c = { deadline: null, created_at: '2026-10-05T00:00:00.000Z' };
const d = { deadline: null, created_at: '2026-10-06T00:00:00.000Z' };
assert.deepEqual([a, c, b, d].sort(f.compareByDeadline), [b, a, d, c]);

assert.deepEqual(f.isExerciseDelivered([], new Map()), { delivered: false, needsRevision: false });
assert.deepEqual(f.isExerciseDelivered(['1', '2'], new Map([['1', 'pending']])), { delivered: false, needsRevision: false });
assert.deepEqual(f.isExerciseDelivered(['1', '2'], new Map([['1', 'pending'], ['2', 'approved']])), { delivered: true, needsRevision: false });
assert.deepEqual(f.isExerciseDelivered(['1', '2'], new Map([['1', 'pending'], ['2', 'needs_revision']])), { delivered: false, needsRevision: true });

assert.deepEqual(f.isTaskDelivered(undefined), { delivered: false, needsRevision: false });
assert.deepEqual(f.isTaskDelivered('SUBMITTED'), { delivered: true, needsRevision: false });
assert.deepEqual(f.isTaskDelivered('GRADED'), { delivered: true, needsRevision: false });
assert.deepEqual(f.isTaskDelivered('RETURNED'), { delivered: false, needsRevision: true });

const iso = '2026-10-05T15:30:00.000Z';
assert.equal(f.datetimeLocalToIso(f.toDatetimeLocal(iso)), iso);
assert.equal(f.toDatetimeLocal(null), '');
assert.equal(f.toDateInput(null), '');
assert.equal(f.toDateInput(f.endOfDayIso('2026-10-20')), '2026-10-20');

assert.deepEqual(
  f.toItemPayload({ kind: 'exercise', lesson_id: 'L1', title: 'x', target: 'all', target_id: 'T' }),
  { kind: 'exercise', lesson_id: 'L1', title: null, description: null, deadline: null, target: 'all', target_id: null, expires_at: null }
);
assert.deepEqual(
  f.toItemPayload({ kind: 'task', lesson_id: 'L1', title: '  Projeto  ', description: ' desc ', target: 'module', target_id: 'M1' }),
  { kind: 'task', lesson_id: null, title: 'Projeto', description: 'desc', deadline: null, target: 'module', target_id: 'M1', expires_at: null }
);

console.log('OK featured-items');
"
```
Expected: `OK featured-items`. Se falhar, corrija `lib/featured-items.ts` até passar (a função e a asserção que falhou aparecem no erro).

- [ ] **Step 5: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sem erros novos em relação à linha de base da Task 0.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261001000000_featured_items.sql lib/types/featured-items.ts lib/featured-items.ts
git commit -m "feat(destaques): migration, tipos e funções puras"
```

- [ ] **Step 7: Aplicar a migration no banco do portal (ação do usuário)**

O projeto do portal é `iysuhjerjudsyvqhmsin`. Peça ao usuário para colar o conteúdo da migration no **SQL Editor** do Supabase e executar (ou aplique pelo conector, se ele enxergar esse projeto, **somente com confirmação explícita do usuário**). Depois confirme com este SQL:

```sql
select table_name from information_schema.tables
where table_schema = 'public' and table_name in ('featured_items', 'featured_item_submissions');
```
Expected: duas linhas. As Tasks 3 a 5 só podem ser testadas no navegador depois disso.

---

### Task 2: Admin — hook, formulário, lista e menu

**Files:**
- Create: `hooks/useFeaturedItems.ts`
- Create: `components/admin/featured/FeaturedItemForm.tsx`
- Create: `components/admin/featured/FeaturedItemCard.tsx`
- Create: `components/admin/featured/index.ts`
- Create: `app/(dashboard)/admin/destaques/page.tsx`
- Modify: `config/navigation.ts`

**Interfaces:**
- Consumes (Task 1): `CreateFeaturedItemData`, `FeaturedItemWithLesson`, `FeaturedItemSubmissionWithStudent`, `GradeSubmissionData`, `LessonOption`, `toItemPayload`, `toDatetimeLocal`, `datetimeLocalToIso`, `toDateInput`, `endOfDayIso`, `formatDeadline`, `getDeadlineState`.
- Produces (Task 4): `useFeaturedItems()` com `fetchSubmissions(itemId)` e `gradeSubmission(id, data)`; `FeaturedItemCard` aceita `onOpenSubmissions`.

- [ ] **Step 1: Escrever o hook do admin**

Create `hooks/useFeaturedItems.ts`:

```ts
// hooks/useFeaturedItems.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toItemPayload } from '@/lib/featured-items';
import type {
    CreateFeaturedItemData,
    FeaturedItemSubmissionWithStudent,
    FeaturedItemWithLesson,
    GradeSubmissionData,
} from '@/lib/types/featured-items';

type Result = { success: boolean; error?: string };

interface UseFeaturedItemsReturn {
    items: FeaturedItemWithLesson[];
    isLoading: boolean;
    error: string | null;
    createItem: (data: CreateFeaturedItemData) => Promise<Result>;
    updateItem: (id: string, data: CreateFeaturedItemData) => Promise<Result>;
    deleteItem: (id: string) => Promise<Result>;
    toggleActive: (id: string, isActive: boolean) => Promise<Result>;
    fetchSubmissions: (itemId: string) => Promise<FeaturedItemSubmissionWithStudent[]>;
    gradeSubmission: (id: string, data: GradeSubmissionData) => Promise<Result>;
    refresh: () => Promise<void>;
}

export function useFeaturedItems(): UseFeaturedItemsReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [items, setItems] = useState<FeaturedItemWithLesson[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('featured_items')
                .select('*, lesson:lessons(id, title, module_id)')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setItems((data || []) as FeaturedItemWithLesson[]);
        } catch (err) {
            console.error('[useFeaturedItems] Erro ao carregar destaques:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar destaques');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const createItem = async (data: CreateFeaturedItemData): Promise<Result> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { error: insertError } = await supabase
                .from('featured_items')
                .insert({ ...toItemPayload(data), created_by: user.id });

            if (insertError) throw insertError;

            await fetchItems();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar destaque' };
        }
    };

    const updateItem = async (id: string, data: CreateFeaturedItemData): Promise<Result> => {
        try {
            const { error: updateError } = await supabase
                .from('featured_items')
                .update({ ...toItemPayload(data), updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchItems();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar destaque' };
        }
    };

    const deleteItem = async (id: string): Promise<Result> => {
        try {
            const { error: deleteError } = await supabase
                .from('featured_items')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setItems((prev: FeaturedItemWithLesson[]) => prev.filter((i: FeaturedItemWithLesson) => i.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao excluir destaque' };
        }
    };

    const toggleActive = async (id: string, isActive: boolean): Promise<Result> => {
        try {
            const { error: updateError } = await supabase
                .from('featured_items')
                .update({ is_active: isActive, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchItems();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar destaque' };
        }
    };

    const fetchSubmissions = async (itemId: string): Promise<FeaturedItemSubmissionWithStudent[]> => {
        const { data, error: fetchError } = await supabase
            .from('featured_item_submissions')
            .select('*, student:users!featured_item_submissions_student_id_fkey(id, name, email)')
            .eq('featured_item_id', itemId)
            .order('submitted_at', { ascending: false });

        if (fetchError) throw fetchError;

        return (data || []) as FeaturedItemSubmissionWithStudent[];
    };

    const gradeSubmission = async (id: string, data: GradeSubmissionData): Promise<Result> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const now = new Date().toISOString();

            const { error: updateError } = await supabase
                .from('featured_item_submissions')
                .update({
                    status: data.status,
                    grade: data.grade,
                    feedback: data.feedback.trim() || null,
                    graded_by: user.id,
                    graded_at: now,
                    updated_at: now,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Erro ao salvar correção' };
        }
    };

    const refresh = async (): Promise<void> => {
        await fetchItems();
    };

    return {
        items,
        isLoading,
        error,
        createItem,
        updateItem,
        deleteItem,
        toggleActive,
        fetchSubmissions,
        gradeSubmission,
        refresh,
    };
}
```

- [ ] **Step 2: Escrever o formulário**

Create `components/admin/featured/FeaturedItemForm.tsx`:

```tsx
// components/admin/featured/FeaturedItemForm.tsx
'use client';

import { useState } from 'react';
import { Send, X, ClipboardCheck, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnnouncementTarget, TARGET_LABELS } from '@/lib/types/announcements';
import type {
    CreateFeaturedItemData,
    FeaturedItemWithLesson,
    FeaturedKind,
    LessonOption,
} from '@/lib/types/featured-items';
import {
    datetimeLocalToIso,
    endOfDayIso,
    toDateInput,
    toDatetimeLocal,
} from '@/lib/featured-items';
import { showToast } from '@/lib/toast';

interface NamedOption {
    id: string;
    name: string;
}

interface FeaturedItemFormProps {
    tracks: NamedOption[];
    phases: NamedOption[];
    modules: NamedOption[];
    lessons: LessonOption[];
    item?: FeaturedItemWithLesson | null;
    onSubmit: (data: CreateFeaturedItemData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
}

const inputClass = cn(
    'w-full px-4 py-3 rounded-lg',
    'bg-gray-800 border border-gray-700',
    'text-white placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
);

const targetOptions: AnnouncementTarget[] = ['all', 'track', 'phase', 'module'];

export function FeaturedItemForm({
                                     tracks,
                                     phases,
                                     modules,
                                     lessons,
                                     item,
                                     onSubmit,
                                     onCancel,
                                 }: FeaturedItemFormProps) {
    const isEditing = !!item;

    const [kind, setKind] = useState<FeaturedKind>(item?.kind ?? 'exercise');
    const [lessonId, setLessonId] = useState<string>(item?.lesson_id ?? '');
    const [title, setTitle] = useState<string>(item?.title ?? '');
    const [description, setDescription] = useState<string>(item?.description ?? '');
    const [deadline, setDeadline] = useState<string>(toDatetimeLocal(item?.deadline ?? null));
    const [target, setTarget] = useState<AnnouncementTarget>(item?.target ?? 'all');
    const [targetId, setTargetId] = useState<string>(item?.target_id ?? '');
    const [expiresAt, setExpiresAt] = useState<string>(toDateInput(item?.expires_at ?? null));
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleTargetChange = (newTarget: AnnouncementTarget) => {
        setTarget(newTarget);
        setTargetId('');
    };

    const getTargetOptions = (): NamedOption[] => {
        switch (target) {
            case 'track':
                return tracks;
            case 'phase':
                return phases;
            case 'module':
                return modules;
            default:
                return [];
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (kind === 'exercise' && !lessonId) {
            showToast('error', 'Selecione o exercício');
            return;
        }

        if (kind === 'task') {
            if (!title.trim()) {
                showToast('error', 'Digite um título');
                return;
            }
            if (!description.trim()) {
                showToast('error', 'Digite a descrição da tarefa');
                return;
            }
        }

        if (target !== 'all' && !targetId) {
            showToast('error', `Selecione ${TARGET_LABELS[target].toLowerCase()}`);
            return;
        }

        setIsSubmitting(true);

        const data: CreateFeaturedItemData = {
            kind,
            lesson_id: kind === 'exercise' ? lessonId : null,
            title: kind === 'task' ? title : null,
            description: kind === 'task' ? description : null,
            deadline: deadline ? datetimeLocalToIso(deadline) : null,
            target,
            target_id: target === 'all' ? null : targetId,
            expires_at: expiresAt ? endOfDayIso(expiresAt) : null,
        };

        const result = await onSubmit(data);

        setIsSubmitting(false);

        if (result.success) {
            showToast('success', isEditing ? 'Destaque atualizado!' : 'Destaque criado!');
            onCancel();
        } else {
            showToast('error', result.error || 'Erro ao salvar destaque');
        }
    };

    const kindOptions: { value: FeaturedKind; label: string; hint: string; icon: typeof ClipboardCheck }[] = [
        { value: 'exercise', label: 'Exercício existente', hint: 'Uma aula com exercício', icon: ClipboardCheck },
        { value: 'task', label: 'Tarefa avulsa', hint: 'Criada só para o destaque', icon: ClipboardList },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">O que destacar</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {kindOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                disabled={isEditing}
                                onClick={() => setKind(option.value)}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                                    kind === option.value
                                        ? 'bg-sky-950/30 border-sky-500/50 text-sky-300'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600',
                                    isEditing && 'opacity-60 cursor-not-allowed'
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
                                <span>
                                    <span className="block text-sm font-medium">{option.label}</span>
                                    <span className="block text-xs text-gray-500">{option.hint}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {kind === 'exercise' ? (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Exercício *</label>
                    <select
                        value={lessonId}
                        onChange={(e) => setLessonId(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Selecione a aula...</option>
                        {lessons.map((lesson: LessonOption) => (
                            <option key={lesson.id} value={lesson.id}>
                                {lesson.label}
                            </option>
                        ))}
                    </select>
                    {lessons.length === 0 && (
                        <p className="mt-2 text-sm text-amber-400">
                            Nenhuma aula com exercício encontrada.
                        </p>
                    )}
                </div>
            ) : (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Título *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Enviar o projeto final"
                            maxLength={255}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Descrição *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Explique o que o aluno precisa entregar..."
                            rows={4}
                            className={cn(inputClass, 'resize-none')}
                        />
                    </div>
                </>
            )}

            {/* Prazo e expiração */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Prazo (opcional)</label>
                    <input
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sai do topo em (opcional)
                    </label>
                    <input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Público alvo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Público alvo</label>
                    <select
                        value={target}
                        onChange={(e) => handleTargetChange(e.target.value as AnnouncementTarget)}
                        className={inputClass}
                    >
                        {targetOptions.map((t: AnnouncementTarget) => (
                            <option key={t} value={t}>
                                {TARGET_LABELS[t]}
                            </option>
                        ))}
                    </select>
                </div>

                {target !== 'all' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Selecionar {target === 'track' ? 'trilha' : target === 'phase' ? 'fase' : 'módulo'}
                        </label>
                        <select
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Selecione...</option>
                            {getTargetOptions().map((option: NamedOption) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Botões */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-800">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-500">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar destaque' : 'Publicar destaque'}
                </Button>
            </div>
        </form>
    );
}
```

- [ ] **Step 3: Escrever o cartão da lista**

Create `components/admin/featured/FeaturedItemCard.tsx`:

```tsx
// components/admin/featured/FeaturedItemCard.tsx
'use client';

import { ClipboardCheck, ClipboardList, Clock, Pencil, Trash2, Power, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TARGET_LABELS } from '@/lib/types/announcements';
import type { FeaturedItemWithLesson } from '@/lib/types/featured-items';
import { formatDeadline, getDeadlineState } from '@/lib/featured-items';

interface FeaturedItemCardProps {
    item: FeaturedItemWithLesson;
    targetName: string | null;
    onEdit: (item: FeaturedItemWithLesson) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string, isActive: boolean) => void;
    onOpenSubmissions: (item: FeaturedItemWithLesson) => void;
}

export function FeaturedItemCard({
                                     item,
                                     targetName,
                                     onEdit,
                                     onDelete,
                                     onToggleActive,
                                     onOpenSubmissions,
                                 }: FeaturedItemCardProps) {
    const isTask = item.kind === 'task';
    const Icon = isTask ? ClipboardList : ClipboardCheck;
    const title = isTask ? item.title : item.lesson?.title ?? 'Aula removida';
    const deadlineState = getDeadlineState(item.deadline);
    const expired = !!item.expires_at && new Date(item.expires_at) < new Date();

    return (
        <div
            className={cn(
                'rounded-xl border p-4 bg-gray-900/50',
                item.is_active && !expired ? 'border-gray-800' : 'border-gray-800/60 opacity-70'
            )}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-sky-500/10 flex-shrink-0">
                        <Icon className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-white truncate">{title}</h3>
                            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                                {isTask ? 'Tarefa avulsa' : 'Exercício'}
                            </span>
                            {expired && (
                                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                                    Expirado
                                </span>
                            )}
                        </div>
                        {isTask && item.description && (
                            <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>
                                Para:{' '}
                                {item.target === 'all'
                                    ? TARGET_LABELS.all
                                    : targetName ?? 'alvo removido'}
                            </span>
                            {item.deadline && (
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-1',
                                        deadlineState === 'overdue' && 'text-rose-400',
                                        deadlineState === 'soon' && 'text-amber-400'
                                    )}
                                >
                                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                                    {formatDeadline(item.deadline)}
                                </span>
                            )}
                            {item.expires_at && (
                                <span>Expira em {formatDeadline(item.expires_at)}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
                    {isTask && (
                        <Button variant="outline" onClick={() => onOpenSubmissions(item)}>
                            <Inbox className="h-4 w-4 mr-2" />
                            Entregas
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => onToggleActive(item.id, !item.is_active)}
                        title={item.is_active ? 'Desativar' : 'Ativar'}
                    >
                        <Power className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => onEdit(item)} title="Editar">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => onDelete(item.id)} title="Excluir">
                        <Trash2 className="h-4 w-4 text-rose-400" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Reexports**

Create `components/admin/featured/index.ts`:

```ts
export { FeaturedItemForm } from './FeaturedItemForm';
export { FeaturedItemCard } from './FeaturedItemCard';
```

(O painel de entregas é reexportado na Task 4.)

- [ ] **Step 5: Escrever a página do admin**

Create `app/(dashboard)/admin/destaques/page.tsx`. Neste ponto o painel de entregas ainda não existe, então o botão "Entregas" fica ligado a um estado que a Task 4 passa a renderizar:

```tsx
// app/(dashboard)/admin/destaques/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Pin, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FeaturedItemCard, FeaturedItemForm } from '@/components/admin/featured';
import { useFeaturedItems } from '@/hooks/useFeaturedItems';
import type {
    CreateFeaturedItemData,
    FeaturedItemWithLesson,
    LessonOption,
} from '@/lib/types/featured-items';
import { showToast } from '@/lib/toast';

interface NamedOption {
    id: string;
    name: string;
}

interface ExerciseContentRow {
    lesson_id: string;
    lesson: {
        id: string;
        title: string;
        module: { name: string } | null;
    } | null;
}

export default function DestaquesPage() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [tracks, setTracks] = useState<NamedOption[]>([]);
    const [phases, setPhases] = useState<NamedOption[]>([]);
    const [modules, setModules] = useState<NamedOption[]>([]);
    const [lessons, setLessons] = useState<LessonOption[]>([]);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<FeaturedItemWithLesson | null>(null);
    const [submissionsItem, setSubmissionsItem] = useState<FeaturedItemWithLesson | null>(null);

    const {
        items,
        isLoading,
        error,
        createItem,
        updateItem,
        deleteItem,
        toggleActive,
        refresh,
    } = useFeaturedItems();

    useEffect(() => {
        async function fetchData() {
            try {
                const [tracksRes, phasesRes, modulesRes, lessonsRes] = await Promise.all([
                    supabase.from('tracks').select('id, name').eq('is_active', true).order('order_index'),
                    supabase.from('phases').select('id, name').eq('is_active', true).order('number'),
                    supabase.from('modules').select('id, name').eq('status', 'PUBLISHED').order('order_index'),
                    supabase
                        .from('lesson_contents')
                        .select('lesson_id, lesson:lessons(id, title, module:modules(name))')
                        .eq('type', 'EXERCISE'),
                ]);

                setTracks(tracksRes.data || []);
                setPhases(phasesRes.data || []);
                setModules(modulesRes.data || []);

                // Uma opção por aula (a aula pode ter vários exercícios)
                const byLesson = new Map<string, LessonOption>();
                ((lessonsRes.data || []) as unknown as ExerciseContentRow[]).forEach((row: ExerciseContentRow) => {
                    if (!row.lesson || byLesson.has(row.lesson.id)) return;
                    const moduleName = row.lesson.module?.name;
                    byLesson.set(row.lesson.id, {
                        id: row.lesson.id,
                        label: moduleName ? `${moduleName} — ${row.lesson.title}` : row.lesson.title,
                    });
                });
                setLessons(
                    Array.from(byLesson.values()).sort((a: LessonOption, b: LessonOption) =>
                        a.label.localeCompare(b.label, 'pt-BR')
                    )
                );
            } catch (err) {
                console.error('Erro ao carregar dados:', err);
            } finally {
                setIsLoadingData(false);
            }
        }

        fetchData();
    }, [supabase]);

    const getTargetName = (item: FeaturedItemWithLesson): string | null => {
        const source =
            item.target === 'track' ? tracks : item.target === 'phase' ? phases : item.target === 'module' ? modules : [];
        return source.find((option: NamedOption) => option.id === item.target_id)?.name ?? null;
    };

    const handleCreate = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: FeaturedItemWithLesson) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleSubmit = async (data: CreateFeaturedItemData): Promise<{ success: boolean; error?: string }> => {
        if (editingItem) {
            return updateItem(editingItem.id, data);
        }
        return createItem(data);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este destaque? As entregas dele também serão apagadas.')) return;

        const result = await deleteItem(id);
        if (result.success) {
            showToast('success', 'Destaque excluído!');
        } else {
            showToast('error', result.error || 'Erro ao excluir');
        }
    };

    const handleToggleActive = async (id: string, isActive: boolean) => {
        const result = await toggleActive(id, isActive);
        if (result.success) {
            showToast('success', isActive ? 'Destaque ativado!' : 'Destaque desativado!');
        } else {
            showToast('error', result.error || 'Erro ao atualizar');
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    const activeItems = items.filter((i: FeaturedItemWithLesson) => i.is_active);
    const inactiveItems = items.filter((i: FeaturedItemWithLesson) => !i.is_active);

    if (isLoading || isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    const renderList = (list: FeaturedItemWithLesson[]) => (
        <div className="space-y-3">
            {list.map((item: FeaturedItemWithLesson) => (
                <FeaturedItemCard
                    key={item.id}
                    item={item}
                    targetName={getTargetName(item)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    onOpenSubmissions={setSubmissionsItem}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/20">
                        <Pin className="h-6 w-6 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Destaques</h1>
                        <p className="text-gray-400">Fixe exercícios e tarefas no topo do dashboard</p>
                    </div>
                </div>

                <Button onClick={handleCreate} className="bg-sky-600 hover:bg-sky-500 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Destaque
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4 text-center">
                    <p className="text-rose-400">{error}</p>
                    <Button variant="outline" onClick={refresh} className="mt-3">
                        Tentar novamente
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-900/30 border border-gray-800 rounded-xl">
                    <Pin className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Nenhum destaque ainda</h3>
                    <p className="text-gray-400 text-center max-w-md mb-6">
                        Destaque um exercício ou crie uma tarefa avulsa para aparecer no topo do dashboard dos alunos.
                    </p>
                    <Button onClick={handleCreate} className="bg-sky-600 hover:bg-sky-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar primeiro destaque
                    </Button>
                </div>
            )}

            {activeItems.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Ativos ({activeItems.length})</h2>
                    {renderList(activeItems)}
                </section>
            )}

            {inactiveItems.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-400">Inativos ({inactiveItems.length})</h2>
                    {renderList(inactiveItems)}
                </section>
            )}

            {/* Form Dialog (a key recria o formulário ao trocar de item) */}
            <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Editar Destaque' : 'Novo Destaque'}</DialogTitle>
                    </DialogHeader>
                    <FeaturedItemForm
                        key={editingItem?.id ?? 'new'}
                        tracks={tracks}
                        phases={phases}
                        modules={modules}
                        lessons={lessons}
                        item={editingItem}
                        onSubmit={handleSubmit}
                        onCancel={handleCloseForm}
                    />
                </DialogContent>
            </Dialog>

            {/* O painel de entregas (submissionsItem) é adicionado na Task 4 */}
            {submissionsItem && null}
        </div>
    );
}
```

- [ ] **Step 6: Adicionar o item no menu do admin**

Modify `config/navigation.ts`. No import do `lucide-react`, adicione `Pin,` depois de `Megaphone,`:

```ts
    Megaphone,
    Pin,
    Video,
```

E, em `adminNavItems`, logo depois do item `Avisos`, adicione:

```ts
    {
        icon: Pin,
        label: "Destaques",
        href: "/admin/destaques",
        description: "Fixar tarefas no dashboard",
    },
```

- [ ] **Step 7: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sem erros novos. Se `Button` reclamar de alguma prop (`variant="outline"` e `"ghost"` já são usados em `avisos`), confira `components/ui/button.tsx` e ajuste.

- [ ] **Step 8: Teste no navegador (precisa da migration aplicada)**

Run: `pnpm dev` (em segundo plano) e abra `http://localhost:3000/admin/destaques` logado como admin (o usuário faz o login).
Expected:
- A página abre com o estado vazio "Nenhum destaque ainda".
- "Novo Destaque" → criar um **exercício existente** (selecionar uma aula) com público "Todos os alunos": aparece em "Ativos".
- Criar uma **tarefa avulsa** com prazo e público "Módulo específico": aparece com "Para: <nome do módulo>" e o botão "Entregas".
- Desativar move para "Inativos"; editar abre o formulário preenchido e o tipo fica travado; excluir remove.

- [ ] **Step 9: Commit**

```bash
git add hooks/useFeaturedItems.ts components/admin/featured app/\(dashboard\)/admin/destaques config/navigation.ts
git commit -m "feat(destaques): página de admin para destacar exercícios e tarefas"
```

---

### Task 3: Aluno — bloco de destaques no dashboard

**Files:**
- Create: `hooks/useStudentFeaturedItems.ts`
- Create: `components/student/dashboard/DashboardFeatured.tsx`
- Create: `components/student/dashboard/FeaturedTaskSubmitDialog.tsx`
- Modify: `app/(dashboard)/aluno/dashboard/page.tsx`

**Interfaces:**
- Consumes (Task 1): `StudentFeaturedItem`, `FeaturedItemWithLesson`, `compareByDeadline`, `isExerciseDelivered`, `isTaskDelivered`, `getDeadlineState`, `formatDeadline`.
- Produces: `useStudentFeaturedItems(userId)` retorna `{ items, isLoading, error, submitTask, refresh }`; `submitTask(itemId, { content, link_url })`. A Task 4 não depende deste hook, mas o modal de entrega é entregue aqui junto com o botão "Entregar", porque sem ele a tarefa avulsa não teria como sair do topo.

- [ ] **Step 1: Escrever o hook do aluno**

Create `hooks/useStudentFeaturedItems.ts`:

```ts
// hooks/useStudentFeaturedItems.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { compareByDeadline, isExerciseDelivered, isTaskDelivered } from '@/lib/featured-items';
import type { FeaturedItemWithLesson, StudentFeaturedItem } from '@/lib/types/featured-items';

interface TaskSubmissionRow {
    featured_item_id: string;
    status: string;
    feedback: string | null;
}

interface ExerciseSubmissionRow {
    content_id: string;
    status: string;
    feedback: string | null;
}

interface LessonContentRow {
    id: string;
    lesson_id: string;
}

interface SubmitTaskData {
    content: string;
    link_url: string;
}

interface UseStudentFeaturedItemsReturn {
    items: StudentFeaturedItem[];
    isLoading: boolean;
    error: string | null;
    submitTask: (itemId: string, data: SubmitTaskData) => Promise<{ success: boolean; error?: string }>;
    refresh: () => Promise<void>;
}

export function useStudentFeaturedItems(userId: string | null): UseStudentFeaturedItemsReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [items, setItems] = useState<StudentFeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async (): Promise<void> => {
        if (!userId) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const now = new Date().toISOString();

            // A segmentação é aplicada pelo banco (RLS); aqui só filtramos ativos e não expirados
            const { data, error: itemsError } = await supabase
                .from('featured_items')
                .select('*, lesson:lessons(id, title, module_id)')
                .eq('is_active', true)
                .or(`expires_at.is.null,expires_at.gt.${now}`);

            if (itemsError) throw itemsError;

            const rows = (data || []) as FeaturedItemWithLesson[];

            if (rows.length === 0) {
                setItems([]);
                return;
            }

            // Tarefas avulsas: entrega do aluno
            const taskIds = rows
                .filter((r: FeaturedItemWithLesson) => r.kind === 'task')
                .map((r: FeaturedItemWithLesson) => r.id);

            const taskSubmissions = new Map<string, TaskSubmissionRow>();

            if (taskIds.length > 0) {
                const { data: subs, error: subsError } = await supabase
                    .from('featured_item_submissions')
                    .select('featured_item_id, status, feedback')
                    .eq('student_id', userId)
                    .in('featured_item_id', taskIds);

                if (subsError) throw subsError;

                ((subs || []) as TaskSubmissionRow[]).forEach((s: TaskSubmissionRow) =>
                    taskSubmissions.set(s.featured_item_id, s)
                );
            }

            // Exercícios: conteúdos EXERCISE das aulas e submissões do aluno
            const lessonIds = rows
                .filter((r: FeaturedItemWithLesson) => r.kind === 'exercise' && r.lesson_id)
                .map((r: FeaturedItemWithLesson) => r.lesson_id as string);

            const contentIdsByLesson = new Map<string, string[]>();
            const exerciseSubmissions = new Map<string, ExerciseSubmissionRow>();

            if (lessonIds.length > 0) {
                const { data: contents, error: contentsError } = await supabase
                    .from('lesson_contents')
                    .select('id, lesson_id')
                    .eq('type', 'EXERCISE')
                    .in('lesson_id', lessonIds);

                if (contentsError) throw contentsError;

                const contentRows = (contents || []) as LessonContentRow[];

                contentRows.forEach((c: LessonContentRow) => {
                    contentIdsByLesson.set(c.lesson_id, [...(contentIdsByLesson.get(c.lesson_id) ?? []), c.id]);
                });

                if (contentRows.length > 0) {
                    const { data: subs, error: subsError } = await supabase
                        .from('exercise_submissions')
                        .select('content_id, status, feedback')
                        .eq('student_id', userId)
                        .in('content_id', contentRows.map((c: LessonContentRow) => c.id));

                    if (subsError) throw subsError;

                    ((subs || []) as ExerciseSubmissionRow[]).forEach((s: ExerciseSubmissionRow) =>
                        exerciseSubmissions.set(s.content_id, s)
                    );
                }
            }

            const visible: StudentFeaturedItem[] = [];

            for (const row of rows) {
                let delivered = false;
                let needsRevision = false;
                let feedback: string | null = null;

                if (row.kind === 'task') {
                    const submission = taskSubmissions.get(row.id);
                    ({ delivered, needsRevision } = isTaskDelivered(submission?.status));
                    feedback = needsRevision ? submission?.feedback ?? null : null;
                } else {
                    const contentIds = contentIdsByLesson.get(row.lesson_id ?? '') ?? [];
                    const statusByContent = new Map<string, string>();
                    contentIds.forEach((id: string) => {
                        const submission = exerciseSubmissions.get(id);
                        if (submission) statusByContent.set(id, submission.status);
                    });
                    ({ delivered, needsRevision } = isExerciseDelivered(contentIds, statusByContent));
                    if (needsRevision) {
                        const revised = contentIds
                            .map((id: string) => exerciseSubmissions.get(id))
                            .find((s) => s?.status === 'needs_revision');
                        feedback = revised?.feedback ?? null;
                    }
                }

                if (delivered) continue;

                visible.push({
                    id: row.id,
                    kind: row.kind,
                    title: row.kind === 'task' ? row.title ?? '' : row.lesson?.title ?? 'Exercício',
                    description: row.kind === 'task' ? row.description : null,
                    deadline: row.deadline,
                    created_at: row.created_at,
                    href:
                        row.kind === 'exercise' && row.lesson
                            ? `/aluno/estudar/${row.lesson.module_id}/${row.lesson.id}`
                            : null,
                    needsRevision,
                    feedback,
                });
            }

            setItems(visible.sort(compareByDeadline));
        } catch (err) {
            console.error('[useStudentFeaturedItems] Erro ao carregar destaques:', err);
            setError(err instanceof Error ? err.message : 'Erro ao carregar destaques');
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [supabase, userId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const submitTask = async (
        itemId: string,
        data: SubmitTaskData
    ): Promise<{ success: boolean; error?: string }> => {
        if (!userId) return { success: false, error: 'Usuário não autenticado' };

        try {
            const now = new Date().toISOString();

            const { error: upsertError } = await supabase
                .from('featured_item_submissions')
                .upsert(
                    {
                        featured_item_id: itemId,
                        student_id: userId,
                        content: data.content.trim() || null,
                        link_url: data.link_url.trim() || null,
                        status: 'SUBMITTED',
                        submitted_at: now,
                        updated_at: now,
                        grade: null,
                        graded_by: null,
                        graded_at: null,
                    },
                    { onConflict: 'featured_item_id,student_id' }
                );

            if (upsertError) throw upsertError;

            await fetchItems();
            return { success: true };
        } catch (err) {
            console.error('[useStudentFeaturedItems] Erro ao enviar tarefa:', err);
            return { success: false, error: 'Erro ao enviar a tarefa. Tente novamente.' };
        }
    };

    const refresh = async (): Promise<void> => {
        await fetchItems();
    };

    return { items, isLoading, error, submitTask, refresh };
}
```

- [ ] **Step 2: Escrever o modal de entrega**

Create `components/student/dashboard/FeaturedTaskSubmitDialog.tsx`:

```tsx
// components/student/dashboard/FeaturedTaskSubmitDialog.tsx
'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import type { StudentFeaturedItem } from '@/lib/types/featured-items';

interface FeaturedTaskSubmitDialogProps {
    item: StudentFeaturedItem | null;
    onClose: () => void;
    onSubmit: (
        itemId: string,
        data: { content: string; link_url: string }
    ) => Promise<{ success: boolean; error?: string }>;
}

const inputClass = cn(
    'w-full px-4 py-3 rounded-lg',
    'bg-gray-800 border border-gray-700',
    'text-white placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
);

export function FeaturedTaskSubmitDialog({ item, onClose, onSubmit }: FeaturedTaskSubmitDialogProps) {
    return (
        <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                {item && <SubmitForm key={item.id} item={item} onClose={onClose} onSubmit={onSubmit} />}
            </DialogContent>
        </Dialog>
    );
}

interface SubmitFormProps {
    item: StudentFeaturedItem;
    onClose: () => void;
    onSubmit: FeaturedTaskSubmitDialogProps['onSubmit'];
}

function SubmitForm({ item, onClose, onSubmit }: SubmitFormProps) {
    const [content, setContent] = useState<string>('');
    const [linkUrl, setLinkUrl] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim() && !linkUrl.trim()) {
            showToast('error', 'Escreva uma resposta ou informe um link');
            return;
        }

        if (linkUrl.trim() && !/^https?:\/\//i.test(linkUrl.trim())) {
            showToast('error', 'O link deve começar com http:// ou https://');
            return;
        }

        setIsSubmitting(true);
        const result = await onSubmit(item.id, { content, link_url: linkUrl });
        setIsSubmitting(false);

        if (result.success) {
            showToast('success', 'Tarefa enviada!');
            onClose();
        } else {
            showToast('error', result.error || 'Erro ao enviar a tarefa');
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>{item.title}</DialogTitle>
            </DialogHeader>

            {item.description && (
                <p className="text-sm text-gray-400 whitespace-pre-line">{item.description}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sua resposta</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escreva aqui..."
                        rows={4}
                        className={cn(inputClass, 'resize-none')}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Link (opcional)</label>
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className={inputClass}
                    />
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-500">
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Enviando...' : 'Enviar tarefa'}
                    </Button>
                </div>
            </form>
        </>
    );
}
```

- [ ] **Step 3: Escrever o bloco do dashboard**

Create `components/student/dashboard/DashboardFeatured.tsx`:

```tsx
// components/student/dashboard/DashboardFeatured.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pin, ClipboardCheck, ClipboardList, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStudentFeaturedItems } from '@/hooks/useStudentFeaturedItems';
import { formatDeadline, getDeadlineState } from '@/lib/featured-items';
import type { StudentFeaturedItem } from '@/lib/types/featured-items';
import { FeaturedTaskSubmitDialog } from './FeaturedTaskSubmitDialog';

const VISIBLE_LIMIT = 3;

interface DashboardFeaturedProps {
    userId: string | null;
}

export function DashboardFeatured({ userId }: DashboardFeaturedProps) {
    const { items, isLoading, submitTask } = useStudentFeaturedItems(userId);
    const [expanded, setExpanded] = useState<boolean>(false);
    const [submittingItem, setSubmittingItem] = useState<StudentFeaturedItem | null>(null);

    if (isLoading || items.length === 0) {
        return null;
    }

    const shown = expanded ? items : items.slice(0, VISIBLE_LIMIT);
    const hiddenCount = items.length - VISIBLE_LIMIT;

    return (
        <section className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-sky-300">
                <Pin className="h-4 w-4" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold uppercase tracking-wide">Em destaque</h2>
            </div>

            <div className="space-y-3">
                {shown.map((item: StudentFeaturedItem) => (
                    <FeaturedCard key={item.id} item={item} onSubmit={() => setSubmittingItem(item)} />
                ))}
            </div>

            {hiddenCount > 0 && (
                <button
                    type="button"
                    onClick={() => setExpanded((prev: boolean) => !prev)}
                    className="inline-flex items-center gap-1 text-sm text-sky-300 hover:text-sky-200 transition-colors"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-4 w-4" /> Mostrar menos
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4" /> Ver todos ({items.length})
                        </>
                    )}
                </button>
            )}

            <FeaturedTaskSubmitDialog
                item={submittingItem}
                onClose={() => setSubmittingItem(null)}
                onSubmit={submitTask}
            />
        </section>
    );
}

interface FeaturedCardProps {
    item: StudentFeaturedItem;
    onSubmit: () => void;
}

function FeaturedCard({ item, onSubmit }: FeaturedCardProps) {
    const isTask = item.kind === 'task';
    const Icon = isTask ? ClipboardList : ClipboardCheck;
    const deadlineState = getDeadlineState(item.deadline);

    return (
        <div className="rounded-lg bg-gray-900/60 border border-gray-800 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 flex-shrink-0">
                        <Icon className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <p className="font-medium text-white break-words">{item.title}</p>
                        {item.description && (
                            <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                        )}
                        {item.deadline && (
                            <p
                                className={cn(
                                    'inline-flex items-center gap-1 text-xs',
                                    deadlineState === 'overdue' && 'text-rose-400',
                                    deadlineState === 'soon' && 'text-amber-400',
                                    (deadlineState === 'ok' || deadlineState === 'none') && 'text-gray-500'
                                )}
                            >
                                <Clock className="h-3 w-3" strokeWidth={1.5} />
                                {deadlineState === 'overdue' ? 'Atrasado — era para ' : 'Até '}
                                {formatDeadline(item.deadline)}
                            </p>
                        )}
                        {item.needsRevision && (
                            <p className="inline-flex items-start gap-1 text-xs text-amber-400">
                                <RotateCcw className="h-3 w-3 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                                <span>
                                    Revisão solicitada{item.feedback ? `: ${item.feedback}` : ''}
                                </span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="sm:flex-shrink-0">
                    {isTask ? (
                        <Button onClick={onSubmit} className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500">
                            {item.needsRevision ? 'Reenviar' : 'Entregar'}
                        </Button>
                    ) : (
                        item.href && (
                            <Link
                                href={item.href}
                                className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
                            >
                                Ir para o exercício
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Ligar o bloco no dashboard**

Modify `app/(dashboard)/aluno/dashboard/page.tsx`.

Depois da linha `import { DashboardAnnouncements } from '@/components/student/dashboard/DashboardAnnouncements';` adicione:

```tsx
import { DashboardFeatured } from '@/components/student/dashboard/DashboardFeatured';
```

E troque:

```tsx
            {/* Avisos do Professor */}
            <DashboardAnnouncements userId={user?.id || null} />
```

por:

```tsx
            {/* Destaques do professor (tarefas e exercícios fixados) */}
            <DashboardFeatured userId={user?.id || null} />

            {/* Avisos do Professor */}
            <DashboardAnnouncements userId={user?.id || null} />
```

- [ ] **Step 5: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 6: Teste no navegador (precisa da migration e dos destaques da Task 2)**

Com o `pnpm dev` rodando, logado como **aluno** (o usuário faz o login) em `http://localhost:3000/aluno/dashboard`:
- Os destaques criados para "Todos os alunos" aparecem no bloco "Em destaque", acima dos avisos, ordenados por prazo.
- Destaque de módulo/fase/trilha **que não inclui o aluno** não aparece.
- Tarefa avulsa: "Entregar" abre o modal; enviar sem texto nem link mostra o toast de erro; enviar com texto faz o item sumir do topo.
- Exercício: "Ir para o exercício" abre a aula; depois de enviar todos os exercícios da aula, o item some.
- Redimensione para ~375px (ferramenta de viewport do navegador): cartões empilham e botões ocupam a largura toda.
- Com mais de 3 itens aparece "Ver todos (N)".

- [ ] **Step 7: Commit**

```bash
git add hooks/useStudentFeaturedItems.ts components/student/dashboard/DashboardFeatured.tsx components/student/dashboard/FeaturedTaskSubmitDialog.tsx "app/(dashboard)/aluno/dashboard/page.tsx"
git commit -m "feat(destaques): bloco de destaques no dashboard do aluno"
```

---

### Task 4: Admin — entregas e correção das tarefas avulsas

**Files:**
- Create: `components/admin/featured/FeaturedSubmissionsPanel.tsx`
- Modify: `components/admin/featured/index.ts`
- Modify: `app/(dashboard)/admin/destaques/page.tsx`

**Interfaces:**
- Consumes (Task 2): `useFeaturedItems().fetchSubmissions`, `.gradeSubmission`; `onOpenSubmissions` no cartão; estado `submissionsItem` da página.
- Consumes (Task 1): `FeaturedItemSubmissionWithStudent`, `GradeSubmissionData`, `FeaturedItemWithLesson`.

- [ ] **Step 1: Escrever o painel de entregas**

Create `components/admin/featured/FeaturedSubmissionsPanel.tsx`:

```tsx
// components/admin/featured/FeaturedSubmissionsPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { Loader2, ExternalLink, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { formatDeadline } from '@/lib/featured-items';
import type {
    FeaturedItemSubmissionWithStudent,
    FeaturedItemWithLesson,
    FeaturedSubmissionStatus,
    GradeSubmissionData,
} from '@/lib/types/featured-items';

interface FeaturedSubmissionsPanelProps {
    item: FeaturedItemWithLesson | null;
    onClose: () => void;
    fetchSubmissions: (itemId: string) => Promise<FeaturedItemSubmissionWithStudent[]>;
    gradeSubmission: (id: string, data: GradeSubmissionData) => Promise<{ success: boolean; error?: string }>;
}

const STATUS_LABEL: Record<FeaturedSubmissionStatus, { label: string; className: string }> = {
    SUBMITTED: { label: 'Aguardando correção', className: 'bg-amber-500/10 text-amber-400' },
    GRADED: { label: 'Corrigida', className: 'bg-emerald-500/10 text-emerald-400' },
    RETURNED: { label: 'Devolvida', className: 'bg-rose-500/10 text-rose-400' },
};

export function FeaturedSubmissionsPanel({
                                             item,
                                             onClose,
                                             fetchSubmissions,
                                             gradeSubmission,
                                         }: FeaturedSubmissionsPanelProps) {
    return (
        <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                {item && (
                    <PanelContent
                        key={item.id}
                        item={item}
                        fetchSubmissions={fetchSubmissions}
                        gradeSubmission={gradeSubmission}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

interface PanelContentProps {
    item: FeaturedItemWithLesson;
    fetchSubmissions: FeaturedSubmissionsPanelProps['fetchSubmissions'];
    gradeSubmission: FeaturedSubmissionsPanelProps['gradeSubmission'];
}

function PanelContent({ item, fetchSubmissions, gradeSubmission }: PanelContentProps) {
    const [submissions, setSubmissions] = useState<FeaturedItemSubmissionWithStudent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        try {
            setError(null);
            setSubmissions(await fetchSubmissions(item.id));
        } catch (err) {
            console.error('[FeaturedSubmissionsPanel] Erro ao carregar entregas:', err);
            setError('Erro ao carregar as entregas');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id]);

    return (
        <>
            <DialogHeader>
                <DialogTitle>Entregas — {item.title}</DialogTitle>
            </DialogHeader>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                </div>
            )}

            {error && <p className="text-center text-rose-400 py-6">{error}</p>}

            {!isLoading && !error && submissions.length === 0 && (
                <p className="text-center text-gray-400 py-10">Nenhuma entrega ainda.</p>
            )}

            <div className="space-y-4">
                {submissions.map((submission: FeaturedItemSubmissionWithStudent) => (
                    <SubmissionRow
                        key={submission.id}
                        submission={submission}
                        gradeSubmission={gradeSubmission}
                        onSaved={load}
                    />
                ))}
            </div>
        </>
    );
}

interface SubmissionRowProps {
    submission: FeaturedItemSubmissionWithStudent;
    gradeSubmission: FeaturedSubmissionsPanelProps['gradeSubmission'];
    onSaved: () => Promise<void>;
}

function SubmissionRow({ submission, gradeSubmission, onSaved }: SubmissionRowProps) {
    const [grade, setGrade] = useState<string>(submission.grade?.toString() ?? '');
    const [feedback, setFeedback] = useState<string>(submission.feedback ?? '');
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const status = STATUS_LABEL[submission.status];

    const save = async (nextStatus: 'GRADED' | 'RETURNED') => {
        const parsedGrade = grade.trim() === '' ? null : Number(grade.replace(',', '.'));

        if (parsedGrade !== null && (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 10)) {
            showToast('error', 'A nota deve ser um número de 0 a 10');
            return;
        }

        if (nextStatus === 'RETURNED' && !feedback.trim()) {
            showToast('error', 'Explique no feedback o que o aluno precisa revisar');
            return;
        }

        setIsSaving(true);
        const result = await gradeSubmission(submission.id, {
            status: nextStatus,
            grade: parsedGrade,
            feedback,
        });
        setIsSaving(false);

        if (result.success) {
            showToast('success', nextStatus === 'GRADED' ? 'Correção salva!' : 'Entrega devolvida para revisão');
            await onSaved();
        } else {
            showToast('error', result.error || 'Erro ao salvar correção');
        }
    };

    return (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-medium text-white truncate">{submission.student?.name ?? 'Aluno removido'}</p>
                    <p className="text-xs text-gray-500">
                        Enviado em {formatDeadline(submission.submitted_at)}
                    </p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status.className)}>
                    {status.label}
                </span>
            </div>

            {submission.content && (
                <p className="text-sm text-gray-300 whitespace-pre-line break-words">{submission.content}</p>
            )}

            {submission.link_url && (
                <a
                    href={submission.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 break-all"
                >
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    {submission.link_url}
                </a>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Nota (0-10)</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Feedback</label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" disabled={isSaving} onClick={() => save('RETURNED')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Devolver para revisão
                </Button>
                <Button disabled={isSaving} onClick={() => save('GRADED')} className="bg-emerald-600 hover:bg-emerald-500">
                    <Check className="h-4 w-4 mr-2" />
                    Salvar correção
                </Button>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Reexportar**

Modify `components/admin/featured/index.ts`, adicionando a linha:

```ts
export { FeaturedSubmissionsPanel } from './FeaturedSubmissionsPanel';
```

- [ ] **Step 3: Ligar o painel na página**

Modify `app/(dashboard)/admin/destaques/page.tsx`.

Troque o import:

```tsx
import { FeaturedItemCard, FeaturedItemForm } from '@/components/admin/featured';
```

por:

```tsx
import { FeaturedItemCard, FeaturedItemForm, FeaturedSubmissionsPanel } from '@/components/admin/featured';
```

No destructuring de `useFeaturedItems()`, adicione `fetchSubmissions,` e `gradeSubmission,` (depois de `toggleActive,`).

Troque o final:

```tsx
            {/* O painel de entregas (submissionsItem) é adicionado na Task 4 */}
            {submissionsItem && null}
```

por:

```tsx
            <FeaturedSubmissionsPanel
                item={submissionsItem}
                onClose={() => setSubmissionsItem(null)}
                fetchSubmissions={fetchSubmissions}
                gradeSubmission={gradeSubmission}
            />
```

- [ ] **Step 4: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 5: Teste no navegador (fluxo completo)**

1. Como aluno, entregue uma tarefa avulsa (Task 3).
2. Como admin, em `/admin/destaques` → "Entregas" da tarefa: a entrega aparece com nome, texto, link e "Aguardando correção".
3. "Devolver para revisão" sem feedback mostra o toast de erro. Com feedback, o status vira "Devolvida".
4. Como aluno, recarregue o dashboard: a tarefa **volta ao topo** com "Revisão solicitada: <feedback>" e botão "Reenviar". Reenvie.
5. Como admin, "Salvar correção" com nota 9,5 → status "Corrigida".
6. Como aluno, a tarefa **não aparece mais** no topo.
Expected: todos os passos se comportam como descrito.

- [ ] **Step 6: Commit**

```bash
git add components/admin/featured app/\(dashboard\)/admin/destaques
git commit -m "feat(destaques): entregas e correção de tarefas avulsas no admin"
```

---

### Task 5: Limpeza ao excluir aluno, verificação final e PR

**Files:**
- Modify: `app/api/admin/delete-student/route.ts`

- [ ] **Step 1: Incluir as entregas na limpeza**

Modify `app/api/admin/delete-student/route.ts`. Troque:

```ts
        const tablesToDelete = [
            'exercise_responses',
            'lesson_progress',
            'task_submissions',
            'enrollments',
            'payments',
        ];
```

por:

```ts
        const tablesToDelete = [
            'exercise_responses',
            'lesson_progress',
            'task_submissions',
            'featured_item_submissions',
            'enrollments',
            'payments',
        ];
```

(A tabela já tem `ON DELETE CASCADE` em `student_id`; a linha mantém a lista consistente com o spec e não causa erro, porque o loop ignora falhas.)

- [ ] **Step 2: Verificação completa**

Run, em sequência:
```bash
pnpm exec tsc --noEmit
pnpm build
```
Expected: `tsc` sem erros novos em relação à linha de base da Task 0; `pnpm build` termina com `Compiled successfully` e lista a rota `/admin/destaques`. Se o build falhar por causa de erros que **já existiam** antes da branch (compare com `git stash`/linha de base), registre-os na descrição do PR e não os corrija neste trabalho.

- [ ] **Step 3: Revisão do diff**

Run: `git diff main --stat`
Expected: só aparecem os arquivos do mapa de arquivos, mais `docs/`. Nenhum `.env*`, `.next` ou `tsconfig.tsbuildinfo`. Se `tsconfig.tsbuildinfo` aparecer modificado, desfaça com `git checkout main -- tsconfig.tsbuildinfo`.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/delete-student/route.ts
git commit -m "feat(destaques): limpar entregas de destaques ao excluir aluno"
```

- [ ] **Step 5: Subir a branch e abrir o PR**

**Antes do merge, a migration precisa estar aplicada no banco de produção do portal.** Confirme com o usuário (Task 1, Step 7), porque o deploy pelo merge publica código que consulta as tabelas novas.

Run:
```bash
git push -u origin feat/destaques-dashboard
gh pr create --title "feat: destaques de exercícios e tarefas no topo do dashboard do aluno" --body "$(cat <<'EOF'
## O que muda

O admin passa a destacar itens no topo do dashboard do aluno, como mensagens fixadas:

- **Exercício existente** (aula com conteúdos do tipo EXERCISE) ou **tarefa avulsa** (título, descrição, prazo).
- Segmentação por todos, trilha, fase ou módulo, no mesmo padrão dos avisos.
- O item some do topo do aluno quando ele entrega, o admin desativa ou a data de expiração passa.
- Se a entrega for devolvida para revisão, o item volta ao topo daquele aluno com o feedback.
- Tarefas avulsas têm entrega por texto e/ou link, com nota e feedback do admin na própria página de destaques.

## Detalhes

- Nova página `/admin/destaques` (item "Destaques" no menu do admin).
- Novo bloco "Em destaque" acima dos avisos em `/aluno/dashboard`: mostra 3 itens por prazo, com "Ver todos".
- Migration em `supabase/migrations/20261001000000_featured_items.sql`: tabelas `featured_items` e `featured_item_submissions`, constraints e RLS. A segmentação é aplicada no banco pela função `featured_in_scope`.
- Exclusão de aluno também limpa `featured_item_submissions`.
- Spec e plano em `docs/superpowers/`.

## Antes do merge

Aplicar a migration no projeto Supabase do portal.

## Como testar

1. Aplicar a migration.
2. Admin: criar um exercício destacado e uma tarefa avulsa segmentada por módulo.
3. Aluno: ver o bloco no dashboard, entregar a tarefa e conferir que ela sai do topo.
4. Admin: devolver a entrega com feedback; o item volta ao aluno. Depois, corrigir com nota.
5. Conferir no celular (~375px) que os cartões empilham.

Não há suíte de testes no projeto; a lógica pura foi checada com um script de asserções e o fluxo foi testado manualmente.
EOF
)"
```
Expected: URL do PR impressa. O corpo do PR **não** leva linha de assinatura de ferramenta, conforme pedido do usuário.

- [ ] **Step 6: Merge (autorizado pelo usuário)**

O histórico do repositório usa merge commits (`Merge pull request #51 ...`), então:

Run: `gh pr merge --merge --delete-branch`
Expected: PR mesclado. Se o GitHub bloquear por proteção de branch, exigência de revisão ou checks pendentes, **não contorne**: informe o usuário do bloqueio.

- [ ] **Step 7: Voltar para a main**

Run: `git checkout main && git pull`
Expected: `main` atualizada com o merge.

---

## Auto-revisão do plano contra o spec

- **Modelo de dados** (spec §1): Task 1, migration com as duas tabelas, constraints, unique, RLS e função de escopo.
- **Regra de visibilidade 1 a 4** (ativo/expirado, segmentação, entregue, devolvido volta): RLS e função SQL (Task 1) + `useStudentFeaturedItems` e funções puras (Tasks 1 e 3).
- **Admin: página, formulário com tipo, lista, ativar/desativar/excluir/editar** (spec §2): Task 2.
- **Painel Entregas com nota, feedback e devolução** (spec §2): Task 4.
- **Aluno: bloco acima dos avisos, 3 itens, "ver todos", cartões, modal de entrega** (spec §2): Task 3.
- **Hooks `useFeaturedItems` e `useStudentFeaturedItems`** (spec §2): Tasks 2 e 3.
- **Erros e toasts, bloco some em falha** (spec §2): hook do aluno loga e esvazia; formulários e painel usam `showToast`.
- **Mobile** (spec §2): classes `flex-col sm:flex-row` e botões `w-full sm:w-auto` nos componentes novos; checagem a 375px na Task 3.
- **Casos de borda** (spec §3): aula excluída (`ON DELETE CASCADE` da migration), alvo removido ("alvo removido" no cartão do admin), aluno excluído (Task 5), prazo vencido (rótulo "Atrasado" e item permanece).
- **Pendências do spec**: nome da tabela de submissões de exercício resolvido (`exercise_submissions`, por `content_id`); segmentação reproduzida via `enrollments`/`phases`/`modules` (sem depender de `announcements_view`); a confirmação do schema real fica para o Step 7 da Task 1, no banco do portal.
- **Consistência de nomes**: `toItemPayload`, `isExerciseDelivered`, `isTaskDelivered`, `compareByDeadline`, `getDeadlineState`, `formatDeadline`, `StudentFeaturedItem`, `FeaturedItemWithLesson`, `GradeSubmissionData`, `LessonOption` têm a mesma assinatura em todas as tasks.
