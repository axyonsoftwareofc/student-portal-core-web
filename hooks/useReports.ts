// hooks/useReports.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// Tipos
export interface ReportStats {
    // Totais gerais
    totalStudents: number;
    activeStudents: number;
    pendingStudents: number;
    totalCourses: number;
    totalModules: number;
    totalLessons: number;

    // Progresso
    totalLessonsCompleted: number;
    engagementRate: number; // % de aulas concluídas

    // Financeiro
    totalRevenue: number;
    pendingRevenue: number;
    overdueRevenue: number;
}

export interface MonthlyData {
    month: string;
    monthNum: number;
    year: number;
    alunos: number;
    receita: number;
    aulasCompletas: number;
}

export interface ModuleCompletion {
    moduleId: string;
    moduleName: string;
    courseName: string;
    totalLessons: number;
    completedByStudents: number; // total de conclusões (aluno x aula)
    studentsInProgress: number;
}

export interface TopStudent {
    id: string;
    name: string;
    email: string;
    lessonsCompleted: number;
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

export function useReports(timeRange: 'week' | 'month' | 'year' = 'month') {
    const [stats, setStats] = useState<ReportStats>({
        totalStudents: 0,
        activeStudents: 0,
        pendingStudents: 0,
        totalCourses: 0,
        totalModules: 0,
        totalLessons: 0,
        totalLessonsCompleted: 0,
        engagementRate: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
        overdueRevenue: 0,
    });

    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [moduleCompletion, setModuleCompletion] = useState<ModuleCompletion[]>([]);
    const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
    const [studentDistribution, setStudentDistribution] = useState<StudentStatusDistribution[]>([]);
    const [paymentDistribution, setPaymentDistribution] = useState<PaymentStatusDistribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    // Calcular data de início baseado no timeRange
    const getStartDate = useCallback(() => {
        const now = new Date();
        switch (timeRange) {
            case 'week':
                return new Date(now.setDate(now.getDate() - 7));
            case 'month':
                return new Date(now.setMonth(now.getMonth() - 1));
            case 'year':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            default:
                return new Date(now.setMonth(now.getMonth() - 1));
        }
    }, [timeRange]);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Buscar estatísticas gerais
            const [
                { count: totalStudents },
                { count: activeStudents },
                { count: pendingStudents },
                { count: totalCourses },
                { count: totalModules },
                { count: totalLessons },
                { count: totalLessonsCompleted },
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'active'),
                supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'pending'),
                supabase.from('courses').select('*', { count: 'exact', head: true }),
                supabase.from('modules').select('*', { count: 'exact', head: true }),
                supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('status', 'PUBLISHED'),
                supabase.from('lesson_progress').select('*', { count: 'exact', head: true }).eq('completed', true),
            ]);

            // 2. Buscar dados financeiros
            const { data: payments } = await supabase
                .from('payments')
                .select('amount, status');

            let totalRevenue = 0;
            let pendingRevenue = 0;
            let overdueRevenue = 0;
            let paidCount = 0;
            let pendingCount = 0;
            let overdueCount = 0;
            let cancelledCount = 0;

            (payments || []).forEach((p: { amount: number; status: string }) => {
                const amount = Number(p.amount) || 0;
                switch (p.status) {
                    case 'PAID':
                        totalRevenue += amount;
                        paidCount++;
                        break;
                    case 'PENDING':
                        pendingRevenue += amount;
                        pendingCount++;
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

            // Calcular engajamento
            const totalPossibleCompletions = (totalStudents || 0) * (totalLessons || 0);
            const engagementRate = totalPossibleCompletions > 0
                ? Math.round(((totalLessonsCompleted || 0) / totalPossibleCompletions) * 100)
                : 0;

            setStats({
                totalStudents: totalStudents || 0,
                activeStudents: activeStudents || 0,
                pendingStudents: pendingStudents || 0,
                totalCourses: totalCourses || 0,
                totalModules: totalModules || 0,
                totalLessons: totalLessons || 0,
                totalLessonsCompleted: totalLessonsCompleted || 0,
                engagementRate,
                totalRevenue,
                pendingRevenue,
                overdueRevenue,
            });

            // 3. Distribuição de status dos alunos
            setStudentDistribution([
                { name: 'Ativos', value: activeStudents || 0, color: '#10b981' },
                { name: 'Pendentes', value: pendingStudents || 0, color: '#f59e0b' },
            ]);

            // 4. Distribuição de pagamentos
            setPaymentDistribution([
                { name: 'Pagos', value: paidCount, color: '#10b981' },
                { name: 'Pendentes', value: pendingCount, color: '#f59e0b' },
                { name: 'Atrasados', value: overdueCount, color: '#ef4444' },
                { name: 'Cancelados', value: cancelledCount, color: '#6b7280' },
            ]);

            // 5. Buscar dados mensais (últimos 6 meses)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const { data: recentStudents } = await supabase
                .from('users')
                .select('created_at')
                .eq('role', 'student')
                .gte('created_at', sixMonthsAgo.toISOString());

            const { data: recentPayments } = await supabase
                .from('payments')
                .select('paid_date, amount')
                .eq('status', 'PAID')
                .gte('paid_date', sixMonthsAgo.toISOString().split('T')[0]);

            const { data: recentProgress } = await supabase
                .from('lesson_progress')
                .select('completed_at')
                .eq('completed', true)
                .gte('completed_at', sixMonthsAgo.toISOString());

            // Agrupar por mês
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const monthlyMap = new Map<string, MonthlyData>();

            // Inicializar últimos 6 meses
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                monthlyMap.set(key, {
                    month: monthNames[d.getMonth()],
                    monthNum: d.getMonth(),
                    year: d.getFullYear(),
                    alunos: 0,
                    receita: 0,
                    aulasCompletas: 0,
                });
            }

            // Contar alunos por mês
            (recentStudents || []).forEach((s: { created_at: string }) => {
                const d = new Date(s.created_at);
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                const entry = monthlyMap.get(key);
                if (entry) entry.alunos++;
            });

            // Contar receita por mês
            (recentPayments || []).forEach((p: { paid_date: string; amount: number }) => {
                if (p.paid_date) {
                    const d = new Date(p.paid_date + 'T00:00:00');
                    const key = `${d.getFullYear()}-${d.getMonth()}`;
                    const entry = monthlyMap.get(key);
                    if (entry) entry.receita += Number(p.amount) || 0;
                }
            });

            // Contar aulas completas por mês
            (recentProgress || []).forEach((p: { completed_at: string }) => {
                if (p.completed_at) {
                    const d = new Date(p.completed_at);
                    const key = `${d.getFullYear()}-${d.getMonth()}`;
                    const entry = monthlyMap.get(key);
                    if (entry) entry.aulasCompletas++;
                }
            });

            setMonthlyData(Array.from(monthlyMap.values()));

            // 6. Buscar conclusão por módulo
            const { data: modules } = await supabase
                .from('modules')
                .select(`
          id,
          name,
          course:courses(name),
          lessons(id)
        `)
                .eq('status', 'PUBLISHED')
                .limit(10);

            if (modules && modules.length > 0) {
                const moduleCompletionData: ModuleCompletion[] = [];

                for (const mod of modules) {
                    const lessonIds = (mod.lessons || []).map((l: { id: string }) => l.id);

                    if (lessonIds.length > 0) {
                        const { count: completedCount } = await supabase
                            .from('lesson_progress')
                            .select('*', { count: 'exact', head: true })
                            .in('lesson_id', lessonIds)
                            .eq('completed', true);

                        const { count: inProgressCount } = await supabase
                            .from('lesson_progress')
                            .select('*', { count: 'exact', head: true })
                            .in('lesson_id', lessonIds)
                            .eq('completed', false);

                        moduleCompletionData.push({
                            moduleId: mod.id,
                            moduleName: mod.name,
                            courseName: (mod.course as { name: string } | null)?.name || 'Sem curso',
                            totalLessons: lessonIds.length,
                            completedByStudents: completedCount || 0,
                            studentsInProgress: inProgressCount || 0,
                        });
                    }
                }

                setModuleCompletion(moduleCompletionData);
            }

            // 7. Buscar top alunos
            const { data: progressByStudent } = await supabase
                .from('lesson_progress')
                .select(`
          student_id,
          completed,
          quiz_score,
          quiz_total,
          completed_at,
          student:users!student_id(id, name, email)
        `)
                .eq('completed', true)
                .order('completed_at', { ascending: false });

            if (progressByStudent) {
                const studentMap = new Map<string, {
                    id: string;
                    name: string;
                    email: string;
                    lessonsCompleted: number;
                    quizScores: number[];
                    lastActivity: string | null;
                }>();

                progressByStudent.forEach((p: {
                    student_id: string;
                    quiz_score: number | null;
                    quiz_total: number | null;
                    completed_at: string | null;
                    student: { id: string; name: string; email: string } | null;
                }) => {
                    if (!p.student) return;

                    const existing = studentMap.get(p.student_id);
                    if (existing) {
                        existing.lessonsCompleted++;
                        if (p.quiz_score !== null && p.quiz_total !== null && p.quiz_total > 0) {
                            existing.quizScores.push((p.quiz_score / p.quiz_total) * 100);
                        }
                        if (!existing.lastActivity && p.completed_at) {
                            existing.lastActivity = p.completed_at;
                        }
                    } else {
                        const quizScores: number[] = [];
                        if (p.quiz_score !== null && p.quiz_total !== null && p.quiz_total > 0) {
                            quizScores.push((p.quiz_score / p.quiz_total) * 100);
                        }
                        studentMap.set(p.student_id, {
                            id: p.student.id,
                            name: p.student.name,
                            email: p.student.email,
                            lessonsCompleted: 1,
                            quizScores,
                            lastActivity: p.completed_at,
                        });
                    }
                });

                const topStudentsList: TopStudent[] = Array.from(studentMap.values())
                    .map(s => ({
                        id: s.id,
                        name: s.name,
                        email: s.email,
                        lessonsCompleted: s.lessonsCompleted,
                        quizAverage: s.quizScores.length > 0
                            ? Math.round(s.quizScores.reduce((a, b) => a + b, 0) / s.quizScores.length)
                            : 0,
                        lastActivity: s.lastActivity,
                    }))
                    .sort((a, b) => b.lessonsCompleted - a.lessonsCompleted)
                    .slice(0, 5);

                setTopStudents(topStudentsList);
            }

        } catch (err) {
            console.error('Erro ao buscar relatórios:', err);
            setError('Erro ao carregar relatórios');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, getStartDate]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    return {
        stats,
        monthlyData,
        moduleCompletion,
        topStudents,
        studentDistribution,
        paymentDistribution,
        isLoading,
        error,
        refetch: fetchReports,
    };
}