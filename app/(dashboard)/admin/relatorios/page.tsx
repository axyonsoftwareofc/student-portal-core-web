// app/(dashboard)/admin/relatorios/page.tsx

'use client';

import { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    Clock,
    Star,
    RefreshCcw,
    Trophy,
    FileSpreadsheet,
    FileText,
    Send
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

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
    { name: 'Concluídos', value: 60, color: '#0ea5e9' },
];

const topStudents = [
    { name: 'Pedro Oliveira', points: 1250, modules: 5 },
    { name: 'Ana Silva', points: 1180, modules: 4 },
    { name: 'Carlos Santos', points: 1120, modules: 5 },
    { name: 'Mariana Costa', points: 1090, modules: 4 },
    { name: 'João Ferreira', points: 1050, modules: 4 },
];

interface MetricCardProps {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: typeof TrendingUp;
}

function MetricCard({ title, value, change, changeType, icon: Icon }: MetricCardProps) {
    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs sm:text-sm text-gray-400">{title}</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-white">{value}</p>
                    <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {changeType === 'positive' ? '↑' : '↓'} {change}
                    </p>
                </div>
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-sky-500/10">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-sky-400" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}

export default function RelatoriosPage() {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <BarChart3 className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            Relatórios e Análises
                        </h1>
                        <p className="text-sm text-gray-500">
                            Métricas e insights sobre a plataforma
                        </p>
                    </div>
                </div>
                <div className="flex gap-1 sm:gap-2 bg-gray-900/50 border border-gray-800/50 p-1 rounded-lg">
                    {(['week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                                timeRange === range
                                    ? 'bg-sky-600 text-white'
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
                <MetricCard
                    title="Engajamento"
                    value="82%"
                    change="5%"
                    changeType="positive"
                    icon={TrendingUp}
                />
                <MetricCard
                    title="Tempo/Dia"
                    value="2.4h"
                    change="12%"
                    changeType="positive"
                    icon={Clock}
                />
                <MetricCard
                    title="NPS Score"
                    value="8.7"
                    change="0.3"
                    changeType="positive"
                    icon={Star}
                />
                <MetricCard
                    title="Retenção"
                    value="91%"
                    change="2%"
                    changeType="negative"
                    icon={RefreshCcw}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Enrollment Trend */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                        Matrículas (6 meses)
                    </h3>
                    <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={enrollmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#111827',
                                        border: '1px solid rgba(55, 65, 81, 0.5)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="alunos"
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    dot={{ fill: '#0ea5e9', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6">
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
                                        backgroundColor: '#111827',
                                        border: '1px solid rgba(55, 65, 81, 0.5)',
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
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-4">
                    Conclusão por Módulo
                </h3>
                <div className="h-64 sm:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={completionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                            <XAxis dataKey="modulo" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#111827',
                                    border: '1px solid rgba(55, 65, 81, 0.5)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="concluidos" fill="#10b981" name="Concluídos" />
                            <Bar dataKey="emAndamento" fill="#0ea5e9" name="Em Andamento" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Performing Students */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                        Top 5 Alunos do Mês
                    </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                    {topStudents.map((student, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-gray-800/30 border border-gray-800/50 p-3 sm:p-4"
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <span className="text-lg sm:text-2xl font-semibold text-sky-400 w-6 sm:w-8">
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
                                <p className="text-base sm:text-lg font-semibold text-sky-400">
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
                <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                    <FileSpreadsheet className="h-4 w-4" strokeWidth={1.5} />
                    Excel
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                    <FileText className="h-4 w-4" strokeWidth={1.5} />
                    PDF
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors">
                    <Send className="h-4 w-4" strokeWidth={1.5} />
                    Enviar
                </button>
            </div>
        </div>
    );
}