// app/(dashboard)/aluno/desempenho/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCourses } from '@/hooks/useStudentCourses';
import { useStudentSubmissions } from '@/hooks/useStudentSubmissions';
import { PerformanceHeader } from '@/components/student/performance/PerformanceHeader';
import { PerformanceTabs, type PerformanceTabType } from '@/components/student/performance/PerformanceTabs';
import { ExercisesTab } from '@/components/student/performance/ExercisesTab';
import { ProgressTab } from '@/components/student/performance/ProgressTab';
import { AchievementsTab } from '@/components/student/performance/AchievementsTab';

export default function DesempenhoPage() {
    const { user } = useAuth();
    const { courses, isLoading: isLoadingCourses } = useStudentCourses(user?.id || null);
    const { submissions, pendingCount, isLoading: isLoadingSubmissions } = useStudentSubmissions(user?.id || null);

    const [activeTab, setActiveTab] = useState<PerformanceTabType>('exercises');

    // Calcular estatísticas gerais
    const totalLessons = courses.reduce((acc, c) => acc + (c.lessons_count || 0), 0);
    const completedLessons = courses.reduce((acc, c) => acc + (c.completed_lessons || 0), 0);
    const overallProgress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    // Calcular estatísticas de exercícios
    const exerciseStats = useMemo(() => {
        const totalExercises = submissions.length;
        const approvedCount = submissions.filter(
            (s) => s.status === 'approved' || s.status === 'reviewed'
        ).length;

        const gradesWithValues = submissions
            .filter((s) => s.grade !== null)
            .map((s) => s.grade as number);

        const averageGrade = gradesWithValues.length > 0
            ? gradesWithValues.reduce((a, b) => a + b, 0) / gradesWithValues.length
            : null;

        return { totalExercises, approvedCount, averageGrade };
    }, [submissions]);

    const isLoading = isLoadingCourses || isLoadingSubmissions;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-sky-400 animate-spin" strokeWidth={1.5} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                    Meu Desempenho
                </h1>
                <p className="text-sm text-gray-500">
                    Acompanhe seu progresso e conquistas
                </p>
            </div>

            {/* Stats */}
            <PerformanceHeader
                averageGrade={exerciseStats.averageGrade}
                totalExercises={exerciseStats.totalExercises}
                approvedCount={exerciseStats.approvedCount}
                pendingCount={pendingCount}
                overallProgress={overallProgress}
            />

            {/* Tabs */}
            <PerformanceTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'exercises' && (
                    <ExercisesTab
                        submissions={submissions}
                        isLoading={isLoadingSubmissions}
                    />
                )}

                {activeTab === 'progress' && (
                    <ProgressTab
                        courses={courses}
                        isLoading={isLoadingCourses}
                    />
                )}

                {activeTab === 'achievements' && (
                    <AchievementsTab
                        overallProgress={overallProgress}
                        completedLessons={completedLessons}
                        totalExercises={exerciseStats.totalExercises}
                    />
                )}
            </div>
        </div>
    );
}