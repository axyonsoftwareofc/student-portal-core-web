// hooks/useStudentLiveClasses.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LiveClassWithDetails } from '@/lib/types/live-classes';

interface LiveClassViewRecord {
    live_class_id: string;
}

interface UseStudentLiveClassesReturn {
    liveClasses: LiveClassWithDetails[];
    nextClass: LiveClassWithDetails | null;
    recentRecordings: LiveClassWithDetails[];
    unwatchedCount: number;
    isLoading: boolean;
    error: string | null;
    markAsWatched: (liveClassId: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useStudentLiveClasses(userId: string | null): UseStudentLiveClassesReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [liveClasses, setLiveClasses] = useState<LiveClassWithDetails[]>([]);
    const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLiveClasses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: classesData, error: classesError } = await supabase
                .from('live_classes_view')
                .select('*')
                .eq('is_active', true)
                .neq('status', 'cancelled')
                .order('scheduled_at', { ascending: false });

            if (classesError) throw classesError;

            if (userId) {
                const { data: viewsData } = await supabase
                    .from('live_class_views')
                    .select('live_class_id')
                    .eq('user_id', userId);

                const watchedSet = new Set<string>(
                    (viewsData || []).map((v: LiveClassViewRecord) => v.live_class_id)
                );
                setWatchedIds(watchedSet);

                const classesWithWatched = (classesData || []).map((lc: LiveClassWithDetails) => ({
                    ...lc,
                    is_watched: watchedSet.has(lc.id),
                }));

                setLiveClasses(classesWithWatched);
            } else {
                setLiveClasses((classesData || []) as LiveClassWithDetails[]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar aulas ao vivo');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, userId]);

    useEffect(() => {
        fetchLiveClasses();
    }, [fetchLiveClasses]);

    const markAsWatched = async (liveClassId: string): Promise<void> => {
        if (!userId || watchedIds.has(liveClassId)) return;

        try {
            await supabase
                .from('live_class_views')
                .insert({
                    live_class_id: liveClassId,
                    user_id: userId,
                });

            setWatchedIds((prev: Set<string>) => {
                const newSet = new Set<string>(prev);
                newSet.add(liveClassId);
                return newSet;
            });

            setLiveClasses((prev: LiveClassWithDetails[]) =>
                prev.map((lc: LiveClassWithDetails) =>
                    lc.id === liveClassId ? { ...lc, is_watched: true } : lc
                )
            );
        } catch (err) {
            console.error('Erro ao marcar como assistido:', err);
        }
    };

    const now = new Date();

    const nextClass = liveClasses.find((lc: LiveClassWithDetails) =>
        (lc.status === 'scheduled' || lc.status === 'live') &&
        new Date(lc.scheduled_at) >= now
    ) || null;

    const recentRecordings = liveClasses
        .filter((lc: LiveClassWithDetails) => lc.status === 'recorded' && lc.video_url)
        .slice(0, 10);

    const unwatchedCount = recentRecordings.filter((lc: LiveClassWithDetails) => !lc.is_watched).length;

    const refresh = async (): Promise<void> => {
        await fetchLiveClasses();
    };

    return {
        liveClasses,
        nextClass,
        recentRecordings,
        unwatchedCount,
        isLoading,
        error,
        markAsWatched,
        refresh,
    };
}