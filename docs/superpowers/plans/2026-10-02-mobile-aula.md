# Responsividade mobile — Tela de aula e exercícios (2a) — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a tela de aula e os exercícios interativos usáveis no celular (375px e 360px): "Próximo" e "Voltar ao módulo" alcançáveis, áreas de toque de 44px, exercícios "Conectar" e "Classificar" cabendo na tela, e "Classificar" funcionando por toque.

**Architecture:** Só ajustes de classes Tailwind e um pequeno estado novo em `CategorizeExercise` (item selecionado para classificar por toque). Nenhum componente novo, nenhuma dependência.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, pnpm.

## Global Constraints

- Largura mínima alvo: 375px, e também deve caber em 360px, sem nenhum elemento fora da tela (fora de contêineres com rolagem própria, como a faixa de chips dos conteúdos).
- Barra de navegação de baixo no celular: `Anterior`, contador `{índice+1} / {total}` e `Próximo` (ou "Voltar ao módulo" no último). As bolinhas aparecem só a partir de `md`.
- Áreas de toque de pelo menos 44px de altura no celular para: `Anterior`, `Próximo`/"Voltar ao módulo", links do breadcrumb e botão de anotações. No desktop (`md`/`sm` para cima) o aspecto visual não muda.
- "Classificar": categorias em 1 coluna no celular e, de `sm` para cima, `min(nº de categorias, 3)` colunas; tocar num item o seleciona e tocar numa categoria o coloca lá; o arrastar continua funcionando no desktop.
- Sem mudança de estilo visual além do necessário; sem biblioteca de gestos; não mexer em tipos de exercício que não tiveram overflow.
- O projeto não tem framework de testes nem config de ESLint. Verificação: `pnpm exec tsc --noEmit` (baseline: 0 erros), `pnpm build` e medição no navegador. Não adicionar dependências.
- Código novo segue o estilo do repositório: indentação de 4 espaços, aspas simples nos arquivos de `components/` e `app/(dashboard)/aluno/`, comentários curtos em português.
- Commits sem linhas de coautoria e sem menção a ferramentas de IA, no usuário `wernersaboia-code`.

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `app/(dashboard)/aluno/estudar/[modulo]/[aula]/page.tsx` | Modificar | Barra de navegação de baixo, breadcrumb e botão de anotações |
| `components/common/markdown-renderer.tsx` | Modificar | Código inline quebra linha |
| `components/student/exercises/InteractiveExercise.tsx` | Modificar | `MatchingExercise` e `CategorizeExercise` |

---

### Task 0: Branch e linha de base

**Files:** nenhum arquivo do projeto muda.

- [ ] **Step 1: Confirmar a branch e a identidade**

Run: `git branch --show-current && git config user.name && git config user.email && git status --short`
Expected: `feat/mobile-aula`, `wernersaboia-code`, `193748113+wernersaboia-code@users.noreply.github.com`, e só aparecem como não rastreados os arquivos de `docs/superpowers/` desta missão. Se a branch não for `feat/mobile-aula`, crie-a a partir da `main` atualizada: `git checkout main && git pull && git checkout -b feat/mobile-aula`.

- [ ] **Step 2: Linha de base de tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 3: Commit do spec e do plano**

```bash
git add docs/superpowers/specs/2026-10-02-mobile-aula-design.md docs/superpowers/plans/2026-10-02-mobile-aula.md
git commit -m "docs: spec e plano da tela de aula no celular (sub-projeto 2a)"
```

---

### Task 1: Barra de navegação, breadcrumb e anotações

**Files:**
- Modify: `app/(dashboard)/aluno/estudar/[modulo]/[aula]/page.tsx` (bloco do breadcrumb e das anotações, ~linhas 238-273, e "Navigation Footer", ~linhas 371-415)

**Interfaces:** nenhuma nova. As variáveis `activeContentIndex`, `contents`, `goToPrev`, `goToNext`, `goToContent` e `moduloId` já existem no arquivo.

- [ ] **Step 1: Breadcrumb e botão de anotações**

Leia o arquivo e aplique as três trocas abaixo (os textos são exatos; o JSX tem indentação irregular em alguns trechos, então localize cada um pelo conteúdo).

1. No primeiro `<Link href="/aluno/estudar" ...>`, troque o `className`:
```tsx
className="text-gray-500 hover:text-sky-400 transition-colors flex-shrink-0"
```
por:
```tsx
className="text-gray-500 hover:text-sky-400 transition-colors flex-shrink-0 py-3 sm:py-0"
```

2. No `<Link href={`/aluno/estudar/${moduloId}`} ...>`, troque o `className`:
```tsx
className="text-gray-500 hover:text-sky-400 transition-colors truncate max-w-[120px] sm:max-w-[200px]"
```
por:
```tsx
className="text-gray-500 hover:text-sky-400 transition-colors truncate max-w-[120px] sm:max-w-[200px] py-3 sm:py-0"
```

3. No botão de anotações (o que chama `setIsNotesOpen((prev) => !prev)`), troque o início do `className`:
```tsx
className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10
```
por (mantendo o resto da string igual):
```tsx
className="flex-shrink-0 flex items-center justify-center gap-2 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 px-3 py-1.5 rounded-lg bg-amber-500/10
```

- [ ] **Step 2: Barra de navegação de baixo**

Substitua o bloco inteiro de `{/* Navigation Footer */}` (do comentário até o `</div>` que fecha a barra) por:

```tsx
                    {/* Navigation Footer */}
                    <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-800/50">
                        <button
                            onClick={goToPrev}
                            disabled={activeContentIndex === 0}
                            className="flex min-h-11 items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed md:min-h-0"
                        >
                            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                            Anterior
                        </button>

                        {/* Celular: contador de posição */}
                        <span className="text-sm text-gray-500 md:hidden">
                            {activeContentIndex + 1} / {contents.length}
                        </span>

                        {/* Tablet e desktop: bolinhas de navegação */}
                        <div className="hidden items-center gap-1 md:flex">
                            {contents.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToContent(index)}
                                    className={`h-2 rounded-full transition-all ${
                                        index === activeContentIndex
                                            ? 'w-6 bg-sky-500'
                                            : contents[index].is_completed
                                                ? 'w-2 bg-emerald-500'
                                                : 'w-2 bg-gray-700 hover:bg-gray-600'
                                    }`}
                                />
                            ))}
                        </div>

                        {activeContentIndex < contents.length - 1 ? (
                            <button
                                onClick={goToNext}
                                className="flex min-h-11 items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors md:min-h-0"
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        ) : (
                            <Link
                                href={`/aluno/estudar/${moduloId}`}
                                className="flex min-h-11 items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors md:min-h-0"
                            >
                                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                Voltar ao módulo
                            </Link>
                        )}
                    </div>
```

Preserve exatamente o que vem logo depois do bloco original (não remova nem altere o resto do arquivo).

- [ ] **Step 3: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/aluno/estudar/[modulo]/[aula]/page.tsx"
git commit -m "fix(mobile): navegação da aula alcançável e áreas de toque de 44px"
```

---

### Task 2: Código inline e exercício "Conectar"

**Files:**
- Modify: `components/common/markdown-renderer.tsx` (~linha 142)
- Modify: `components/student/exercises/InteractiveExercise.tsx` (`MatchingExercise`, ~linhas 900-933)

**Interfaces:** nenhuma nova.

- [ ] **Step 1: Código inline quebra linha**

Em `components/common/markdown-renderer.tsx`, troque:

```tsx
                                <code className="bg-gray-800 text-sky-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono">
```

por:

```tsx
                                <code className="bg-gray-800 text-sky-300 px-1.5 py-0.5 rounded text-[0.85em] font-mono [overflow-wrap:anywhere]">
```

- [ ] **Step 2: "Conectar" empilha no celular**

Em `components/student/exercises/InteractiveExercise.tsx`, dentro de `MatchingExercise`:

1. Troque a linha do contêiner de cada par:
```tsx
                                "grid grid-cols-2 gap-4 p-3 rounded-lg border transition-all",
```
por:
```tsx
                                "grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 p-3 rounded-lg border transition-all",
```

2. O `<div className="flex items-center gap-2">` que vem **imediatamente antes** de `<select value={userMatch}` (não o que contém `{pair.left}`) vira:
```tsx
                            <div className="flex min-w-0 items-center gap-2">
```

3. No `className` do `<select>` (o de `userMatch`), troque o início da primeira string:
```tsx
                                        "flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50",
```
por:
```tsx
                                        "min-h-11 min-w-0 flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 sm:min-h-0",
```

- [ ] **Step 3: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 4: Commit**

```bash
git add components/common/markdown-renderer.tsx components/student/exercises/InteractiveExercise.tsx
git commit -m "fix(mobile): código inline quebra linha e exercício Conectar cabe na tela"
```

---

### Task 3: Exercício "Classificar" responsivo e por toque

**Files:**
- Modify: `components/student/exercises/InteractiveExercise.tsx` (`CategorizeExercise`, ~linhas 1995-2225)

**Interfaces:** nenhuma nova exportada. Internamente: estado `selectedItemId`, callbacks `handleSelectItem` e `handleTapCategory` (usa o `handleClickToAssign` que já existe no componente).

- [ ] **Step 1: Estado do item selecionado**

Logo abaixo de `const [draggedItemId, setDraggedItemId] = useState<string | null>(null);` (dentro de `CategorizeExercise`), adicione:

```tsx
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
```

- [ ] **Step 2: Callbacks de toque**

Logo depois de `handleRemoveFromCategory` (o `useCallback` que faz `delete newAssignments[itemId]`) e antes de `handleSubmit`, adicione:

```tsx
    // Toque: selecionar um item e depois tocar na categoria (alternativa ao arrastar)
    const handleSelectItem = useCallback((itemId: string): void => {
        if (submitted) return;
        setSelectedItemId(prev => (prev === itemId ? null : itemId));
    }, [submitted]);

    const handleTapCategory = useCallback((categoryId: string): void => {
        if (submitted || !selectedItemId) return;
        handleClickToAssign(selectedItemId, categoryId);
        setSelectedItemId(null);
    }, [submitted, selectedItemId, handleClickToAssign]);
```

E em `handleRetry` (o `useCallback` que faz `setAssignments({})`), adicione uma linha para limpar a seleção:

```tsx
    const handleRetry = useCallback((): void => {
        setAssignments({});
        setSelectedItemId(null);
        setSubmitted(false);
        setShowExplanation(false);
    }, []);
```

- [ ] **Step 3: Itens não classificados**

Substitua o bloco `{/* Itens não classificados */}` por:

```tsx
            {/* Itens não classificados */}
            {unassignedItems.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Itens para classificar</p>
                    <p className="text-xs text-gray-500 md:hidden">Toque num item e depois na categoria.</p>
                    <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-dashed border-gray-700 bg-gray-900/30 min-h-[3rem]">
                        {unassignedItems.map(item => (
                            <div
                                key={item.id}
                                draggable={!submitted}
                                onDragStart={() => handleDragStart(item.id)}
                                onDragEnd={handleDragEnd}
                                onClick={() => handleSelectItem(item.id)}
                                className={cn(
                                    "flex min-h-11 items-center px-3 py-2 rounded-lg border text-sm font-medium transition-all select-none md:min-h-0",
                                    !submitted && "cursor-grab active:cursor-grabbing bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20",
                                    submitted && "bg-gray-800 border-gray-700 text-gray-400 cursor-default",
                                    draggedItemId === item.id && "opacity-50 ring-2 ring-sky-500",
                                    selectedItemId === item.id && "ring-2 ring-sky-400 bg-sky-500/20"
                                )}
                            >
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            )}
```

- [ ] **Step 4: Categorias em 1 coluna no celular**

Troque o contêiner das categorias:

```tsx
            <div className="grid gap-4" style={{
                gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)`
            }}>
```

por:

```tsx
            <div className={cn(
                "grid grid-cols-1 gap-4",
                categories.length === 2 && "sm:grid-cols-2",
                categories.length >= 3 && "sm:grid-cols-3"
            )}>
```

- [ ] **Step 5: Cada categoria aceita toque**

No `<div key={category.id} ...>` de cada categoria, adicione o `onClick` e o realce quando houver item selecionado. Troque:

```tsx
                        <div
                            key={category.id}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDropOnCategory(category.id)}
                            className={cn(
                                "rounded-lg border-2 border-dashed p-4 min-h-[120px] transition-all",
                                draggedItemId && "border-sky-500/50 bg-sky-500/5",
                                !draggedItemId && "border-gray-700"
                            )}
                        >
```

por:

```tsx
                        <div
                            key={category.id}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDropOnCategory(category.id)}
                            onClick={() => handleTapCategory(category.id)}
                            className={cn(
                                "rounded-lg border-2 border-dashed p-4 min-h-[120px] transition-all",
                                (draggedItemId || selectedItemId) && "border-sky-500/50 bg-sky-500/5",
                                selectedItemId && "cursor-pointer",
                                !draggedItemId && !selectedItemId && "border-gray-700"
                            )}
                        >
```

- [ ] **Step 6: Texto vazio e remoção sem disparar a categoria**

1. Troque o texto do estado vazio da categoria:
```tsx
                                    <p className="text-xs text-gray-600 text-center py-4">
                                        Arraste itens aqui
                                    </p>
```
por:
```tsx
                                    <p className="text-xs text-gray-600 text-center py-4">
                                        <span className="hidden md:inline">Arraste itens aqui</span>
                                        <span className="md:hidden">Toque aqui para colocar o item selecionado</span>
                                    </p>
```

2. No item já classificado, o clique remove o item. Para o toque não "vazar" para a categoria (o que atribuiria o item selecionado à mesma categoria ao remover), troque:
```tsx
                                                onClick={() => !submitted && handleRemoveFromCategory(item.id)}
```
por:
```tsx
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!submitted) handleRemoveFromCategory(item.id);
                                                }}
```

- [ ] **Step 7: Checar tipos**

Run: `pnpm exec tsc --noEmit`
Expected: 0 erros.

- [ ] **Step 8: Commit**

```bash
git add components/student/exercises/InteractiveExercise.tsx
git commit -m "fix(mobile): exercício Classificar responsivo e por toque"
```

---

### Task 4: Verificação no navegador, PR e merge

Esta task é executada pelo controlador (precisa da sessão de aluno no navegador embutido); não delegue a um subagente.

- [ ] **Step 1: Servidor e build**

Antes das medições, rode `pnpm exec tsc --noEmit` e `pnpm build` (o build **sobrescreve `.next`**: pare o servidor de desenvolvimento antes e suba de novo depois com `pnpm dev`). Expected: 0 erros e `Compiled successfully`.

- [ ] **Step 2: Varredura automática da aula em 375px e 360px**

Com o viewport emulado (375×812 e depois 360×800; reaplique a emulação se ela for desfeita), abra uma aula do módulo `864647f5-569c-4311-a34c-8914ff365454`, por exemplo `/aluno/estudar/864647f5-569c-4311-a34c-8914ff365454/98583a60-4276-4c76-8df8-419194996ae4`, e execute:

```js
await new Promise(r => setTimeout(r, 5000));
const m = document.querySelector('main');
const getChips = () => [...m.querySelectorAll('button')].filter(b => /^\d+\./.test(b.innerText.trim()));
const n = getChips().length;
const flagged = [];
let nextOffscreen = 0;
for (let i = 0; i < n; i++) {
    getChips()[i].click();
    await new Promise(r => setTimeout(r, 300));
    const bad = [...m.querySelectorAll('*')].filter(e => {
        const b = e.getBoundingClientRect();
        if (!(b.width > 0 && b.right > innerWidth + 1)) return false;
        return !(e.closest('[aria-hidden="true"]') || e.closest('.overflow-x-auto') || e.closest('.fixed'));
    });
    if (bad.length) flagged.push({ i: i + 1, sample: bad.slice(0, 2).map(e => e.tagName + '.' + String(e.className).slice(0, 45) + ' w' + Math.round(e.getBoundingClientRect().width)) });
    const next = [...m.querySelectorAll('button, a')].find(b => /Próximo|Voltar ao módulo/.test(b.innerText));
    if (!next || next.getBoundingClientRect().right > innerWidth) nextOffscreen++;
}
({ iw: innerWidth, contents: n, flaggedCount: flagged.length, flagged: flagged.slice(0, 10), nextOffscreen })
```
Expected: `flaggedCount === 0` e `nextOffscreen === 0`. Repita nas outras quatro aulas do módulo (os links aparecem em `/aluno/estudar/864647f5-569c-4311-a34c-8914ff365454`) e nas duas larguras.

- [ ] **Step 3: Áreas de toque e contador**

Na mesma aula, em 375px:

```js
const m = document.querySelector('main');
const h = (el) => el ? Math.round(el.getBoundingClientRect().height) : null;
({
    next: h([...m.querySelectorAll('button')].find(b => /Próximo/.test(b.innerText))),
    prev: h([...m.querySelectorAll('button')].find(b => /Anterior/.test(b.innerText))),
    crumbLinks: [...m.querySelectorAll('a')].filter(a => /\/aluno\/estudar/.test(a.getAttribute('href') || '')).slice(0, 2).map(h),
    notesBtn: h([...m.querySelectorAll('button')].find(b => b.querySelector('svg') && /Anota|Fechar/.test(b.innerText + b.className) )),
    counter: [...m.querySelectorAll('span')].find(s => /^\d+ \/ \d+$/.test(s.innerText.trim()))?.innerText,
    dotsVisible: !![...m.querySelectorAll('div')].find(d => String(d.className).includes('hidden items-center gap-1 md:flex') && d.getBoundingClientRect().width > 0)
})
```
Expected: `next`, `prev`, `crumbLinks` (dois valores) e `notesBtn` com 44 ou mais; `counter` no formato `N / 61`; `dotsVisible: false`. Se o seletor do botão de anotações não achar o elemento, meça-o manualmente (screenshot e `getBoundingClientRect`).

- [ ] **Step 4: "Classificar" por toque**

Em 375px, abra o conteúdo 5 da aula ("Classificando Conceitos"). Execute:

```js
const m = document.querySelector('main');
const chips = [...m.querySelectorAll('button')].filter(b => /^\d+\./.test(b.innerText.trim()));
chips[4].click();
await new Promise(r => setTimeout(r, 600));
const label = [...m.querySelectorAll('p')].find(p => /Itens para classificar/i.test(p.innerText));
const itemsBox = label.parentElement.querySelector('.flex-wrap');
const before = itemsBox.children.length;
const firstItem = itemsBox.children[0];
const firstText = firstItem.innerText.trim();
firstItem.click();
await new Promise(r => setTimeout(r, 200));
const selected = firstItem.className.includes('ring-sky-400');
const cats = [...m.querySelectorAll('div')].filter(d => String(d.className).includes('border-dashed') && String(d.className).includes('min-h-[120px]'));
cats[0].click();
await new Promise(r => setTimeout(r, 300));
const label2 = [...m.querySelectorAll('p')].find(p => /Itens para classificar/i.test(p.innerText));
const after = label2 ? label2.parentElement.querySelector('.flex-wrap').children.length : 0;
const cats2 = [...m.querySelectorAll('div')].filter(d => String(d.className).includes('border-dashed') && String(d.className).includes('min-h-[120px]'));
({ categories: cats.length, selectedAfterTap: selected, before, after, firstText, inFirstCategory: cats2[0].innerText.includes(firstText), catsStacked: cats.length > 1 && Math.abs(cats[0].getBoundingClientRect().left - cats[1].getBoundingClientRect().left) < 2 })
```
Expected: `selectedAfterTap: true`, `after === before - 1`, `inFirstCategory: true` e `catsStacked: true` (categorias em 1 coluna). Tire um screenshot do exercício.

- [ ] **Step 5: "Conectar"**

Abra o conteúdo 7 ("Conectando Conceitos") em 375px e confirme que o `<select>` cabe na tela:

```js
const m = document.querySelector('main');
[...m.querySelectorAll('button')].filter(b => /^\d+\./.test(b.innerText.trim()))[6].click();
await new Promise(r => setTimeout(r, 600));
const sels = [...m.querySelectorAll('select')];
({ selects: sels.length, allFit: sels.every(s => s.getBoundingClientRect().right <= innerWidth - 8), heights: sels.map(s => Math.round(s.getBoundingClientRect().height)) })
```
Expected: `allFit: true` e alturas ≥ 44.

- [ ] **Step 6: Desktop (1280px)**

Defina o viewport para 1280×800 e abra a mesma aula: as bolinhas de navegação estão visíveis, o contador está oculto, e o exercício "Classificar" mostra as categorias em colunas lado a lado. Depois restaure com `resize_window` preset `desktop`.

- [ ] **Step 7: Revisão do diff e PR**

Run: `git diff main --stat`
Expected: só os três arquivos do mapa de arquivos e os dois documentos de `docs/superpowers/`. Nenhum `.env*`, `.next` ou `tsconfig.tsbuildinfo`.

Depois:
```bash
git push -u origin feat/mobile-aula
gh pr create --repo axyonsoftwareofc/student-portal-core-web --base main --head feat/mobile-aula --title "fix(mobile): tela de aula e exercícios no celular" --body "$(cat <<'EOF'
## O que muda

Segundo sub-projeto da missão mobile, parte 2a: a tela de aula e os exercícios interativos.

- **Navegação entre conteúdos:** a barra de baixo tinha 61 bolinhas de 8×8px numa fila de 744px e empurrava o "Próximo" para fora da tela, o que o `overflow-x-hidden` do PR #53 tornou inalcançável. No celular agora há `Anterior`, o contador "N / total" e `Próximo` (ou "Voltar ao módulo"); as bolinhas ficam só a partir de `md`.
- **Toque:** botões da barra, links do breadcrumb e botão de anotações com pelo menos 44px de altura no celular.
- **Exercício "Conectar":** rótulo e `<select>` empilham no celular e o select cabe na tela.
- **Exercício "Classificar":** categorias em 1 coluna no celular (colunas a partir de `sm`) e nova interação por toque: tocar num item o seleciona e tocar numa categoria o coloca lá. O arrastar continua no desktop.
- **Markdown:** código inline longo agora quebra linha.

Spec e plano em `docs/superpowers/`.

## Como testar

1. Logado como aluno, abrir uma aula em 375px e 360px: "Próximo" e "Voltar ao módulo" aparecem e funcionam, e nenhum conteúdo rola para o lado.
2. No exercício "Classificar", tocar num item e depois numa categoria move o item; tocar num item já classificado o devolve.
3. No exercício "Conectar", os selects cabem na tela.
4. Em 1280px as bolinhas de navegação e as colunas do "Classificar" continuam como antes.

Verificação feita: `tsc --noEmit` sem erros, `next build` ok e varredura automática de todos os conteúdos de 5 aulas do módulo em 375px e 360px. Não há suíte de testes no projeto.

## Observações

Fica para o sub-projeto 2b (telas de lista e perfil): as abas de Desempenho com 22px de altura, os grids de 4 e 7 colunas em trilhas e na sequência de dias, e o filtro do fórum.
EOF
)"
```
Expected: URL do PR impressa, sem assinatura de ferramenta no corpo.

- [ ] **Step 8: Merge (autorizado pelo usuário)**

Run: `gh pr merge --merge --delete-branch`
Expected: PR mesclado. Se o GitHub bloquear por proteção de branch, revisão exigida ou checks pendentes, **não contorne**: informe o usuário.

- [ ] **Step 9: Voltar para a main e encerrar o servidor**

Run: `git checkout main && git pull`
Expected: `main` atualizada. Encerre o `pnpm dev` que foi subido para as medições.

---

## Auto-revisão do plano contra o spec

- **§1 Barra de navegação de baixo (contador no celular, bolinhas só em `md+`, botões de 44px):** Task 1, Step 2.
- **§2 Toque no cabeçalho (breadcrumb e anotações):** Task 1, Step 1. A conferência de que o painel de anotações tem botão de fechar alcançável é feita na Task 4 (Step 3, via `notesBtn`, que vira "Fechar" quando o painel abre; confirmar visualmente no screenshot se necessário).
- **§3 Código inline:** Task 2, Step 1.
- **§4 "Conectar":** Task 2, Step 2.
- **§5 "Classificar" (colunas responsivas, toque, dica só no celular):** Task 3.
- **Verificação do spec** (tsc, build, varredura de 5 aulas em 375/360px, toque do Classificar, áreas de toque, desktop 1280px): Task 4.
- **Pendências do spec:** como itens classificados voltam para a lista (clicar neles chama `handleRemoveFromCategory`, mantido, com `stopPropagation` para o toque não vazar); o botão de anotações e o breadcrumb são locais da página de aula (edição restrita ao arquivo dela); a branch já existe a partir da `main` pós PR #53 (Task 0).
- **Consistência de nomes:** `selectedItemId`, `handleSelectItem`, `handleTapCategory` e o já existente `handleClickToAssign` são usados da mesma forma nas Steps 1, 2, 3 e 5 da Task 3.
