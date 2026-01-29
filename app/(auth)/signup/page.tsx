export const metadata = {
  title: "Criar conta - Open PRO",
  description: "Página de cadastro",
};

import Link from "next/link";

export default function SignUp() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">

          {}
          <div className="pb-12 text-center">
            <h1 className="animate-[gradient_6s_linear_infinite]
              bg-[linear-gradient(to_right,var(--color-sky-200),var(--color-sky-400),var(--color-sky-100),var(--color-sky-500),var(--color-sky-200))]
              bg-[length:200%_auto] bg-clip-text font-nacelle
              text-3xl font-semibold text-transparent md:text-4xl">
              Criar uma conta
            </h1>
          </div>

          {}
          <form className="mx-auto max-w-[400px]">
            <div className="space-y-5">

              <div>
                <label className="mb-1 block text-sm font-medium text-sky-200/80">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="form-input w-full"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-sky-200/80">
                  E-mail<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="form-input w-full"
                  placeholder="Seu e-mail"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sky-200/80">
                  Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="form-input w-full"
                  placeholder="Senha (mínimo de 10 caracteres)"
                  required
                />
              </div>

            </div>

            {}
            <div className="mt-6 space-y-5">

              <button
                type="submit"
                className="btn w-full bg-linear-to-t from-sky-500 to-sky-400
                           text-white font-medium shadow-lg
                           hover:from-sky-400 hover:to-sky-300 transition"
              >
                Cadastrar
              </button>

              <div className="flex items-center gap-3 text-center text-sm italic text-gray-400
                              before:h-px before:flex-1 before:bg-gray-400/30
                              after:h-px after:flex-1 after:bg-gray-400/30">
                ou
              </div>

              <button
                type="button"
                className="btn w-full bg-sky-100 text-sky-700 font-medium
                           border border-sky-300 hover:bg-sky-200 transition"
              >
                Entrar com Google
              </button>

            </div>
          </form>

          {}
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
