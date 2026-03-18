// hooks/useCommunityFeed.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CommunityFeedItem, ReactionType, UserReactions } from '@/lib/types/community';

interface ReactionRecord {
    achievement_id: string;
    reaction_type: string;
}

interface UseCommunityFeedReturn {
    feedItems: CommunityFeedItem[];
    isLoading: boolean;
    error: string | null;
    userReactions: Record<string, UserReactions>;
    toggleReaction: (achievementId: string, reactionType: ReactionType) => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;
    refresh: () => Promise<void>;
}

const PAGE_SIZE = 10;

export function useCommunityFeed(currentUserId: string | null): UseCommunityFeedReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [feedItems, setFeedItems] = useState<CommunityFeedItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userReactions, setUserReactions] = useState<Record<string, UserReactions>>({});
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const fetchFeed = useCallback(async (pageNumber: number, append: boolean = false) => {
        try {
            setIsLoading(true);
            setError(null);

            const from = pageNumber * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error: fetchError } = await supabase
                .from('community_feed')
                .select('*')
                .order('created_at', { ascending: false })
                .range(from, to);

            if (fetchError) throw fetchError;

            const items = (data || []) as CommunityFeedItem[];

            if (append) {
                setFeedItems((prev: CommunityFeedItem[]) => [...prev, ...items]);
            } else {
                setFeedItems(items);
            }

            setHasMore(items.length === PAGE_SIZE);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar feed');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    const fetchUserReactions = useCallback(async (achievementIds: string[]) => {
        if (!currentUserId || achievementIds.length === 0) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('community_reactions')
                .select('achievement_id, reaction_type')
                .eq('user_id', currentUserId)
                .in('achievement_id', achievementIds);

            if (fetchError) throw fetchError;

            const reactionsMap: Record<string, UserReactions> = {};

            achievementIds.forEach((id: string) => {
                reactionsMap[id] = {
                    celebrate: false,
                    fire: false,
                    strong: false,
                    clap: false,
                    heart: false,
                };
            });

            (data || []).forEach((reaction: ReactionRecord) => {
                if (reactionsMap[reaction.achievement_id]) {
                    reactionsMap[reaction.achievement_id][reaction.reaction_type as ReactionType] = true;
                }
            });

            setUserReactions((prev: Record<string, UserReactions>) => ({ ...prev, ...reactionsMap }));

        } catch (err) {
            console.error('Erro ao buscar reações do usuário:', err);
        }
    }, [supabase, currentUserId]);

    useEffect(() => {
        fetchFeed(0);
    }, [fetchFeed]);

    useEffect(() => {
        if (feedItems.length > 0 && currentUserId) {
            const ids = feedItems.map((item: CommunityFeedItem) => item.id);
            fetchUserReactions(ids);
        }
    }, [feedItems, currentUserId, fetchUserReactions]);

    const toggleReaction = async (achievementId: string, reactionType: ReactionType) => {
        if (!currentUserId) return;

        const currentReactions = userReactions[achievementId] || {
            celebrate: false,
            fire: false,
            strong: false,
            clap: false,
            heart: false,
        };

        const isActive = currentReactions[reactionType];

        setUserReactions((prev: Record<string, UserReactions>) => ({
            ...prev,
            [achievementId]: {
                ...currentReactions,
                [reactionType]: !isActive,
            },
        }));

        setFeedItems((prev: CommunityFeedItem[]) =>
            prev.map((item: CommunityFeedItem) => {
                if (item.id === achievementId) {
                    const countKey = `${reactionType}_count` as keyof CommunityFeedItem;
                    const currentCount = item[countKey] as number;
                    return {
                        ...item,
                        [countKey]: isActive ? currentCount - 1 : currentCount + 1,
                        total_reactions: isActive ? item.total_reactions - 1 : item.total_reactions + 1,
                    };
                }
                return item;
            })
        );

        try {
            if (isActive) {
                await supabase
                    .from('community_reactions')
                    .delete()
                    .eq('achievement_id', achievementId)
                    .eq('user_id', currentUserId)
                    .eq('reaction_type', reactionType);
            } else {
                await supabase
                    .from('community_reactions')
                    .insert({
                        achievement_id: achievementId,
                        user_id: currentUserId,
                        reaction_type: reactionType,
                    });
            }
        } catch (err) {
            setUserReactions((prev: Record<string, UserReactions>) => ({
                ...prev,
                [achievementId]: currentReactions,
            }));

            setFeedItems((prev: CommunityFeedItem[]) =>
                prev.map((item: CommunityFeedItem) => {
                    if (item.id === achievementId) {
                        const countKey = `${reactionType}_count` as keyof CommunityFeedItem;
                        const currentCount = item[countKey] as number;
                        return {
                            ...item,
                            [countKey]: isActive ? currentCount + 1 : currentCount - 1,
                            total_reactions: isActive ? item.total_reactions + 1 : item.total_reactions - 1,
                        };
                    }
                    return item;
                })
            );

            console.error('Erro ao toggle reação:', err);
        }
    };

    const loadMore = async () => {
        if (!hasMore || isLoading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await fetchFeed(nextPage, true);
    };

    const refresh = async () => {
        setPage(0);
        setHasMore(true);
        await fetchFeed(0, false);
    };

    return {
        feedItems,
        isLoading,
        error,
        userReactions,
        toggleReaction,
        loadMore,
        hasMore,
        refresh,
    };
}