// components/student/community/CommunityFeed.tsx
'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AchievementCard } from './AchievementCard';
import { EmptyFeed } from './EmptyFeed';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';
import { CommunityFeedItem, ReactionType } from '@/lib/types/community';

interface CommunityFeedProps {
    currentUserId: string | null;
}

export function CommunityFeed({ currentUserId }: CommunityFeedProps) {
    const {
        feedItems,
        isLoading,
        error,
        userReactions,
        toggleReaction,
        loadMore,
        hasMore,
        refresh,
    } = useCommunityFeed(currentUserId);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4">
                <p className="text-rose-400 mb-4">Erro ao carregar feed: {error}</p>
                <Button variant="outline" onClick={refresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                </Button>
            </div>
        );
    }

    if (isLoading && feedItems.length === 0) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            </div>
        );
    }

    if (feedItems.length === 0) {
        return <EmptyFeed />;
    }

    const defaultReactions = {
        celebrate: false,
        fire: false,
        strong: false,
        clap: false,
        heart: false,
    };

    return (
        <div className="space-y-4">
            {/* Header com refresh */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                    {feedItems.length} conquista{feedItems.length !== 1 ? 's' : ''}
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-white"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>

            {/* Lista de conquistas */}
            <div className="space-y-3">
                {feedItems.map((achievement: CommunityFeedItem) => (
                    <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        userReactions={userReactions[achievement.id] || defaultReactions}
                        onToggleReaction={toggleReaction}
                        isCurrentUser={achievement.user_id === currentUserId}
                    />
                ))}
            </div>

            {/* Carregar mais */}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={isLoading}
                        className="w-full max-w-xs"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Carregando...
                            </>
                        ) : (
                            'Carregar mais'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}