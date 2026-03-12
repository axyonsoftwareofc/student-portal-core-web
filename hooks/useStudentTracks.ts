// hooks/useStudentTracks.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showErrorToast } from '@/lib/toast';
import type { StudentTrack, Track } from '@/lib/types/database';

// Tipo próprio para o retorno da query (não extende Enrollment)
interface EnrollmentQueryResult {
    id: string;
    student_id: string;
    track_id: string | null;
    status: string;
    track: Track | null;
}

export function useStudentTracks(studentId: string | null) {
    const [tracks, setTracks] = useState<StudentTrack[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchTracks = useCallback(async (): Promise<void> => {
        if (!studentId) {
            setTracks([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // 1. Buscar matrículas do aluno com track_id preenchido
            const { data: enrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select(`
                    id,
                    student_id,
                    track_id,
                    status,
                    track:tracks(*)
                `)
                .eq('student_id', studentId)
                .eq('status', 'ACTIVE')
                .not('track_id', 'is', null);

            if (enrollError) throw enrollError;

            if (!enrollments || enrollments.length === 0) {
                setTracks([]);
                return;
            }

            // Filtrar matrículas que têm track válido
            const validEnrollments = (enrollments as unknown as EnrollmentQueryResult[]).filter(
                (e) => e.track !== null && e.track_id !== null
            );

            if (validEnrollments.length === 0) {
                setTracks([]);
                return;
            }

            // 2. Para cada trilha, buscar estatísticas
            const tracksWithStats: StudentTrack[] = await Promise.all(
                validEnrollments.map(async (enrollment) => {
                    const track = enrollment.track!;

                    // Buscar fases da trilha
                    const { data: phases } = await supabase
                        .from('phases')
                        .select('id')
                        .eq('track_id', track.id)
                        .eq('is_active', true);

                    const phaseIds = phases?.map((p: { id: string }) => p.id) || [];

                    // Buscar módulos das fases
                    let moduleIds: string[] = [];
                    if (phaseIds.length > 0) {
                        const { data: modules } = await supabase
                            .from('modules')
                            .select('id')
                            .in('phase_id', phaseIds)
                            .eq('status', 'PUBLISHED');

                        moduleIds = modules?.map((m: { id: string }) => m.id) || [];
                    }

                    // Buscar aulas dos módulos
                    let lessonsCount = 0;
                    let completedLessons = 0;

                    if (moduleIds.length > 0) {
                        const { data: lessons } = await supabase
                            .from('lessons')
                            .select('id')
                            .in('module_id', moduleIds)
                            .eq('status', 'PUBLISHED');

                        lessonsCount = lessons?.length || 0;

                        if (lessonsCount > 0) {
                            const lessonIds = lessons?.map((l: { id: string }) => l.id) || [];

                            // Buscar conteúdos das aulas
                            const { data: contents } = await supabase
                                .from('lesson_contents')
                                .select('id, lesson_id')
                                .in('lesson_id', lessonIds);

                            const contentIds = contents?.map((c: { id: string }) => c.id) || [];

                            if (contentIds.length > 0) {
                                // Contar conteúdos completados
                                const { data: progress } = await supabase
                                    .from('content_progress')
                                    .select('content_id')
                                    .eq('student_id', studentId)
                                    .eq('completed', true)
                                    .in('content_id', contentIds);

                                const completedContentIds = new Set(
                                    progress?.map((p: { content_id: string }) => p.content_id) || []
                                );

                                // Para cada aula, verificar se todos os conteúdos foram completados
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
                    }

                    const progressPercentage = lessonsCount > 0
                        ? Math.round((completedLessons / lessonsCount) * 100)
                        : 0;

                    return {
                        ...track,
                        phases_count: phaseIds.length,
                        modules_count: moduleIds.length,
                        lessons_count: lessonsCount,
                        completed_lessons: completedLessons,
                        progress_percentage: progressPercentage,
                    };
                })
            );

            setTracks(tracksWithStats);
        } catch (err) {
            console.error('[useStudentTracks] Erro ao buscar trilhas:', err);
            setError('Erro ao carregar trilhas');
            showErrorToast('Erro ao carregar trilhas', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [studentId, supabase]);

    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

    return {
        tracks,
        isLoading,
        error,
        refetch: fetchTracks,
    };
}