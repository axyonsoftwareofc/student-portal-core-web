// components/student/community/AchievementCard.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ReactionBar } from './ReactionBar';
import { CommunityFeedItem, ReactionType, UserReactions } from '@/lib/types/community';

interface AchievementCardProps {
    achievement: CommunityFeedItem;
    userReactions: UserReactions;
    onToggleReaction: (achievementId: string, type: ReactionType) => void;
    isCurrentUser: boolean;
}

export function AchievementCard({
                                    achievement,
                                    userReactions,
                                    onToggleReaction,
                                    isCurrentUser,
                                }: AchievementCardProps) {
    const timeAgo = formatDistanceToNow(new Date(achievement.created_at), {
        addSuffix: true,
        locale: ptBR,
    });

    const reactions = [
        { type: 'celebrate' as ReactionType, count: achievement.celebrate_count },
        { type: 'fire' as ReactionType, count: achievement.fire_count },
        { type: 'strong' as ReactionType, count: achievement.strong_count },
        { type: 'clap' as ReactionType, count: achievement.clap_count },
        { type: 'heart' as ReactionType, count: achievement.heart_count },
    ];

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
            {/* Header */}
            <div className="flex items-start gap-3">
                <UserAvatar
                    name={achievement.user_name}
                    avatarUrl={achievement.avatar_url}
                    size="md"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">
              {achievement.user_name}
            </span>
                        {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400">
                você
              </span>
                        )}
                        <span className="text-gray-500 text-sm">
              {timeAgo}
            </span>
                    </div>

                    {/* Mensagem da conquista */}
                    <p className="mt-2 text-gray-200 text-lg">
                        <span className="mr-2">{achievement.icon}</span>
                        {achievement.message}
                    </p>
                </div>
            </div>

            {/* Reactions */}
            <div className="mt-4 pt-3 border-t border-gray-800">
                <ReactionBar
                    reactions={reactions}
                    userReactions={userReactions}
                    onToggleReaction={(type: ReactionType) => onToggleReaction(achievement.id, type)}
                />
            </div>
        </div>
    );
}