// app/(dashboard)/aluno/estudar/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    BookOpen,
    Layers,
    PlayCircle,
    CheckCircle,
    Clock,
    ArrowRight,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Route,
    Lock,
    Sprout,
    Briefcase,
    Target,
    Rocket,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentTracks } from '@/hooks/useStudentTracks';
import { useStudentPhases } from '@/hooks/useStudentPhases';
import { useStudentModules } from '@/hooks/useStudentModules';
import type { StudentTrack, StudentPhase, StudentModule } from '@/lib/types/database';

const trackIcons: Record<string, typeof Sprout> = {
    Sprout: Sprout,
    Briefcase: Briefcase,
    Target: Target,
    Rocket: Rocket,
};

export default function EstudarPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();

    // Pegar parâmetros da URL
    const trilhaIdFromUrl = searchParams.get('trilha');
    const faseIdFromUrl = searchParams.get('fase');

    const { tracks, isLoading: loadingTracks, error: tracksError } = useStudentTracks(user?.id || null);

    // Determinar qual trilha carregar
    const selectedTrackId = trilhaIdFromUrl || (tracks.length === 1 ? tracks[0].id : null);

    const { phases, track: selectedTrack, isLoading: loadingPhases } = useStudentPhases(
        selectedTrackId,
        user?.id || null
    );

    // Determinar qual fase carregar
    const selectedPhaseId = faseIdFromUrl || null;

    const { modules, phase: selectedPhase, isLoading: loadingModules } = useStudentModules(
        selectedPhaseId,
        user?.id || null
    );

    const isLoading = loadingTracks || (selectedTrackId && loadingPhases) || (selectedPhaseId && loadingModules);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400 text-sm">Carregando conteúdo...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (tracksError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-300 font-medium mb-1">Erro ao carregar</p>
                    <p className="text-gray-500 text-sm">{tracksError}</p>
                </div>
            </div>
        );
    }

    // No tracks enrolled
    if (tracks.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 mx-auto mb-4">
                        <Route className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Nenhuma trilha encontrada
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Você ainda não está matriculado em nenhuma trilha.
                        Entre em contato com o professor para ser adicionado.
                    </p>
                </div>
            </div>
        );
    }

    // Se tem fase selecionada, mostra módulos
    if (selectedPhaseId && selectedPhase) {
        return (
            <ModulesView
                modules={modules}
                phase={selectedPhase}
                trackId={selectedTrackId!}
            />
        );
    }

    // Se tem trilha selecionada, mostra fases
    if (selectedTrackId && selectedTrack) {
        return (
            <PhasesView
                phases={phases}
                track={selectedTrack}
            />
        );
    }

    // Múltiplas trilhas - mostra cards de trilhas
    return (
        <TracksView tracks={tracks} />
    );
}

// ============================================
// VIEW: TRILHAS
// ============================================

function TracksView({ tracks }: { tracks: StudentTrack[] }) {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <Route className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                            Minhas Trilhas
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500">
                            Escolha uma trilha para continuar estudando
                        </p>
                    </div>
                </div>
            </div>

            {/* Tracks grid */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                {tracks.map((track) => (
                    <TrackCard key={track.id} track={track} />
                ))}
            </div>

            {/* Info box */}
            <InfoBox />
        </div>
    );
}

function TrackCard({ track }: { track: StudentTrack }) {
    const IconComponent = trackIcons[track.icon] || Route;

    return (
        <Link
            href={`/aluno/estudar?trilha=${track.id}`}
            className="group relative overflow-hidden rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/50"
            style={{ borderLeftColor: track.color, borderLeftWidth: '4px' }}
        >
            <div className="relative z-10 flex h-full flex-col">
                {/* Icon and status */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${track.color}20` }}
                    >
                        <IconComponent
                            className="h-6 w-6"
                            style={{ color: track.color }}
                            strokeWidth={1.5}
                        />
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs font-medium ${
                        track.progress_percentage === 100
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : (track.progress_percentage ?? 0) > 0
                                ? 'bg-sky-500/10 text-sky-400'
                                : 'bg-gray-800 text-gray-400'
                    }`}>
                        {track.progress_percentage === 100
                            ? 'Concluída'
                            : (track.progress_percentage ?? 0) > 0
                                ? 'Em progresso'
                                : 'Não iniciada'}
                    </span>
                </div>

                {/* Title and description */}
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {track.name}
                </h3>
                {track.description && (
                    <p className="text-xs sm:text-sm text-gray-400 mb-4 flex-1 line-clamp-2">
                        {track.description}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {track.phases_count ?? 0} fases
                    </span>
                    <span className="flex items-center gap-1">
                        <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {track.lessons_count ?? 0} aulas
                    </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${track.progress_percentage ?? 0}%`,
                                backgroundColor: track.color,
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {track.completed_lessons ?? 0}/{track.lessons_count ?? 0} aulas concluídas
                    </span>
                    <ArrowRight
                        className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                        style={{ color: track.color }}
                        strokeWidth={1.5}
                    />
                </div>
            </div>
        </Link>
    );
}

// ============================================
// VIEW: FASES
// ============================================

function PhasesView({ phases, track }: { phases: StudentPhase[]; track: StudentTrack }) {
    const IconComponent = trackIcons[track.icon] || Route;

    // Calcular progresso geral da trilha
    const totalLessons = phases.reduce((acc, p) => acc + (p.lessons_count || 0), 0);
    const completedLessons = phases.reduce((acc, p) => acc + (p.completed_lessons || 0), 0);
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-3">
                <Link
                    href="/aluno/estudar"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar para trilhas
                </Link>

                <div className="flex items-center gap-3">
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
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                            {track.name}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500">
                            {progressPercentage}% concluído • {completedLessons}/{totalLessons} aulas
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progresso da trilha</span>
                    <span className="text-sm font-medium" style={{ color: track.color }}>
                        {progressPercentage}%
                    </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                    <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%`, backgroundColor: track.color }}
                    />
                </div>
            </div>

            {/* Phases list */}
            {phases.length === 0 ? (
                <div className="text-center py-12">
                    <Layers className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhuma fase disponível ainda</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Layers className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        Fases da Trilha
                    </h2>

                    <div className="space-y-3">
                        {phases.map((phase, index) => (
                            <PhaseCard
                                key={phase.id}
                                phase={phase}
                                index={index}
                                trackId={track.id}
                                trackColor={track.color}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Info box */}
            <InfoBox />
        </div>
    );
}

function PhaseCard({
                       phase,
                       index,
                       trackId,
                       trackColor,
                   }: {
    phase: StudentPhase;
    index: number;
    trackId: string;
    trackColor: string;
}) {
    const isLocked = phase.is_locked;
    const isCompleted = phase.progress_percentage === 100;

    return (
        <div
            className={`group relative rounded-lg border p-4 sm:p-6 transition-all ${
                isLocked
                    ? 'border-gray-800/30 bg-gray-900/20 opacity-60'
                    : 'border-gray-800/50 bg-gray-900/30 hover:border-gray-700 hover:bg-gray-900/50'
            }`}
        >
            {isLocked ? (
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                        <Lock className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fase {phase.number}</p>
                        <h3 className="font-medium text-gray-400">{phase.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                            Complete a fase anterior para desbloquear
                        </p>
                    </div>
                </div>
            ) : (
                <Link
                    href={`/aluno/estudar?trilha=${trackId}&fase=${phase.id}`}
                    className="block"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div
                                className="flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold"
                                style={{
                                    backgroundColor: `${trackColor}20`,
                                    color: isCompleted ? '#22c55e' : trackColor,
                                }}
                            >
                                {isCompleted ? (
                                    <CheckCircle className="h-6 w-6" strokeWidth={1.5} />
                                ) : (
                                    phase.number
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-1">Fase {phase.number}</p>
                                <h3 className="font-semibold text-white mb-1">{phase.name}</h3>
                                {phase.description && (
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                        {phase.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        {phase.modules_count ?? 0} módulos
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        {phase.lessons_count ?? 0} aulas
                                    </span>
                                    <span style={{ color: isCompleted ? '#22c55e' : trackColor }}>
                                        {phase.progress_percentage ?? 0}%
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-3">
                                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                                        <div
                                            className="h-full transition-all duration-500"
                                            style={{
                                                width: `${phase.progress_percentage ?? 0}%`,
                                                backgroundColor: isCompleted ? '#22c55e' : trackColor,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ArrowRight
                            className="h-5 w-5 text-gray-500 group-hover:translate-x-1 transition-transform flex-shrink-0"
                            strokeWidth={1.5}
                        />
                    </div>
                </Link>
            )}
        </div>
    );
}

// ============================================
// VIEW: MÓDULOS
// ============================================

function ModulesView({
                         modules,
                         phase,
                         trackId,
                     }: {
    modules: StudentModule[];
    phase: StudentPhase;
    trackId: string;
}) {
    // Calcular progresso da fase
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons_count || 0), 0);
    const completedLessons = modules.reduce((acc, m) => acc + (m.completed_lessons || 0), 0);
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-3">
                <Link
                    href={`/aluno/estudar?trilha=${trackId}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar para {phase.track?.name || 'trilha'}
                </Link>

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                        <Layers className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Fase {phase.number}</p>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            {phase.name}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {progressPercentage}% concluído • {completedLessons}/{totalLessons} aulas
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progresso da fase</span>
                    <span className="text-sm font-medium text-sky-400">{progressPercentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                    <div
                        className={`h-full transition-all duration-500 ${
                            progressPercentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Modules list */}
            {modules.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhum módulo disponível ainda</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        Módulos
                    </h2>

                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {modules.map((module, index) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Info box */}
            <InfoBox />
        </div>
    );
}

function ModuleCard({ module, index }: { module: StudentModule; index: number }) {
    const isLocked = module.is_locked;
    const isCompleted = module.progress_percentage === 100;

    if (isLocked) {
        return (
            <div className="rounded-lg border border-gray-800/30 bg-gray-900/20 p-4 sm:p-6 opacity-60">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                        <Lock className="h-5 w-5 text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-400">{module.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                            Complete o módulo anterior
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            href={`/aluno/estudar/${module.id}`}
            className="group relative overflow-hidden rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/50"
        >
            <div className="relative z-10 flex h-full flex-col">
                {/* Order and status */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg font-semibold ${
                        isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-sky-500/10 text-sky-400'
                    }`}>
                        {isCompleted ? (
                            <CheckCircle className="h-5 w-5" strokeWidth={1.5} />
                        ) : (
                            index + 1
                        )}
                    </div>
                    {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                    ) : (module.progress_percentage ?? 0) > 0 ? (
                        <Clock className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                    ) : (
                        <Clock className="h-5 w-5 text-gray-600" strokeWidth={1.5} />
                    )}
                </div>

                {/* Title and description */}
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {module.name}
                </h3>
                {module.description && (
                    <p className="text-xs sm:text-sm text-gray-400 mb-4 flex-1 line-clamp-2">
                        {module.description}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                        <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {module.lessons_count ?? 0} aulas
                    </span>
                    <span className="text-sky-400 font-medium">
                        {module.progress_percentage ?? 0}%
                    </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                        <div
                            className={`h-full transition-all duration-500 ${
                                isCompleted ? 'bg-emerald-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${module.progress_percentage ?? 0}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {module.completed_lessons ?? 0}/{module.lessons_count ?? 0} concluídas
                    </span>
                    <ArrowRight
                        className="h-4 w-4 text-sky-400 group-hover:translate-x-1 transition-transform"
                        strokeWidth={1.5}
                    />
                </div>
            </div>
        </Link>
    );
}

// ============================================
// COMPONENTE AUXILIAR
// ============================================

function InfoBox() {
    return (
        <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                <h3 className="font-semibold text-sky-300 text-sm sm:text-base">
                    Como funciona?
                </h3>
            </div>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-sky-200/80">
                <li className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Siga as trilhas na ordem recomendada</span>
                </li>
                <li className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Complete cada fase para desbloquear a próxima</span>
                </li>
                <li className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Assista as videoaulas e leia os artigos</span>
                </li>
                <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-sky-400 flex-shrink-0" strokeWidth={1.5} />
                    <span>Complete os quizzes para testar seu conhecimento</span>
                </li>
            </ul>
        </div>
    );
}