// hooks/useStudentLessons.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showErrorToast } from '@/lib/toast';

interface ModuleWithCourse {
    id: string;
    course_id: string;
    name: string;
    description?: string | null;
    order_index: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    created_at: string;
    updated_at: string;
    course: { id: string; name: string };
}

interface LessonFromDB {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    order_index: number;
    status: string;
    total_contents: number;
    created_at: string;
}

interface ContentFromDB {
    id: string;
    lesson_id: string;
}

interface ProgressFromDB {
    content_id: string;
    completed: boolean;
}

export interface StudentLessonSummary {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    order_index: number;
    status: string;
    total_contents: number;
    created_at: string;
    completed_contents: number;
    is_completed: boolean;
    progress_percentage: number;
}

export function useStudentLessons(moduleId: string | null, studentId: string | null) {
    const [lessons, setLessons] = useState<StudentLessonSummary[]>([]);
    const [module, setModule] = useState<ModuleWithCourse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchLessons = useCallback(async (): Promise<void> => {
        if (!moduleId || !studentId) {
            setLessons([]);
            setModule(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const { data: moduleData, error: moduleError } = await supabase
                .from('modules')
                .select(`
          *,
          course:courses(id, name)
        `)
                .eq('id', moduleId)
                .single();

            if (moduleError) throw moduleError;
            setModule(moduleData as ModuleWithCourse);

            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('id, module_id, title, description, order_index, status, total_contents, created_at')
                .eq('module_id', moduleId)
                .eq('status', 'PUBLISHED')
                .order('order_index', { ascending: true });

            if (lessonsError) throw lessonsError;

            if (!lessonsData || lessonsData.length === 0) {
                setLessons([]);
                return;
            }

            const typedLessonsData = lessonsData as LessonFromDB[];
            const lessonIds = typedLessonsData.map((l: LessonFromDB) => l.id);

            const { data: contentsData } = await supabase
                .from('lesson_contents')
                .select('id, lesson_id')
                .in('lesson_id', lessonIds);

            const typedContentsData = (contentsData as ContentFromDB[]) || [];
            const contentIds = typedContentsData.map((c: ContentFromDB) => c.id);

            let typedProgressData: ProgressFromDB[] = [];

            if (contentIds.length > 0) {
                const { data: progressData } = await supabase
                    .from('content_progress')
                    .select('content_id, completed')
                    .eq('student_id', studentId)
                    .eq('completed', true)
                    .in('content_id', contentIds);

                typedProgressData = (progressData as ProgressFromDB[]) || [];
            }

            const completedContentIds = new Set(
                typedProgressData.map((p: ProgressFromDB) => p.content_id)
            );

            const lessonsWithProgress: StudentLessonSummary[] = typedLessonsData.map((lesson: LessonFromDB) => {
                const lessonContents = typedContentsData.filter(
                    (c: ContentFromDB) => c.lesson_id === lesson.id
                );
                const completedCount = lessonContents.filter(
                    (c: ContentFromDB) => completedContentIds.has(c.id)
                ).length;
                const totalCount = lessonContents.length;
                const progressPercentage = totalCount > 0
                    ? Math.round((completedCount / totalCount) * 100)
                    : 0;

                return {
                    ...lesson,
                    completed_contents: completedCount,
                    is_completed: totalCount > 0 && completedCount === totalCount,
                    progress_percentage: progressPercentage,
                };
            });

            setLessons(lessonsWithProgress);
        } catch (err) {
            console.error('[useStudentLessons] Erro:', err);
            const message = 'Erro ao carregar aulas';
            setError(message);
            showErrorToast('Erro ao carregar aulas', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [moduleId, studentId, supabase]);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    return {
        lessons,
        module,
        isLoading,
        error,
        refetch: fetchLessons,
    };
}