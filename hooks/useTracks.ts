// hooks/useTracks.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import type { Track, TrackWithStats } from '@/lib/types/database';

export function useTracks() {
    const [tracks, setTracks] = useState<TrackWithStats[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchTracks = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            // Usar a view track_stats que criamos no SQL
            const { data, error: fetchError } = await supabase
                .from('track_stats')
                .select('*')
                .order('order_index', { ascending: true });

            if (fetchError) throw fetchError;

            setTracks((data as TrackWithStats[]) || []);
        } catch (err) {
            console.error('[useTracks] Erro ao buscar trilhas:', err);
            setError('Erro ao carregar trilhas');
            showErrorToast('Erro ao carregar trilhas', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    const getTrackBySlug = useCallback(async (
        slug: string
    ): Promise<TrackWithStats | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('track_stats')
                .select('*')
                .eq('slug', slug)
                .single();

            if (fetchError) throw fetchError;

            return data as TrackWithStats;
        } catch (err) {
            console.error('[useTracks] Erro ao buscar trilha:', err);
            return null;
        }
    }, [supabase]);

    const getTrackById = useCallback(async (
        id: string
    ): Promise<TrackWithStats | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('track_stats')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            return data as TrackWithStats;
        } catch (err) {
            console.error('[useTracks] Erro ao buscar trilha:', err);
            return null;
        }
    }, [supabase]);

    const updateTrack = useCallback(async (
        id: string,
        data: Partial<Pick<Track, 'name' | 'description' | 'color' | 'icon' | 'is_active'>>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (data.name) updateData.name = data.name.trim();
            if (data.description !== undefined) updateData.description = data.description?.trim() || null;
            if (data.color) updateData.color = data.color;
            if (data.icon) updateData.icon = data.icon;
            if (data.is_active !== undefined) updateData.is_active = data.is_active;

            const { error: updateError } = await supabase
                .from('tracks')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchTracks();

            showSuccessToast('Trilha atualizada!', data.name || 'Alterações salvas');
            return { success: true };
        } catch (err) {
            console.error('[useTracks] Erro ao atualizar trilha:', err);
            showErrorToast('Erro ao atualizar trilha', 'Tente novamente');
            return { success: false, error: 'Erro ao atualizar trilha' };
        }
    }, [supabase, fetchTracks]);

    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

    return {
        tracks,
        isLoading,
        error,
        fetchTracks,
        getTrackBySlug,
        getTrackById,
        updateTrack,
    };
}