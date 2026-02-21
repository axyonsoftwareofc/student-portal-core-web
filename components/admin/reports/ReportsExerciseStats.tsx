// components/admin/reports/ReportsExerciseStats.tsx
'use client';

import { FileCheck, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import type { ReportStats, ExerciseStatusDistribution } from '@/hooks/useReports';

interface ReportsExerciseStatsProps {
    stats: ReportStats;
    exerciseDistribution: ExerciseStatusDistribution[];
}

const TOOLTIP_STYLE = {
    backgroundColor: '#111827',
    border: '1px solid rgba(55, 65, 81, 0.5)',
    borderRadius: '8px',
    fontSize: '13px',
};

export function ReportsExerciseStats({ stats, exerciseDistribution }: ReportsExerciseStatsProps) {
    const hasExerciseData = exerciseDistribution.some(
        (d: ExerciseStatusDistribution) => d.value > 0
    );

    const exerciseCards = [
        {
            label: 'Total Enviados',
            value: stats.totalExerciseSubmissions,
            icon: FileCheck,
            color: 'text-sky-400',
            bgColor: 'bg-sky-500/10',
        },
        {
            label: 'Pendentes',
            value: stats.pendingExercises,
            icon: Clock,
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
        },
        {
            label: 'Aprovados',
            value: stats.approvedExercises,
            icon: CheckCircle,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
        },
        {
            label: 'Em Revisão',
            value: stats.needsRevisionExercises,
            icon: AlertTriangle,
            color: 'text-rose-400',
            bgColor: 'bg-rose-500/10',
        },
    ] as const;

    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
            <div className="mb-6 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-white">Exercícios</h3>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {exerciseCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div
                                    key={card.label}
                                    className="rounded-lg border border-gray-800/50 bg-gray-800/30 p-4 text-center"
                                >
                                    <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${card.color}`} strokeWidth={1.5} />
                                    </div>
                                    <p className="text-2xl font-bold text-white">{card.value}</p>
                                    <p className="mt-1 text-xs text-gray-500">{card.label}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10">
                            <TrendingUp className="h-6 w-6 text-violet-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Média Geral da Turma</p>
                            <p className="text-2xl font-bold text-violet-400">
                                {stats.classAverage !== null ? stats.classAverage.toFixed(1) : '—'}
                                {stats.classAverage !== null && (
                                    <span className="ml-1 text-sm font-normal text-gray-500">/ 10</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-center text-sm text-gray-400">Distribuição</p>
                    <div className="h-48">
                        {hasExerciseData ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={exerciseDistribution.filter(
                                            (d: ExerciseStatusDistribution) => d.value > 0
                                        )}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="40%"
                                        outerRadius="70%"
                                        dataKey="value"
                                        fontSize={11}
                                        label={({ name, value }: { name?: string; value?: number }) =>
                                            `${name || ''}: ${value || 0}`
                                        }
                                        labelLine={false}
                                    >
                                        {exerciseDistribution
                                            .filter((d: ExerciseStatusDistribution) => d.value > 0)
                                            .map((entry: ExerciseStatusDistribution, index: number) => (
                                                <Cell key={`exercise-${index}`} fill={entry.color} />
                                            ))}
                                    </Pie>
                                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                Nenhum exercício enviado
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}