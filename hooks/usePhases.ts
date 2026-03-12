// hooks/usePhases.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import type { Phase, PhaseWithStats, PhaseFormData, Track, PhaseWithTrack } from '@/lib/types/database';

export type { PhaseWithTrack };

export function usePhases(trackId?: string) {
    const [phases, setPhases] = useState<PhaseWithTrack[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchPhases = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('phases')
                .select(`
                    *,
                    track:tracks(*)
                `)
                .eq('is_active', true)
                .order('number', { ascending: true });

            if (trackId) {
                query = query.eq('track_id', trackId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setPhases((data as PhaseWithTrack[]) || []);
        } catch (err) {
            console.error('[usePhases] Erro ao buscar fases:', err);
            setError('Erro ao carregar fases');
            showErrorToast('Erro ao carregar fases', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, trackId]);

    const getPhaseByNumber = useCallback(async (
        phaseNumber: number
    ): Promise<PhaseWithTrack | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('phases')
                .select(`
                    *,
                    track:tracks(*)
                `)
                .eq('number', phaseNumber)
                .single();

            if (fetchError) throw fetchError;

            return data as PhaseWithTrack;
        } catch (err) {
            console.error('[usePhases] Erro ao buscar fase:', err);
            return null;
        }
    }, [supabase]);

    const getPhaseById = useCallback(async (
        phaseId: string
    ): Promise<PhaseWithTrack | null> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('phases')
                .select(`
                    *,
                    track:tracks(*)
                `)
                .eq('id', phaseId)
                .single();

            if (fetchError) throw fetchError;

            return data as PhaseWithTrack;
        } catch (err) {
            console.error('[usePhases] Erro ao buscar fase:', err);
            return null;
        }
    }, [supabase]);

    const getPhaseWithStats = useCallback(async (
        phaseId: string
    ): Promise<PhaseWithStats | null> => {
        try {
            const { data: phase, error: phaseError } = await supabase
                .from('phases')
                .select('*')
                .eq('id', phaseId)
                .single();

            if (phaseError) throw phaseError;

            // Buscar módulos da fase
            const { data: modules } = await supabase
                .from('modules')
                .select('id')
                .eq('phase_id', phaseId);

            const moduleIds: string[] = modules?.map((m: { id: string }) => m.id) || [];

            let lessonsCount = 0;
            let contentsCount = 0;

            if (moduleIds.length > 0) {
                // Contar aulas
                const { count: lCount } = await supabase
                    .from('lessons')
                    .select('*', { count: 'exact', head: true })
                    .in('module_id', moduleIds);

                lessonsCount = lCount || 0;

                // Buscar IDs das aulas para contar conteúdos
                const { data: lessons } = await supabase
                    .from('lessons')
                    .select('id')
                    .in('module_id', moduleIds);

                const lessonIds: string[] = lessons?.map((l: { id: string }) => l.id) || [];

                if (lessonIds.length > 0) {
                    const { count: cCount } = await supabase
                        .from('lesson_contents')
                        .select('*', { count: 'exact', head: true })
                        .in('lesson_id', lessonIds);

                    contentsCount = cCount || 0;
                }
            }

            return {
                ...phase,
                modules_count: moduleIds.length,
                lessons_count: lessonsCount,
                contents_count: contentsCount,
            } as PhaseWithStats;
        } catch (err) {
            console.error('[usePhases] Erro ao buscar estatísticas:', err);
            return null;
        }
    }, [supabase]);

    const updatePhase = useCallback(async (
        id: string,
        data: Partial<PhaseFormData>
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (data.name) updateData.name = data.name.trim();
            if (data.description !== undefined) updateData.description = data.description?.trim() || null;
            if (data.objectives !== undefined) updateData.objectives = data.objectives;
            if (data.estimated_hours !== undefined) updateData.estimated_hours = data.estimated_hours;
            if (data.order_index !== undefined) updateData.order_index = data.order_index;
            if (data.is_active !== undefined) updateData.is_active = data.is_active;

            const { error: updateError } = await supabase
                .from('phases')
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            await fetchPhases();

            showSuccessToast('Fase atualizada!', data.name || 'Alterações salvas');
            return { success: true };
        } catch (err) {
            console.error('[usePhases] Erro ao atualizar fase:', err);
            showErrorToast('Erro ao atualizar fase', 'Tente novamente');
            return { success: false, error: 'Erro ao atualizar fase' };
        }
    }, [supabase, fetchPhases]);

    useEffect(() => {
        fetchPhases();
    }, [fetchPhases]);

    return {
        phases,
        isLoading,
        error,
        fetchPhases,
        getPhaseByNumber,
        getPhaseById,
        getPhaseWithStats,
        updatePhase,
    };
}