// app/(auth)/convite/[token]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Loader2, PartyPopper, AlertCircle, KeyRound } from 'lucide-react';

interface InviteData {
    id: string;
    email: string;
    name: string;
}

// Cliente Supabase local
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

    // Verificar token
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
                    setErrorMessage('Convite expirado. Solicite um novo ao administrador.');
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
            console.log('=== INÍCIO DO FLUXO DE CONVITE ===');
            console.log('1. Email:', inviteData.email);
            console.log('2. Nome:', inviteData.name);
            console.log('3. ID temporário:', inviteData.id);

            // Criar usuário no Auth
            // O trigger handle_new_user vai fazer o UPSERT automaticamente
            console.log('4. Chamando signUp...');

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: inviteData.email,
                password,
                options: {
                    data: {
                        name: inviteData.name,
                    }
                }
            });

            console.log('5. Resposta signUp:');
            console.log('   - user:', authData?.user?.id || 'null');
            console.log('   - session:', authData?.session ? 'existe' : 'null');
            console.log('   - error:', authError?.message || 'nenhum');

            if (authError) {
                console.error('❌ ERRO no signUp:', authError.message);

                if (authError.message.includes('already registered')) {
                    setFormError('Este e-mail já possui uma conta. Tente fazer login.');
                } else if (authError.message.includes('Database error')) {
                    setFormError('Erro no banco de dados. Entre em contato com o suporte.');
                } else {
                    setFormError(`Erro: ${authError.message}`);
                }
                setIsSubmitting(false);
                return;
            }

            if (authData.user) {
                console.log('✅ Usuário criado no Auth! ID:', authData.user.id);
                console.log('6. O trigger handle_new_user deve ter atualizado public.users');

                // Verificar se o usuário foi atualizado corretamente
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, status')
                    .eq('email', inviteData.email)
                    .single();

                console.log('7. Verificação do usuário:', { userData, userError });

                if (userData?.status !== 'active') {
                    // Fallback: atualizar manualmente se o trigger não funcionou
                    console.log('8. Status não é active, atualizando manualmente...');

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
                }

                console.log('=== ✅ SUCESSO ===');
                setPageState('success');

                setTimeout(() => {
                    router.push('/aluno/dashboard');
                }, 2500);
            } else {
                // Pode ser que o Supabase está configurado para confirmar email
                console.log('⚠️ signUp não retornou user - pode precisar confirmar email');
                setFormError('Verifique seu email para confirmar a conta, ou tente fazer login.');
                setIsSubmitting(false);
            }

        } catch (err) {
            console.error('❌ ERRO GERAL:', err);
            setFormError('Erro inesperado. Tente novamente.');
            setIsSubmitting(false);
        }
    };

    // === RENDERIZAÇÃO ===

    if (pageState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400 mx-auto" strokeWidth={1.5} />
                    <p className="mt-4 text-gray-400">Verificando convite...</p>
                </div>
            </div>
        );
    }

    if (pageState === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
                            <AlertCircle className="h-8 w-8 text-rose-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Ops!</h1>
                    <p className="text-gray-400 mb-6">{errorMessage}</p>
                    <Link
                        href="/signin"
                        className="inline-block rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
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
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                            <PartyPopper className="h-8 w-8 text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Conta criada com sucesso!</h1>
                    <p className="text-gray-400 mb-4">Redirecionando para o portal...</p>
                    <Loader2 className="h-6 w-6 animate-spin text-sky-400 mx-auto" strokeWidth={1.5} />
                </div>
            </div>
        );
    }

    // Formulário
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10">
                            <KeyRound className="h-7 w-7 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Bem-vindo, {inviteData?.name.split(' ')[0]}!
                    </h1>
                    <p className="text-sm text-gray-400">
                        Crie sua senha para acessar o portal
                    </p>
                </div>

                <div className="rounded-xl border border-gray-800/50 bg-gray-900/50 p-4 sm:p-6">
                    <div className="mb-4 p-3 rounded-lg bg-sky-950/30 border border-sky-500/20">
                        <p className="text-sm text-sky-300 break-all">
                            <strong>E-mail:</strong> {inviteData?.email}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-950/30 border border-rose-500/20">
                                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                <p className="text-sm text-rose-300">{formError}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
                                placeholder="Mínimo 6 caracteres"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Confirmar senha
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
                                placeholder="Repita a senha"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                    Criando conta...
                                </>
                            ) : (
                                'Criar minha conta'
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Já tem conta?{' '}
                    <Link href="/signin" className="text-sky-400 hover:text-sky-300 transition-colors">
                        Fazer login
                    </Link>
                </p>
            </div>
        </div>
    );
}