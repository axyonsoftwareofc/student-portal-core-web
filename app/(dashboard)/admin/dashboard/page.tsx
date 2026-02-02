// app/(dashboard)/admin/dashboard/page.tsx
'use client';

import { adminStats, recentActivities, systemAlerts } from "@/utils/mock/adminMock";
import AdminStatCard from "@/components/dashboard/cards/AdminStatCard";
import Link from "next/link";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="font-nacelle text-4xl font-bold text-white">
                    Dashboard Administrativo 👑
                </h1>
                <p className="text-gray-400">
                    Visão geral do sistema e métricas importantes
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">
                            Atividades Recentes
                        </h2>
                        <Link
                            href="/admin/relatorios"
                            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Ver tudo →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                            activity.type === 'student' ? 'bg-blue-500/20' :
                                                activity.type === 'content' ? 'bg-green-500/20' :
                                                    activity.type === 'system' ? 'bg-orange-500/20' :
                                                        'bg-purple-500/20'
                                        }`}>
                                            <span className="text-lg">{activity.icon}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white">
                                            {activity.title}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-400">
                                            {activity.description}
                                        </p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {new Date(activity.timestamp).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Alerts */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">
                        Alertas do Sistema
                    </h2>

                    <div className="space-y-3">
                        {systemAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`rounded-lg border p-4 backdrop-blur transition-all hover:scale-105 cursor-pointer ${
                                    alert.severity === 'high'
                                        ? 'border-red-500/30 bg-red-950/20'
                                        : alert.severity === 'medium'
                                            ? 'border-yellow-500/30 bg-yellow-950/20'
                                            : 'border-blue-500/30 bg-blue-950/20'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">{alert.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white text-sm">
                                            {alert.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-400">
                                            {alert.message}
                                        </p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {new Date(alert.timestamp).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full rounded-lg border border-violet-500/30 bg-violet-950/20 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-950/30 transition-colors">
                        Ver todos os alertas
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">
                    Ações Rápidas
                </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/admin/alunos"
                        className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Novo Aluno</p>
                                <p className="text-xs text-gray-400">Cadastrar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/modulos"
                        className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                                <span className="text-2xl">📚</span>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Novo Módulo</p>
                                <p className="text-xs text-gray-400">Criar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/conteudos"
                        className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                                <span className="text-2xl">📝</span>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Novo Conteúdo</p>
                                <p className="text-xs text-gray-400">Adicionar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/relatorios"
                        className="group rounded-lg border border-gray-700/50 bg-gray-900/30 p-6 backdrop-blur transition-all hover:border-violet-500/50 hover:bg-gray-900/60"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div>
                                <p className="font-semibold text-white">Relatório</p>
                                <p className="text-xs text-gray-400">Gerar</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}