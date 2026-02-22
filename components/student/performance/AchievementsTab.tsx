// components/student/performance/AchievementsTab.tsx
'use client';

import { useState } from 'react';
import { Trophy, Sparkles, Filter, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementCard } from '@/components/student/achievements/AchievementCard';
import { CATEGORY_INFO, RARITY_INFO } from '@/lib/data/achievements';
import type { AchievementCategory, AchievementRarity } from '@/lib/types/achievements';

interface AchievementsTabProps {
    overallProgress: number;
    completedLessons: number;
    totalExercises: number;
    approvedExercises?: number;
    perfectScores?: number;
    averageGrade?: number | null;
    completedQuizzes?: number;
    perfectQuizzes?: number;
    totalNotes?: number;
    completedModules?: number;
}

type FilterType = 'all' | 'unlocked' | 'locked' | AchievementCategory;

export function AchievementsTab({
                                    overallProgress,
                                    completedLessons,
                                    totalExercises,
                                    approvedExercises = 0,
                                    perfectScores = 0,
                                    averageGrade = null,
                                    completedQuizzes = 0,
                                    perfectQuizzes = 0,
                                    totalNotes = 0,
                                    completedModules = 0,
                                }: AchievementsTabProps) {
    const [filter, setFilter] = useState<FilterType>('all');
    const [showOnlyUnlocked, setShowOnlyUnlocked] = useState<boolean>(false);

    const { achievements, stats } = useAchievements({
        completedLessons,
        totalExercises,
        approvedExercises,
        perfectScores,
        averageGrade,
        overallProgress,
        completedQuizzes,
        perfectQuizzes,
        totalNotes,
        completedModules,
        allExercisesApproved: approvedExercises > 0 && approvedExercises === totalExercises,
    });

    // Filtrar conquistas
    const filteredAchievements = achievements.filter((a) => {
        if (showOnlyUnlocked && !a.unlocked) return false;
        if (filter === 'all') return true;
        if (filter === 'unlocked') return a.unlocked;
        if (filter === 'locked') return !a.unlocked;
        return a.category === filter;
    });

    // Agrupar por categoria para exibição
    const groupedByCategory = Object.keys(CATEGORY_INFO).map((cat) => {
        const category = cat as AchievementCategory;
        const categoryAchievements = filteredAchievements.filter((a) => a.category === category);
        return {
            category,
            info: CATEGORY_INFO[category],
            achievements: categoryAchievements,
            stats: stats.byCategory[category],
        };
    }).filter((group) => group.achievements.length > 0);

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-amber-900/20 to-amber-950/30 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <Trophy className="h-7 w-7 text-amber-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Suas Conquistas</h3>
                            <p className="text-sm text-amber-200/70">
                                {stats.unlocked} de {stats.total} desbloqueadas ({stats.percentage}%)
                            </p>
                        </div>
                    </div>

                    {/* Estatísticas por raridade */}
                    <div className="flex gap-3">
                        {(['common', 'rare', 'epic', 'legendary'] as AchievementRarity[]).map((rarity) => {
                            const info = RARITY_INFO[rarity];
                            const rarityStats = stats.byRarity[rarity];
                            return (
                                <div
                                    key={rarity}
                                    className={cn(
                                        'text-center px-3 py-2 rounded-lg border',
                                        rarity === 'common' && 'border-gray-700 bg-gray-800/30',
                                        rarity === 'rare' && 'border-sky-500/20 bg-sky-950/20',
                                        rarity === 'epic' && 'border-violet-500/20 bg-violet-950/20',
                                        rarity === 'legendary' && 'border-amber-500/20 bg-amber-950/20'
                                    )}
                                >
                                    <p className={cn(
                                        'text-lg font-bold',
                                        rarity === 'common' && 'text-gray-400',
                                        rarity === 'rare' && 'text-sky-400',
                                        rarity === 'epic' && 'text-violet-400',
                                        rarity === 'legendary' && 'text-amber-400'
                                    )}>
                                        {rarityStats.unlocked}/{rarityStats.total}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase">{info.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Barra de progresso geral */}
                <div className="mt-4">
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                            style={{ width: `${stats.percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Próximas conquistas */}
            {stats.nextToUnlock.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                        <h4 className="font-semibold text-white">Próximas Conquistas</h4>
                    </div>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        {stats.nextToUnlock.map((achievement) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                                showProgress
                                size="sm"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        filter === 'all'
                            ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                            : 'text-gray-400 hover:text-gray-300 border border-gray-800 hover:border-gray-700'
                    )}
                >
                    Todas
                </button>
                <button
                    onClick={() => setFilter('unlocked')}
                    className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        filter === 'unlocked'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'text-gray-400 hover:text-gray-300 border border-gray-800 hover:border-gray-700'
                    )}
                >
                    ✓ Desbloqueadas
                </button>
                <button
                    onClick={() => setFilter('locked')}
                    className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        filter === 'locked'
                            ? 'bg-gray-500/10 text-gray-300 border border-gray-500/20'
                            : 'text-gray-400 hover:text-gray-300 border border-gray-800 hover:border-gray-700'
                    )}
                >
                    🔒 Bloqueadas
                </button>
                <div className="h-4 w-px bg-gray-800" />
                {Object.entries(CATEGORY_INFO).slice(0, 4).map(([cat, info]) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat as AchievementCategory)}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            filter === cat
                                ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                                : 'text-gray-400 hover:text-gray-300 border border-gray-800 hover:border-gray-700'
                        )}
                    >
                        {info.emoji} {info.label}
                    </button>
                ))}
            </div>

            {/* Grid de conquistas por categoria */}
            <div className="space-y-6">
                {groupedByCategory.map(({ category, info, achievements: categoryAchievements, stats: catStats }) => (
                    <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{info.emoji}</span>
                                <h4 className="font-semibold text-white">{info.label}</h4>
                                <span className="text-xs text-gray-500">
                  ({catStats.unlocked}/{catStats.total})
                </span>
                            </div>
                        </div>
                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
                            {categoryAchievements.map((achievement) => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    size="md"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filteredAchievements.length === 0 && (
                <div className="text-center py-12 rounded-xl border border-gray-800/50 bg-gray-900/30">
                    <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhuma conquista encontrada</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Tente alterar os filtros
                    </p>
                </div>
            )}

            {/* Mensagem motivacional */}
            <div className="rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-950/30 via-sky-900/20 to-sky-950/30 p-4">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                        <p className="text-sm text-sky-200">
                            Continue estudando no seu ritmo! Cada aula completa te aproxima de novas conquistas.
                            O importante é evoluir um pouco a cada dia. 💙
                        </p>
                        {stats.nextToUnlock.length > 0 && (
                            <p className="text-xs text-sky-300/70 mt-2">
                                Dica: Você está a {100 - stats.nextToUnlock[0].percentage}% de desbloquear "{stats.nextToUnlock[0].title}"!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}