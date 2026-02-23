// components/student/journey/JourneyHeader.tsx
'use client';

import { Flame, Star, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatXp, LEVELS } from '@/lib/data/gamification';
import type { GamificationStats } from '@/lib/types/gamification';

interface JourneyHeaderProps {
    stats: GamificationStats;
}

export function JourneyHeader({ stats }: JourneyHeaderProps) {
    const { levelInfo, xp, xpProgress, xpToNextLevel, currentStreak, longestStreak } = stats;

    return (
        <div className="rounded-xl border border-gray-800/50 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-gray-900/80 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Level Badge */}
                <div className="flex items-center gap-4">
                    <div className={cn(
                        'flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl text-3xl sm:text-4xl',
                        'bg-gradient-to-br shadow-lg',
                        levelInfo.color === 'gray' && 'from-gray-700 to-gray-800 shadow-gray-900/50',
                        levelInfo.color === 'emerald' && 'from-emerald-600 to-emerald-800 shadow-emerald-900/50',
                        levelInfo.color === 'sky' && 'from-sky-600 to-sky-800 shadow-sky-900/50',
                        levelInfo.color === 'violet' && 'from-violet-600 to-violet-800 shadow-violet-900/50',
                        levelInfo.color === 'amber' && 'from-amber-500 to-amber-700 shadow-amber-900/50',
                        levelInfo.color === 'rose' && 'from-rose-600 to-rose-800 shadow-rose-900/50',
                    )}>
                        {levelInfo.emoji}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Nível {levelInfo.level}</span>
                            {levelInfo.level === 10 && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium">
                  MAX
                </span>
                            )}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">{levelInfo.title}</h2>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 grid grid-cols-3 gap-3 sm:gap-4">
                    {/* XP */}
                    <div className="text-center p-3 rounded-lg bg-gray-800/30 border border-gray-800/50">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-white">{formatXp(xp)}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">XP Total</p>
                    </div>

                    {/* Streak */}
                    <div className="text-center p-3 rounded-lg bg-gray-800/30 border border-gray-800/50">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Flame className={cn(
                                'h-4 w-4',
                                currentStreak > 0 ? 'text-orange-400' : 'text-gray-600'
                            )} strokeWidth={1.5} />
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-white">{currentStreak}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            {currentStreak === 1 ? 'Dia' : 'Dias'} seguidos
                        </p>
                    </div>

                    {/* Record */}
                    <div className="text-center p-3 rounded-lg bg-gray-800/30 border border-gray-800/50">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Trophy className="h-4 w-4 text-violet-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-white">{longestStreak}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">Recorde</p>
                    </div>
                </div>
            </div>

            {/* XP Progress Bar */}
            {levelInfo.level < 10 && (
                <div className="mt-5">
                    <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">
              Progresso para Nível {levelInfo.level + 1}
            </span>
                        <span className="text-xs font-medium text-sky-400">
              {xpToNextLevel} XP restantes
            </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-800 overflow-hidden">
                        <div
                            className={cn(
                                'h-full transition-all duration-500 rounded-full',
                                'bg-gradient-to-r from-sky-500 to-sky-400'
                            )}
                            style={{ width: `${xpProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Max Level Message */}
            {levelInfo.level === 10 && (
                <div className="mt-5 flex items-center justify-center gap-2 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Zap className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-amber-300">
            Você alcançou o nível máximo! Parabéns, Lenda! 🏆
          </span>
                </div>
            )}
        </div>
    );
}