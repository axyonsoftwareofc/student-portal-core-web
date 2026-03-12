// hooks/useStudentPhases.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showErrorToast } from '@/lib/toast';
import type { StudentPhase, Track, Phase } from '@/lib/types/database';

interface PhaseFromDB extends Phase {
    track: Track;
}

export function useStudentPhases(trackId: string | null, studentId: string | null) {
    const [phases, setPhases] = useState<StudentPhase[]>([]);
    const [track, setTrack] = useState<Track | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchPhases = useCallback(async (): Promise<void> => {
        if (!trackId || !studentId) {
            setPhases([]);
            setTrack(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // 1. Buscar trilha
            const { data: trackData, error: trackError } = await supabase
                .from('tracks')
                .select('*')
                .eq('id', trackId)
                .single();

            if (trackError) throw trackError;
            setTrack(trackData as Track);

            // 2. Buscar fases da trilha
            const { data: phasesData, error: phasesError } = await supabase
                .from('phases')
                .select(`
                    *,
                    track:tracks(*)
                `)
                .eq('track_id', trackId)
                .eq('is_active', true)
                .order('number', { ascending: true });

            if (phasesError) throw phasesError;

            if (!phasesData || phasesData.length === 0) {
                setPhases([]);
                return;
            }

            // 3. Para cada fase, calcular progresso SEQUENCIALMENTE
            const phasesWithStats: StudentPhase[] = [];
            let allPreviousPhasesCompleted = true; // Acumula se TODAS as anteriores estão completas

            for (let index = 0; index < phasesData.length; index++) {
                const phase = phasesData[index] as PhaseFromDB;

                // Buscar módulos da fase
                const { data: modules } = await supabase
                    .from('modules')
                    .select('id')
                    .eq('phase_id', phase.id)
                    .eq('status', 'PUBLISHED');

                const moduleIds = modules?.map((m: { id: string }) => m.id) || [];

                let lessonsCount = 0;
                let completedLessons = 0;

                if (moduleIds.length > 0) {
                    // Buscar aulas
                    const { data: lessons } = await supabase
                        .from('lessons')
                        .select('id')
                        .in('module_id', moduleIds)
                        .eq('status', 'PUBLISHED');

                    lessonsCount = lessons?.length || 0;

                    if (lessonsCount > 0) {
                        const lessonIds = lessons?.map((l: { id: string }) => l.id) || [];

                        // Buscar progresso
                        const { data: progress } = await supabase
                            .from('lesson_progress')
                            .select('id')
                            .eq('student_id', studentId)
                            .eq('completed', true)
                            .in('lesson_id', lessonIds);

                        completedLessons = progress?.length || 0;
                    }
                }

                const progressPercentage = lessonsCount > 0
                    ? Math.round((completedLessons / lessonsCount) * 100)
                    : 0;

                // Fase está completa se tem aulas E todas foram completadas
                const isCompleted = lessonsCount > 0 && completedLessons === lessonsCount;

                // 🔧 CORREÇÃO: Fase está bloqueada se NÃO é a primeira E alguma anterior não está completa
                const isLocked = index > 0 && !allPreviousPhasesCompleted;

                // Atualizar flag para próximas iterações
                // Se ESTA fase não está completa, todas as próximas devem estar bloqueadas
                if (!isCompleted) {
                    allPreviousPhasesCompleted = false;
                }

                phasesWithStats.push({
                    ...phase,
                    modules_count: moduleIds.length,
                    lessons_count: lessonsCount,
                    completed_lessons: completedLessons,
                    progress_percentage: progressPercentage,
                    is_locked: isLocked,
                });
            }

            setPhases(phasesWithStats);
        } catch (err) {
            console.error('[useStudentPhases] Erro ao buscar fases:', err);
            setError('Erro ao carregar fases');
            showErrorToast('Erro ao carregar fases', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [trackId, studentId, supabase]);

    useEffect(() => {
        fetchPhases();
    }, [fetchPhases]);

    return {
        phases,
        track,
        isLoading,
        error,
        refetch: fetchPhases,
    };
}