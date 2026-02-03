// components/dashboard/DashboardHeader.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    ChevronDown,
    User,
    Settings,
    LayoutDashboard,
    LogOut,
    GraduationCap
} from "lucide-react";

export default function DashboardHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
    };

    if (!user) return null;

    const dashboardLink = user.role === 'admin' ? '/admin/dashboard' : '/aluno/dashboard';
    const profileLink = user.role === 'admin' ? '/admin/configuracoes' : '/aluno/perfil';

    return (
        <header className="sticky top-0 z-40 border-b border-gray-800/50 bg-gray-950/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 sm:h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href={dashboardLink} className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600">
                            <GraduationCap className="h-4 w-4 text-white" strokeWidth={2} />
                        </div>
                        <span className="hidden sm:inline font-nacelle text-lg font-semibold text-white">
              {user.role === 'admin' ? 'Code Plus Admin' : 'Code Plus'}
            </span>
                    </Link>

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 transition-colors hover:bg-gray-800/50"
                        >
                            {/* Avatar */}
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  {user.name.split(" ")[0][0]}
                    {user.name.split(" ")[1]?.[0] || ''}
                </span>
                            </div>

                            {/* Name - hidden on small mobile */}
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-gray-200 truncate max-w-[120px] md:max-w-none">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.role === 'admin' ? 'Administrador' : 'Aluno'}
                                </p>
                            </div>

                            {/* Dropdown icon */}
                            <ChevronDown
                                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                                    menuOpen ? "rotate-180" : ""
                                }`}
                                strokeWidth={1.5}
                            />
                        </button>

                        {/* Dropdown menu */}
                        {menuOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                />

                                {/* Menu */}
                                <div className="absolute right-0 mt-2 w-56 sm:w-52 rounded-lg border border-gray-800 bg-gray-900 shadow-xl z-20">
                                    {/* User info */}
                                    <div className="border-b border-gray-800 px-4 py-3">
                                        <p className="text-sm font-medium text-gray-200 truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>

                                    {/* Menu items */}
                                    <div className="p-1.5">
                                        <Link
                                            href={profileLink}
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-gray-100"
                                        >
                                            {user.role === 'admin' ? (
                                                <Settings className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                            ) : (
                                                <User className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                            )}
                                            {user.role === 'admin' ? 'Configurações' : 'Meu Perfil'}
                                        </Link>

                                        {user.role === 'admin' && (
                                            <Link
                                                href="/admin/dashboard"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-gray-100"
                                            >
                                                <LayoutDashboard className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                                                Dashboard
                                            </Link>
                                        )}
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-800 p-1.5">
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-950/30 hover:text-red-300"
                                        >
                                            <LogOut className="h-4 w-4" strokeWidth={1.5} />
                                            Sair
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