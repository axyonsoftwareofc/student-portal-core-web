// components/admin/dashboard/ExerciseStatsCards.tsx
'use client';

import { ClipboardCheck, Clock, CheckCircle, RotateCcw, Star } from 'lucide-react';

interface ExerciseStatsCardsProps {
    totalExercises: number;
    pendingExercises: number;
    approvedExercises: number;
    needsRevisionExercises: number;
    classAverage: number | null;
}

export function ExerciseStatsCards({
                                       totalExercises,
                                       pendingExercises,
                                       approvedExercises,
                                       needsRevisionExercises,
                                       classAverage,
                                   }: ExerciseStatsCardsProps) {
    const stats = [
        {
            label: 'Exercícios',
            value: totalExercises,
            icon: ClipboardCheck,
            color: 'sky',
        },
        {
            label: 'Pendentes',
            value: pendingExercises,
            icon: Clock,
            color: pendingExercises > 0 ? 'amber' : 'gray',
            highlight: pendingExercises > 0,
        },
        {
            label: 'Aprovados',
            value: approvedExercises,
            icon: CheckCircle,
            color: 'emerald',
        },
        {
            label: 'Revisão',
            value: needsRevisionExercises,
            icon: RotateCcw,
            color: needsRevisionExercises > 0 ? 'rose' : 'gray',
        },
        {
            label: 'Média Turma',
            value: classAverage !== null ? classAverage.toFixed(1) : '--',
            icon: Star,
            color: 'amber',
        },
    ];

    const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
        sky: { bg: 'bg-sky-500/10', icon: 'text-sky-400', border: 'border-gray-800/50' },
        amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/30' },
        emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-gray-800/50' },
        rose: { bg: 'bg-rose-500/10', icon: 'text-rose-400', border: 'border-rose-500/30' },
        gray: { bg: 'bg-gray-500/10', icon: 'text-gray-400', border: 'border-gray-800/50' },
    };

    return (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => {
                const Icon = stat.icon;
                const colors = colorClasses[stat.color];

                return (
                    <div
                        key={stat.label}
                        className={`rounded-lg border ${colors.border} bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg}`}>
                                <Icon className={`h-4 w-4 ${colors.icon}`} strokeWidth={1.5} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                );
            })}
        </div>
    );
}