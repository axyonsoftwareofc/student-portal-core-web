// hooks/useReports.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ReportStats {
    totalStudents: number;
    activeStudents: number;
    pendingStudents: number;
    suspendedStudents: number;
    totalCourses: number;
    totalModules: number;
    totalLessons: number;
    totalLessonsCompleted: number;
    engagementRate: number;
    totalRevenue: number;
    pendingRevenue: number;
    overdueRevenue: number;
    totalExerciseSubmissions: number;
    pendingExercises: number;
    approvedExercises: number;
    needsRevisionExercises: number;
    classAverage: number | null;
}

export interface MonthlyData {
    month: string;
    monthNum: number;
    year: number;
    alunos: number;
    receita: number;
    aulasCompletas: number;
    exerciciosEnviados: number;
}

export interface ModuleCompletion {
    moduleId: string;
    moduleName: string;
    courseName: string;
    totalLessons: number;
    completedByStudents: number;
    studentsInProgress: number;
}

export interface TopStudent {
    id: string;
    name: string;
    email: string;
    lessonsCompleted: number;
    exercisesSubmitted: number;
    exerciseAverage: number | null;
    quizAverage: number;
    lastActivity: string | null;
}

export interface StudentStatusDistribution {
    name: string;
    value: number;
    color: string;
}

export interface PaymentStatusDistribution {
    name: string;
    value: number;
    color: string;
}

export interface ExerciseStatusDistribution {
    name: string;
    value: number;
    color: string;
}

export interface StudentReportDetail {
    id: string;
    name: string;
    email: string;
    status: string;
    createdAt: string;
    lessonsCompleted: number;
    totalLessons: number;
    progressPercent: number;
    exercisesSubmitted: number;
    exerciseAverage: number | null;
    quizAverage: number;
    lastActivity: string | null;
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function buildMonthlyMap(): Map<string, MonthlyData> {
    const map = new Map<string, MonthlyData>();
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        map.set(key, {
            month: MONTH_NAMES[d.getMonth()],
            monthNum: d.getMonth(),
            year: d.getFullYear(),
            alunos: 0,
            receita: 0,
            aulasCompletas: 0,
            exerciciosEnviados: 0,
        });
    }
    return map;
}

function getMonthKey(dateString: string): string {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${d.getMonth()}`;
}

export function useReports(_timeRange: 'week' | 'month' | 'year' = 'month') {
    const [stats, setStats] = useState<ReportStats>({
        totalStudents: 0,
        activeStudents: 0,
        pendingStudents: 0,
        suspendedStudents: 0,
        totalCourses: 0,
        totalModules: 0,
        totalLessons: 0,
        totalLessonsCompleted: 0,
        engagementRate: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
        overdueRevenue: 0,
        totalExerciseSubmissions: 0,
        pendingExercises: 0,
        approvedExercises: 0,
        needsRevisionExercises: 0,
        classAverage: null,
    });

    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [moduleCompletion, setModuleCompletion] = useState<ModuleCompletion[]>([]);
    const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
    const [studentReports, setStudentReports] = useState<StudentReportDetail[]>([]);
    const [studentDistribution, setStudentDistribution] = useState<StudentStatusDistribution[]>([]);
    const [paymentDistribution, setPaymentDistribution] = useState<PaymentStatusDistribution[]>([]);
    const [exerciseDistribution, setExerciseDistribution] = useState<ExerciseStatusDistribution[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const sixMonthsAgoISO = sixMonthsAgo.toISOString();
            const sixMonthsAgoDate = sixMonthsAgoISO.split('T')[0];

            const [
                studentsResult,
                coursesCount,
                modulesResult,
                lessonsCount,
                completedCount,
                paymentsResult,
                exercisesResult,
                recentStudentsResult,
                recentPaymentsResult,
                recentProgressResult,
                recentExercisesResult,
                allProgressResult,
            ] = await Promise.all([
                supabase
                    .from('users')
                    .select('id, name, email, status, created_at')
                    .eq('role', 'student'),

                supabase
                    .from('courses')
                    .select('*', { count: 'exact', head: true }),

                supabase
                    .from('modules')
                    .select(`
            id,
            name,
            status,
            course:courses(name),
            lessons(id)
          `),

                supabase
                    .from('lessons')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'PUBLISHED'),

                supabase
                    .from('lesson_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('completed', true),

                supabase
                    .from('payments')
                    .select('amount, status'),

                supabase
                    .from('exercise_submissions')
                    .select('id, student_id, status, grade, created_at'),

                supabase
                    .from('users')
                    .select('created_at')
                    .eq('role', 'student')
                    .gte('created_at', sixMonthsAgoISO),

                supabase
                    .from('payments')
                    .select('paid_date, amount')
                    .eq('status', 'PAID')
                    .gte('paid_date', sixMonthsAgoDate),

                supabase
                    .from('lesson_progress')
                    .select('completed_at')
                    .eq('completed', true)
                    .gte('completed_at', sixMonthsAgoISO),

                supabase
                    .from('exercise_submissions')
                    .select('created_at')
                    .gte('created_at', sixMonthsAgoISO),

                supabase
                    .from('lesson_progress')
                    .select(`
            student_id,
            lesson_id,
            completed,
            completed_at,
            quiz_score,
            quiz_total
          `)
                    .eq('completed', true),
            ]);

            const students = studentsResult.data || [];
            const activeStudents = students.filter((s: { status: string }) => s.status === 'active').length;
            const pendingStudents = students.filter((s: { status: string }) => s.status === 'pending').length;
            const suspendedStudents = students.filter((s: { status: string }) => s.status === 'suspended').length;

            const payments = paymentsResult.data || [];
            let totalRevenue = 0;
            let pendingRevenue = 0;
            let overdueRevenue = 0;
            let paidCount = 0;
            let pendingPayCount = 0;
            let overdueCount = 0;
            let cancelledCount = 0;

            payments.forEach((p: { amount: number; status: string }) => {
                const amount = Number(p.amount) || 0;
                switch (p.status) {
                    case 'PAID':
                        totalRevenue += amount;
                        paidCount++;
                        break;
                    case 'PENDING':
                        pendingRevenue += amount;
                        pendingPayCount++;
                        break;
                    case 'OVERDUE':
                        overdueRevenue += amount;
                        overdueCount++;
                        break;
                    case 'CANCELLED':
                        cancelledCount++;
                        break;
                }
            });

            const exercises = exercisesResult.data || [];
            const totalExerciseSubmissions = exercises.length;
            const pendingExercisesCount = exercises.filter(
                (e: { status: string }) => e.status === 'pending'
            ).length;
            const approvedExercises = exercises.filter(
                (e: { status: string }) => e.status === 'approved' || e.status === 'reviewed'
            ).length;
            const needsRevisionExercises = exercises.filter(
                (e: { status: string }) => e.status === 'needs_revision'
            ).length;

            const gradesWithValues = exercises
                .filter((e: { grade: number | null }) => e.grade !== null)
                .map((e: { grade: number }) => Number(e.grade));
            const classAverage = gradesWithValues.length > 0
                ? Number((gradesWithValues.reduce((a: number, b: number) => a + b, 0) / gradesWithValues.length).toFixed(1))
                : null;

            const totalPossibleCompletions = students.length * (lessonsCount.count || 0);
            const engagementRate = totalPossibleCompletions > 0
                ? Math.round(((completedCount.count || 0) / totalPossibleCompletions) * 100)
                : 0;

            setStats({
                totalStudents: students.length,
                activeStudents,
                pendingStudents,
                suspendedStudents,
                totalCourses: coursesCount.count || 0,
                totalModules: (modulesResult.data || []).length,
                totalLessons: lessonsCount.count || 0,
                totalLessonsCompleted: completedCount.count || 0,
                engagementRate,
                totalRevenue,
                pendingRevenue,
                overdueRevenue,
                totalExerciseSubmissions,
                pendingExercises: pendingExercisesCount,
                approvedExercises,
                needsRevisionExercises,
                classAverage,
            });

            setStudentDistribution([
                { name: 'Ativos', value: activeStudents, color: '#10b981' },
                { name: 'Pendentes', value: pendingStudents, color: '#f59e0b' },
                { name: 'Suspensos', value: suspendedStudents, color: '#ef4444' },
            ]);

            setPaymentDistribution([
                { name: 'Pagos', value: paidCount, color: '#10b981' },
                { name: 'Pendentes', value: pendingPayCount, color: '#f59e0b' },
                { name: 'Atrasados', value: overdueCount, color: '#ef4444' },
                { name: 'Cancelados', value: cancelledCount, color: '#6b7280' },
            ]);

            setExerciseDistribution([
                { name: 'Pendentes', value: pendingExercisesCount, color: '#f59e0b' },
                { name: 'Aprovados', value: approvedExercises, color: '#10b981' },
                { name: 'Revisão', value: needsRevisionExercises, color: '#ef4444' },
            ]);

            const monthlyMap = buildMonthlyMap();

            (recentStudentsResult.data || []).forEach((s: { created_at: string }) => {
                const key = getMonthKey(s.created_at);
                const entry = monthlyMap.get(key);
                if (entry) entry.alunos++;
            });

            (recentPaymentsResult.data || []).forEach((p: { paid_date: string; amount: number }) => {
                if (p.paid_date) {
                    const key = getMonthKey(p.paid_date + 'T00:00:00');
                    const entry = monthlyMap.get(key);
                    if (entry) entry.receita += Number(p.amount) || 0;
                }
            });

            (recentProgressResult.data || []).forEach((p: { completed_at: string }) => {
                if (p.completed_at) {
                    const key = getMonthKey(p.completed_at);
                    const entry = monthlyMap.get(key);
                    if (entry) entry.aulasCompletas++;
                }
            });

            (recentExercisesResult.data || []).forEach((e: { created_at: string }) => {
                const key = getMonthKey(e.created_at);
                const entry = monthlyMap.get(key);
                if (entry) entry.exerciciosEnviados++;
            });

            setMonthlyData(Array.from(monthlyMap.values()));

            const modules = (modulesResult.data || []).filter(
                (m: { status: string }) => m.status === 'PUBLISHED'
            );
            const allProgress = allProgressResult.data || [];

            const allLessonIds = new Set<string>();
            const moduleLessonMap = new Map<string, string[]>();

            modules.forEach((mod: { id: string; lessons: { id: string }[] }) => {
                const lessonIds = (mod.lessons || []).map((l: { id: string }) => l.id);
                moduleLessonMap.set(mod.id, lessonIds);
                lessonIds.forEach((id: string) => allLessonIds.add(id));
            });

            const completedByLesson = new Map<string, number>();
            const inProgressByLesson = new Map<string, number>();

            allProgress.forEach((p: { lesson_id: string; completed: boolean }) => {
                if (allLessonIds.has(p.lesson_id)) {
                    if (p.completed) {
                        completedByLesson.set(p.lesson_id, (completedByLesson.get(p.lesson_id) || 0) + 1);
                    } else {
                        inProgressByLesson.set(p.lesson_id, (inProgressByLesson.get(p.lesson_id) || 0) + 1);
                    }
                }
            });

            const moduleCompletionData: ModuleCompletion[] = modules
                .map((mod: { id: string; name: string; course: { name: string } | null; lessons: { id: string }[] }) => {
                    const lessonIds = moduleLessonMap.get(mod.id) || [];
                    let completedTotal = 0;
                    let inProgressTotal = 0;

                    lessonIds.forEach((lessonId: string) => {
                        completedTotal += completedByLesson.get(lessonId) || 0;
                        inProgressTotal += inProgressByLesson.get(lessonId) || 0;
                    });

                    return {
                        moduleId: mod.id,
                        moduleName: mod.name,
                        courseName: (mod.course as { name: string } | null)?.name || 'Sem curso',
                        totalLessons: lessonIds.length,
                        completedByStudents: completedTotal,
                        studentsInProgress: inProgressTotal,
                    };
                })
                .filter((m: ModuleCompletion) => m.totalLessons > 0);

            setModuleCompletion(moduleCompletionData);

            const studentProgressMap = new Map<string, {
                lessonsCompleted: number;
                quizScores: number[];
                lastActivity: string | null;
            }>();

            allProgress.forEach((p: {
                student_id: string;
                completed_at: string | null;
                quiz_score: number | null;
                quiz_total: number | null;
            }) => {
                const existing = studentProgressMap.get(p.student_id);
                if (existing) {
                    existing.lessonsCompleted++;
                    if (p.quiz_score !== null && p.quiz_total !== null && p.quiz_total > 0) {
                        existing.quizScores.push((p.quiz_score / p.quiz_total) * 100);
                    }
                    if (p.completed_at && (!existing.lastActivity || p.completed_at > existing.lastActivity)) {
                        existing.lastActivity = p.completed_at;
                    }
                } else {
                    const quizScores: number[] = [];
                    if (p.quiz_score !== null && p.quiz_total !== null && p.quiz_total > 0) {
                        quizScores.push((p.quiz_score / p.quiz_total) * 100);
                    }
                    studentProgressMap.set(p.student_id, {
                        lessonsCompleted: 1,
                        quizScores,
                        lastActivity: p.completed_at,
                    });
                }
            });

            const exercisesByStudent = new Map<string, { count: number; grades: number[] }>();
            exercises.forEach((e: { student_id: string; grade: number | null }) => {
                const existing = exercisesByStudent.get(e.student_id);
                if (existing) {
                    existing.count++;
                    if (e.grade !== null) existing.grades.push(Number(e.grade));
                } else {
                    exercisesByStudent.set(e.student_id, {
                        count: 1,
                        grades: e.grade !== null ? [Number(e.grade)] : [],
                    });
                }
            });

            const studentMap = new Map(
                students.map((s: { id: string; name: string; email: string }) => [s.id, s])
            );

            const topStudentsList: TopStudent[] = Array.from(studentProgressMap.entries())
                .map(([studentId, progress]) => {
                    const student = studentMap.get(studentId) as { id: string; name: string; email: string } | undefined;
                    const exerciseData = exercisesByStudent.get(studentId);

                    return {
                        id: studentId,
                        name: student?.name || 'Aluno',
                        email: student?.email || '',
                        lessonsCompleted: progress.lessonsCompleted,
                        exercisesSubmitted: exerciseData?.count || 0,
                        exerciseAverage: exerciseData?.grades.length
                            ? Number((exerciseData.grades.reduce((a, b) => a + b, 0) / exerciseData.grades.length).toFixed(1))
                            : null,
                        quizAverage: progress.quizScores.length > 0
                            ? Math.round(progress.quizScores.reduce((a, b) => a + b, 0) / progress.quizScores.length)
                            : 0,
                        lastActivity: progress.lastActivity,
                    };
                })
                .sort((a, b) => b.lessonsCompleted - a.lessonsCompleted)
                .slice(0, 5);

            setTopStudents(topStudentsList);

            const totalLessonsAvailable = lessonsCount.count || 0;
            const studentReportsList: StudentReportDetail[] = students
                .map((s: { id: string; name: string; email: string; status: string; created_at: string }) => {
                    const progress = studentProgressMap.get(s.id);
                    const exerciseData = exercisesByStudent.get(s.id);
                    const completed = progress?.lessonsCompleted || 0;
                    const progressPercent = totalLessonsAvailable > 0
                        ? Math.round((completed / totalLessonsAvailable) * 100)
                        : 0;

                    return {
                        id: s.id,
                        name: s.name,
                        email: s.email,
                        status: s.status,
                        createdAt: s.created_at,
                        lessonsCompleted: completed,
                        totalLessons: totalLessonsAvailable,
                        progressPercent,
                        exercisesSubmitted: exerciseData?.count || 0,
                        exerciseAverage: exerciseData?.grades.length
                            ? Number((exerciseData.grades.reduce((a, b) => a + b, 0) / exerciseData.grades.length).toFixed(1))
                            : null,
                        quizAverage: progress?.quizScores.length
                            ? Math.round(progress.quizScores.reduce((a, b) => a + b, 0) / progress.quizScores.length)
                            : 0,
                        lastActivity: progress?.lastActivity || null,
                    };
                })
                .sort((a: StudentReportDetail, b: StudentReportDetail) => b.lessonsCompleted - a.lessonsCompleted);

            setStudentReports(studentReportsList);

        } catch (err) {
            console.error('Erro ao buscar relatórios:', err);
            setError('Erro ao carregar relatórios');
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    return {
        stats,
        monthlyData,
        moduleCompletion,
        topStudents,
        studentReports,
        studentDistribution,
        paymentDistribution,
        exerciseDistribution,
        isLoading,
        error,
        refetch: fetchReports,
    };
}