// components/student/journey/StreakCard.tsx
'use client';

import { Flame, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCardProps {
    currentStreak: number;
    longestStreak: number;
    isStreakActive: boolean;
}

export function StreakCard({ currentStreak, longestStreak, isStreakActive }: StreakCardProps) {
    const streakDays = Array.from({ length: 7 }, (_, i) => {
        const dayIndex = 6 - i;
        return dayIndex < currentStreak;
    }).reverse();

    const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const today = new Date().getDay();

    return (
        <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-950/30 to-amber-950/20 p-5">
            <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    currentStreak > 0 ? 'bg-orange-500/20' : 'bg-gray-800/50'
                )}>
                    <Flame className={cn(
                        'h-6 w-6',
                        currentStreak > 0 ? 'text-orange-400' : 'text-gray-600'
                    )} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Sequência de Estudos</h3>
                    <p className="text-xs text-gray-500">
                        {currentStreak > 0
                            ? `🔥 ${currentStreak} ${currentStreak === 1 ? 'dia' : 'dias'} seguidos!`
                            : 'Comece a estudar hoje!'
                        }
                    </p>
                </div>
            </div>

            {/* Week visualization */}
            <div className="grid grid-cols-7 gap-2 mb-4">
                {dayLabels.map((label, index) => {
                    const isActive = streakDays[index];
                    const isToday = index === today;

                    return (
                        <div key={index} className="text-center">
                            <span className="text-[10px] text-gray-600">{label}</span>
                            <div className={cn(
                                'mt-1 h-8 w-8 mx-auto rounded-lg flex items-center justify-center',
                                isActive && 'bg-orange-500/20',
                                isToday && !isActive && 'border-2 border-dashed border-orange-500/30',
                                !isActive && !isToday && 'bg-gray-800/30'
                            )}>
                                {isActive ? (
                                    <Flame className="h-4 w-4 text-orange-400" strokeWidth={1.5} />
                                ) : isToday ? (
                                    <span className="text-xs text-orange-400/50">?</span>
                                ) : (
                                    <span className="text-xs text-gray-700">-</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-orange-500/10">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
                    <span className="text-xs text-gray-400">Atual: {currentStreak} dias</span>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-violet-400" strokeWidth={1.5} />
                    <span className="text-xs text-gray-400">Recorde: {longestStreak} dias</span>
                </div>
            </div>

            {/* Motivation */}
            {!isStreakActive && currentStreak === 0 && (
                <div className="mt-4 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                    <p className="text-xs text-gray-400 text-center">
                        💪 Complete pelo menos 1 conteúdo hoje para iniciar sua sequência!
                    </p>
                </div>
            )}

            {isStreakActive && currentStreak >= 3 && (
                <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-xs text-orange-300 text-center">
                        🔥 Incrível! Você está em uma sequência de {currentStreak} dias!
                        {currentStreak >= 7 && ' Uma semana inteira! 🎉'}
                    </p>
                </div>
            )}
        </div>
    );
}