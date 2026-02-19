// hooks/useStudentLessonContents.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { LessonContent, LessonContentWithProgress, ContentProgress } from '@/lib/types/lesson-contents';

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

interface LessonBasicInfo {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    order_index: number;
    status: string;
    total_contents: number;
}

interface UseStudentLessonContentsReturn {
    lesson: LessonBasicInfo | null;
    module: ModuleWithCourse | null;
    contents: LessonContentWithProgress[];
    completedCount: number;
    totalCount: number;
    progressPercentage: number;
    isLessonCompleted: boolean;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useStudentLessonContents(
    lessonId: string | null,
    studentId: string | null
): UseStudentLessonContentsReturn {
    const [lesson, setLesson] = useState<LessonBasicInfo | null>(null);
    const [module, setModule] = useState<ModuleWithCourse | null>(null);
    const [contents, setContents] = useState<LessonContentWithProgress[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchData = useCallback(async (): Promise<void> => {
        if (!lessonId || !studentId) {
            setLesson(null);
            setModule(null);
            setContents([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // 1. Buscar aula com módulo e curso
            const { data: lessonData, error: lessonError } = await supabase
                .from('lessons')
                .select(`
                    id,
                    module_id,
                    title,
                    description,
                    order_index,
                    status,
                    total_contents,
                    module:modules (
                        *,
                        course:courses (id, name)
                    )
                `)
                .eq('id', lessonId)
                .single();

            if (lessonError) throw lessonError;

            setLesson({
                id: lessonData.id,
                module_id: lessonData.module_id,
                title: lessonData.title,
                description: lessonData.description,
                order_index: lessonData.order_index,
                status: lessonData.status,
                total_contents: lessonData.total_contents,
            });

            setModule(lessonData.module as ModuleWithCourse);

            // 2. Buscar conteúdos da aula
            const { data: contentsData, error: contentsError } = await supabase
                .from('lesson_contents')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('order_index', { ascending: true });

            if (contentsError) throw contentsError;

            if (!contentsData || contentsData.length === 0) {
                setContents([]);
                return;
            }

            // 3. Buscar progresso do aluno para esses conteúdos
            const contentIds = contentsData.map((c: LessonContent) => c.id);

            const { data: progressData } = await supabase
                .from('content_progress')
                .select('*')
                .eq('student_id', studentId)
                .in('content_id', contentIds);

            // 4. Combinar conteúdos com progresso
            const contentsWithProgress: LessonContentWithProgress[] = contentsData.map(
                (content: LessonContent) => {
                    const progress = (progressData as ContentProgress[] | null)?.find(
                        (p: ContentProgress) => p.content_id === content.id
                    );
                    return {
                        ...content,
                        progress: progress || undefined,
                        is_completed: progress?.completed || false,
                    };
                }
            );

            setContents(contentsWithProgress);
        } catch (err) {
            console.error('[useStudentLessonContents] Erro:', err);
            setError('Erro ao carregar aula');
        } finally {
            setIsLoading(false);
        }
    }, [lessonId, studentId, supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const completedCount = contents.filter((c) => c.is_completed).length;
    const totalCount = contents.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const isLessonCompleted = totalCount > 0 && completedCount === totalCount;

    return {
        lesson,
        module,
        contents,
        completedCount,
        totalCount,
        progressPercentage,
        isLessonCompleted,
        isLoading,
        error,
        refetch: fetchData,
    };
}