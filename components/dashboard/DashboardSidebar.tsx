// components/dashboard/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    TrendingUp,
    User,
} from "lucide-react";

const navItems = [
    { href: "/aluno/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/aluno/estudar", label: "Estudar", icon: BookOpen },
    { href: "/aluno/modulos", label: "Módulos", icon: GraduationCap },
    { href: "/aluno/desempenho", label: "Desempenho", icon: TrendingUp },
    { href: "/aluno/perfil", label: "Perfil", icon: User },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-800/50 bg-gray-950">
            <nav className="h-full overflow-y-auto p-4 sm:p-6">
                {/* Navigation */}
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200 ${
                                    isActive
                                        ? "bg-sky-500/10 text-sky-300 border-l-2 border-sky-400 -ml-[2px] pl-[14px]"
                                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                                }`}
                            >
                                <Icon
                                    className={`h-[18px] w-[18px] transition-colors ${
                                        isActive
                                            ? "text-sky-400"
                                            : "text-gray-500 group-hover:text-gray-300"
                                    }`}
                                    strokeWidth={1.5}
                                />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Progress Card */}
                <div className="mt-8 rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Próxima Meta
                    </p>
                    <div className="mt-3 space-y-2">
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                            <div
                                className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all"
                                style={{ width: "68%" }}
                            />
                        </div>
                        <p className="text-xs text-gray-500">Completar Spring Boot</p>
                    </div>
                </div>
            </nav>
        </aside>
    );
}