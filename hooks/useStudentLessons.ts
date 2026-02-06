// hooks/useStudentLessons.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { StudentLesson, Module, Lesson, LessonProgress } from '@/lib/types/database';

// Tipo para o retorno da query com JOIN (sem extends)
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

export function useStudentLessons(moduleId: string | null, studentId: string | null) {
    const [lessons, setLessons] = useState<StudentLesson[]>([]);
    const [module, setModule] = useState<ModuleWithCourse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const fetchLessons = useCallback(async () => {
        if (!moduleId || !studentId) {
            setLessons([]);
            setModule(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            // 1. Buscar módulo com curso
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

            // 2. Buscar aulas do módulo
            const { data: lessonsData, error: lessonsError } = await supabase
                .from('lessons')
                .select('*')
                .eq('module_id', moduleId)
                .eq('status', 'PUBLISHED')
                .order('order_index', { ascending: true });

            if (lessonsError) throw lessonsError;

            if (!lessonsData || lessonsData.length === 0) {
                setLessons([]);
                return;
            }

            // 3. Buscar progresso do aluno para essas aulas
            const lessonIds = (lessonsData as Lesson[]).map((l: Lesson) => l.id);

            const { data: progressData } = await supabase
                .from('lesson_progress')
                .select('*')
                .eq('student_id', studentId)
                .in('lesson_id', lessonIds);

            // 4. Combinar aulas com progresso
            const lessonsWithProgress: StudentLesson[] = (lessonsData as Lesson[]).map((lesson: Lesson) => {
                const progress = (progressData as LessonProgress[] | null)?.find(
                    (p: LessonProgress) => p.lesson_id === lesson.id
                ) || null;
                return {
                    ...lesson,
                    progress,
                    is_completed: progress?.completed || false,
                };
            });

            setLessons(lessonsWithProgress);
        } catch (err) {
            console.error('Erro ao buscar aulas:', err);
            setError('Erro ao carregar aulas');
        } finally {
            setIsLoading(false);
        }
    }, [moduleId, studentId]);

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