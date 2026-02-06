// hooks/useStudentCourses.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { StudentCourse, Course, Enrollment } from '@/lib/types/database';

// Tipo para o retorno da query com JOIN
interface EnrollmentWithCourse extends Enrollment {
    course: Course;
}

export function useStudentCourses(studentId: string | null) {
    const [courses, setCourses] = useState<StudentCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const fetchCourses = useCallback(async () => {
        if (!studentId) {
            setCourses([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            // 1. Buscar matrículas do aluno
            const { data: enrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select(`
                    *,
                    course:courses(*)
                `)
                .eq('student_id', studentId)
                .eq('status', 'ACTIVE');

            if (enrollError) throw enrollError;

            if (!enrollments || enrollments.length === 0) {
                setCourses([]);
                return;
            }

            // 2. Para cada curso, buscar estatísticas
            const coursesWithStats: StudentCourse[] = await Promise.all(
                (enrollments as EnrollmentWithCourse[]).map(async (enrollment: EnrollmentWithCourse) => {
                    const course = enrollment.course;

                    // Buscar módulos do curso
                    const { data: modules } = await supabase
                        .from('modules')
                        .select('id')
                        .eq('course_id', course.id)
                        .eq('status', 'PUBLISHED');

                    const moduleIds = modules?.map((m: { id: string }) => m.id) || [];

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

                            const { data: progress } = await supabase
                                .from('lesson_progress')
                                .select('id')
                                .eq('student_id', studentId)
                                .in('lesson_id', lessonIds)
                                .eq('completed', true);

                            completedLessons = progress?.length || 0;
                        }
                    }

                    const progressPercentage = lessonsCount > 0
                        ? Math.round((completedLessons / lessonsCount) * 100)
                        : 0;

                    return {
                        ...course,
                        enrollment,
                        modules_count: moduleIds.length,
                        lessons_count: lessonsCount,
                        completed_lessons: completedLessons,
                        progress_percentage: progressPercentage,
                    };
                })
            );

            setCourses(coursesWithStats);
        } catch (err) {
            console.error('Erro ao buscar cursos:', err);
            setError('Erro ao carregar cursos');
        } finally {
            setIsLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return {
        courses,
        isLoading,
        error,
        refetch: fetchCourses,
    };
}