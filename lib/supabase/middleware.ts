// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    let response = NextResponse.next({ request });

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
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Rotas públicas - sempre permite
    const publicPaths = ['/', '/signin', '/signup', '/reset-password'];
    const isPublicPath = publicPaths.includes(pathname) ||
        pathname.startsWith('/auth/') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/');

    if (isPublicPath) {
        // Verificar se usuário logado está acessando login/signup
        if (pathname === '/signin' || pathname === '/signup') {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    const redirectPath = userData?.role === 'admin' ? '/admin/dashboard' : '/aluno/dashboard';
                    return NextResponse.redirect(new URL(redirectPath, request.url));
                }
            } catch {
                // Se deu erro, deixa acessar normalmente
            }
        }
        return response;
    }

    // Rotas protegidas - verifica autenticação
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        // Sem usuário válido - redireciona para login
        if (error || !user) {
            // Limpar cookies potencialmente corrompidos
            const allCookies = request.cookies.getAll();
            allCookies.forEach(cookie => {
                if (cookie.name.startsWith('sb-')) {
                    response.cookies.delete(cookie.name);
                }
            });

            return NextResponse.redirect(new URL('/signin', request.url));
        }

        // Verificar acesso admin
        if (pathname.startsWith('/admin')) {
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!userData || userData.role !== 'admin') {
                return NextResponse.redirect(new URL('/aluno/dashboard', request.url));
            }
        }

        return response;
    } catch {
        // Em caso de erro, redireciona para login
        return NextResponse.redirect(new URL('/signin', request.url));
    }
}