// components/dashboard/dashboard-header.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
    ChevronDown,
    User,
    Settings,
    LayoutDashboard,
    LogOut,
    GraduationCap,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Gera as iniciais do nome do usuário para o avatar.
 */
function getInitials(name: string): string {
    const parts = name.split(" ");
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
}

/**
 * Header do dashboard com menu do usuário.
 * Responsivo: mostra nome completo no desktop, apenas avatar no mobile.
 */
export function DashboardHeader() {
    const { user, logout } = useAuth();

    if (!user) return null;

    const isAdmin = user.role === "admin";
    const dashboardLink = isAdmin ? "/admin/dashboard" : "/aluno/dashboard";
    const profileLink = isAdmin ? "/admin/configuracoes" : "/aluno/perfil";

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="sticky top-0 z-40 border-b border-gray-800/50 bg-gray-950/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 sm:h-16 items-center justify-between">
                    {/* Logo - com margem à esquerda no mobile para o botão do menu */}
                    <Link
                        href={dashboardLink}
                        className="flex items-center gap-2.5 transition-opacity hover:opacity-80 ml-12 lg:ml-0"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600">
                            <GraduationCap className="h-4 w-4 text-white" strokeWidth={2} />
                        </div>
                        <span className="hidden sm:inline font-nacelle text-lg font-semibold text-white">
              {isAdmin ? "Code Plus Admin" : "Code Plus"}
            </span>
                    </Link>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 transition-colors hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-gray-950">
                                {/* Avatar */}
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {getInitials(user.name)}
                  </span>
                                </div>

                                {/* Name - hidden on mobile */}
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-gray-200 truncate max-w-[120px] md:max-w-none">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {isAdmin ? "Administrador" : "Aluno"}
                                    </p>
                                </div>

                                {/* Chevron */}
                                <ChevronDown
                                    className="h-4 w-4 text-gray-500 transition-transform duration-200"
                                    strokeWidth={1.5}
                                />
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                            {/* User info header */}
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium text-gray-200 truncate">
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            {/* Navigation items */}
                            <DropdownMenuItem asChild>
                                <Link href={profileLink}>
                                    {isAdmin ? (
                                        <Settings strokeWidth={1.5} />
                                    ) : (
                                        <User strokeWidth={1.5} />
                                    )}
                                    {isAdmin ? "Configurações" : "Meu Perfil"}
                                </Link>
                            </DropdownMenuItem>

                            {isAdmin && (
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/dashboard">
                                        <LayoutDashboard strokeWidth={1.5} />
                                        Dashboard
                                    </Link>
                                </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* Logout */}
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 focus:bg-rose-950/30 focus:text-rose-300"
                            >
                                <LogOut strokeWidth={1.5} className="!text-rose-400" />
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}

// Export default para compatibilidade
export default DashboardHeader;