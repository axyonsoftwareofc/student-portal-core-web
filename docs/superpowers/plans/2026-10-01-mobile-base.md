# Responsividade mobile — Base compartilhada — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir no celular (375px, e também 360px) os problemas dos layouts compartilhados do dashboard: rolagem horizontal, menu `fixed` sobre o header, `Dialog` sem limite de altura, `h-screen`, áreas de toque pequenas e código morto.

**Architecture:** Mudanças pequenas e independentes em componentes de base. O estado do drawer de navegação passa a viver em um `MobileNavProvider` (contexto React) colocado em `app/(dashboard)/layout.tsx`, de onde o header (botão hambúrguer) e o `Sidebar` (o `Sheet` do drawer) o leem. As demais correções são ajustes de classes Tailwind.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, Radix (`Dialog`/`Sheet`), pnpm.

## Global Constraints

- Largura mínima alvo: 375px, e também deve caber em 360px, sem rolagem horizontal da página.
- Desktop (1280px) não pode mudar: sidebar fixa visível e sem botão hambúrguer.
- Navegação no celular: hambúrguer e drawer, com o botão **dentro do header** (sem `position: fixed` e sem `ml-12` no logo); área de toque de 44px.
- `Dialog`: largura `w-[calc(100%-2rem)]`, `max-h-[calc(100dvh-2rem)]`, `overflow-y-auto`, padding `p-4 sm:p-6`. Usos que já passam `max-h-[90vh] overflow-y-auto` continuam funcionando.
- `h-screen` vira `h-dvh` apenas nos layouts do dashboard (aluno e admin).
- Sem mudança de estilo visual além do necessário para caber; sem componente de tabela compartilhado e sem barra de navegação inferior (fora de escopo).
- O projeto não tem framework de testes nem config de ESLint. Verificação: `pnpm exec tsc --noEmit` (baseline: 0 erros), `pnpm build` e medição no navegador. Não adicionar dependências.
- Código novo segue o estilo do repositório: indentação de 4 espaços, aspas duplas nos arquivos que já as usam (`sidebar.tsx`, `dashboard-header.tsx`, `DashboardFooter.tsx`, `page-header.tsx`, layouts) e aspas simples nos demais, comentários curtos em português.
- Commits sem linhas de coautoria e sem menção a ferramentas de IA, no usuário `wernersaboia-code`.

## Ajuste em relação ao spec

O spec diz que "os dois layouts envolvem o conteúdo com o provider". Em vez disso, o provider fica **uma vez** em `app/(dashboard)/layout.tsx` (hoje um passthrough `<>{children}</>`), que já envolve `/aluno/*` e `/admin/*`. O resultado é o mesmo, sem duplicar código nem reindentar os layouts.

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `app/(dashboard)/aluno/layout.tsx` | Modificar | `h-dvh` e `overflow-x-hidden` no `<main>` |
| `app/(dashboard)/admin/layout.tsx` | Modificar | `h-dvh` e `overflow-x-hidden` no `<main>` |
| `contexts/MobileNavContext.tsx` | Criar | Estado do drawer de navegação |
| `app/(dashboard)/layout.tsx` | Modificar | Provedor do contexto |
| `components/dashboard/dashboard-header.tsx` | Modificar | Botão hambúrguer no header |
| `components/dashboard/sidebar.tsx` | Modificar | Remove o botão `fixed`; `Sheet` usa o contexto |
| `components/ui/dialog.tsx` | Modificar | Largura e altura máximas no celular |
| `components/common/page-header.tsx` | Modificar | Ações quebram linha e ocupam a largura toda no celular |
| `components/dashboard/DashboardFooter.tsx` | Modificar | Área de toque dos links |
| `components/dashboard/AdminSidebar.tsx`, `DashboardSidebar.tsx`, `MobileMenu.tsx` | Remover | Código morto |

---

### Task 0: Branch e linha de base

**Files:** nenhum arquivo do projeto muda.

- [ ] **Step 1: Confirmar que o PR de destaques foi mesclado**

Run: `gh pr view 52 --repo axyonsoftwareofc/student-portal-core-web --json state,mergedAt`
Expected: `"state":"MERGED"`. Se não estiver mesclado, **pare** e avise o usuário: esta missão parte da `main` depois desse merge.

- [ ] **Step 2: Atualizar a main e criar a branch**

Run:
```bash
git checkout main && git pull && git checkout -b feat/mobile-base
```
Expected: `Switched to a new branch 'feat/mobile-base'`. Os arquivos não rastreados `docs/superpowers/specs/2026-10-01-mobile-base-design.md` e `docs/superpowers/plans/2026-10-01-mobile-base.md` acompanham a troca de branch.

- [ ] **Step 3: Conferir a identidade de commit do repositório**

Run: `git config user.name && git config user.email`
Expected: `wernersaboia-code` e `193748113+wernersaboia-code@users.noreply.github.com`. Se vier vazio, configure:
```bash
ID=$(gh api user --jq .id) && git config user.name "wernersaboia-code" && git config user.email "${ID}+wernersaboia-code@users.noreply.github.com"
```

- [ ] **Step 4: Linha de base de tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 5: Commit do spec e do plano**

```bash
git add docs/superpowers/specs/2026-10-01-mobile-base-design.md docs/superpowers/plans/2026-10-01-mobile-base.md
git commit -m "docs: spec e plano da base mobile (sub-projeto 1)"
```

---

### Task 1: Rolagem horizontal e altura dinâmica nos layouts

**Files:**
- Modify: `app/(dashboard)/aluno/layout.tsx`
- Modify: `app/(dashboard)/admin/layout.tsx`

**Interfaces:** nenhuma (só classes).

- [ ] **Step 1: Layout do aluno**

Em `app/(dashboard)/aluno/layout.tsx`, troque a linha do contêiner raiz do layout principal (a que está logo depois do bloco `if (isSuspended) { ... }`; **não** mexa na tela de suspensão, que usa `min-h-screen`):

```tsx
        <div className="flex h-screen flex-col bg-gray-950">
```

por:

```tsx
        <div className="flex h-dvh flex-col bg-gray-950">
```

E troque:

```tsx
                <main className="relative flex-1 overflow-y-auto">
```

por:

```tsx
                <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
```

- [ ] **Step 2: Layout do admin**

Em `app/(dashboard)/admin/layout.tsx`, faça as mesmas duas trocas:

```tsx
        <div className="flex h-screen flex-col bg-gray-950">
```
→
```tsx
        <div className="flex h-dvh flex-col bg-gray-950">
```

```tsx
                <main className="relative flex-1 overflow-y-auto">
```
→
```tsx
                <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
```

- [ ] **Step 3: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/aluno/layout.tsx" "app/(dashboard)/admin/layout.tsx"
git commit -m "fix(mobile): evitar rolagem horizontal e usar altura dinâmica nos layouts"
```

---

### Task 2: Botão do menu dentro do header

**Files:**
- Create: `contexts/MobileNavContext.tsx`
- Modify: `app/(dashboard)/layout.tsx`
- Modify: `components/dashboard/dashboard-header.tsx`
- Modify: `components/dashboard/sidebar.tsx`

**Interfaces:**
- Produces: `MobileNavProvider` e `useMobileNav(): { isOpen: boolean; setIsOpen: (open: boolean) => void }` (em `@/contexts/MobileNavContext`). `useMobileNav` lança erro fora do provider.

- [ ] **Step 1: Criar o contexto**

Create `contexts/MobileNavContext.tsx`:

```tsx
// contexts/MobileNavContext.tsx
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface MobileNavContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(undefined);

// Estado do drawer de navegação, compartilhado entre o header (botão) e o Sidebar (Sheet)
export function MobileNavProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </MobileNavContext.Provider>
    );
}

export function useMobileNav(): MobileNavContextType {
    const context = useContext(MobileNavContext);

    if (!context) {
        throw new Error('useMobileNav deve ser usado dentro de MobileNavProvider');
    }

    return context;
}
```

- [ ] **Step 2: Colocar o provider no layout do dashboard**

Substitua todo o conteúdo de `app/(dashboard)/layout.tsx` por:

```tsx
// app/(dashboard)/layout.tsx
import { MobileNavProvider } from "@/contexts/MobileNavContext";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return <MobileNavProvider>{children}</MobileNavProvider>;
}
```

- [ ] **Step 3: Remover o botão `fixed` e usar o contexto no Sidebar**

Em `components/dashboard/sidebar.tsx`:

1. Remova a linha `import { useState } from "react";`.
2. Troque `import { Menu, GraduationCap, Shield, Sparkles } from "lucide-react";` por `import { GraduationCap, Shield, Sparkles } from "lucide-react";`.
3. Remova a linha `import { Button } from "@/components/ui/button";`.
4. Depois de `import { type NavItem } from "@/config/navigation";` adicione:
```tsx
import { useMobileNav } from "@/contexts/MobileNavContext";
```
5. Troque `const [isOpen, setIsOpen] = useState(false);` por:
```tsx
    const { isOpen, setIsOpen } = useMobileNav();
```
6. Remova o bloco do botão fixo, do comentário até o `</Button>` (inclusive a linha em branco depois):
```tsx
            {/* ==================== MOBILE TRIGGER (TOPO ESQUERDO) ==================== */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="fixed left-4 top-3 z-50 h-10 w-10 rounded-lg bg-gray-900/90 border border-gray-800 shadow-lg backdrop-blur-sm hover:bg-gray-800 lg:hidden"
                aria-label="Abrir menu de navegação"
            >
                <Menu className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
            </Button>
```
O `Sheet` (`<Sheet open={isOpen} onOpenChange={setIsOpen}>`) e o resto continuam iguais.

- [ ] **Step 4: Botão hambúrguer no header**

Em `components/dashboard/dashboard-header.tsx`:

1. No import de `lucide-react`, adicione `Menu,` à lista (por exemplo, depois de `GraduationCap,`).
2. Depois do import de `@/contexts/AuthContext`, adicione:
```tsx
import { Button } from "@/components/ui/button";
import { useMobileNav } from "@/contexts/MobileNavContext";
```
3. Logo abaixo de `const { user, logout } = useAuth();` (e **antes** de `if (!user) return null;`, por causa da regra dos hooks) adicione:
```tsx
    const { setIsOpen } = useMobileNav();
```
4. Troque o bloco do logo, do comentário `{/* Logo - com margem à esquerda no mobile para o botão do menu */}` até o `</Link>` correspondente, por:
```tsx
                    <div className="flex items-center gap-2">
                        {/* Botão do menu (drawer): só no mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(true)}
                            className="h-11 w-11 rounded-lg text-gray-300 hover:bg-gray-800/50 lg:hidden"
                            aria-label="Abrir menu de navegação"
                        >
                            <Menu className="h-5 w-5" strokeWidth={1.5} />
                        </Button>

                        {/* Logo */}
                        <Link
                            href={dashboardLink}
                            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600">
                                <GraduationCap className="h-4 w-4 text-white" strokeWidth={2} />
                            </div>
                            <span className="hidden sm:inline font-nacelle text-lg font-semibold text-white">
                                {isAdmin ? "Code Plus Admin" : "Code Plus"}
                            </span>
                        </Link>
                    </div>
```
O `<DropdownMenu>` do usuário (à direita) continua igual. Mantenha `<div className="flex h-14 sm:h-16 items-center justify-between">` como pai: o novo `div` e o `DropdownMenu` são seus dois filhos.

- [ ] **Step 5: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros. Se aparecer `useState`/`Button`/`Menu` "declared but never used" em `sidebar.tsx`, confirme que os passos 3.1 a 3.3 foram aplicados.

- [ ] **Step 6: Commit**

```bash
git add contexts/MobileNavContext.tsx "app/(dashboard)/layout.tsx" components/dashboard/dashboard-header.tsx components/dashboard/sidebar.tsx
git commit -m "fix(mobile): mover o botão do menu para dentro do header"
```

---

### Task 3: Dialog, PageHeader e rodapé

**Files:**
- Modify: `components/ui/dialog.tsx`
- Modify: `components/common/page-header.tsx`
- Modify: `components/dashboard/DashboardFooter.tsx`

**Interfaces:** nenhuma nova. A API de `DialogContent`, `PageHeader` e `DashboardFooter` não muda.

- [ ] **Step 1: Dialog**

Em `components/ui/dialog.tsx`, dentro de `DialogContent`, na string de classes do `DialogPrimitive.Content`, troque este trecho:

```
grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-800 bg-gray-900 p-6 shadow-lg
```

por:

```
grid w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border border-gray-800 bg-gray-900 p-4 shadow-lg sm:p-6
```

O resto da string (`duration-200 data-[state=open]:animate-in ...`) e o `sizeClasses` ficam como estão.

- [ ] **Step 2: PageHeader**

Em `components/common/page-header.tsx`:

1. Troque `<div className="flex items-center gap-2">` (o contêiner das ações) por:
```tsx
                <div className="flex flex-wrap items-center gap-2">
```
2. No `className` do `<button>` das ações, troque a primeira string
```tsx
                                    "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors",
```
por:
```tsx
                                    "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-colors sm:w-auto",
```

- [ ] **Step 3: Rodapé**

Em `components/dashboard/DashboardFooter.tsx`, troque o bloco dos links:

```tsx
                    <div className="flex gap-6">
                        <a href="#" className="transition-colors hover:text-gray-300">
                            Suporte
                        </a>
                        <a href="#" className="transition-colors hover:text-gray-300">
                            Privacidade
                        </a>
                    </div>
```

por:

```tsx
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="inline-flex min-h-11 items-center transition-colors hover:text-gray-300 sm:min-h-0"
                        >
                            Suporte
                        </a>
                        <a
                            href="#"
                            className="inline-flex min-h-11 items-center transition-colors hover:text-gray-300 sm:min-h-0"
                        >
                            Privacidade
                        </a>
                    </div>
```

- [ ] **Step 4: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 5: Commit**

```bash
git add components/ui/dialog.tsx components/common/page-header.tsx components/dashboard/DashboardFooter.tsx
git commit -m "fix(mobile): limites do Dialog, ações do PageHeader e toque no rodapé"
```

---

### Task 4: Remover código morto e verificar o build

**Files:**
- Remove: `components/dashboard/AdminSidebar.tsx`
- Remove: `components/dashboard/DashboardSidebar.tsx`
- Remove: `components/dashboard/MobileMenu.tsx`

- [ ] **Step 1: Confirmar que ninguém os importa**

Run:
```bash
grep -rEn "AdminSidebar|DashboardSidebar|MobileMenu" app components contexts hooks lib config utils middleware.ts --include=*.ts --include=*.tsx | grep -vE "^components/dashboard/(AdminSidebar|DashboardSidebar|MobileMenu)\.tsx"
```
Expected: nenhuma linha de saída. Se aparecer algum import, **não apague** esse arquivo e reporte.

- [ ] **Step 2: Remover os arquivos**

Run:
```bash
git rm components/dashboard/AdminSidebar.tsx components/dashboard/DashboardSidebar.tsx components/dashboard/MobileMenu.tsx
```
Expected: três arquivos removidos.

- [ ] **Step 3: Tipos e build**

Run, em sequência:
```bash
pnpm exec tsc --noEmit
pnpm build
```
Expected: `tsc` com 0 erros e `pnpm build` terminando com `Compiled successfully`. Se o build falhar, mostre o erro e diga se vem de arquivos desta branch (`git diff main --stat`); não corrija problemas que já existiam antes da branch.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: remover componentes de navegação sem uso"
```

---

### Task 5: Verificação no navegador, PR e merge

Esta task é executada pelo controlador (precisa da sessão logada do usuário no navegador embutido); não delegue a um subagente.

- [ ] **Step 1: Servidor de desenvolvimento e sessões**

O `pnpm dev` deve estar rodando em `http://localhost:3000` (suba com `pnpm dev` em segundo plano se não estiver, e reinicie-o depois do `git checkout`, já que os arquivos mudaram). Peça ao usuário para estar logado como **aluno** no navegador embutido.

- [ ] **Step 2: Medir as rotas do aluno em 375px e 360px**

Defina o viewport (`resize_window` com 375×812 e depois 360×800). Para cada rota abaixo, navegue e execute o script de medição:

Rotas: `/aluno/dashboard`, `/aluno/estudar`, `/aluno/trilhas`, `/aluno/journey`, `/aluno/aulas-ao-vivo`, `/aluno/notas`, `/aluno/desempenho`, `/aluno/forum`, `/aluno/comunidade`, `/aluno/perfil`.

Script (sem esconder a decoração, para provar que ela agora é cortada):

```js
await new Promise(r => setTimeout(r, 2500));
const m = document.querySelector('main');
const trigger = document.querySelector('button[aria-label="Abrir menu de navegação"]');
const tr = trigger?.getBoundingClientRect();
({
    path: location.pathname,
    innerWidth,
    mainClientW: m.clientWidth,
    mainScrollW: m.scrollWidth,
    docScrollW: document.documentElement.scrollWidth,
    rootHeightMatchesViewport: Math.abs(document.querySelector('main').closest('.h-dvh').getBoundingClientRect().height - innerHeight) <= 1,
    trigger: trigger ? { position: getComputedStyle(trigger).position, w: tr.width, h: tr.height, inHeader: !!trigger.closest('header') } : null,
    footerLinkHeights: [...document.querySelectorAll('footer a')].map(a => Math.round(a.getBoundingClientRect().height)),
})
```

Expected, em todas as rotas e nas duas larguras: `mainScrollW === mainClientW`, `docScrollW === innerWidth`, `rootHeightMatchesViewport: true`, `trigger.position` diferente de `fixed`, `trigger.inHeader: true`, `trigger.w` e `trigger.h` iguais a 44, e `footerLinkHeights` com todos os valores ≥ 44.

- [ ] **Step 3: Drawer**

Em 375px, em `/aluno/dashboard`: clique no botão hambúrguer do header → o drawer abre com os itens de navegação; clique em um item → navega e o drawer fecha; reabra e feche pelo "X"/overlay. Tire um screenshot do drawer aberto.

- [ ] **Step 4: Admin e Dialog**

Peça ao usuário para trocar a sessão do navegador para uma conta de **admin**. Meça, nas mesmas larguras, `/admin/dashboard`, `/admin/alunos`, `/admin/pagamentos`, `/admin/destaques`: o critério `mainScrollW === mainClientW` vale para todas. Em `/admin/destaques` (ou `/admin/avisos`), abra "Novo ..." e meça o diálogo:

```js
const d = document.querySelector('[role="dialog"]');
const r = d.getBoundingClientRect();
({ left: r.left, right: innerWidth - r.right, top: r.top, bottom: innerHeight - r.bottom, height: r.height, scrollable: d.scrollHeight > d.clientHeight })
```
Expected: `left` e `right` ≥ 16, `top` e `bottom` ≥ 16 e o diálogo não passa da altura da tela (com `scrollable: true` se o conteúdo for maior). Tire um screenshot.

Observação: as tabelas do admin (`/admin/pagamentos` e outras) podem ter rolagem horizontal **dentro do próprio contêiner** da tabela (`overflow-x-auto`); isso é esperado e é tratado no sub-projeto do admin. O critério acima mede o `<main>`.

- [ ] **Step 5: Desktop**

Defina o viewport para 1280×800 (`resize_window` com largura e altura). Em `/aluno/dashboard` e `/admin/dashboard`, confirme com `getComputedStyle`/screenshot que: a sidebar fixa está visível (`aside` com largura 256px), o botão hambúrguer está oculto (`display: none`) e não há mudança de layout visível. Depois restaure o viewport com `resize_window` preset `desktop`.

- [ ] **Step 6: Revisão do diff**

Run: `git diff main --stat`
Expected: só aparecem os arquivos do mapa de arquivos e os dois documentos em `docs/`. Nenhum `.env*`, `.next` ou `tsconfig.tsbuildinfo`; se `tsconfig.tsbuildinfo` aparecer, desfaça com `git checkout main -- tsconfig.tsbuildinfo`.

- [ ] **Step 7: Subir a branch e abrir o PR**

Run:
```bash
git push -u origin feat/mobile-base
gh pr create --repo axyonsoftwareofc/student-portal-core-web --base main --head feat/mobile-base --title "fix(mobile): base compartilhada para o celular" --body "$(cat <<'EOF'
## O que muda

Primeiro de quatro sub-projetos para tornar o app usável no celular (375px). Este cobre os layouts e componentes compartilhados do dashboard:

- **Rolagem horizontal:** a ilustração decorativa estourava o `<main>` (822px numa tela de 375px) em todas as páginas do dashboard. O `<main>` agora corta o excesso.
- **Menu:** o botão do drawer era `fixed` sobre o header, com `ml-12` no logo para abrir espaço. Agora fica dentro do header (44px), com o estado do drawer em um `MobileNavProvider`.
- **Dialog:** largura com margem lateral, altura máxima e scroll interno por padrão.
- **Altura:** layouts do dashboard usam `h-dvh` em vez de `h-screen` (barra de endereço do Safari no iPhone).
- **PageHeader e rodapé:** ações quebram linha e ocupam a largura toda no celular; links do rodapé com área de toque de 44px.
- **Código morto:** removidos `AdminSidebar`, `DashboardSidebar` e `MobileMenu`, que nenhum arquivo importava.

Spec e plano em `docs/superpowers/`. Os próximos sub-projetos tratam das telas do aluno, do admin e das páginas públicas.

## Como testar

1. Abrir o app logado em 375px (e 360px): nenhuma página do dashboard rola para o lado.
2. O hambúrguer no header abre o drawer; escolher um item navega e fecha.
3. No admin, abrir um diálogo (por exemplo "Novo Destaque"): cabe na tela, com scroll interno se for alto.
4. Em 1280px nada muda: sidebar fixa visível e sem hambúrguer.

Verificação feita: `tsc --noEmit` sem erros, `next build` ok e medição no navegador nas rotas do aluno e do admin. Não há suíte de testes no projeto.
EOF
)"
```
Expected: URL do PR impressa, sem assinatura de ferramenta no corpo.

- [ ] **Step 8: Merge (autorizado pelo usuário)**

O histórico usa merge commits, então:

Run: `gh pr merge --merge --delete-branch`
Expected: PR mesclado. Se o GitHub bloquear por proteção de branch, revisão exigida ou checks pendentes, **não contorne**: informe o usuário.

- [ ] **Step 9: Voltar para a main**

Run: `git checkout main && git pull`
Expected: `main` atualizada com o merge.

---

## Auto-revisão do plano contra o spec

- **§1 Rolagem horizontal:** Task 1, `overflow-x-hidden` nos dois `<main>`.
- **§2 Menu no header:** Task 2 (contexto, provider, botão no header sem `fixed`/`ml-12`, `Sheet` controlado). Ajuste documentado: provider em `app/(dashboard)/layout.tsx`.
- **§3 Dialog:** Task 3, Step 1.
- **§4 Altura:** Task 1, `h-dvh` nos dois layouts.
- **§5 Toque no rodapé:** Task 3, Step 3.
- **§6 PageHeader:** Task 3, Step 2.
- **§7 Código morto:** Task 4, com a confirmação prévia de que ninguém importa.
- **Verificação do spec** (`tsc`, `build`, 375/360px aluno e admin, drawer, Dialog, desktop 1280px): Task 4 (build) e Task 5.
- **Pendências do spec:** usos do `Dialog` verificados (cinco, todos com `className` de `max-w`/`max-h` que se sobrepõem de forma compatível; nenhum usa `size="full"`); componentes mortos sem importadores (conferido por busca e reconferido na Task 4); a missão parte da `main` após o merge do PR #52 (Task 0, Step 1).
- **Consistência de nomes:** `MobileNavProvider`, `useMobileNav`, `isOpen`, `setIsOpen` e o `aria-label="Abrir menu de navegação"` são os mesmos nas Tasks 2 e 5.
