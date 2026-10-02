# Responsividade mobile — Sub-projeto 1: base compartilhada

Data: 2026-10-01
Status: aguardando revisão do usuário

## Contexto: a missão e sua divisão

Missão: tornar o app (portal do aluno e admin, páginas de login e landing) usável no celular. O escopo é grande demais para um único plano, então foi dividido em quatro sub-projetos, cada um com levantamento visual, plano e PR próprios:

1. **Base compartilhada** (este documento): layouts do dashboard, header, drawer de navegação, `Dialog`, `PageHeader`, rodapé.
2. **Área do aluno** (`/aluno/*`).
3. **Área do admin** (`/admin/*`), incluindo as tabelas.
4. **Páginas públicas** (landing, login, cadastro, recuperação de senha).

A ordem importa: os sub-projetos 2 a 4 usam o que o 1 entrega.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Escopo da missão | Tudo: aluno, admin, páginas públicas |
| Ordem | Base, aluno, admin, páginas públicas |
| Tabelas no celular | Caso a caso: cartões nas listas principais, rolagem horizontal nas tabelas densas. Não há componente de tabela compartilhado nesta etapa |
| Navegação no celular | Manter hambúrguer e drawer, com o botão dentro do header (sem `fixed` e sem `ml-12` no logo) |
| Largura mínima alvo | 375px (também deve caber em 360px) |

## Levantamento visual (375px, aluno logado)

Medido no navegador, rotas do aluno e layout compartilhado:

| # | Problema | Onde | Evidência |
|---|---|---|---|
| 1 | Rolagem horizontal em todas as páginas do dashboard: a ilustração decorativa (846px) estoura o `<main>`; `scrollWidth` 822px para tela de 375px | layouts do aluno e do admin | medido; volta a 375 ao esconder a decoração |
| 2 | Botão do menu `fixed` sobre o header; logo com `ml-12` para abrir espaço | `components/dashboard/sidebar.tsx`, `dashboard-header.tsx` | medido (`position: fixed`) |
| 3 | `Dialog` sem altura máxima e sem margem lateral (`w-full`, `p-6`, sem scroll); cada uso precisa lembrar de `max-h` | `components/ui/dialog.tsx` | lido no código |
| 4 | `h-screen` nos layouts: no Safari do iPhone o conteúdo fica atrás da barra de endereço | layouts do aluno e do admin | lido no código |
| 5 | Área de toque pequena: links "Suporte" e "Privacidade" do rodapé com 22px de altura | `components/dashboard/DashboardFooter.tsx` | medido |
| 6 | Código morto: `AdminSidebar`, `DashboardSidebar`, `MobileMenu` não são usados | `components/dashboard/` | busca no código |

Sem overflow nas telas: estudar, trilhas, jornada, aulas ao vivo, fórum, comunidade, notas, desempenho e perfil. A conta de teste tinha poucos dados, então listas cheias, cartões do fórum e a tela de aula não foram exercitados (ficam para o sub-projeto 2). As abas de Desempenho têm 22px de altura (também sub-projeto 2).

## Design

### 1. Rolagem horizontal
`overflow-x-hidden` no `<main>` dos layouts do aluno (`app/(dashboard)/aluno/layout.tsx`) e do admin (`app/(dashboard)/admin/layout.tsx`).

### 2. Menu no header
- Novo `MobileNavProvider` em `contexts/MobileNavContext.tsx`, expondo `isOpen` e `setIsOpen` por um hook `useMobileNav()`.
- Os dois layouts envolvem o conteúdo com o provider.
- `DashboardHeader` ganha o botão hambúrguer: visível abaixo de `lg`, área de toque de 44px, sem `position: fixed`, à esquerda do logo. O logo perde o `ml-12`.
- `Sidebar` mantém só o `Sheet` do drawer, controlado pelo contexto. O botão `fixed` é removido de `sidebar.tsx`.
- Alternativa descartada: passar o estado por props pelos layouts, que repete código nos dois e acopla mais.

### 3. `Dialog`
Em `components/ui/dialog.tsx`: largura `w-[calc(100%-2rem)]`, `max-h-[calc(100dvh-2rem)]`, `overflow-y-auto` e padding `p-4 sm:p-6`. Os usos que já passam `max-h-[90vh] overflow-y-auto` continuam funcionando.

### 4. Altura
`h-screen` vira `h-dvh` nos layouts do dashboard (aluno e admin).

### 5. Toque no rodapé
Em `DashboardFooter.tsx`, os links ganham área de pelo menos 44px de altura no celular.

### 6. `PageHeader`
Em `components/common/page-header.tsx`, o contêiner de ações passa a quebrar linha (`flex-wrap`) e os botões ocupam a largura toda no celular (`w-full sm:w-auto`).

### 7. Código morto
Remover `AdminSidebar.tsx`, `DashboardSidebar.tsx` e `MobileMenu.tsx` (confirmar de novo, antes de apagar, que nada os importa).

## Verificação

Não há suíte de testes no projeto. Verificar com:
- `pnpm exec tsc --noEmit` e `pnpm build` sem erros novos.
- No navegador, em 375px e 360px, logado como aluno e como admin: `main.scrollWidth` igual a `clientWidth` em todas as rotas do aluno e nas principais do admin; drawer abrindo e fechando pelo botão do header; um `Dialog` (o de destaques, no admin) cabendo na tela, com scroll interno quando alto.
- Em 1280px, conferir que nada mudou no desktop: sidebar fixa visível e sem botão hambúrguer.

## Fora de escopo

- Correções dentro das telas do aluno, do admin e das páginas públicas (sub-projetos 2 a 4).
- Componente de tabela compartilhado e barra de navegação inferior.
- Mudança de estilo visual além do necessário para o layout caber.

## Pendências para o plano

- Confirmar quais usos do `Dialog` passam `size="full"` ou classes próprias que possam conflitar com a nova largura e altura máximas.
- Confirmar que `MobileMenu`, `AdminSidebar` e `DashboardSidebar` realmente não são importados por nenhum arquivo, nem por import dinâmico.
- A missão parte da `main` em uma branch nova, depois do merge do PR de destaques (#52), para os layouts não conflitarem.
