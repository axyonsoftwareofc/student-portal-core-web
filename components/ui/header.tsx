// components/ui/header.tsx
"use client";

import Link from "next/link";
import Logo from "./logo";

export default function Header() {
  return (
      <header className="z-30 mt-2 w-full md:mt-5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl
                        bg-gray-900/90 px-3 backdrop-blur-xs">

            <div className="flex flex-1 items-center">
              <Logo />
            </div>

            <ul className="flex flex-1 items-center justify-end gap-3">
              <li>
                <Link
                    href="/signin"
                    className="btn-sm border border-sky-400 text-sky-400
                           bg-transparent px-4 py-[5px] rounded-md
                           hover:bg-sky-400 hover:text-white
                           transition"
                >
                  Entrar
                </Link>
              </li>

              <li>
                <Link
                    href="/inscreva-se"
                    className="btn-sm bg-linear-to-t from-sky-500 to-sky-400
                           px-4 py-[5px] text-white font-medium rounded-md
                           shadow-md hover:from-sky-400 hover:to-sky-300
                           transition"
                >
                  Inscreva-se
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
  );
}