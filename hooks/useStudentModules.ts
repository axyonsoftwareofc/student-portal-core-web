// hooks/useStudentModules.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showErrorToast } from '@/lib/toast';
import type { StudentModule, Phase, Module, Track } from '@/lib/types/database';

// 🆕 v20.0 - Agora busca por phase_id
interface PhaseWithTrack extends Phase {
    track: Track;
}

export function useStudentModules(phaseId: string | null, studentId: string | null) {
    const [modules, setModules] = useState<StudentModule[]>([]);
    const [phase, setPhase] = useState<PhaseWithTrack | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchModules = useCallback(async (): Promise<void> => {
        if (!phaseId || !studentId) {
            setModules([]);
            setPhase(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // 1. Buscar fase com trilha
            const { data: phaseData, error: phaseError } = await supabase
                .from('phases')
                .select(`
                    *,
                    track:tracks(*)
                `)
                .eq('id', phaseId)
                .single();

            if (phaseError) throw phaseError;
            setPhase(phaseData as PhaseWithTrack);

            // 2. Buscar módulos da fase
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select('*')
                .eq('phase_id', phaseId)
                .eq('status', 'PUBLISHED')
                .order('order_index', { ascending: true });

            if (modulesError) throw modulesError;

            if (!modulesData || modulesData.length === 0) {
                setModules([]);
                return;
            }

            // 3. Para cada módulo, buscar estatísticas
            let previousModuleCompleted = true; // Primeiro módulo sempre desbloqueado

            const modulesWithStats: StudentModule[] = await Promise.all(
                (modulesData as Module[]).map(async (module: Module, index: number) => {
                    // Buscar aulas do módulo
                    const { data: lessons } = await supabase
                        .from('lessons')
                        .select('id')
                        .eq('module_id', module.id)
                        .eq('status', 'PUBLISHED');

                    const lessonsCount = lessons?.length || 0;
                    let completedLessons = 0;

                    if (lessonsCount > 0) {
                        const lessonIds = lessons?.map((l: { id: string }) => l.id) || [];

                        // Buscar conteúdos das aulas
                        const { data: contents } = await supabase
                            .from('lesson_contents')
                            .select('id, lesson_id')
                            .in('lesson_id', lessonIds);

                        const contentIds = contents?.map((c: { id: string }) => c.id) || [];

                        if (contentIds.length > 0) {
                            // Buscar progresso dos conteúdos
                            const { data: progress } = await supabase
                                .from('content_progress')
                                .select('content_id')
                                .eq('student_id', studentId)
                                .eq('completed', true)
                                .in('content_id', contentIds);

                            const completedContentIds = new Set(
                                progress?.map((p: { content_id: string }) => p.content_id) || []
                            );

                            // Verificar quais aulas estão completas (todos os conteúdos completados)
                            for (const lessonId of lessonIds) {
                                const lessonContents = contents?.filter(
                                    (c: { id: string; lesson_id: string }) => c.lesson_id === lessonId
                                ) || [];

                                if (lessonContents.length > 0) {
                                    const allCompleted = lessonContents.every(
                                        (c: { id: string }) => completedContentIds.has(c.id)
                                    );
                                    if (allCompleted) completedLessons++;
                                }
                            }
                        }
                    }

                    const progressPercentage = lessonsCount > 0
                        ? Math.round((completedLessons / lessonsCount) * 100)
                        : 0;

                    const isCompleted = lessonsCount > 0 && completedLessons === lessonsCount;

                    // 🆕 Progressão linear: só desbloqueia se o anterior estiver completo
                    const isLocked = index > 0 && !previousModuleCompleted;

                    // Atualizar para próxima iteração
                    previousModuleCompleted = isCompleted;

                    return {
                        ...module,
                        lessons_count: lessonsCount,
                        completed_lessons: completedLessons,
                        progress_percentage: progressPercentage,
                        is_locked: isLocked,
                    };
                })
            );

            setModules(modulesWithStats);
        } catch (err) {
            console.error('[useStudentModules] Erro ao buscar módulos:', err);
            setError('Erro ao carregar módulos');
            showErrorToast('Erro ao carregar módulos', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [phaseId, studentId, supabase]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    return {
        modules,
        phase,
        isLoading,
        error,
        refetch: fetchModules,
    };
}