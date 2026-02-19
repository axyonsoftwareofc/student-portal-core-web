// app/(dashboard)/admin/dashboard/page.tsx
'use client';

import Link from "next/link";
import {
    Users,
    BookOpen,
    FileText,
    BarChart3,
    GraduationCap,
    Layers,
    Package,
    Eye,
    CheckCircle,
    Clock,
    UserPlus,
    TrendingUp,
    Loader2,
    AlertTriangle,
    Video,
    PenTool,
    HelpCircle,
    ClipboardCheck,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { ExerciseStatsCards } from "@/components/admin/dashboard/ExerciseStatsCards";
import { PendingExercisesList } from "@/components/admin/dashboard/PendingExercisesList";
import { StudentsNeedingHelpCard } from "@/components/admin/dashboard/StudentsNeedingHelpCard";

export default function AdminDashboardPage() {
    const {
        stats,
        recentStudents,
        topLessons,
        recentProgress,
        pendingExercises,
        studentsNeedingHelp,
        isLoading,
        error,
        refetch
    } = useAdminDashboard();

    // Ícone por tipo de aula
    const getLessonTypeIcon = (type: string) => {
        const icons: Record<string, typeof Video> = {
            VIDEO: Video,
            ARTICLE: BookOpen,
            EXERCISE: PenTool,
            QUIZ: HelpCircle,
        };
        return icons[type] || FileText;
    };

    // Cor por tipo de aula
    const getLessonTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            VIDEO: 'bg-sky-500/10 text-sky-400',
            ARTICLE: 'bg-emerald-500/10 text-emerald-400',
            EXERCISE: 'bg-amber-500/10 text-amber-400',
            QUIZ: 'bg-violet-500/10 text-violet-400',
        };
        return colors[type] || 'bg-gray-500/10 text-gray-400';
    };

    // Formatar tempo relativo
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;
        return date.toLocaleDateString('pt-BR');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-400 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors"
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
                <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                    Visão geral do sistema
                </p>
            </div>

            {/* Stats Grid - Principais */}
            <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
                {/* Total de Alunos */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-400">Total de Alunos</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.totalStudents}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                    <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                                    {stats.activeStudents} ativos
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

                {/* Cursos */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-400">Cursos</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.totalCourses}</p>
                            <p className="mt-2 text-xs text-gray-500">
                                {stats.activeCourses} ativos
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
                            <GraduationCap className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Módulos */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-400">Módulos</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.totalModules}</p>
                            <p className="mt-2 text-xs text-gray-500">
                                {stats.publishedModules} publicados
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/10">
                            <Layers className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Aulas */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-400">Aulas</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.totalLessons}</p>
                            <p className="mt-2 text-xs text-gray-500">
                                {stats.publishedLessons} publicadas
                            </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10">
                            <FileText className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercícios Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    <h2 className="text-lg font-semibold text-white">Exercícios</h2>
                </div>

                <ExerciseStatsCards
                    totalExercises={stats.totalExercises}
                    pendingExercises={stats.pendingExercises}
                    approvedExercises={stats.approvedExercises}
                    needsRevisionExercises={stats.needsRevisionExercises}
                    classAverage={stats.classAverage}
                />

                <div className="grid gap-4 lg:grid-cols-2">
                    <PendingExercisesList
                        exercises={pendingExercises}
                        totalPending={stats.pendingExercises}
                    />
                    <StudentsNeedingHelpCard students={studentsNeedingHelp} />
                </div>
            </div>

            {/* Stats Grid - Secundários */}
            <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-3">
                {/* Materiais */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                            <Package className="h-5 w-5 text-rose-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalMaterials}</p>
                            <p className="text-xs text-gray-500">Materiais</p>
                        </div>
                    </div>
                </div>

                {/* Visualizações */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <Eye className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
                            <p className="text-xs text-gray-500">Visualizações</p>
                        </div>
                    </div>
                </div>

                {/* Aulas Concluídas */}
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <TrendingUp className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.completedLessons}</p>
                            <p className="text-xs text-gray-500">Aulas concluídas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                {/* Top Aulas */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">
                            Aulas Mais Vistas
                        </h2>
                        <Link
                            href="/admin/aulas"
                            className="text-sm text-gray-400 hover:text-sky-400 transition-colors"
                        >
                            Ver todas →
                        </Link>
                    </div>

                    {topLessons.length === 0 ? (
                        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-8 text-center">
                            <Eye className="h-8 w-8 text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                            <p className="text-gray-500 text-sm">Nenhuma aula visualizada ainda</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topLessons.map((lesson, index) => {
                                const TypeIcon = getLessonTypeIcon(lesson.type);
                                const typeColor = getLessonTypeColor(lesson.type);

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
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-200 truncate">
                                                    {lesson.title}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {lesson.module_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-white">
                                                    {lesson.views_count}
                                                </p>
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
                            <h2 className="text-lg font-semibold text-white">
                                Alunos Recentes
                            </h2>
                            <Link
                                href="/admin/alunos"
                                className="text-sm text-gray-400 hover:text-sky-400 transition-colors"
                            >
                                Ver todos →
                            </Link>
                        </div>

                        {recentStudents.length === 0 ? (
                            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 text-center">
                                <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                                <p className="text-gray-500 text-sm">Nenhum aluno cadastrado</p>
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
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-200 truncate">
                                                    {student.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatRelativeTime(student.created_at)}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
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
                        <h2 className="text-lg font-semibold text-white">
                            Atividade Recente
                        </h2>

                        {recentProgress.length === 0 ? (
                            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 text-center">
                                <CheckCircle className="h-6 w-6 text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                                <p className="text-gray-500 text-sm">Nenhuma atividade ainda</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentProgress.map((progress) => (
                                    <div
                                        key={progress.id}
                                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 mt-0.5">
                                                <CheckCircle className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-300">
                                                    <span className="font-medium text-white">{progress.student_name}</span>
                                                    {' '}concluiu
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {progress.lesson_title}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
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

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">
                    Ações Rápidas
                </h2>

                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/admin/alunos"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/10">
                                <Users className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm">Novo Aluno</p>
                                <p className="text-xs text-gray-500">Cadastrar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/correcoes"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10">
                                <ClipboardCheck className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm">Correções</p>
                                <p className="text-xs text-gray-500">
                                    {stats.pendingExercises > 0 ? `${stats.pendingExercises} pendente${stats.pendingExercises !== 1 ? 's' : ''}` : 'Em dia'}
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/modulos"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
                                <BookOpen className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm">Novo Módulo</p>
                                <p className="text-xs text-gray-500">Criar</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/aulas"
                        className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/10">
                                <FileText className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-200 text-sm">Nova Aula</p>
                                <p className="text-xs text-gray-500">Adicionar</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}