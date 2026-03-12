// app/(dashboard)/aluno/trilhas/[id]/page.tsx
'use client';

import { use } from 'react';
import Link from 'next/link';
import {
    Layers,
    Route,
    GraduationCap,
    Clock,
    ChevronRight,
    Loader2,
    AlertTriangle,
    ArrowLeft,
    FileText,
    CheckCircle,
    Lock,
    Play,
    Sprout,
    Briefcase,
    Target,
    Rocket,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTracks } from '@/hooks/useTracks';
import { usePhases, type PhaseWithTrack } from '@/hooks/usePhases';
import { useStudentTracks } from '@/hooks/useStudentTracks';
import { useStudentPhases } from '@/hooks/useStudentPhases';

const trackIcons: Record<string, typeof Sprout> = {
    Sprout: Sprout,
    Briefcase: Briefcase,
    Target: Target,
    Rocket: Rocket,
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function AlunoTrilhaFasesPage({ params }: PageProps) {
    const { id: trackId } = use(params);
    const { user } = useAuth();

    const { tracks, isLoading: loadingTracks } = useTracks();
    const { phases, isLoading: loadingPhases, error } = usePhases(trackId);
    const { tracks: enrolledTracks, isLoading: loadingEnrolled } = useStudentTracks(user?.id || null);
    const { phases: studentPhases, isLoading: loadingStudentPhases } = useStudentPhases(trackId, user?.id || null);

    const isLoading = loadingTracks || loadingPhases || loadingEnrolled || loadingStudentPhases;

    // Encontrar a trilha atual
    const currentTrack = tracks.find(t => t.id === trackId);
    const isEnrolled = enrolledTracks.some(t => t.id === trackId);

    // Criar mapa de progresso do aluno
    const studentProgressMap = new Map(
        studentPhases.map(sp => [sp.id, sp])
    );

    // Estatísticas
    const totalHours = phases.reduce((acc, p) => acc + (p.estimated_hours || 0), 0);

    const IconComponent = currentTrack?.icon ? (trackIcons[currentTrack.icon] || Route) : Route;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-sky-400 animate-spin" strokeWidth={1.5} />
            </div>
        );
    }

    if (error || !currentTrack) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-gray-300 font-medium">{error || 'Trilha não encontrada'}</p>
                    <Link
                        href="/aluno/trilhas"
                        className="mt-4 inline-flex items-center gap-2 text-sky-400 hover:text-sky-300"
                    >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                        Voltar para Trilhas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/30 border border-gray-800/50">
                <Link
                    href="/aluno/trilhas"
                    className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar para Trilhas
                </Link>
                <span className="text-gray-600">|</span>
                <span className="text-sm text-gray-300">
                    Trilha: <strong className="text-white">{currentTrack.name}</strong>
                </span>
                {isEnrolled && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                        Matriculado
                    </span>
                )}
            </div>

            {/* Header da Trilha */}
            <div
                className="rounded-lg border p-6"
                style={{
                    borderColor: `${currentTrack.color}50`,
                    backgroundColor: `${currentTrack.color}10`,
                }}
            >
                <div className="flex items-start gap-4">
                    <div
                        className="flex h-14 w-14 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${currentTrack.color}30` }}
                    >
                        <IconComponent
                            className="h-7 w-7"
                            style={{ color: currentTrack.color }}
                            strokeWidth={1.5}
                        />
                    </div>
                    <div className="flex-1">
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white mb-1">
                            {currentTrack.name}
                        </h1>
                        {currentTrack.description && (
                            <p className="text-sm text-gray-400 mb-4">
                                {currentTrack.description}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="inline-flex items-center gap-1 text-gray-400">
                                <Layers className="h-4 w-4" strokeWidth={1.5} />
                                {phases.length} fases
                            </span>
                            <span className="inline-flex items-center gap-1 text-gray-400">
                                <GraduationCap className="h-4 w-4" strokeWidth={1.5} />
                                {currentTrack.modules_count} módulos
                            </span>
                            <span className="inline-flex items-center gap-1 text-gray-400">
                                <Play className="h-4 w-4" strokeWidth={1.5} />
                                {currentTrack.lessons_count} aulas
                            </span>
                            <span className="inline-flex items-center gap-1 text-gray-400">
                                <Clock className="h-4 w-4" strokeWidth={1.5} />
                                {totalHours}h estimadas
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fases */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                    Fases desta Trilha
                </h2>

                {phases.length === 0 ? (
                    <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                        <Layers className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-400">Nenhuma fase encontrada nesta trilha</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {phases.map((phase, index) => {
                            const studentProgress = studentProgressMap.get(phase.id);
                            const isLocked = isEnrolled && studentProgress?.is_locked;
                            const progressPercentage = studentProgress?.progress_percentage || 0;
                            const isCompleted = progressPercentage === 100;

                            return (
                                <PhaseCard
                                    key={phase.id}
                                    phase={phase}
                                    index={index}
                                    isEnrolled={isEnrolled}
                                    isLocked={isLocked}
                                    progressPercentage={progressPercentage}
                                    isCompleted={isCompleted}
                                    completedLessons={studentProgress?.completed_lessons || 0}
                                    totalLessons={studentProgress?.lessons_count || 0}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Info Box */}
            {!isEnrolled && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4 sm:p-6">
                    <h3 className="font-semibold text-amber-300 mb-2">🔒 Não Matriculado</h3>
                    <p className="text-sm text-amber-200/70">
                        Você não está matriculado nesta trilha. Entre em contato com o professor
                        para realizar sua matrícula e ter acesso ao conteúdo!
                    </p>
                </div>
            )}

            {isEnrolled && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4 sm:p-6">
                    <h3 className="font-semibold text-emerald-300 mb-2">✅ Você está matriculado!</h3>
                    <p className="text-sm text-emerald-200/70">
                        Acesse a página <strong>Estudar</strong> para começar a acompanhar o conteúdo.
                        As fases são desbloqueadas conforme você avança no curso.
                    </p>
                    <Link
                        href="/aluno/estudar"
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
                    >
                        <Play className="h-4 w-4" strokeWidth={1.5} />
                        Ir para Estudar
                    </Link>
                </div>
            )}
        </div>
    );
}

interface PhaseCardProps {
    phase: PhaseWithTrack;
    index: number;
    isEnrolled: boolean;
    isLocked?: boolean;
    progressPercentage: number;
    isCompleted: boolean;
    completedLessons: number;
    totalLessons: number;
}

function PhaseCard({
                       phase,
                       index,
                       isEnrolled,
                       isLocked,
                       progressPercentage,
                       isCompleted,
                       completedLessons,
                       totalLessons,
                   }: PhaseCardProps) {
    const isInProgress = progressPercentage > 0 && !isCompleted;

    return (
        <div
            className={`rounded-lg border bg-gray-900/30 p-4 sm:p-6 transition-all ${
                isCompleted
                    ? 'border-emerald-500/30'
                    : isInProgress
                        ? 'border-sky-500/30'
                        : isLocked
                            ? 'border-gray-800/50 opacity-60'
                            : 'border-gray-800/50'
            }`}
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    {/* Phase Number */}
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold ${
                            isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isInProgress
                                    ? 'bg-sky-500 text-white'
                                    : isLocked
                                        ? 'bg-gray-800 text-gray-600'
                                        : 'bg-gray-800 text-gray-400'
                        }`}
                    >
                        {isCompleted ? (
                            <CheckCircle className="h-6 w-6" strokeWidth={1.5} />
                        ) : isLocked ? (
                            <Lock className="h-5 w-5" strokeWidth={1.5} />
                        ) : (
                            phase.number
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-lg font-semibold ${
                                isCompleted
                                    ? 'text-emerald-300'
                                    : isInProgress
                                        ? 'text-sky-300'
                                        : 'text-white'
                            }`}>
                                {phase.name}
                            </h3>
                            {isCompleted && (
                                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                    Concluída
                                </span>
                            )}
                            {isInProgress && (
                                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-sky-500/10 text-sky-400">
                                    Em progresso
                                </span>
                            )}
                            {isLocked && (
                                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-500/10 text-gray-400">
                                    Bloqueada
                                </span>
                            )}
                        </div>

                        {phase.description && (
                            <p className="text-sm text-gray-400 mb-3">
                                {phase.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            {phase.estimated_hours && (
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    {phase.estimated_hours}h estimadas
                                </span>
                            )}
                            {phase.objectives && phase.objectives.length > 0 && (
                                <span className="inline-flex items-center gap-1">
                                    <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    {phase.objectives.length} objetivos
                                </span>
                            )}
                            {isEnrolled && totalLessons > 0 && (
                                <span className="inline-flex items-center gap-1">
                                    <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    {completedLessons}/{totalLessons} aulas
                                </span>
                            )}
                        </div>

                        {/* Objectives */}
                        {phase.objectives && phase.objectives.length > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-gray-800/30">
                                <p className="text-xs text-gray-500 mb-2">O que você vai aprender:</p>
                                <ul className="space-y-1">
                                    {phase.objectives.slice(0, 4).map((obj, idx) => (
                                        <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                                            <span className="text-emerald-400">✓</span>
                                            {obj}
                                        </li>
                                    ))}
                                    {phase.objectives.length > 4 && (
                                        <li className="text-xs text-gray-500">
                                            +{phase.objectives.length - 4} mais...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Progress Bar */}
                        {isEnrolled && !isLocked && (
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-500">Progresso</span>
                                    <span className={isCompleted ? 'text-emerald-400' : 'text-sky-400'}>
                                        {progressPercentage}%
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${
                                            isCompleted ? 'bg-emerald-500' : 'bg-sky-500'
                                        }`}
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}