// app/(auth)/convite/[token]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface InviteData {
    id: string;
    email: string;
    name: string;
}

// Cliente Supabase local (não usa contexto)
function getSupabase() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export default function ConvitePage() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [inviteData, setInviteData] = useState<InviteData | null>(null);
    const [pageState, setPageState] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');

    // Verificar token uma única vez
    useEffect(() => {
        if (!token) {
            setErrorMessage('Link inválido');
            setPageState('error');
            return;
        }

        const supabase = getSupabase();

        supabase
            .from('users')
            .select('id, email, name, invite_expires_at, status')
            .eq('invite_token', token)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error || !data) {
                    setErrorMessage('Convite não encontrado ou já utilizado');
                    setPageState('error');
                    return;
                }

                if (data.status === 'active') {
                    setErrorMessage('Este convite já foi utilizado. Faça login.');
                    setPageState('error');
                    return;
                }

                if (data.invite_expires_at && new Date(data.invite_expires_at) < new Date()) {
                    setErrorMessage('Convite expirado. Solicite um novo.');
                    setPageState('error');
                    return;
                }

                setInviteData({ id: data.id, email: data.email, name: data.name });
                setPageState('form');
            });
    }, [token]);

    // Criar conta
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (password.length < 6) {
            setFormError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setFormError('As senhas não coincidem');
            return;
        }

        if (!inviteData) return;

        setIsSubmitting(true);
        const supabase = getSupabase();

        try {
            // Criar no Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: inviteData.email,
                password,
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    setFormError('E-mail já possui conta. Tente fazer login.');
                } else {
                    setFormError(authError.message);
                }
                setIsSubmitting(false);
                return;
            }

            if (authData.user) {
                // Atualizar registro
                await supabase
                    .from('users')
                    .update({
                        id: authData.user.id,
                        status: 'active',
                        invite_token: null,
                        invite_expires_at: null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('email', inviteData.email);

                setPageState('success');

                setTimeout(() => {
                    router.push('/aluno/dashboard');
                }, 2000);
            }
        } catch {
            setFormError('Erro ao criar conta. Tente novamente.');
            setIsSubmitting(false);
        }
    };

    // === RENDERIZAÇÃO ===

    if (pageState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto" />
                    <p className="mt-4 text-gray-400">Verificando convite...</p>
                </div>
            </div>
        );
    }

    if (pageState === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="text-5xl mb-4">😕</div>
                    <h1 className="text-xl font-bold text-white mb-2">Ops!</h1>
                    <p className="text-gray-400 mb-6">{errorMessage}</p>
                    <Link
                        href="/signin"
                        className="inline-block rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
                    >
                        Ir para Login
                    </Link>
                </div>
            </div>
        );
    }

    if (pageState === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h1 className="text-xl font-bold text-white mb-2">Conta criada!</h1>
                    <p className="text-gray-400 mb-4">Redirecionando...</p>
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-violet-600 border-t-transparent mx-auto" />
                </div>
            </div>
        );
    }

    // Form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-4">👋</div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Bem-vindo, {inviteData?.name.split(' ')[0]}!
                    </h1>
                    <p className="text-sm text-gray-400">
                        Crie sua senha para acessar o portal
                    </p>
                </div>

                <div className="rounded-xl border border-gray-700/50 bg-gray-900/50 p-4 sm:p-6">
                    <div className="mb-4 p-3 rounded-lg bg-violet-950/30 border border-violet-500/20">
                        <p className="text-sm text-violet-300 break-all">
                            <strong>E-mail:</strong> {inviteData?.email}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-sm">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
                                placeholder="Mínimo 6 caracteres"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Confirmar senha
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
                                placeholder="Repita a senha"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Criando...
                                </>
                            ) : (
                                'Criar minha conta'
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Já tem conta?{' '}
                    <Link href="/signin" className="text-violet-400 hover:text-violet-300">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}