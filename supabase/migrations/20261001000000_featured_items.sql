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
