# Responsividade mobile — Sub-projeto 3: área do admin

Data: 2026-10-02
Status: aguardando revisão do usuário

## Contexto

Continuação da missão de tornar o app usável no celular. Já estão mesclados: a base compartilhada (PR #53), a tela de aula com exercícios (PR #54) e as telas de lista e perfil do aluno (PR #55). Este documento cobre o sub-projeto 3: a área do admin (`/admin/*`), incluindo as tabelas.

Telas auditadas (375px e 360px, admin logado; 768px nas principais): dashboard, alunos, leads, trilhas, fases, módulos, detalhe do módulo, aulas, aulas ao vivo, importar, correções, avisos, destaques, pagamentos, relatórios e configurações. Também foram medidos os modais de criar e editar: aluno (novo, editar, cursos, reset de senha), módulo (novo, editar), aula (nova, editor com conteúdos, visualizar), aula ao vivo, aviso, destaque, pagamento (novo, lote, marcar pago), detalhe do lead e exportação de relatórios.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Áreas de toque no admin | Regra completa de 44px, igual à da área do aluno, com o padrão `min-h-11 sm:min-h-0` (o desktop não muda) |
| Navegação do modal "Visualizar" aula | Contador "5 / 61" no celular; bolinhas só em `md+` (mesma solução do PR #54) |
| Tabela de Relatórios | Fica como está: rola dentro do próprio contêiner |
| Largura mínima alvo | 375px (também 360px) |

## Levantamento

| # | Problema | Onde | Evidência |
|---|---|---|---|
| 1 | Em 360px os cartões de Aulas ao Vivo passam da tela (borda direita em 374px): o bloco do título tem `flex-1` sem `min-w-0` | `components/admin/live-classes/LiveClassCard.tsx:87` | medido |
| 2 | No modal "Visualizar" aula, a faixa de bolinhas de navegação ocupa de 150px a 978px e passa da tela | `components/admin/lessons/LessonPreviewModal.tsx:213` | medido |
| 3 | Botão de fechar dos modais pequeno: 14×26 (texto "✕" do `Modal`), 16×16 (botão "Fechar" dos modais de aula ao vivo, aviso e destaque) e o ícone do `Dialog` compartilhado | `components/ui/Modal.tsx`, `components/ui/dialog.tsx` e modais próprios | medido |
| 4 | Áreas de toque abaixo de 44px: ações dos cartões de Alunos (20px); Editar, Excluir e Visualizar em Módulos e Aulas (22px); "Ver Fases" e "Ver Módulos" em Trilhas (22px); "Módulos" em Fases (34px); "Ver todas/todos →" no dashboard (22px); "Voltar para Módulos" (22px) e botões de ícone (32px) no detalhe do módulo; abas de Alunos (40px), Leads e Correções (38px) e Relatórios (34px); "Ver detalhes" de Leads (36px); menus ⋮ de Aulas ao Vivo e Avisos (28px); botão de ícone dos cartões de Pagamentos (32px); "Ver Gravação" (34px); "Marcar Pago" (38px); "Restaurar padrão" (22px) e botões de ícone em Configurações; "Desmarcar todos" (20px); email e telefone no detalhe do lead (22px); botões de 40 a 43px ("Novo …", Cancelar/Salvar dos formulários, status do pagamento) | vários | medido |

O que já funciona:
- Nenhuma página rola para o lado (`scrollWidth` igual à largura da tela em todas as rotas).
- As tabelas de Alunos e Pagamentos já viram cartões abaixo de `lg`; a de Relatórios rola dentro do contêiner.
- Todos os formulários medidos cabem na tela, sem conteúdo cortado na horizontal nem na vertical.
- Em 768px nada passa da tela (dashboard, alunos, aulas, aulas ao vivo, pagamentos, relatórios, módulos).

## Design

### 1. Cartões de Aulas ao Vivo
Em `LiveClassCard.tsx`, o bloco `flex items-start gap-3 flex-1` ganha `min-w-0`, e o `h3` do título ganha `[overflow-wrap:anywhere]`, para que títulos longos quebrem linha.

### 2. Modal "Visualizar" aula
Em `LessonPreviewModal.tsx`, no rodapé de navegação:
- Novo `<span className="text-sm text-gray-500 md:hidden">` com `{activeIndex + 1} / {contents.length}`.
- O contêiner das bolinhas passa a ser `hidden min-w-0 items-center gap-1 overflow-x-auto py-1 [scrollbar-width:none] md:flex [&::-webkit-scrollbar]:hidden`.
- Botões Anterior e Próximo ganham `min-h-11 shrink-0 md:min-h-0`.
- O rodapé passa de `px-6` para `px-4 sm:px-6`.

### 3. Botão de fechar dos modais
No `Dialog` compartilhado (`components/ui/dialog.tsx`), no `Modal` (`components/ui/Modal.tsx`) e nos modais próprios cujo botão de fechar mede menos de 44px, o botão ganha `inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0`. No `Dialog`, que tem posição absoluta (`right-4 top-4`), a posição no celular é ajustada para que o ícone continue alinhado ao canto (ex.: `right-1 top-1 sm:right-4 sm:top-4`). O visual no desktop não muda. A mudança também beneficia os modais do aluno que usam esses componentes.

### 4. Áreas de toque de 44px
Padrão `min-h-11 sm:min-h-0` (e `min-w-11 sm:min-w-0` em botões só de ícone), sem mudar o desktop, em todos os itens do achado 4:
- `app/(dashboard)/admin/alunos/page.tsx`: abas de status e ações dos cartões.
- `app/(dashboard)/admin/modulos/page.tsx`, `app/(dashboard)/admin/aulas/page.tsx`: ações dos cartões e links de título.
- `app/(dashboard)/admin/modulos/[id]/page.tsx`: "Voltar para Módulos", botões de ícone das aulas e "Nova Aula".
- `app/(dashboard)/admin/trilhas/page.tsx`, `app/(dashboard)/admin/fases/page.tsx`: links "Ver Fases", "Ver Módulos" e "Módulos".
- `app/(dashboard)/admin/dashboard/page.tsx`: links "Ver todas →" e "Ver todos →".
- Leads, Correções e Relatórios: abas de filtro, "Ver detalhes" e botão de ícone de Relatórios.
- `LiveClassCard.tsx` e `AnnouncementCard.tsx`: menus ⋮ e "Ver Gravação".
- Pagamentos: botão de ícone e "Marcar Pago" do cartão, "Desmarcar todos" do lote, botões de status do formulário.
- Configurações: "Restaurar padrão" e botões de ícone.
- `LeadDetailsModal.tsx`: links de email e telefone.
- Botões de 40 a 43px: se vêm do `Button` compartilhado, a altura de 44px vai no tamanho padrão dele, só abaixo de `sm`; caso contrário, em cada uso.

## Verificação

Não há suíte de testes no projeto. Verificar com:
- `pnpm exec tsc --noEmit` e `pnpm build` sem erros novos.
- No navegador, logado como admin, em 375px e 360px: nenhuma rota do admin tem conteúdo fora da tela (fora de contêineres com rolagem própria); os cartões de Aulas ao Vivo cabem em 360px; o modal "Visualizar" mostra o contador e nada passa da tela; todos os itens dos achados 3 e 4 medem pelo menos 44px de altura (e de largura, nos botões só de ícone).
- Em 768px e 1280px, conferir que nada mudou (bolinhas do modal "Visualizar" aparecem em `md+`).

## Fora de escopo

- Converter a tabela de Relatórios em cartões.
- A rota `/admin/aulas/[id]/preview`, que não tem nenhum link no código (candidata a remoção em tarefa separada).
- Acessibilidade por teclado dos menus e modais.
- Mudança de estilo visual além do necessário.

## Pendências para o plano

- Localizar os componentes com botão de fechar de 16×16 ("Fechar") e o com "✕" de 14×26 (provavelmente `Modal.tsx`), e conferir os demais modais próprios listados por `fixed inset-0` em `components/admin/`.
- Confirmar de onde vêm os botões de 40 a 43px (`Button` compartilhado ou classes próprias) antes de mexer no tamanho padrão.
- A branch `feat/mobile-admin` já foi criada a partir da `main` atualizada.
