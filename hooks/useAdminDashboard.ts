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
    totalMaterials: number;
    totalViews: number;
    completedLessons: number;
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
        totalMaterials: 0,
        totalViews: 0,
        completedLessons: 0,
    });
    const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
    const [topLessons, setTopLessons] = useState<TopLesson[]>([]);
    const [recentProgress, setRecentProgress] = useState<RecentProgress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabaseRef = useRef(createClient());

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const supabase = supabaseRef.current;

            // Buscar estatísticas em paralelo
            const [
                studentsResult,
                coursesResult,
                modulesResult,
                lessonsResult,
                materialsResult,
                progressResult,
                recentStudentsResult,
                topLessonsResult,
                recentProgressResult,
            ] = await Promise.all([
                // Total de alunos
                supabase
                    .from('users')
                    .select('id, status', { count: 'exact' })
                    .eq('role', 'student'),

                // Total de cursos
                supabase
                    .from('courses')
                    .select('id, status', { count: 'exact' }),

                // Total de módulos
                supabase
                    .from('modules')
                    .select('id, status', { count: 'exact' }),

                // Total de aulas + views
                supabase
                    .from('lessons')
                    .select('id, status, views_count'),

                // Total de materiais
                supabase
                    .from('materials')
                    .select('id', { count: 'exact' }),

                // Total de progressos completados
                supabase
                    .from('lesson_progress')
                    .select('id', { count: 'exact' })
                    .eq('completed', true),

                // Últimos 5 alunos cadastrados
                supabase
                    .from('users')
                    .select('id, name, email, status, created_at')
                    .eq('role', 'student')
                    .order('created_at', { ascending: false })
                    .limit(5),

                // Top 5 aulas mais vistas
                supabase
                    .from('lessons')
                    .select(`
                        id,
                        title,
                        views_count,
                        type,
                        module:modules (
                            name
                        )
                    `)
                    .eq('status', 'PUBLISHED')
                    .order('views_count', { ascending: false })
                    .limit(5),

                // Últimos 5 progressos
                supabase
                    .from('lesson_progress')
                    .select(`
                        id,
                        completed_at,
                        student:users (
                            name
                        ),
                        lesson:lessons (
                            title
                        )
                    `)
                    .eq('completed', true)
                    .order('completed_at', { ascending: false })
                    .limit(5),
            ]);

            // Processar estatísticas de alunos
            const students = studentsResult.data || [];
            const activeStudents = students.filter((s: { status: string }) => s.status === 'active').length;
            const pendingStudents = students.filter((s: { status: string }) => s.status === 'pending').length;

            // Processar estatísticas de cursos
            const courses = coursesResult.data || [];
            const activeCourses = courses.filter((c: { status: string }) => c.status === 'ACTIVE').length;

            // Processar estatísticas de módulos
            const modules = modulesResult.data || [];
            const publishedModules = modules.filter((m: { status: string }) => m.status === 'PUBLISHED').length;

            // Processar estatísticas de aulas
            const lessons = lessonsResult.data || [];
            const publishedLessons = lessons.filter((l: { status: string }) => l.status === 'PUBLISHED').length;
            const totalViews = lessons.reduce((acc: number, l: { views_count: number }) => acc + (l.views_count || 0), 0);

            // Atualizar stats
            setStats({
                totalStudents: students.length,
                activeStudents,
                pendingStudents,
                totalCourses: courses.length,
                activeCourses,
                totalModules: modules.length,
                publishedModules,
                totalLessons: lessons.length,
                publishedLessons,
                totalMaterials: materialsResult.count || 0,
                totalViews,
                completedLessons: progressResult.count || 0,
            });

            // Atualizar alunos recentes
            setRecentStudents(
                (recentStudentsResult.data || []).map((s: RecentStudent) => ({
                    id: s.id,
                    name: s.name,
                    email: s.email,
                    status: s.status,
                    created_at: s.created_at,
                }))
            );

            // Atualizar top aulas
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

            // Atualizar progressos recentes
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
        isLoading,
        error,
        refetch: fetchDashboardData,
    };
}