// hooks/useAdminDashboard.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
    totalStudents: number;
    activeStudents: number;
    pendingStudents: number;
    totalCourses: number;
    activeCourses: number;
    totalModules: number;
    publishedModules: number;
    totalLessons: number;
    publishedLessons: number;
    pendingExercises: number;
}

interface RecentStudent {
    id: string;
    name: string;
    email: string;
    status: string;
    created_at: string;
}

interface TopLesson {
    id: string;
    title: string;
    views_count: number;
    type: string;
    module_name: string;
}

interface RecentProgress {
    id: string;
    student_name: string;
    lesson_title: string;
    completed_at: string;
}

interface PendingExercise {
    id: string;
    student_id: string;
    student_name: string;
    content_title: string;
    lesson_title: string;
    module_id: string;
    lesson_id: string;
    created_at: string;
}

export function useAdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalStudents: 0,
        activeStudents: 0,
        pendingStudents: 0,
        totalCourses: 0,
        activeCourses: 0,
        totalModules: 0,
        publishedModules: 0,
        totalLessons: 0,
        publishedLessons: 0,
        pendingExercises: 0,
    });
    const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
    const [topLessons, setTopLessons] = useState<TopLesson[]>([]);
    const [recentProgress, setRecentProgress] = useState<RecentProgress[]>([]);
    const [pendingExercises, setPendingExercises] = useState<PendingExercise[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            const [
                studentsResult,
                coursesResult,
                modulesResult,
                lessonsResult,
                recentStudentsResult,
                topLessonsResult,
                recentProgressResult,
                pendingExercisesCountResult,
                pendingExercisesListResult,
            ] = await Promise.all([
                supabase
                    .from('users')
                    .select('id, status')
                    .eq('role', 'student'),

                supabase
                    .from('courses')
                    .select('id, status'),

                supabase
                    .from('modules')
                    .select('id, status'),

                supabase
                    .from('lessons')
                    .select('id, status'),

                supabase
                    .from('users')
                    .select('id, name, email, status, created_at')
                    .eq('role', 'student')
                    .order('created_at', { ascending: false })
                    .limit(5),

                supabase
                    .from('lessons')
                    .select(`
            id,
            title,
            views_count,
            type,
            module:modules (name)
          `)
                    .eq('status', 'PUBLISHED')
                    .order('views_count', { ascending: false })
                    .limit(5),

                supabase
                    .from('lesson_progress')
                    .select(`
            id,
            completed_at,
            student:users (name),
            lesson:lessons (title)
          `)
                    .eq('completed', true)
                    .order('completed_at', { ascending: false })
                    .limit(5),

                supabase
                    .from('exercise_submissions')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'pending'),

                supabase
                    .from('exercise_submissions')
                    .select(`
            id,
            student_id,
            created_at,
            student:users!exercise_submissions_student_id_fkey (name),
            content:lesson_contents!exercise_submissions_content_id_fkey (
              title,
              lesson_id,
              lesson:lessons (title, module_id)
            )
          `)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: true })
                    .limit(5),
            ]);

            const students = studentsResult.data || [];
            const courses = coursesResult.data || [];
            const modules = modulesResult.data || [];
            const lessons = lessonsResult.data || [];

            setStats({
                totalStudents: students.length,
                activeStudents: students.filter((s: { status: string }) => s.status === 'active').length,
                pendingStudents: students.filter((s: { status: string }) => s.status === 'pending').length,
                totalCourses: courses.length,
                activeCourses: courses.filter((c: { status: string }) => c.status === 'ACTIVE').length,
                totalModules: modules.length,
                publishedModules: modules.filter((m: { status: string }) => m.status === 'PUBLISHED').length,
                totalLessons: lessons.length,
                publishedLessons: lessons.filter((l: { status: string }) => l.status === 'PUBLISHED').length,
                pendingExercises: pendingExercisesCountResult.count || 0,
            });

            setRecentStudents(
                (recentStudentsResult.data || []).map((s: RecentStudent) => ({
                    id: s.id,
                    name: s.name,
                    email: s.email,
                    status: s.status,
                    created_at: s.created_at,
                }))
            );

            interface TopLessonRaw {
                id: string;
                title: string;
                views_count: number;
                type: string;
                module: { name: string } | null;
            }

            setTopLessons(
                (topLessonsResult.data || []).map((l: TopLessonRaw) => ({
                    id: l.id,
                    title: l.title,
                    views_count: l.views_count,
                    type: l.type,
                    module_name: l.module?.name || 'Sem módulo',
                }))
            );

            interface RecentProgressRaw {
                id: string;
                completed_at: string;
                student: { name: string } | null;
                lesson: { title: string } | null;
            }

            setRecentProgress(
                (recentProgressResult.data || [])
                    .filter((p: RecentProgressRaw) => p.completed_at)
                    .map((p: RecentProgressRaw) => ({
                        id: p.id,
                        student_name: p.student?.name || 'Aluno',
                        lesson_title: p.lesson?.title || 'Aula',
                        completed_at: p.completed_at,
                    }))
            );

            interface PendingExerciseRaw {
                id: string;
                student_id: string;
                created_at: string;
                student: { name: string } | null;
                content: {
                    title: string;
                    lesson_id: string;
                    lesson: { title: string; module_id: string } | null;
                } | null;
            }

            setPendingExercises(
                (pendingExercisesListResult.data || []).map((e: PendingExerciseRaw) => ({
                    id: e.id,
                    student_id: e.student_id,
                    student_name: e.student?.name || 'Aluno',
                    content_title: e.content?.title || 'Exercício',
                    lesson_title: e.content?.lesson?.title || 'Aula',
                    module_id: e.content?.lesson?.module_id || '',
                    lesson_id: e.content?.lesson_id || '',
                    created_at: e.created_at,
                }))
            );
        } catch (err) {
            console.error('Erro ao buscar dados do dashboard:', err);
            setError('Erro ao carregar dados do dashboard');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        stats,
        recentStudents,
        topLessons,
        recentProgress,
        pendingExercises,
        isLoading,
        error,
        refetch: fetchDashboardData,
    };
}