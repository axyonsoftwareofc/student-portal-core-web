# Destaques no topo do dashboard do aluno — Design

Data: 2026-10-01
Status: aguardando revisão do usuário

## Objetivo

Permitir que o admin destaque itens no topo do dashboard do aluno, como mensagens fixadas no WhatsApp. Um destaque pode ser:

- um **exercício existente** (aula do tipo `EXERCISE`), ou
- uma **tarefa avulsa**, criada só para esse fim.

Cada destaque é segmentado como os avisos (todos, trilha, fase ou módulo) e some do topo do aluno quando ele entrega.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Quem destaca | O admin |
| Tipos | Exercício existente e tarefa avulsa |
| Segmentação | `all`, `track`, `phase`, `module`, no mesmo padrão dos avisos (`target`, `target_id`) |
| Saída do topo | Admin desafixa ou o item expira; ou o aluno entrega |
| Entrega da tarefa avulsa | Texto e/ou link, com correção do admin |
| Modelagem | Tabela única `featured_items` + `featured_item_submissions` |

A tabela `tasks` antiga (tipos `Task`, `TaskSubmission` em `lib/types/database.ts`) não é usada por nenhuma tela. Ela não será reaproveitada nem removida neste trabalho.

## 1. Modelo de dados

### `featured_items`

- `id` uuid, PK.
- `kind` text, `'exercise'` ou `'task'`.
- `lesson_id` uuid, FK para a aula, `ON DELETE CASCADE`. Obrigatório quando `kind='exercise'`; nulo caso contrário.
- `title`, `description`: obrigatórios quando `kind='task'`. Em `exercise`, o título vem da aula.
- `deadline` timestamptz, opcional nos dois tipos.
- `target` (`all | track | phase | module`) e `target_id`, iguais aos avisos.
- `expires_at` timestamptz, opcional.
- `is_active` boolean.
- `created_by`, `created_at`, `updated_at`.
- Constraints `CHECK` garantem a coerência entre `kind` e os campos acima.

### `featured_item_submissions` (somente `kind='task'`)

- `id`, `featured_item_id`, `student_id`, `content`, `link_url`, `submitted_at`.
- `status`: `SUBMITTED | GRADED | RETURNED`.
- `grade`, `feedback`, `graded_by`, `graded_at`.
- Unique em (`featured_item_id`, `student_id`). Reenvio é feito por atualização.

### Regra de visibilidade para o aluno

O item aparece no topo quando todas as condições valem:

1. `is_active` e não expirado.
2. A segmentação inclui o aluno (todos, ou a trilha, fase ou módulo dele).
3. O aluno ainda não entregou. Em exercício, vale a submissão do fluxo atual de exercícios; em tarefa avulsa, uma linha em `featured_item_submissions`.
4. Se a entrega for devolvida (`RETURNED`), o item volta ao topo daquele aluno.

### Segurança (RLS)

- Aluno: lê apenas itens que valem para ele e escreve apenas a própria entrega.
- Admin: lê e escreve tudo.

## 2. Telas e código

### Admin: página `Destaques`

- Rota `app/(dashboard)/admin/destaques/page.tsx`, com item no menu em `config/navigation`.
- Lista com tipo, alvo, prazo, expiração e estado; ações de editar, desativar e excluir. Segue o padrão de `admin/avisos`.
- `FeaturedItemForm` com escolha do tipo:
  - Exercício existente: seletor de aulas `EXERCISE`, com busca.
  - Tarefa avulsa: título, descrição e prazo.
  - Em ambos: segmentação e expiração opcional.
- Cada tarefa avulsa tem um painel **Entregas**: ver quem entregou, dar nota e feedback ou devolver para revisão. Exercícios continuam sendo corrigidos onde já são hoje; a tela `correcoes` não muda.

### Aluno: bloco no dashboard

- `DashboardFeatured` (`components/student/dashboard/`), acima de `DashboardAnnouncements` em `aluno/dashboard/page.tsx`.
- Cartão com ícone do tipo, título, prazo (com destaque para atrasado ou próximo) e botão: "Ir para o exercício" (link para a aula) ou "Entregar" (modal com texto e/ou link).
- Mostra os 3 primeiros, por prazo mais próximo, com "ver todos" para expandir. Sem itens, o bloco não é renderizado.

### Hooks

- `useFeaturedItems`: CRUD do admin e consulta de entregas.
- `useStudentFeaturedItems`: lista filtrada pelas regras de visibilidade e função de entregar.

### Erros e testes

- Falha ao carregar não derruba o dashboard: o bloco some e o erro vai para o log.
- Erros de salvar e entregar aparecem como toast (`sonner`).
- O projeto não tem framework de testes. Validação com `tsc`, `lint` e `build`, mais teste manual no navegador com um aluno e um admin.

### Mobile

Componentes novos nascem responsivos: cartões empilhados e botões com área de toque confortável.

## 3. Entrega e casos de borda

### Migration

- Criar `supabase/migrations/<data>_featured_items.sql` (a pasta `supabase/` ainda não existe) com tabelas, constraints e policies de RLS.
- Aplicar no painel do Supabase ou via conector, com confirmação do usuário.

### Ordem de implementação

1. Migration e tipos TypeScript.
2. Admin: CRUD de destaques e item no menu.
3. Aluno: bloco no dashboard com a regra de visibilidade.
4. Entrega de tarefa avulsa pelo aluno e correção pelo admin.
5. Revisão final: `tsc`, `lint`, `build` e teste no navegador.

### Casos de borda

- Aula excluída: o destaque é removido junto (`ON DELETE CASCADE`).
- Trilha, fase ou módulo excluído: `target_id` fica sem referência, como nos avisos; o item não aparece para ninguém e a lista do admin mostra "alvo removido".
- Aluno excluído: adicionar `featured_item_submissions` à lista de tabelas limpas em `app/api/admin/delete-student/route.ts`.
- Prazo vencido: o item continua no topo, marcado como atrasado, até ser entregue, desafixado ou expirar.

## Fora de escopo

- Notificações push ou por e-mail ao destacar.
- Limpeza da tabela `tasks` antiga e dos tipos `Task` não usados.
- Responsividade das telas existentes (missão 2, em ciclo próprio).

## Pendências a resolver no plano

- Confirmar o nome da tabela de submissões de exercício (ver `hooks/useExerciseSubmissions.ts`).
- Ver como `announcements_view` resolve a trilha, fase e módulo do aluno, para reproduzir na segmentação.
- Confirmar o schema real no banco do portal (projeto `iysuhjerjudsyvqhmsin`). Hoje o conector Supabase só enxerga outro projeto.
