// components/student/community/ReactionBar.tsx
'use client';

import { cn } from '@/lib/utils';
import { ReactionType, REACTION_EMOJIS, UserReactions } from '@/lib/types/community';

interface ReactionCount {
    type: ReactionType;
    count: number;
}

interface ReactionBarProps {
    reactions: ReactionCount[];
    userReactions: UserReactions;
    onToggleReaction: (type: ReactionType) => void;
    disabled?: boolean;
}

export function ReactionBar({
                                reactions,
                                userReactions,
                                onToggleReaction,
                                disabled = false
                            }: ReactionBarProps) {
    const reactionTypes: ReactionType[] = ['celebrate', 'fire', 'strong', 'clap', 'heart'];

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {reactionTypes.map((type: ReactionType) => {
                const reactionData = reactions.find((r: ReactionCount) => r.type === type);
                const count = reactionData?.count || 0;
                const isActive = userReactions[type];
                const emoji = REACTION_EMOJIS[type];

                return (
                    <button
                        key={type}
                        onClick={() => onToggleReaction(type)}
                        disabled={disabled}
                        className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all',
                            'hover:scale-105 active:scale-95',
                            isActive
                                ? 'bg-sky-500/20 border border-sky-500/50 text-sky-300'
                                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600',
                            disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
                        )}
                    >
                        <span className="text-base">{emoji}</span>
                        {count > 0 && (
                            <span className={cn(
                                'font-medium',
                                isActive ? 'text-sky-300' : 'text-gray-500'
                            )}>
                {count}
              </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}