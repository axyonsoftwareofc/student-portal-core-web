"use client";

import Link from "next/link";
import { useState } from "react";
import { studentData } from "@/utils/mock/studentMock";

export default function DashboardHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        // Por enquanto, apenas redireciona para signin
        // Depois integra com autenticação real
        window.location.href = "/signin";
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-700/50 bg-gray-950/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo e marca */}
                    <Link href="/aluno/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
                            <span className="text-sm font-bold text-white">📚</span>
                        </div>
                        <span className="hidden font-nacelle text-lg font-semibold text-white sm:inline">
              Portal do Aluno
            </span>
                    </Link>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-900/50"
                        >
                            {/* Avatar */}
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {studentData.name.split(" ")[0][0]}
                    {studentData.name.split(" ")[1][0]}
                </span>
                            </div>

                            {/* Name */}
                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-medium text-white">
                                    {studentData.name}
                                </p>
                                <p className="text-xs text-gray-400">{studentData.course}</p>
                            </div>

                            {/* Dropdown icon */}
                            <svg
                                className={`h-4 w-4 text-gray-400 transition-transform ${
                                    menuOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                            </svg>
                        </button>

                        {/* Dropdown menu */}
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
                                <div className="border-b border-gray-700 p-4">
                                    <p className="text-sm font-medium text-white">
                                        {studentData.name}
                                    </p>
                                    <p className="text-xs text-gray-400">{studentData.email}</p>
                                </div>

                                <div className="space-y-2 p-2">
                                    <Link
                                        href="/aluno/perfil"
                                        className="block rounded px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-gray-800"
                                    >
                                        Meu Perfil
                                    </Link>
                                    <Link
                                        href="/aluno/configuracoes"
                                        className="block rounded px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-gray-800"
                                    >
                                        Configurações
                                    </Link>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full border-t border-gray-700 px-4 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-950/30"
                                >
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}