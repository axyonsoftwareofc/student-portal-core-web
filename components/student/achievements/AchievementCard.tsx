// components/student/achievements/AchievementCard.tsx
'use client';

import { Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RARITY_INFO } from '@/lib/data/achievements';
import type { AchievementWithProgress } from '@/lib/types/achievements';

interface AchievementCardProps {
    achievement: AchievementWithProgress;
    showProgress?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function AchievementCard({
                                    achievement,
                                    showProgress = true,
                                    size = 'md'
                                }: AchievementCardProps) {
    const { unlocked, percentage, rarity, secret } = achievement;
    const rarityInfo = RARITY_INFO[rarity];

    const sizeClasses = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-5',
    };

    const emojiSizes = {
        sm: 'text-2xl',
        md: 'text-3xl',
        lg: 'text-4xl',
    };

    const titleSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    // Cores por raridade
    const borderColors = {
        common: unlocked ? 'border-gray-500/30' : 'border-gray-800/50',
        rare: unlocked ? 'border-sky-500/40' : 'border-gray-800/50',
        epic: unlocked ? 'border-violet-500/50' : 'border-gray-800/50',
        legendary: unlocked ? 'border-amber-500/60' : 'border-gray-800/50',
    };

    const bgColors = {
        common: unlocked ? 'bg-gray-900/50' : 'bg-gray-900/30',
        rare: unlocked ? 'bg-sky-950/30' : 'bg-gray-900/30',
        epic: unlocked ? 'bg-violet-950/30' : 'bg-gray-900/30',
        legendary: unlocked ? 'bg-amber-950/20' : 'bg-gray-900/30',
    };

    const glowEffects = {
        common: '',
        rare: unlocked ? 'shadow-lg shadow-sky-500/10' : '',
        epic: unlocked ? 'shadow-lg shadow-violet-500/20' : '',
        legendary: unlocked ? 'shadow-xl shadow-amber-500/30 animate-pulse-slow' : '',
    };

    return (
        <div
            className={cn(
                'relative rounded-xl border transition-all duration-300',
                sizeClasses[size],
                borderColors[rarity],
                bgColors[rarity],
                glowEffects[rarity],
                !unlocked && 'opacity-60 hover:opacity-80',
                unlocked && 'hover:scale-105'
            )}
        >
            {/* Glow effect for legendary */}
            {unlocked && rarity === 'legendary' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 via-yellow-500/10 to-amber-500/5 animate-shimmer" />
            )}

            {/* Sparkles for epic+ */}
            {unlocked && (rarity === 'epic' || rarity === 'legendary') && (
                <Sparkles
                    className={cn(
                        'absolute top-2 right-2 h-4 w-4',
                        rarity === 'epic' ? 'text-violet-400' : 'text-amber-400'
                    )}
                    strokeWidth={1.5}
                />
            )}

            {/* Lock icon for locked */}
            {!unlocked && (
                <div className="absolute top-2 right-2">
                    <Lock className="h-3.5 w-3.5 text-gray-600" strokeWidth={1.5} />
                </div>
            )}

            {/* Content */}
            <div className="relative text-center">
                {/* Emoji */}
                <div className={cn(
                    'mb-2 transition-transform',
                    emojiSizes[size],
                    !unlocked && 'grayscale',
                    unlocked && 'animate-bounce-subtle'
                )}>
                    {secret && !unlocked ? '❓' : achievement.emoji}
                </div>

                {/* Title */}
                <h4 className={cn(
                    'font-semibold mb-0.5',
                    titleSizes[size],
                    unlocked ? 'text-white' : 'text-gray-400'
                )}>
                    {secret && !unlocked ? '???' : achievement.title}
                </h4>

                {/* Description */}
                <p className={cn(
                    'text-gray-500 leading-tight',
                    size === 'sm' ? 'text-[10px]' : 'text-xs'
                )}>
                    {secret && !unlocked ? 'Conquista secreta' : achievement.description}
                </p>

                {/* Progress bar */}
                {showProgress && !unlocked && !secret && (
                    <div className="mt-3 space-y-1">
                        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div
                                className={cn(
                                    'h-full transition-all duration-500',
                                    rarity === 'legendary' ? 'bg-amber-500' :
                                        rarity === 'epic' ? 'bg-violet-500' :
                                            rarity === 'rare' ? 'bg-sky-500' : 'bg-gray-500'
                                )}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-600">
                            {achievement.current}/{achievement.requirement}
                        </p>
                    </div>
                )}

                {/* Rarity badge for unlocked */}
                {unlocked && rarity !== 'common' && (
                    <div className={cn(
                        'mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                        rarity === 'rare' && 'bg-sky-500/10 text-sky-400',
                        rarity === 'epic' && 'bg-violet-500/10 text-violet-400',
                        rarity === 'legendary' && 'bg-amber-500/10 text-amber-400'
                    )}>
                        {rarityInfo.label}
                    </div>
                )}
            </div>
        </div>
    );
}