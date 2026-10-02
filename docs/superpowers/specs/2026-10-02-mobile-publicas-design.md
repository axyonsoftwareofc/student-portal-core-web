# Responsividade mobile — Sub-projeto 4: páginas públicas

Data: 2026-10-02
Status: aprovado pelo usuário

## Contexto

Último sub-projeto da missão de tornar o app usável no celular. Já estão mesclados: a base compartilhada (PR #53), a tela de aula (PR #54), as telas de lista do aluno (PR #55) e a área do admin (PR #56). Este documento cobre as páginas públicas: landing (`/`), login (`/signin`), cadastro (`/signup`), recuperação de senha (`/reset-password`), nova senha (`/update-password`), inscrição (`/inscreva-se`) e convite (`/convite/[token]`).

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Fonte dos campos (zoom do iPhone) | Corrigir na classe global `.form-input` e afins: `text-base sm:text-sm` |
| Links do rodapé (Twitter, Medium, GitHub com `href="#"`) | Manter no lugar e só aumentar a área de toque para 44px |
| `aria-label="Cruip"` do logo | Trocar por "Code Plus" |
| Áreas de toque | 44px no celular com o padrão `min-h-11 sm:min-h-0` (o desktop não muda), igual ao dos PRs anteriores |
| Largura mínima alvo | 375px (também 360px) |

## Levantamento (375px e 360px)

Nenhuma página pública passa da tela nem tem conteúdo cortado, em 375px e 360px.

| # | Problema | Onde | Evidência |
|---|---|---|---|
| 1 | Campos com fonte de 14px: o Safari do iPhone dá zoom na página ao focar um campo com menos de 16px | classe `.form-input` (e `.form-textarea`, `.form-multiselect`, `.form-select`), definida em `app/css/style.css` (regra sem camada, que é a que vale) e repetida em `app/css/additional-styles/utility-patterns.css`; usada só em signin, signup, reset-password e update-password | medido (14px); `/inscreva-se` já usa 16px |
| 2 | Links pequenos nos formulários: "Esqueceu?" (22px) e "Criar conta" (17px) no login; "Entrar" (17px) no cadastro; "Voltar para login" (22px) e "Fazer login" (17px) na recuperação; "Já é aluno? Fazer login" (17px) na inscrição; link "Entrar" do rodapé do convite | páginas de `app/(auth)/` | medido (convite: lido no código) |
| 3 | Botão de mostrar senha com 16×16 | signup, update-password (2), convite (2) | medido no signup; lido no código nos demais |
| 4 | Header da landing e da inscrição: "Entrar" (38px), "Inscreva-se" (36px), logo (32px); "Ir para Login" do convite inválido (42px) | `components/ui/header.tsx`, `components/ui/logo.tsx`, `app/(auth)/convite/[token]/page.tsx` | medido |
| 5 | Rodapé da landing: links Twitter, Medium e GitHub com 32px (apontam para `#`, sobra do template) | `components/ui/footer.tsx` | medido |
| 6 | Logo com `aria-label="Cruip"` e `alt="Cruip Logo"` (nome do template) | `components/ui/logo.tsx` | lido no código |

Não verificáveis no navegador sem link real: o formulário de `/update-password` (sem sessão de recuperação mostra "Link inválido ou expirado") e o de convite válido (com token inválido mostra "Ops!"). As mudanças neles são conferidas pelo código.

## Design

### 1. Fonte dos campos
Nos dois arquivos de CSS, no bloco
```css
.form-input,
.form-textarea,
.form-multiselect,
.form-select {
  @apply rounded-lg px-4 py-2.5 text-sm text-gray-200;
}
```
`text-sm` passa a ser `text-base sm:text-sm`. Os campos ficam com 16px no celular e 14px a partir de `sm`.

### 2. Links dos formulários
Cada link do achado 2 ganha `inline-flex min-h-11 items-center sm:min-h-0` (os que já têm `inline-flex items-center` ganham só `min-h-11` e `sm:min-h-0`). Links no meio de uma frase passam a ocupar uma linha de 44px no celular.

### 3. Botão de mostrar senha
Nos botões `absolute right-3 top-1/2 -translate-y-1/2 …`: passam a `absolute right-0 top-1/2 -translate-y-1/2 inline-flex min-h-11 min-w-11 items-center justify-center sm:right-3 sm:min-h-0 sm:min-w-0 …` (resto das classes igual). O campo de senha correspondente passa de `pr-10` para `pr-12 sm:pr-10`.

### 4. Header, logo e convite
- `header.tsx`: links "Entrar" e "Inscreva-se" ganham `min-h-11 sm:min-h-0`.
- `logo.tsx`: o `Link` passa de `inline-flex shrink-0` para `inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center sm:min-h-0 sm:min-w-0`; `aria-label="Code Plus"` e `alt="Code Plus"`.
- Convite: "Ir para Login" ganha `min-h-11 sm:min-h-0` (e `inline-flex items-center justify-center` no lugar de `inline-block`).

### 5. Rodapé
Os três links sociais de `footer.tsx` (`flex items-center justify-center …`) ganham `min-h-11 min-w-11 sm:min-h-0 sm:min-w-0`. O `href="#"` continua.

## Verificação

Não há suíte de testes no projeto. Verificar com:
- `pnpm exec tsc --noEmit` e `pnpm build` sem erros novos.
- No navegador, em 375px e 360px: campos de signin, signup e reset-password com `font-size: 16px`; todos os itens dos achados 2 a 5 com pelo menos 44px de altura (e de largura, nos só de ícone); nenhuma página pública com conteúdo fora da tela.
- Em 768px e 1280px: campos com 14px e alturas originais (sem `min-height` de 44px).

## Fora de escopo

- Trocar ou remover os links sociais do rodapé.
- Campos de outras telas que não usam `.form-input` (buscas e formulários do aluno e do admin).
- Mudança de estilo visual além do necessário.

## Pendências para o plano

- Confirmar o texto exato dos links do achado 2 em cada página (alguns estão quebrados em várias linhas de JSX).
- Confirmar os campos de senha que têm `pr-10` em signup, update-password e convite.
- A branch `feat/mobile-publicas` já foi criada a partir da `main` atualizada.
