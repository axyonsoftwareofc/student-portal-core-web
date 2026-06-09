// hooks/useLiveClasses.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    LiveClassWithDetails,
    CreateLiveClassData,
    UpdateLiveClassData,
    LiveClassStatus,
} from '@/lib/types/live-classes';

interface UseLiveClassesReturn {
    liveClasses: LiveClassWithDetails[];
    isLoading: boolean;
    error: string | null;
    createLiveClass: (data: CreateLiveClassData) => Promise<{ success: boolean; error?: string }>;
    updateLiveClass: (id: string, data: UpdateLiveClassData) => Promise<{ success: boolean; error?: string }>;
    deleteLiveClass: (id: string) => Promise<{ success: boolean; error?: string }>;
    updateStatus: (id: string, status: LiveClassStatus) => Promise<{ success: boolean; error?: string }>;
    reorderLiveClasses: (orderedIds: string[]) => Promise<{ success: boolean; error?: string }>;
    refresh: () => Promise<void>;
}

export function useLiveClasses(): UseLiveClassesReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [liveClasses, setLiveClasses] = useState<LiveClassWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLiveClasses = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('live_classes')
                .select('*, track:track_id(name), phase:phase_id(name), module:module_id(name)')
                .order('order_index', { ascending: true, nullsFirst: false })
                .order('scheduled_at', { ascending: true });

            if (fetchError) throw fetchError;

            const classIds = (data || []).map((lc: Record<string, unknown>) => lc.id as string);

            let viewCounts: Record<string, number> = {};
            if (classIds.length > 0) {
                const { data: viewsData } = await supabase
                    .from('live_class_views')
                    .select('live_class_id')
                    .in('live_class_id', classIds);

                (viewsData || []).forEach((v: { live_class_id: string }) => {
                    viewCounts[v.live_class_id] = (viewCounts[v.live_class_id] || 0) + 1;
                });
            }

            const transformed = (data || []).map((item: Record<string, unknown>) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                scheduled_at: item.scheduled_at,
                video_url: item.video_url,
                meet_url: item.meet_url,
                duration_minutes: item.duration_minutes,
                module_id: item.module_id,
                phase_id: item.phase_id,
                track_id: item.track_id,
                status: item.status,
                thumbnail_url: item.thumbnail_url,
                is_active: item.is_active,
                order_index: item.order_index,
                created_at: item.created_at,
                updated_at: item.updated_at,
                track_name: (item.track as Record<string, string> | null)?.name ?? null,
                phase_name: (item.phase as Record<string, string> | null)?.name ?? null,
                module_name: (item.module as Record<string, string> | null)?.name ?? null,
                views_count: viewCounts[item.id as string] || 0,
            }));

            setLiveClasses(transformed as LiveClassWithDetails[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar aulas ao vivo');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchLiveClasses();
    }, [fetchLiveClasses]);

    const getNextOrderIndex = useCallback(async (): Promise<number> => {
        const { data } = await supabase
            .from('live_classes')
            .select('order_index')
            .order('order_index', { ascending: false, nullsFirst: false })
            .limit(1)
            .single();

        return (data?.order_index ?? 0) + 1;
    }, [supabase]);

    const createLiveClass = async (data: CreateLiveClassData): Promise<{ success: boolean; error?: string }> => {
        try {
            const nextIndex = data.order_index != null
                ? data.order_index
                : await getNextOrderIndex();

            const { error: insertError } = await supabase
                .from('live_classes')
                .insert({
                    title: data.title,
                    description: data.description || null,
                    scheduled_at: data.scheduled_at,
                    video_url: data.video_url || null,
                    meet_url: data.meet_url || null,
                    duration_minutes: data.duration_minutes || null,
                    module_id: data.module_id || null,
                    phase_id: data.phase_id || null,
                    track_id: data.track_id || null,
                    status: data.status || 'scheduled',
                    thumbnail_url: data.thumbnail_url || null,
                    order_index: nextIndex,
                });

            if (insertError) throw insertError;

            await fetchLiveClasses();

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao criar aula ao vivo',
            };
        }
    };

    const updateLiveClass = async (id: string, data: UpdateLiveClassData): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: updateError } = await supabase
                .from('live_classes')
                .update(data)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchLiveClasses();

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao atualizar aula ao vivo',
            };
        }
    };

    const deleteLiveClass = async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('live_classes')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setLiveClasses((prev: LiveClassWithDetails[]) =>
                prev.filter((lc: LiveClassWithDetails) => lc.id !== id)
            );

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao excluir aula ao vivo',
            };
        }
    };

    const updateStatus = async (id: string, status: LiveClassStatus): Promise<{ success: boolean; error?: string }> => {
        return updateLiveClass(id, { status });
    };

    const reorderLiveClasses = useCallback(async (
        orderedIds: string[]
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updates = orderedIds.map((id, index) =>
                supabase
                    .from('live_classes')
                    .update({
                        order_index: index + 1,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', id)
            );

            await Promise.all(updates);
            await fetchLiveClasses();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao reordenar aulas',
            };
        }
    }, [supabase, fetchLiveClasses]);

    const refresh = async (): Promise<void> => {
        await fetchLiveClasses();
    };

    return {
        liveClasses,
        isLoading,
        error,
        createLiveClass,
        updateLiveClass,
        deleteLiveClass,
        updateStatus,
        reorderLiveClasses,
        refresh,
    };
}