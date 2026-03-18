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
                .from('live_classes_view')
                .select('*')
                .order('scheduled_at', { ascending: false });

            if (fetchError) throw fetchError;

            setLiveClasses((data || []) as LiveClassWithDetails[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar aulas ao vivo');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchLiveClasses();
    }, [fetchLiveClasses]);

    const createLiveClass = async (data: CreateLiveClassData): Promise<{ success: boolean; error?: string }> => {
        try {
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
        refresh,
    };
}