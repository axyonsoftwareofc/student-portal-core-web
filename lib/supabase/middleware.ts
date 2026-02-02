// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANTE: Não colocar lógica entre createServerClient e supabase.auth.getUser()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Rotas públicas que não precisam de autenticação
    const publicRoutes = ['/', '/signin', '/signup', '/reset-password']
    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname === route ||
        request.nextUrl.pathname.startsWith('/api/auth') ||
        request.nextUrl.pathname.startsWith('/auth')
    )

    // Se não está logado e tenta acessar rota protegida
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/signin'
        return NextResponse.redirect(url)
    }

    // Se está logado e tenta acessar página de login/cadastro
    if (user && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup')) {
        const url = request.nextUrl.clone()

        // Buscar o role do usuário para redirecionar corretamente
        const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!error && userData) {
            const role = (userData as { role: string }).role
            if (role === 'admin') {
                url.pathname = '/admin/dashboard'
            } else {
                url.pathname = '/aluno/dashboard'
            }
            return NextResponse.redirect(url)
        }

        // Default para aluno se não encontrar
        url.pathname = '/aluno/dashboard'
        return NextResponse.redirect(url)
    }

    // Proteção de rotas admin
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
        const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (error || !userData || (userData as { role: string }).role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/aluno/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}