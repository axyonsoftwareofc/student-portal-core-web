// app/(dashboard)/admin/dashboard/page.tsx
'use client';

import { adminStats, recentActivities, systemAlerts } from "@/utils/mock/adminMock";
import AdminStatCard from "@/components/dashboard/cards/AdminStatCard";
import Link from "next/link";
import { Users, BookOpen, FileText, BarChart3 } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                    Visão geral do sistema
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
                {adminStats.map((stat) => (
                    <AdminStatCard
                        key={stat.id}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        trend={stat.trend}
                        description={stat.description}
                    />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">
                            Atividades Recentes
                        </h2>
                        <Link
                            href="/admin/relatorios"
                            className="text-sm text-gray-400 hover:text-sky-400 transition-colors"
                        >
                            Ver tudo →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentActivities.map((activity) => {
                            const Icon = activity.icon;
                            return (
                                <div
                                    key={activity.id}
                                    className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                            activity.type === 'student' ? 'bg-sky-500/10 text-sky-400' :
                                                activity.type === 'content' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    activity.type === 'system' ? 'bg-amber-500/10 text-amber-400' :
                                                        'bg-violet-500/10 text-violet-400'
                                        }`}>
                                            <Icon className="h-5 w-5" strokeWidth={1.5} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-200">
                                                {activity.title}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                                                {activity.description}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-600">
                                                {new Date(activity.timestamp).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* System Alerts */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">
                        Alertas
                    </h2>

                    <div className="space-y-3">
                        {systemAlerts.map((alert) => {
                            const Icon = alert.icon;
                            return (
                                <div
                                    key={alert.id}
                                    className={`rounded-lg border p-4 transition-all hover:scale-[1.01] cursor-pointer ${
                                        alert.severity === 'high'
                                            ? 'border-rose-500/20 bg-rose-950/20'
                                            : alert.severity === 'medium'
                                                ? 'border-amber-500/20 bg-amber-950/20'
                                                : 'border-sky-500/20 bg-sky-950/20'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Icon className={`h-5 w-5 mt-0.5 ${
                                            alert.severity === 'high' ? 'text-rose-400' :
                                                alert.severity === 'medium' ? 'text-amber-400' :
                                                    'text-sky-400'
                                        }`} strokeWidth={1.5} />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-200 text-sm">
                                                {alert.title}
                                            </h3>
                                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                                {alert.message}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-600">
                                                {new Date(alert.timestamp).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button className="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-900 transition-colors">
                        Ver todos os alertas
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">
                    Ações Rápidas
                </h2>

                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/admin/alunos"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/10">
                                <Users className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm">Novo Aluno</p>
                                <p className="text-xs text-gray-500">Cadastrar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/modulos"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
                                <BookOpen className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm">Novo Módulo</p>
                                <p className="text-xs text-gray-500">Criar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/conteudos"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/10">
                                <FileText className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm">Novo Conteúdo</p>
                                <p className="text-xs text-gray-500">Adicionar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/relatorios"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10">
                                <BarChart3 className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm">Relatório</p>
                                <p className="text-xs text-gray-500">Gerar</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}