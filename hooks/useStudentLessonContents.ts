// hooks/useStudentLessonContents.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { showErrorToast } from '@/lib/toast';
import type { LessonContent, LessonContentWithProgress, ContentProgress } from '@/lib/types/lesson-contents';

interface LessonFromDB {
    id: string;
    title: string;
    description: string | null;
    duration: string | null;
    status: string;
    module_id: string;
}

interface ModuleFromDB {
    id: string;
    name: string;
    course_id: string;
    course: {
        id: string;
        name: string;
    };
}

export interface StudentLesson {
    id: string;
    title: string;
    description: string | null;
    duration: string | null;
}

export interface StudentModule {
    id: string;
    name: string;
    course_id: string;
    course: {
        id: string;
        name: string;
    };
}

interface UseStudentLessonContentsReturn {
    contents: LessonContentWithProgress[];
    lesson: StudentLesson | null;
    module: StudentModule | null;
    isLoading: boolean;
    error: string | null;
    completedCount: number;
    totalCount: number;
    progressPercentage: number;
    isLessonCompleted: boolean;
    refetch: () => Promise<void>;
}

export function useStudentLessonContents(
    lessonId: string | null,
    studentId: string | null
): UseStudentLessonContentsReturn {
    const [contents, setContents] = useState<LessonContentWithProgress[]>([]);
    const [lesson, setLesson] = useState<StudentLesson | null>(null);
    const [module, setModule] = useState<StudentModule | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchContents = useCallback(async (): Promise<void> => {
        if (!lessonId || !studentId) {
            setContents([]);
            setLesson(null);
            setModule(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // 1. Buscar informações da aula
            const { data: lessonData, error: lessonError } = await supabase
                .from('lessons')
                .select('id, title, description, duration, status, module_id')
                .eq('id', lessonId)
                .single();

            if (lessonError) throw lessonError;

            const typedLesson = lessonData as LessonFromDB;

            setLesson({
                id: typedLesson.id,
                title: typedLesson.title,
                description: typedLesson.description,
                duration: typedLesson.duration,
            });

            // 2. Buscar módulo com curso
            const { data: moduleData, error: moduleError } = await supabase
                .from('modules')
                .select(`
          id,
          name,
          course_id,
          course:courses (
            id,
            name
          )
        `)
                .eq('id', typedLesson.module_id)
                .single();

            if (moduleError) throw moduleError;

            const typedModule = moduleData as unknown as ModuleFromDB;
            setModule({
                id: typedModule.id,
                name: typedModule.name,
                course_id: typedModule.course_id,
                course: typedModule.course,
            });

            // 3. Buscar conteúdos da aula
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

            const typedContents = contentsData as LessonContent[];

            // 4. Buscar progresso do aluno
            const contentIds = typedContents.map((c: LessonContent) => c.id);

            const { data: progressData } = await supabase
                .from('content_progress')
                .select('*')
                .eq('student_id', studentId)
                .in('content_id', contentIds);

            const progressMap = new Map<string, ContentProgress>();
            (progressData || []).forEach((p: ContentProgress) => {
                progressMap.set(p.content_id, p);
            });

            // 5. Mesclar conteúdos com progresso
            const contentsWithProgress: LessonContentWithProgress[] = typedContents.map((content: LessonContent) => {
                const progress = progressMap.get(content.id);
                return {
                    ...content,
                    is_completed: progress?.completed || false,
                    progress: progress || undefined,
                };
            });

            setContents(contentsWithProgress);
        } catch (err) {
            console.error('[useStudentLessonContents] Erro:', err);
            const message = 'Erro ao carregar conteúdos';
            setError(message);
            showErrorToast('Erro ao carregar aula', 'Verifique sua conexão');
        } finally {
            setIsLoading(false);
        }
    }, [lessonId, studentId, supabase]);

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    // Calcular estatísticas de progresso
    const completedCount = contents.filter((c: LessonContentWithProgress) => c.is_completed).length;
    const totalCount = contents.length;
    const progressPercentage = totalCount > 0
        ? Math.round((completedCount / totalCount) * 100)
        : 0;
    const isLessonCompleted = totalCount > 0 && completedCount === totalCount;

    return {
        contents,
        lesson,
        module,
        isLoading,
        error,
        completedCount,
        totalCount,
        progressPercentage,
        isLessonCompleted,
        refetch: fetchContents,
    };
}