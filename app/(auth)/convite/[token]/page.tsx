// app/(auth)/convite/[token]/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Loader2, PartyPopper, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { validatePassword } from '@/utils/passwordValidation';
import { PasswordStrength } from '@/components/common/password-strength';

interface InviteData {
    id: string;
    email: string;
    name: string;
}

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formError, setFormError] = useState('');

    const passwordValidation = useMemo(() => validatePassword(password), [password]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!passwordValidation.isValid) {
            setFormError('A senha não atende todos os requisitos de segurança');
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
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: inviteData.email,
                password,
                options: {
                    data: {
                        name: inviteData.name,
                    }
                }
            });

            if (authError) {
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
                const { data: userData } = await supabase
                    .from('users')
                    .select('id, status')
                    .eq('email', inviteData.email)
                    .single();

                if (userData?.status !== 'active') {
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

                setPageState('success');

                setTimeout(() => {
                    router.push('/aluno/dashboard');
                }, 2500);
            } else {
                setFormError('Verifique seu email para confirmar a conta, ou tente fazer login.');
                setIsSubmitting(false);
            }
        } catch (err) {
            setFormError('Erro inesperado. Tente novamente.');
            setIsSubmitting(false);
        }
    };

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
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
                                    placeholder="Crie uma senha segura"
                                    disabled={isSubmitting}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-400 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                                    ) : (
                                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>

                            {password.length > 0 && (
                                <div className="mt-3">
                                    <PasswordStrength validation={passwordValidation} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Confirmar senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
                                    placeholder="Repita a senha"
                                    disabled={isSubmitting}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-400 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                                    ) : (
                                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>

                            {confirmPassword.length > 0 && password !== confirmPassword && (
                                <p className="mt-1.5 text-xs text-rose-400">As senhas não coincidem</p>
                            )}
                            {confirmPassword.length > 0 && password === confirmPassword && (
                                <p className="mt-1.5 text-xs text-emerald-400">✓ Senhas coincidem</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !passwordValidation.isValid}
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