// app/(dashboard)/aluno/journey/page.tsx
'use client';

import { Loader2, Map } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCourses } from '@/hooks/useStudentCourses';
import { useStudentModules } from '@/hooks/useStudentModules';
import { useGamification } from '@/hooks/useGamification';
import { JourneyHeader } from '@/components/student/journey/JourneyHeader';
import { CourseMap } from '@/components/student/journey/CourseMap';
import { StreakCard } from '@/components/student/journey/StreakCard';
import { XpRecentActivity } from '@/components/student/journey/XpRecentActivity';

export default function JourneyPage() {
    const { user } = useAuth();
    const { courses, isLoading: loadingCourses } = useStudentCourses(user?.id || null);
    const { stats, isLoading: loadingGamification } = useGamification(user?.id || null);

    const firstCourseId = courses.length > 0 ? courses[0].id : null;
    const { modules, isLoading: loadingModules } = useStudentModules(firstCourseId, user?.id || null);

    const isLoading = loadingCourses || loadingModules || loadingGamification;

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
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                        <Map className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                            Minha Jornada
                        </h1>
                        <p className="text-sm text-gray-500">
                            Acompanhe sua evolução e conquistas
                        </p>
                    </div>
                </div>
            </div>

            {/* Gamification Header */}
            {stats && <JourneyHeader stats={stats} />}

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Course Map - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {courses.length > 0 && modules.length > 0 ? (
                        <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-5">
                            <CourseMap modules={modules} courseName={courses[0].name} />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-gray-800/50 bg-gray-900/30 p-8 text-center">
                            <Map className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                            <p className="text-gray-400">Nenhum curso encontrado</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Entre em contato com o professor para ser matriculado
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Streak Card */}
                    {stats && (
                        <StreakCard
                            currentStreak={stats.currentStreak}
                            longestStreak={stats.longestStreak}
                            isStreakActive={stats.isStreakActive}
                        />
                    )}

                    {/* XP Info */}
                    <XpRecentActivity />
                </div>
            </div>
        </div>
    );
}