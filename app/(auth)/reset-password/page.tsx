// app/(auth)/reset-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Por favor, digite seu email');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
          }
      );

      if (error) {
        throw error;
      }

      setStatus('success');
      setMessage('Email enviado! Verifique sua caixa de entrada (e spam) para redefinir sua senha.');
      setEmail('');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      setStatus('error');
      setMessage('Erro ao enviar email. Verifique se o email está correto e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <section>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-12 md:py-20">
            {/* Botão voltar */}
            <div className="mb-8">
              <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                Voltar para login
              </Link>
            </div>

            {/* Header */}
            <div className="pb-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 mx-auto mb-4">
                <Mail className="h-8 w-8 text-sky-400" strokeWidth={1.5} />
              </div>
              <h1 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-sky-200),var(--color-blue-300),var(--color-sky-50),var(--color-blue-400),var(--color-sky-200))] bg-[length:200%_auto] bg-clip-text font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                Resetar senha
              </h1>
              <p className="mt-2 text-gray-400">
                Digite seu email para receber um link de recuperação
              </p>
            </div>

            {/* Success Message */}
            {status === 'success' && (
                <div className="mx-auto max-w-[400px] mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm text-emerald-300 font-medium">Email enviado!</p>
                      <p className="text-sm text-emerald-200/80 mt-1">{message}</p>
                    </div>
                  </div>
                </div>
            )}

            {/* Error Message */}
            {status === 'error' && (
                <div className="mx-auto max-w-[400px] mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-sm text-rose-300">{message}</p>
                  </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mx-auto max-w-[400px]">
              <div>
                <label
                    className="mb-1 block text-sm font-medium text-sky-200/80"
                    htmlFor="email"
                >
                  Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input w-full border-sky-300/30 bg-sky-950/30 text-sky-100 placeholder:text-sky-300/60 focus:border-sky-400 focus:ring-sky-400/40"
                    placeholder="Digite seu email"
                    disabled={isLoading}
                    required
                />
              </div>

              <div className="mt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn w-full bg-gradient-to-t from-sky-500 to-blue-400 text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-400 hover:to-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                        Enviando...
                      </>
                  ) : (
                      'Enviar link de recuperação'
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Lembrou sua senha?{' '}
                <Link href="/signin" className="text-sky-400 hover:text-sky-300 transition-colors">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
  );
}