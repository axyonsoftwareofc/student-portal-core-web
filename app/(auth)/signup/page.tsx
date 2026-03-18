// app/(auth)/signup/page.tsx
'use client';

import { useState, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { validatePassword } from '@/utils/passwordValidation';
import { PasswordStrength } from '@/components/common/password-strength';

export default function SignUp() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordValidation = useMemo(() => validatePassword(password), [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordValidation.isValid) {
      setError('A senha não atende todos os requisitos de segurança');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(email, password, name);

      if (result.success && result.redirectTo) {
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
                  <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input w-full pr-10"
                        placeholder="Crie uma senha segura"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
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

                  {/* Indicador de força */}
                  {password.length > 0 && (
                      <div className="mt-3">
                        <PasswordStrength validation={passwordValidation} />
                      </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-6 space-y-5">
                <button
                    type="submit"
                    disabled={isLoading || !passwordValidation.isValid}
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