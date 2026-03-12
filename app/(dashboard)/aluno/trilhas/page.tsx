// app/(dashboard)/aluno/trilhas/page.tsx
'use client';

import Link from 'next/link';
import {
    Route,
    Layers,
    GraduationCap,
    Clock,
    ChevronRight,
    Loader2,
    AlertTriangle,
    Sprout,
    Briefcase,
    Target,
    Rocket,
    Play,
    CheckCircle,
    Lock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTracks } from '@/hooks/useTracks';
import { useStudentTracks } from '@/hooks/useStudentTracks';
import type { TrackWithStats } from '@/lib/types/database';

const trackIcons: Record<string, typeof Sprout> = {
    Sprout: Sprout,
    Briefcase: Briefcase,
    Target: Target,
    Rocket: Rocket,
};

export default function AlunoTrilhasPage() {
    const { user } = useAuth();
    const { tracks, isLoading: loadingTracks, error } = useTracks();
    const { tracks: enrolledTracks, isLoading: loadingEnrolled } = useStudentTracks(user?.id || null);

    const isLoading = loadingTracks || loadingEnrolled;

    // IDs das trilhas em que o aluno está matriculado
    const enrolledTrackIds = new Set(enrolledTracks.map(t => t.id));

    // Estatísticas gerais
    const totalHours = tracks.reduce((acc, t) => acc + t.total_hours, 0);
    const totalPhases = tracks.reduce((acc, t) => acc + t.phases_count, 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-sky-400 animate-spin" strokeWidth={1.5} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-gray-300 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                    <Route className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                        Trilhas de Aprendizado
                    </h1>
                    <p className="text-sm text-gray-500">
                        Conheça todas as trilhas disponíveis no curso
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <Route className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{tracks.length}</p>
                            <p className="text-xs text-gray-500">Trilhas</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <Layers className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalPhases}</p>
                            <p className="text-xs text-gray-500">Fases</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <Clock className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalHours}h</p>
                            <p className="text-xs text-gray-500">De Conteúdo</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <CheckCircle className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{enrolledTracks.length}</p>
                            <p className="text-xs text-gray-500">Matriculado</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracks Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {tracks.map((track) => (
                    <TrackCard
                        key={track.id}
                        track={track}
                        isEnrolled={enrolledTrackIds.has(track.id)}
                    />
                ))}
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4 sm:p-6">
                <h3 className="font-semibold text-sky-300 mb-2">🎯 Sua Jornada</h3>
                <p className="text-sm text-sky-200/70">
                    {enrolledTracks.length > 0 ? (
                        <>
                            Você está matriculado em <strong>{enrolledTracks.length}</strong> trilha(s).
                            Clique em uma trilha para ver as fases e o conteúdo disponível.
                            Para começar a estudar, acesse a página <strong>Estudar</strong>.
                        </>
                    ) : (
                        <>
                            Você ainda não está matriculado em nenhuma trilha.
                            Entre em contato com o professor para realizar sua matrícula!
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

interface TrackCardProps {
    track: TrackWithStats;
    isEnrolled: boolean;
}

function TrackCard({ track, isEnrolled }: TrackCardProps) {
    const IconComponent = trackIcons[track.icon] || Route;

    return (
        <Link
            href={`/aluno/trilhas/${track.id}`}
            className="group block"
        >
            <div
                className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 transition-all hover:border-gray-700 hover:bg-gray-900/50 h-full"
                style={{ borderLeftColor: track.color, borderLeftWidth: '4px' }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
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
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-sky-400 transition-colors">
                                {track.name}
                            </h3>
                            <p className="text-xs text-gray-500">{track.phases_count} fases</p>
                        </div>
                    </div>
                    {isEnrolled ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                            <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                            Matriculado
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-gray-500/10 text-gray-400">
                            <Lock className="h-3 w-3" strokeWidth={1.5} />
                            Não matriculado
                        </span>
                    )}
                </div>

                {track.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {track.description}
                    </p>
                )}

                <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-gray-800/50">
                        <p className="text-lg font-bold text-white">{track.phases_count}</p>
                        <p className="text-xs text-gray-500">Fases</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-800/50">
                        <p className="text-lg font-bold text-white">{track.modules_count}</p>
                        <p className="text-xs text-gray-500">Módulos</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-800/50">
                        <p className="text-lg font-bold text-white">{track.lessons_count}</p>
                        <p className="text-xs text-gray-500">Aulas</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-800/50">
                        <p className="text-lg font-bold text-white">{track.total_hours}h</p>
                        <p className="text-xs text-gray-500">Duração</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                    <span className="text-sm text-gray-500">
                        Clique para ver as fases
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm text-sky-400 group-hover:text-sky-300 transition-colors">
                        Ver detalhes
                        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                </div>
            </div>
        </Link>
    );
}