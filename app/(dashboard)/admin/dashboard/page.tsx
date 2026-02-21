// app/(dashboard)/admin/dashboard/page.tsx
'use client';

import Link from "next/link";
import {
    Users,
    BookOpen,
    FileText,
    GraduationCap,
    Layers,
    Eye,
    CheckCircle,
    Clock,
    UserPlus,
    Loader2,
    AlertTriangle,
    Video,
    PenTool,
    HelpCircle,
    ClipboardCheck,
    BarChart3,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

const LESSON_TYPE_ICONS: Record<string, typeof Video> = {
    VIDEO: Video,
    ARTICLE: BookOpen,
    EXERCISE: PenTool,
    QUIZ: HelpCircle,
};

const LESSON_TYPE_COLORS: Record<string, string> = {
    VIDEO: 'bg-sky-500/10 text-sky-400',
    ARTICLE: 'bg-emerald-500/10 text-emerald-400',
    EXERCISE: 'bg-amber-500/10 text-amber-400',
    QUIZ: 'bg-violet-500/10 text-violet-400',
};

function formatRelativeTime(dateString: string): string {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return new Date(dateString).toLocaleDateString('pt-BR');
}

export default function AdminDashboardPage() {
    const {
        stats,
        recentStudents,
        topLessons,
        recentProgress,
        pendingExercises,
        isLoading,
        error,
        refetch,
    } = useAdminDashboard();

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-sky-400" strokeWidth={1.5} />
                    <p className="text-gray-400">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-rose-400" strokeWidth={1.5} />
                    <p className="mb-4 text-gray-400">{error}</p>
                    <button
                        onClick={refetch}
                        className="rounded-lg bg-sky-600 px-4 py-2 text-white transition-colors hover:bg-sky-500"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="font-nacelle text-2xl font-semibold text-white sm:text-3xl">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500">Visão geral do sistema</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Alunos</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.activeStudents}</p>
                            <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                  ativos
                </span>
                                {stats.pendingStudents > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                                        {stats.pendingStudents} pendentes
                  </span>
                                )}
                            </div>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/10">
                            <Users className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Cursos</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.totalCourses}</p>
                            <p className="mt-2 text-xs text-gray-500">{stats.activeCourses} ativos</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
                            <GraduationCap className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Módulos</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.totalModules}</p>
                            <p className="mt-2 text-xs text-gray-500">{stats.publishedModules} publicados</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/10">
                            <Layers className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Aulas</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.totalLessons}</p>
                            <p className="mt-2 text-xs text-gray-500">{stats.publishedLessons} publicadas</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10">
                            <FileText className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercícios Pendentes - Destaque para Ação */}
            {stats.pendingExercises > 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                            <h2 className="text-lg font-semibold text-white">
                                Exercícios Aguardando Correção
                            </h2>
                            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                {stats.pendingExercises}
              </span>
                        </div>
                        <Link
                            href="/admin/correcoes"
                            className="text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
                        >
                            Corrigir todos →
                        </Link>
                    </div>

                    <div className="space-y-2">
                        {pendingExercises.map((exercise) => (
                            <Link
                                key={exercise.id}
                                href="/admin/correcoes"
                                className="flex items-center justify-between rounded-lg border border-gray-800/50 bg-gray-900/50 p-3 transition-all hover:bg-gray-900/80"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                                        <PenTool className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{exercise.student_name}</p>
                                        <p className="text-xs text-gray-500">{exercise.content_title}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                  {formatRelativeTime(exercise.created_at)}
                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Grid - Aulas + Sidebar */}
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                {/* Top Aulas */}
                <div className="space-y-4 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Aulas Mais Vistas</h2>
                        <Link
                            href="/admin/aulas"
                            className="text-sm text-gray-400 transition-colors hover:text-sky-400"
                        >
                            Ver todas →
                        </Link>
                    </div>

                    {topLessons.length === 0 ? (
                        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-8 text-center">
                            <Eye className="mx-auto mb-2 h-8 w-8 text-gray-600" strokeWidth={1.5} />
                            <p className="text-sm text-gray-500">Nenhuma aula visualizada ainda</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topLessons.map((lesson, index) => {
                                const TypeIcon = LESSON_TYPE_ICONS[lesson.type] || FileText;
                                const typeColor = LESSON_TYPE_COLORS[lesson.type] || 'bg-gray-500/10 text-gray-400';

                                return (
                                    <div
                                        key={lesson.id}
                                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50"
                                    >
                                        <div className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-sm font-bold text-gray-400">
                        {index + 1}
                      </span>
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeColor}`}>
                                                <TypeIcon className="h-5 w-5" strokeWidth={1.5} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-200">
                                                    {lesson.title}
                                                </p>
                                                <p className="text-xs text-gray-500">{lesson.module_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-white">{lesson.views_count}</p>
                                                <p className="text-xs text-gray-500">views</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Alunos Recentes */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Alunos Recentes</h2>
                            <Link
                                href="/admin/alunos"
                                className="text-sm text-gray-400 transition-colors hover:text-sky-400"
                            >
                                Ver todos →
                            </Link>
                        </div>

                        {recentStudents.length === 0 ? (
                            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 text-center">
                                <Users className="mx-auto mb-2 h-6 w-6 text-gray-600" strokeWidth={1.5} />
                                <p className="text-sm text-gray-500">Nenhum aluno cadastrado</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3 transition-all hover:bg-gray-900/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10">
                                                <UserPlus className="h-4 w-4 text-sky-400" strokeWidth={1.5} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-200">
                                                    {student.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatRelativeTime(student.created_at)}
                                                </p>
                                            </div>
                                            <span className={`rounded-full px-2 py-0.5 text-xs ${
                                                student.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-400'
                                                    : 'bg-amber-500/10 text-amber-400'
                                            }`}>
                        {student.status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Atividade Recente */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white">Atividade Recente</h2>

                        {recentProgress.length === 0 ? (
                            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 text-center">
                                <CheckCircle className="mx-auto mb-2 h-6 w-6 text-gray-600" strokeWidth={1.5} />
                                <p className="text-sm text-gray-500">Nenhuma atividade ainda</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentProgress.map((progress) => (
                                    <div
                                        key={progress.id}
                                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                                                <CheckCircle className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-300">
                                                    <span className="font-medium text-white">{progress.student_name}</span>
                                                    {' '}concluiu
                                                </p>
                                                <p className="truncate text-xs text-gray-500">
                                                    {progress.lesson_title}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-600">
                                                    {formatRelativeTime(progress.completed_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Ações Rápidas</h2>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Link
                        href="/admin/alunos"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/10">
                                <Users className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-200">Novo Aluno</p>
                                <p className="text-xs text-gray-500">Cadastrar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/correcoes"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10">
                                <ClipboardCheck className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-200">Correções</p>
                                <p className="text-xs text-gray-500">
                                    {stats.pendingExercises > 0
                                        ? `${stats.pendingExercises} pendente${stats.pendingExercises !== 1 ? 's' : ''}`
                                        : 'Em dia'}
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/modulos"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
                                <BookOpen className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-200">Novo Módulo</p>
                                <p className="text-xs text-gray-500">Criar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/relatorios"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:border-gray-700 hover:bg-gray-900/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/10">
                                <BarChart3 className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-200">Relatórios</p>
                                <p className="text-xs text-gray-500">Ver análises</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}