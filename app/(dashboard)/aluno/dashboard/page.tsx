// app/(dashboard)/aluno/dashboard/page.tsx
'use client';

import Link from 'next/link';
import {
    BookOpen,
    Layers,
    CheckCircle,
    ArrowRight,
    Loader2,
    BarChart3,
    PlayCircle,
    ClipboardCheck,
    Star,
    RotateCcw,
    Clock,
    Route,
    Sprout,
    Briefcase,
    Target,
    Rocket,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentTracks } from '@/hooks/useStudentTracks';
import { useStudentSubmissions } from '@/hooks/useStudentSubmissions';
import { DashboardAnnouncements } from '@/components/student/dashboard/DashboardAnnouncements';
import type { StudentTrack } from '@/lib/types/database';
import { DashboardLiveClasses } from '@/components/student/dashboard/DashboardLiveClasses';

const trackIcons: Record<string, typeof Sprout> = {
    Sprout: Sprout,
    Briefcase: Briefcase,
    Target: Target,
    Rocket: Rocket,
};

export default function AlunoDashboardPage() {
    const { user } = useAuth();
    const { tracks, isLoading } = useStudentTracks(user?.id || null);
    const {
        recentlyReviewed,
        pendingCount,
        isLoading: isLoadingSubmissions
    } = useStudentSubmissions(user?.id || null);

    const totalPhases = tracks.reduce((acc, t) => acc + (t.phases_count || 0), 0);
    const totalLessons = tracks.reduce((acc, t) => acc + (t.lessons_count || 0), 0);
    const completedLessons = tracks.reduce((acc, t) => acc + (t.completed_lessons || 0), 0);
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

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
            approved: { label: 'Aprovado', color: 'emerald', icon: CheckCircle },
            reviewed: { label: 'Corrigido', color: 'sky', icon: CheckCircle },
            needs_revision: { label: 'Precisa Revisão', color: 'rose', icon: RotateCcw },
            pending: { label: 'Pendente', color: 'amber', icon: Clock },
        };
        return configs[status] || configs.pending;
    };

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

            {/* Avisos do Professor */}
            <DashboardAnnouncements userId={user?.id || null} />
            <DashboardLiveClasses userId={user?.id || null} />

            {/* Alerta de Exercícios Corrigidos */}
            {!isLoadingSubmissions && recentlyReviewed.length > 0 && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 flex-shrink-0">
                            <ClipboardCheck className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-emerald-300 mb-1">
                                🎉 Exercícios Corrigidos!
                            </h3>
                            <p className="text-sm text-emerald-200/70 mb-3">
                                {recentlyReviewed.length === 1
                                    ? 'Você tem 1 exercício corrigido recentemente'
                                    : `Você tem ${recentlyReviewed.length} exercícios corrigidos recentemente`
                                }
                            </p>

                            <div className="space-y-2">
                                {recentlyReviewed.slice(0, 3).map((submission) => {
                                    const statusConfig = getStatusConfig(submission.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <Link
                                            key={submission.id}
                                            href={`/aluno/estudar/${submission.content?.lesson?.module_id}/${submission.content?.lesson_id}`}
                                            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {submission.content?.title}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {submission.content?.lesson?.title}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {submission.grade !== null && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-800 text-sm">
                                                        <Star className="h-3 w-3 text-amber-400" strokeWidth={1.5} />
                                                        <span className="font-bold text-white">{submission.grade.toFixed(1)}</span>
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-${statusConfig.color}-500/10 text-${statusConfig.color}-400`}>
                                                    <StatusIcon className="h-3 w-3" strokeWidth={1.5} />
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {recentlyReviewed.length > 3 && (
                                <Link
                                    href="/aluno/estudar"
                                    className="mt-3 inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                                >
                                    Ver todos ({recentlyReviewed.length})
                                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Alerta de Exercícios Pendentes */}
            {!isLoadingSubmissions && pendingCount > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
                        <p className="text-sm text-amber-200/80">
                            {pendingCount === 1
                                ? 'Você tem 1 exercício aguardando correção'
                                : `Você tem ${pendingCount} exercícios aguardando correção`
                            }
                        </p>
                    </div>
                </div>
            )}

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
                    <p className="text-2xl font-bold text-white">{totalPhases}</p>
                    <p className="text-xs text-gray-500">Fases</p>
                </div>

                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <Route className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{tracks.length}</p>
                    <p className="text-xs text-gray-500">Trilhas Ativas</p>
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

            {/* Trilhas */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Minhas Trilhas</h2>
                    <Link
                        href="/aluno/estudar"
                        className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                        Ver todas
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                </div>

                {tracks.length === 0 ? (
                    <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                        <Route className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-400">Você ainda não está matriculado em nenhuma trilha</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {tracks.slice(0, 2).map((track) => (
                            <TrackCard key={track.id} track={track} />
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

function TrackCard({ track }: { track: StudentTrack }) {
    const IconComponent = trackIcons[track.icon] || Route;

    return (
        <Link
            href={`/aluno/estudar?trilha=${track.id}`}
            className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-5 transition-all hover:bg-gray-900/50 hover:border-gray-700"
            style={{ borderLeftColor: track.color, borderLeftWidth: '3px' }}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${track.color}20` }}
                >
                    <IconComponent
                        className="h-5 w-5"
                        style={{ color: track.color }}
                        strokeWidth={1.5}
                    />
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    track.progress_percentage === 100
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-sky-500/10 text-sky-400'
                }`}>
                    {track.progress_percentage}%
                </span>
            </div>
            <h3 className="font-medium text-white mb-1">{track.name}</h3>
            <p className="text-xs text-gray-500 mb-3">
                {track.phases_count} fases • {track.lessons_count} aulas
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                <div
                    className="h-full transition-all"
                    style={{
                        width: `${track.progress_percentage}%`,
                        backgroundColor: track.color,
                    }}
                />
            </div>
        </Link>
    );
}