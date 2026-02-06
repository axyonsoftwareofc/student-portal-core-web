// app/(dashboard)/aluno/desempenho/page.tsx
'use client';

import {
    BarChart3,
    TrendingUp,
    CheckCircle,
    Clock,
    BookOpen,
    Layers,
    Loader2,
    Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCourses } from '@/hooks/useStudentCourses';

export default function DesempenhoPage() {
    const { user } = useAuth();
    const { courses, isLoading } = useStudentCourses(user?.id || null);

    // Calcular estatísticas gerais
    const totalModules = courses.reduce((acc, c) => acc + (c.modules_count || 0), 0);
    const totalLessons = courses.reduce((acc, c) => acc + (c.lessons_count || 0), 0);
    const completedLessons = courses.reduce((acc, c) => acc + (c.completed_lessons || 0), 0);
    const overallProgress = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

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

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <TrendingUp className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{overallProgress}%</p>
                    <p className="text-sm text-gray-500">Progresso Geral</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{completedLessons}</p>
                    <p className="text-sm text-gray-500">Aulas Concluídas</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <Layers className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalModules}</p>
                    <p className="text-sm text-gray-500">Módulos Disponíveis</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <BookOpen className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{courses.length}</p>
                    <p className="text-sm text-gray-500">Cursos Ativos</p>
                </div>
            </div>

            {/* Progress by Course */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    Progresso por Curso
                </h2>

                {courses.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum curso matriculado</p>
                ) : (
                    <div className="space-y-4">
                        {courses.map((course) => (
                            <div key={course.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-300">{course.name}</span>
                                    <span className="text-sm font-medium text-sky-400">
                                        {course.progress_percentage}%
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                                    <div
                                        className={`h-full transition-all duration-500 ${
                                            course.progress_percentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                                        }`}
                                        style={{ width: `${course.progress_percentage}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    {course.completed_lessons}/{course.lessons_count} aulas
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Achievements placeholder */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-6">
                <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                    <h3 className="font-semibold text-amber-300">Conquistas</h3>
                </div>
                <p className="text-sm text-amber-200/80">
                    Continue estudando para desbloquear conquistas!
                </p>
                <div className="mt-4 flex gap-3">
                    {overallProgress >= 25 && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                            <span className="text-lg">🌟</span>
                        </div>
                    )}
                    {overallProgress >= 50 && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                            <span className="text-lg">🏆</span>
                        </div>
                    )}
                    {overallProgress >= 75 && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                            <span className="text-lg">🎯</span>
                        </div>
                    )}
                    {overallProgress === 100 && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                            <span className="text-lg">👑</span>
                        </div>
                    )}
                    {overallProgress < 25 && (
                        <p className="text-xs text-amber-200/60">
                            Complete 25% para ganhar sua primeira conquista!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}