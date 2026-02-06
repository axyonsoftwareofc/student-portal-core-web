// app/(dashboard)/aluno/dashboard/page.tsx
'use client';

import Link from 'next/link';
import {
    BookOpen,
    Layers,
    CheckCircle,
    Clock,
    ArrowRight,
    Loader2,
    BarChart3,
    PlayCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCourses } from '@/hooks/useStudentCourses';

export default function AlunoDashboardPage() {
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
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                    Olá, {user?.name || 'Aluno'}! 👋
                </h1>
                <p className="text-sm sm:text-base text-gray-500">
                    Continue de onde parou e acompanhe seu progresso
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <BarChart3 className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{overallProgress}%</p>
                    <p className="text-xs text-gray-500">Progresso Geral</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{completedLessons}/{totalLessons}</p>
                    <p className="text-xs text-gray-500">Aulas Concluídas</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <Layers className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{totalModules}</p>
                    <p className="text-xs text-gray-500">Módulos</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <BookOpen className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{courses.length}</p>
                    <p className="text-xs text-gray-500">Cursos Ativos</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">Progresso Geral</h3>
                    <span className="text-sm font-medium text-sky-400">{overallProgress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-800">
                    <div
                        className={`h-full transition-all duration-500 ${
                            overallProgress === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    {completedLessons} de {totalLessons} aulas concluídas
                </p>
            </div>

            {/* Courses */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Meus Cursos</h2>
                    <Link
                        href="/aluno/estudar"
                        className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                        Ver todos
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                        <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-400">Você ainda não está matriculado em nenhum curso</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {courses.slice(0, 2).map((course) => (
                            <Link
                                key={course.id}
                                href="/aluno/estudar"
                                className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                                        <BookOpen className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                        course.progress_percentage === 100
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-sky-500/10 text-sky-400'
                                    }`}>
                                        {course.progress_percentage}%
                                    </span>
                                </div>
                                <h3 className="font-medium text-white mb-1">{course.name}</h3>
                                <p className="text-xs text-gray-500 mb-3">
                                    {course.modules_count} módulos • {course.lessons_count} aulas
                                </p>
                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                                    <div
                                        className="h-full bg-sky-500 transition-all"
                                        style={{ width: `${course.progress_percentage}%` }}
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-6">
                <h3 className="font-semibold text-sky-300 mb-4">Continuar Estudando</h3>
                <Link
                    href="/aluno/estudar"
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
                >
                    <PlayCircle className="h-4 w-4" strokeWidth={1.5} />
                    Ir para área de estudos
                </Link>
            </div>
        </div>
    );
}