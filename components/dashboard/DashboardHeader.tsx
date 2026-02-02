// components/dashboard/DashboardHeader.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        console.log('Botão logout clicado');
        setMenuOpen(false); // Fecha o menu
        await logout();
    };

    if (!user) return null;

    // Determinar o link do dashboard baseado no role
    const dashboardLink = user.role === 'admin' ? '/admin/dashboard' : '/aluno/dashboard';
    const profileLink = user.role === 'admin' ? '/admin/configuracoes' : '/aluno/perfil';

    return (
        <header className="sticky top-0 z-50 border-b border-gray-700/50 bg-gray-950/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo e marca */}
                    <Link href={dashboardLink} className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
                            <span className="text-sm font-bold text-white">📚</span>
                        </div>
                        <span className="hidden font-nacelle text-lg font-semibold text-white sm:inline">
                            {user.role === 'admin' ? 'Painel Admin' : 'Portal do Aluno'}
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
                                    {user.name.split(" ")[0][0]}
                                    {user.name.split(" ")[1]?.[0] || ''}
                                </span>
                            </div>

                            {/* Name */}
                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-medium text-white">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {user.role === 'admin' ? 'Administrador' : 'Aluno'}
                                </p>
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
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Dropdown menu */}
                        {menuOpen && (
                            <>
                                {/* Overlay para fechar o menu ao clicar fora */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                />

                                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-700 bg-gray-900 shadow-xl z-20">
                                    <div className="border-b border-gray-700 p-4">
                                        <p className="text-sm font-medium text-white">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-400">{user.email}</p>
                                    </div>

                                    <div className="p-2">
                                        <Link
                                            href={profileLink}
                                            onClick={() => setMenuOpen(false)}
                                            className="block rounded px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-gray-800"
                                        >
                                            {user.role === 'admin' ? '⚙️ Configurações' : '👤 Meu Perfil'}
                                        </Link>

                                        {user.role === 'admin' && (
                                            <Link
                                                href="/admin/dashboard"
                                                onClick={() => setMenuOpen(false)}
                                                className="block rounded px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-gray-800"
                                            >
                                                📊 Dashboard
                                            </Link>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-700 p-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full rounded px-4 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-950/30"
                                        >
                                            🚪 Sair
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}