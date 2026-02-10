export const metadata = {
  title: "Reset Password - Open PRO",
  description: "Page description",
};

import Link from "next/link";

export default function ResetPassword() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="pb-12 text-center">
            <h1 className="
              animate-[gradient_6s_linear_infinite]
              bg-[linear-gradient(to_right,var(--color-sky-200),var(--color-blue-300),var(--color-sky-50),var(--color-blue-400),var(--color-sky-200))]
              bg-[length:200%_auto]
              bg-clip-text
              font-nacelle
              text-3xl
              font-semibold
              text-transparent
              md:text-4xl
            ">
              Resetar senha
            </h1>
          </div>

          {/* Form */}
          <form className="mx-auto max-w-[400px]">
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
                className="
                  form-input
                  w-full
                  border-sky-300/30
                  bg-sky-950/30
                  text-sky-100
                  placeholder:text-sky-300/60
                  focus:border-sky-400
                  focus:ring-sky-400/40
                "
                placeholder="Digite seu email"
              />
            </div>

            <div className="mt-6">
              <button
                className="
                  btn
                  w-full
                  bg-gradient-to-t
                  from-sky-500
                  to-blue-400
                  text-white
                  shadow-lg
                  shadow-sky-500/30
                  transition
                  hover:from-sky-400
                  hover:to-blue-300
                "
              >
                Resetar senha
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
