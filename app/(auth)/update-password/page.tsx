// app/(auth)/update-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [isValidSession, setIsValidSession] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    // Verificar se há uma sessão válida de recovery
    useEffect(() => {
        const checkSession = async () => {
            try {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setIsValidSession(true);
                } else {
                    setStatus('error');
                    setMessage('Link de recuperação inválido ou expirado. Solicite um novo link.');
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
                setStatus('error');
                setMessage('Erro ao verificar sessão. Tente novamente.');
            } finally {
                setCheckingSession(false);
            }
        };

        checkSession();
    }, []);

    const validatePassword = (pass: string): string | null => {
        if (pass.length < 6) {
            return 'A senha deve ter pelo menos 6 caracteres';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validações
        const passwordError = validatePassword(password);
        if (passwordError) {
            setStatus('error');
            setMessage(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('As senhas não coincidem');
            return;
        }

        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                throw error;
            }

            setStatus('success');
            setMessage('Senha atualizada com sucesso! Redirecionando...');

            // Redirecionar após 2 segundos
            setTimeout(() => {
                router.push('/signin');
            }, 2000);
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
            setStatus('error');
            setMessage('Erro ao atualizar senha. Tente novamente ou solicite um novo link.');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading inicial
    if (checkingSession) {
        return (
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="py-12 md:py-20">
                        <div className="flex items-center justify-center min-h-[300px]">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" strokeWidth={1.5} />
                                <p className="text-gray-400 text-sm">Verificando link de recuperação...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Sessão inválida
    if (!isValidSession && status === 'error') {
        return (
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="py-12 md:py-20">
                        <div className="flex items-center justify-center min-h-[300px]">
                            <div className="text-center max-w-md">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-rose-400" strokeWidth={1.5} />
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-2">
                                    Link inválido ou expirado
                                </h2>
                                <p className="text-gray-400 text-sm mb-6">
                                    {message}
                                </p>
                                <Link
                                    href="/reset-password"
                                    className="btn bg-gradient-to-t from-sky-500 to-blue-400 text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-400 hover:to-blue-300"
                                >
                                    Solicitar novo link
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="py-12 md:py-20">
                    {/* Header */}
                    <div className="pb-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 mx-auto mb-4">
                            <Lock className="h-8 w-8 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-sky-200),var(--color-blue-300),var(--color-sky-50),var(--color-blue-400),var(--color-sky-200))] bg-[length:200%_auto] bg-clip-text font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                            Nova senha
                        </h1>
                        <p className="mt-2 text-gray-400">
                            Digite sua nova senha abaixo
                        </p>
                    </div>

                    {/* Success Message */}
                    {status === 'success' && (
                        <div className="mx-auto max-w-[400px] mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                <div>
                                    <p className="text-sm text-emerald-300 font-medium">Senha atualizada!</p>
                                    <p className="text-sm text-emerald-200/80 mt-1">{message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {status === 'error' && isValidSession && (
                        <div className="mx-auto max-w-[400px] mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                <p className="text-sm text-rose-300">{message}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mx-auto max-w-[400px]">
                        {/* Nova senha */}
                        <div>
                            <label
                                className="mb-1 block text-sm font-medium text-sky-200/80"
                                htmlFor="password"
                            >
                                Nova senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input w-full border-sky-300/30 bg-sky-950/30 text-sky-100 placeholder:text-sky-300/60 focus:border-sky-400 focus:ring-sky-400/40 pr-10"
                                    placeholder="Mínimo 6 caracteres"
                                    disabled={isLoading || status === 'success'}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-400 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                                    ) : (
                                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar senha */}
                        <div className="mt-4">
                            <label
                                className="mb-1 block text-sm font-medium text-sky-200/80"
                                htmlFor="confirmPassword"
                            >
                                Confirmar nova senha
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="form-input w-full border-sky-300/30 bg-sky-950/30 text-sky-100 placeholder:text-sky-300/60 focus:border-sky-400 focus:ring-sky-400/40 pr-10"
                                    placeholder="Digite novamente"
                                    disabled={isLoading || status === 'success'}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-400 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                                    ) : (
                                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Indicador de força (opcional) */}
                        {password.length > 0 && (
                            <div className="mt-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${
                                                password.length < 6
                                                    ? 'w-1/4 bg-rose-500'
                                                    : password.length < 8
                                                        ? 'w-1/2 bg-amber-500'
                                                        : password.length < 12
                                                            ? 'w-3/4 bg-sky-500'
                                                            : 'w-full bg-emerald-500'
                                            }`}
                                        />
                                    </div>
                                    <span className={`text-xs ${
                                        password.length < 6
                                            ? 'text-rose-400'
                                            : password.length < 8
                                                ? 'text-amber-400'
                                                : password.length < 12
                                                    ? 'text-sky-400'
                                                    : 'text-emerald-400'
                                    }`}>
                                        {password.length < 6
                                            ? 'Fraca'
                                            : password.length < 8
                                                ? 'Média'
                                                : password.length < 12
                                                    ? 'Boa'
                                                    : 'Forte'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isLoading || status === 'success'}
                                className="btn w-full bg-gradient-to-t from-sky-500 to-blue-400 text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-400 hover:to-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                        Atualizando...
                                    </>
                                ) : (
                                    'Atualizar senha'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}