// components/student/profile/ChangePasswordSection.tsx
'use client';

import { useState, useMemo } from 'react';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { validatePassword } from '@/utils/passwordValidation';
import { PasswordStrength } from '@/components/common/password-strength';

export function ChangePasswordSection() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const passwordValidation = useMemo(() => validatePassword(newPassword), [newPassword]);

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setStatus('idle');
        setMessage('');
    };

    const handleCancel = () => {
        resetForm();
        setIsExpanded(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('idle');
        setMessage('');

        if (!currentPassword) {
            setStatus('error');
            setMessage('Digite sua senha atual');
            return;
        }

        if (!passwordValidation.isValid) {
            setStatus('error');
            setMessage('A nova senha não atende todos os requisitos');
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('As senhas não coincidem');
            return;
        }

        if (currentPassword === newPassword) {
            setStatus('error');
            setMessage('A nova senha deve ser diferente da atual');
            return;
        }

        setIsLoading(true);

        try {
            const supabase = createClient();

            // Primeiro, verificar a senha atual fazendo re-autenticação
            const { data: { user } } = await supabase.auth.getUser();

            if (!user?.email) {
                throw new Error('Usuário não encontrado');
            }

            // Tentar fazer login com a senha atual para validar
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                setStatus('error');
                setMessage('Senha atual incorreta');
                setIsLoading(false);
                return;
            }

            // Atualizar para a nova senha
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                throw updateError;
            }

            setStatus('success');
            setMessage('Senha alterada com sucesso!');

            // Limpar formulário após 2 segundos
            setTimeout(() => {
                resetForm();
                setIsExpanded(false);
            }, 2000);

        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            setStatus('error');
            setMessage('Erro ao alterar senha. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isExpanded) {
        return (
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
                            <KeyRound className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">Senha</h3>
                            <p className="text-sm text-gray-500">••••••••</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        Alterar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-sky-500/30 bg-gray-900/30 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
                    <KeyRound className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="font-medium text-white">Alterar Senha</h3>
                    <p className="text-sm text-gray-500">Digite sua senha atual e escolha uma nova</p>
                </div>
            </div>

            {/* Success Message */}
            {status === 'success' && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                        <p className="text-sm text-emerald-300">{message}</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {status === 'error' && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-400" strokeWidth={1.5} />
                        <p className="text-sm text-rose-300">{message}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Senha Atual */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Senha atual
                    </label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-lg border border-gray-800/50 bg-gray-900/50 px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
                            placeholder="Digite sua senha atual"
                            disabled={isLoading || status === 'success'}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-400 transition-colors"
                            tabIndex={-1}
                        >
                            {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                            ) : (
                                <Eye className="h-4 w-4" strokeWidth={1.5} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Nova Senha */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Nova senha
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-lg border border-gray-800/50 bg-gray-900/50 px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
                            placeholder="Crie uma senha segura"
                            disabled={isLoading || status === 'success'}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-400 transition-colors"
                            tabIndex={-1}
                        >
                            {showNewPassword ? (
                                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                            ) : (
                                <Eye className="h-4 w-4" strokeWidth={1.5} />
                            )}
                        </button>
                    </div>

                    {newPassword.length > 0 && (
                        <div className="mt-3">
                            <PasswordStrength validation={passwordValidation} />
                        </div>
                    )}
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Confirmar nova senha
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-gray-800/50 bg-gray-900/50 px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
                            placeholder="Repita a nova senha"
                            disabled={isLoading || status === 'success'}
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

                    {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                        <p className="mt-1.5 text-xs text-rose-400">As senhas não coincidem</p>
                    )}
                    {confirmPassword.length > 0 && newPassword === confirmPassword && passwordValidation.isValid && (
                        <p className="mt-1.5 text-xs text-emerald-400">✓ Senhas coincidem</p>
                    )}
                </div>

                {/* Botões */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !passwordValidation.isValid || status === 'success'}
                        className="flex-1 rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                Alterando...
                            </>
                        ) : (
                            'Alterar Senha'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}