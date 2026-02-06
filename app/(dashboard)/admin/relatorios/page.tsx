// app/(dashboard)/admin/relatorios/page.tsx
'use client';

import { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    BookOpen,
    DollarSign,
    Trophy,
    FileSpreadsheet,
    FileText,
    RefreshCw,
    Loader2,
    CheckCircle,
    Clock,
    AlertTriangle,
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
    Cell,
} from 'recharts';
import { useReports } from '@/hooks/useReports';

// Formatadores
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

// Componente de Card de Métrica
interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color: 'sky' | 'emerald' | 'amber' | 'rose';
}

function MetricCard({ title, value, subtitle, icon: Icon, color }: MetricCardProps) {
    const colorClasses = {
        sky: 'bg-sky-500/10 text-sky-400',
        emerald: 'bg-emerald-500/10 text-emerald-400',
        amber: 'bg-amber-500/10 text-amber-400',
        rose: 'bg-rose-500/10 text-rose-400',
    };

    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
                    )}
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}

export default function RelatoriosPage() {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

    const {
        stats,
        monthlyData,
        moduleCompletion,
        topStudents,
        studentDistribution,
        paymentDistribution,
        isLoading,
        refetch,
    } = useReports(timeRange);

    // Dados para o gráfico de barras de módulos
    const moduleChartData = moduleCompletion.map(m => ({
        modulo: m.moduleName.length > 15 ? m.moduleName.substring(0, 15) + '...' : m.moduleName,
        concluidos: m.completedByStudents,
        emAndamento: m.studentsInProgress,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <BarChart3 className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Relatórios e Análises</h1>
                        <p className="text-sm text-gray-400">Métricas e insights sobre a plataforma</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Seletor de período */}
                    <div className="flex gap-1 rounded-lg border border-gray-800/50 bg-gray-900/50 p-1">
                        {(['week', 'month', 'year'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                    timeRange === range
                                        ? 'bg-sky-600 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Ano'}
                            </button>
                        ))}
                    </div>

                    {/* Botão atualizar */}
                    <button
                        onClick={refetch}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-4 py-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
                        ) : (
                            <RefreshCw className="h-5 w-5" strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                </div>
            ) : (
                <>
                    {/* Cards de Métricas Principais */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <MetricCard
                            title="Alunos Ativos"
                            value={stats.activeStudents}
                            subtitle={`${stats.totalStudents} total`}
                            icon={Users}
                            color="sky"
                        />
                        <MetricCard
                            title="Engajamento"
                            value={`${stats.engagementRate}%`}
                            subtitle={`${stats.totalLessonsCompleted} aulas concluídas`}
                            icon={TrendingUp}
                            color="emerald"
                        />
                        <MetricCard
                            title="Receita Total"
                            value={formatCurrency(stats.totalRevenue)}
                            subtitle={`${formatCurrency(stats.pendingRevenue)} pendente`}
                            icon={DollarSign}
                            color="emerald"
                        />
                        <MetricCard
                            title="Aulas Disponíveis"
                            value={stats.totalLessons}
                            subtitle={`${stats.totalModules} módulos`}
                            icon={BookOpen}
                            color="amber"
                        />
                    </div>

                    {/* Gráficos - Linha 1 */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Evolução Mensal */}
                        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                            <h3 className="mb-4 text-lg font-semibold text-white">
                                Novos Alunos (6 meses)
                            </h3>
                            <div className="h-72">
                                {monthlyData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                                            <YAxis stroke="#6b7280" fontSize={12} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#111827',
                                                    border: '1px solid rgba(55, 65, 81, 0.5)',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="alunos"
                                                stroke="#0ea5e9"
                                                strokeWidth={2}
                                                dot={{ fill: '#0ea5e9', r: 4 }}
                                                name="Novos Alunos"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-500">
                                        Sem dados para exibir
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Distribuição de Pagamentos */}
                        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                            <h3 className="mb-4 text-lg font-semibold text-white">
                                Status dos Pagamentos
                            </h3>
                            <div className="h-72">
                                {paymentDistribution.some(d => d.value > 0) ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={paymentDistribution.filter(d => d.value > 0)}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                outerRadius="70%"
                                                dataKey="value"
                                                fontSize={12}
                                            >
                                                {paymentDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#111827',
                                                    border: '1px solid rgba(55, 65, 81, 0.5)',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-500">
                                        Sem pagamentos registrados
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Conclusão por Módulo */}
                    <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                        <h3 className="mb-4 text-lg font-semibold text-white">
                            Progresso por Módulo
                        </h3>
                        <div className="h-72">
                            {moduleChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={moduleChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                        <XAxis dataKey="modulo" stroke="#6b7280" fontSize={11} />
                                        <YAxis stroke="#6b7280" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#111827',
                                                border: '1px solid rgba(55, 65, 81, 0.5)',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Bar dataKey="concluidos" fill="#10b981" name="Concluídos" />
                                        <Bar dataKey="emAndamento" fill="#0ea5e9" name="Em Andamento" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-500">
                                    Sem dados de progresso
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cards de Resumo Financeiro */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                                <CheckCircle className="h-6 w-6 text-emerald-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Recebido</p>
                                <p className="text-xl font-bold text-emerald-400">
                                    {formatCurrency(stats.totalRevenue)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                                <Clock className="h-6 w-6 text-amber-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Pendente</p>
                                <p className="text-xl font-bold text-amber-400">
                                    {formatCurrency(stats.pendingRevenue)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10">
                                <AlertTriangle className="h-6 w-6 text-rose-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Atrasado</p>
                                <p className="text-xl font-bold text-rose-400">
                                    {formatCurrency(stats.overdueRevenue)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top 5 Alunos */}
                    <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                            <h3 className="text-lg font-semibold text-white">Top 5 Alunos</h3>
                        </div>

                        {topStudents.length > 0 ? (
                            <div className="space-y-3">
                                {topStudents.map((student, index) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between rounded-lg border border-gray-800/50 bg-gray-800/30 p-4"
                                    >
                                        <div className="flex items-center gap-4">
                      <span className={`text-2xl font-bold ${
                          index === 0 ? 'text-amber-400' :
                              index === 1 ? 'text-gray-300' :
                                  index === 2 ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        #{index + 1}
                      </span>
                                            <div>
                                                <p className="font-medium text-white">{student.name}</p>
                                                <p className="text-sm text-gray-500">{student.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-sky-400">
                                                {student.lessonsCompleted} aulas
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {student.quizAverage > 0
                                                    ? `Média quiz: ${student.quizAverage}%`
                                                    : `Última atividade: ${formatDate(student.lastActivity)}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Users className="h-12 w-12 text-gray-600" strokeWidth={1.5} />
                                <p className="mt-2 text-gray-400">Nenhum progresso registrado ainda</p>
                            </div>
                        )}
                    </div>

                    {/* Botões de Exportação */}
                    <div className="flex flex-col justify-end gap-3 sm:flex-row">
                        <button
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                            onClick={() => alert('Exportação para Excel em breve!')}
                        >
                            <FileSpreadsheet className="h-4 w-4" strokeWidth={1.5} />
                            Exportar Excel
                        </button>
                        <button
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                            onClick={() => alert('Exportação para PDF em breve!')}
                        >
                            <FileText className="h-4 w-4" strokeWidth={1.5} />
                            Exportar PDF
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}