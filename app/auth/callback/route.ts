// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Buscar role do usuário para redirecionar corretamente
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (!userError && userData) {
                const redirectTo = (userData as { role: string }).role === 'admin'
                    ? '/admin/dashboard'
                    : '/aluno/dashboard'

                return NextResponse.redirect(`${origin}${redirectTo}`)
            }

            // Se não encontrou o usuário na tabela, redireciona para aluno
            return NextResponse.redirect(`${origin}/aluno/dashboard`)
        }
    }

    // Redirecionar para página de erro se algo der errado
    return NextResponse.redirect(`${origin}/signin?error=auth`)
}