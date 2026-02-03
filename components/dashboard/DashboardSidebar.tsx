// components/dashboard/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/aluno/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/aluno/estudar", label: "Estudar", icon: "📚" },
    { href: "/aluno/modulos", label: "Módulos", icon: "🎓" },
    { href: "/aluno/desempenho", label: "Desempenho", icon: "📈" },
    { href: "/aluno/perfil", label: "Perfil", icon: "👤" },
];

export default function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-700/50 bg-gray-950/50 backdrop-blur-xl">
            <nav className="h-full overflow-y-auto p-4 sm:p-6">
                <div className="space-y-1 sm:space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-medium transition-all duration-200 ${
                                    isActive
                                        ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-300 border-l-2 border-violet-500"
                                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
                                }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Progress card */}
                <div className="mt-8 rounded-lg border border-gray-700/50 bg-gray-900/50 p-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Próxima Meta
                    </p>
                    <div className="mt-3 space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                            <div
                                className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all"
                                style={{ width: "68%" }}
                            />
                        </div>
                        <p className="text-xs text-gray-400">Completar Spring Boot</p>
                    </div>
                </div>
            </nav>
        </aside>
    );
}