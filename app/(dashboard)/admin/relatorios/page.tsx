// app/(dashboard)/admin/relatorios/page.tsx
'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const enrollmentData = [
    { month: 'Jan', alunos: 45 },
    { month: 'Fev', alunos: 52 },
    { month: 'Mar', alunos: 48 },
    { month: 'Abr', alunos: 61 },
    { month: 'Mai', alunos: 55 },
    { month: 'Jun', alunos: 67 },
];

const completionData = [
    { modulo: 'Java Básico', concluidos: 145, emAndamento: 35 },
    { modulo: 'POO', concluidos: 128, emAndamento: 52 },
    { modulo: 'Spring', concluidos: 98, emAndamento: 67 },
    { modulo: 'APIs REST', concluidos: 76, emAndamento: 89 },
];

const statusDistribution = [
    { name: 'Ativos', value: 185, color: '#10b981' },
    { name: 'Inativos', value: 45, color: '#6b7280' },
    { name: 'Concluídos', value: 60, color: '#8b5cf6' },
];

export default function RelatoriosPage() {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-nacelle text-3xl font-bold text-white">
                        Relatórios e Análises
                    </h1>
                    <p className="mt-1 text-gray-400">
                        Métricas e insights sobre a plataforma
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            timeRange === 'week'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            timeRange === 'month'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        Mês
                    </button>
                    <button
                        onClick={() => setTimeRange('year')}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            timeRange === 'year'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        Ano
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Taxa de Engajamento</p>
                            <p className="text-3xl font-bold text-white">82%</p>
                            <p className="text-xs text-emerald-400 mt-1">↑ 5% vs mês anterior</p>
                        </div>
                        <span className="text-4xl">📈</span>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Tempo Médio/Dia</p>
                            <p className="text-3xl font-bold text-white">2.4h</p>
                            <p className="text-xs text-emerald-400 mt-1">↑ 12% vs mês anterior</p>
                        </div>
                        <span className="text-4xl">⏱️</span>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">NPS Score</p>
                            <p className="text-3xl font-bold text-white">8.7</p>
                            <p className="text-xs text-emerald-400 mt-1">↑ 0.3 vs mês anterior</p>
                        </div>
                        <span className="text-4xl">⭐</span>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Taxa de Retenção</p>
                            <p className="text-3xl font-bold text-white">91%</p>
                            <p className="text-xs text-red-400 mt-1">↓ 2% vs mês anterior</p>
                        </div>
                        <span className="text-4xl">🔄</span>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Enrollment Trend */}
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Matrículas nos Últimos 6 Meses
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={enrollmentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="alunos"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                dot={{ fill: '#8b5cf6', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Distribution */}
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Distribuição de Status dos Alunos
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Module Completion Chart */}
            <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Taxa de Conclusão por Módulo
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={completionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="modulo" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Bar dataKey="concluidos" fill="#10b981" name="Concluídos" />
                        <Bar dataKey="emAndamento" fill="#8b5cf6" name="Em Andamento" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top Performing Students */}
            <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    🏆 Top 5 Alunos do Mês
                </h3>
                <div className="space-y-3">
                    {[
                        { name: 'Pedro Oliveira', points: 1250, modules: 5 },
                        { name: 'Ana Silva', points: 1180, modules: 4 },
                        { name: 'Carlos Santos', points: 1120, modules: 5 },
                        { name: 'Mariana Costa', points: 1090, modules: 4 },
                        { name: 'João Ferreira', points: 1050, modules: 4 },
                    ].map((student, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-gray-800/50 p-4"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-violet-400">
                                    #{index + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-white">{student.name}</p>
                                    <p className="text-sm text-gray-400">
                                        {student.modules} módulos concluídos
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-violet-400">
                                    {student.points}
                                </p>
                                <p className="text-xs text-gray-500">pontos</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Export Options */}
            <div className="flex justify-end gap-3">
                <button className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                    📊 Exportar Excel
                </button>
                <button className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                    📄 Exportar PDF
                </button>
                <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
                    📧 Enviar por Email
                </button>
            </div>
        </div>
    );
}