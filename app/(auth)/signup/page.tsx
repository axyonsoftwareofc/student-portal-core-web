// app/(auth)/signup/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUp() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(email, password, name);

      if (result.success && result.redirectTo) {
        // Usa router.push para navegação SPA (sem reload)
        router.push(result.redirectTo);
      } else if (!result.success) {
        setError(result.error || 'Erro ao criar conta');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
      <section>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="py-12 md:py-20">
            {/* Header */}
            <div className="pb-12 text-center">
              <h1 className="animate-[gradient_6s_linear_infinite]
              bg-[linear-gradient(to_right,var(--color-sky-200),var(--color-sky-400),var(--color-sky-100),var(--color-sky-500),var(--color-sky-200))]
              bg-[length:200%_auto] bg-clip-text font-nacelle
              text-3xl font-semibold text-transparent md:text-4xl">
                Criar uma conta
              </h1>
            </div>

            {/* Form */}
            <form className="mx-auto max-w-[400px]" onSubmit={handleSubmit}>
              {error && (
                  <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">
                    {error}
                  </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-sky-200/80">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="text"
                      className="form-input w-full"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-sky-200/80">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="email"
                      className="form-input w-full"
                      placeholder="Seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-200/80">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <input
                      type="password"
                      className="form-input w-full"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="mt-6 space-y-5">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn w-full bg-linear-to-t from-sky-500 to-sky-400
                           text-white font-medium shadow-lg
                           hover:from-sky-400 hover:to-sky-300 transition
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Criando conta...
                      </>
                  ) : (
                      'Cadastrar'
                  )}
                </button>
              </div>
            </form>

            {/* Sign in link */}
            <div className="mt-6 text-center text-sm text-sky-200/70">
              Já possui uma conta?{" "}
              <Link className="font-medium text-sky-400 hover:underline" href="/signin">
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </section>
  );
}