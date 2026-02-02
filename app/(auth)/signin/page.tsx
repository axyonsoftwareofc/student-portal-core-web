'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (!success) {
        setError('E-mail ou senha incorretos');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Page header */}
          <div className="pb-12 text-center">
            <h1
              className="animate-[gradient_6s_linear_infinite]
              bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-sky-300),var(--color-gray-50),var(--color-sky-400),var(--color-gray-200))]
              bg-[length:200%_auto] bg-clip-text font-nacelle
              text-3xl font-semibold text-transparent md:text-4xl"
            >
              Bem-vindo de volta
            </h1>
          </div>

          {/* Credenciais de teste */}
          <div className="mx-auto max-w-[400px] mb-6 rounded-lg border border-sky-500/30 bg-sky-950/20 p-4">
            <h3 className="text-sm font-semibold text-sky-300 mb-2">
              🔐 Credenciais de Teste
            </h3>
            <div className="space-y-2 text-xs text-gray-300">
              <div>
                <p className="font-medium text-sky-200">Aluno:</p>
                <p>E-mail: <code className="bg-gray-900/50 px-1 rounded">aluno@teste.com</code></p>
                <p>Senha: <code className="bg-gray-900/50 px-1 rounded">123456</code></p>
              </div>
              <div className="pt-2 border-t border-sky-700/30">
                <p className="font-medium text-sky-200">Admin:</p>
                <p>E-mail: <code className="bg-gray-900/50 px-1 rounded">admin@teste.com</code></p>
                <p>Senha: <code className="bg-gray-900/50 px-1 rounded">admin123</code></p>
              </div>
            </div>
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
                  E-mail
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
                <div className="mb-1 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-sky-200/80">
                    Senha
                  </label>
                  <Link
                    className="text-sm text-sky-400 hover:underline"
                    href="/reset-password"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <input
                  type="password"
                  className="form-input w-full"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit button */}
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
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>

              <div
                className="flex items-center gap-3 text-center text-sm italic text-gray-400
                           before:h-px before:flex-1 before:bg-gray-400/30
                           after:h-px after:flex-1 after:bg-gray-400/30"
              >
                ou
              </div>

              <button
                type="button"
                className="btn w-full bg-sky-100 text-sky-700 font-medium
                           border border-sky-300 hover:bg-sky-200 transition
                           disabled:opacity-50"
                disabled={isLoading}
              >
                Entrar com Google
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center text-sm text-sky-200/70">
            Ainda não tem uma conta?{' '}
            <Link className="font-medium text-sky-400 hover:underline" href="/signup">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
