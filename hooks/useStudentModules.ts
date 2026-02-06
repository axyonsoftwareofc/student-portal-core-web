// hooks/useStudentModules.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { StudentModule, Course, Module } from '@/lib/types/database';

export function useStudentModules(courseId: string | null, studentId: string | null) {
    const [modules, setModules] = useState<StudentModule[]>([]);
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const fetchModules = useCallback(async () => {
        if (!courseId || !studentId) {
            setModules([]);
            setCourse(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            // 1. Buscar curso
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;
            setCourse(courseData as Course);

            // 2. Buscar módulos do curso
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select('*')
                .eq('course_id', courseId)
                .eq('status', 'PUBLISHED')
                .order('order_index', { ascending: true });

            if (modulesError) throw modulesError;

            if (!modulesData || modulesData.length === 0) {
                setModules([]);
                return;
            }

            // 3. Para cada módulo, buscar estatísticas
            const modulesWithStats: StudentModule[] = await Promise.all(
                (modulesData as Module[]).map(async (module: Module) => {
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

                        const { data: progress } = await supabase
                            .from('lesson_progress')
                            .select('id')
                            .eq('student_id', studentId)
                            .in('lesson_id', lessonIds)
                            .eq('completed', true);

                        completedLessons = progress?.length || 0;
                    }

                    const progressPercentage = lessonsCount > 0
                        ? Math.round((completedLessons / lessonsCount) * 100)
                        : 0;

                    return {
                        ...module,
                        lessons_count: lessonsCount,
                        completed_lessons: completedLessons,
                        progress_percentage: progressPercentage,
                    };
                })
            );

            setModules(modulesWithStats);
        } catch (err) {
            console.error('Erro ao buscar módulos:', err);
            setError('Erro ao carregar módulos');
        } finally {
            setIsLoading(false);
        }
    }, [courseId, studentId]);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    return {
        modules,
        course,
        isLoading,
        error,
        refetch: fetchModules,
    };
}