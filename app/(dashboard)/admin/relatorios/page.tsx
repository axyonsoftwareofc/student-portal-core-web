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
    { modulo: 'Java', concluidos: 145, emAndamento: 35 },
    { modulo: 'POO', concluidos: 128, emAndamento: 52 },
    { modulo: 'Spring', concluidos: 98, emAndamento: 67 },
    { modulo: 'APIs', concluidos: 76, emAndamento: 89 },
];

const statusDistribution = [
    { name: 'Ativos', value: 185, color: '#10b981' },
    { name: 'Inativos', value: 45, color: '#6b7280' },
    { name: 'Concluídos', value: 60, color: '#8b5cf6' },
];

export default function RelatoriosPage() {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-nacelle text-2xl sm:text-3xl font-bold text-white">
                        Relatórios e Análises
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">
                        Métricas e insights sobre a plataforma
                    </p>
                </div>
                <div className="flex gap-1 sm:gap-2 bg-gray-900/50 p-1 rounded-lg">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                                timeRange === range
                                    ? 'bg-violet-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Engajamento</p>
                            <p className="text-2xl sm:text-3xl font-bold text-white">82%</p>
                            <p className="text-xs text-emerald-400 mt-1">↑ 5%</p>
                        </div>
                        <span className="text-2xl sm:text-4xl">📈</span>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Tempo/Dia</p>
                            <p className="text-2xl sm:text-3xl font-bold text-white">2.4h</p>
                            <p className="text-xs text-emerald-400 mt-1">↑ 12%</p>
                        </div>
                        <span className="text-2xl sm:text-4xl">⏱️</span>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">NPS Score</p>
                            <p className="text-2xl sm:text-3xl font-bold text-white">8.7</p>
                            <p className="text-xs text-emerald-400 mt-1">↑ 0.3</p>
                        </div>
                        <span className="text-2xl sm:text-4xl">⭐</span>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400">Retenção</p>
                            <p className="text-2xl sm:text-3xl font-bold text-white">91%</p>
                            <p className="text-xs text-red-400 mt-1">↓ 2%</p>
                        </div>
                        <span className="text-2xl sm:text-4xl">🔄</span>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Enrollment Trend */}
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                        Matrículas (6 meses)
                    </h3>
                    <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={enrollmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        fontSize: '12px',
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
                </div>

                {/* Status Distribution */}
                <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                        Status dos Alunos
                    </h3>
                    <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius="70%"
                                    fill="#8884d8"
                                    dataKey="value"
                                    fontSize={11}
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
                                        fontSize: '12px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Module Completion Chart */}
            <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                    Conclusão por Módulo
                </h3>
                <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={completionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="modulo" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="concluidos" fill="#10b981" name="Concluídos" />
                            <Bar dataKey="emAndamento" fill="#8b5cf6" name="Em Andamento" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Performing Students */}
            <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                    🏆 Top 5 Alunos do Mês
                </h3>
                <div className="space-y-2 sm:space-y-3">
                    {[
                        { name: 'Pedro Oliveira', points: 1250, modules: 5 },
                        { name: 'Ana Silva', points: 1180, modules: 4 },
                        { name: 'Carlos Santos', points: 1120, modules: 5 },
                        { name: 'Mariana Costa', points: 1090, modules: 4 },
                        { name: 'João Ferreira', points: 1050, modules: 4 },
                    ].map((student, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3 sm:p-4"
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <span className="text-lg sm:text-2xl font-bold text-violet-400 w-6 sm:w-8">
                                    #{index + 1}
                                </span>
                                <div>
                                    <p className="text-sm sm:text-base font-medium text-white">{student.name}</p>
                                    <p className="text-xs sm:text-sm text-gray-400">
                                        {student.modules} módulos
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base sm:text-lg font-bold text-violet-400">
                                    {student.points}
                                </p>
                                <p className="text-xs text-gray-500">pts</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Export Options */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                    📊 Excel
                </button>
                <button className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                    📄 PDF
                </button>
                <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
                    📧 Enviar
                </button>
            </div>
        </div>
    );
}