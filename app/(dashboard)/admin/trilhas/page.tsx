// app/(dashboard)/admin/trilhas/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Route,
    Layers,
    GraduationCap,
    Play,
    Clock,
    ChevronRight,
    Loader2,
    AlertTriangle,
    Sprout,
    Briefcase,
    Target,
    Rocket,
} from 'lucide-react';
import { useTracks } from '@/hooks/useTracks';
import type { TrackWithStats } from '@/lib/types/database';

const trackIcons: Record<string, typeof Sprout> = {
    Sprout: Sprout,
    Briefcase: Briefcase,
    Target: Target,
    Rocket: Rocket,
};

export default function TrilhasPage() {
    const { tracks, isLoading, error } = useTracks();

    const totalModules = tracks.reduce((acc, t) => acc + t.modules_count, 0);
    const totalLessons = tracks.reduce((acc, t) => acc + t.lessons_count, 0);
    const totalHours = tracks.reduce((acc, t) => acc + t.total_hours, 0);

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
                        {tracks.length} trilhas • {totalHours}h de conteúdo
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
                            <p className="text-2xl font-bold text-white">
                                {tracks.reduce((acc, t) => acc + t.phases_count, 0)}
                            </p>
                            <p className="text-xs text-gray-500">Fases</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <GraduationCap className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalModules}</p>
                            <p className="text-xs text-gray-500">Módulos</p>
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
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracks Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {tracks.map((track) => (
                    <TrackCard key={track.id} track={track} />
                ))}
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4 sm:p-6">
                <h3 className="font-semibold text-sky-300 mb-2">ℹ️ Sobre as Trilhas</h3>
                <p className="text-sm text-sky-200/70">
                    As trilhas são fixas e representam os grandes marcos da jornada do aluno.
                    Cada trilha contém fases, que por sua vez contêm módulos e aulas.
                    Para adicionar conteúdo, acesse <strong>Módulos</strong> ou use a <strong>Importação JSON</strong>.
                </p>
            </div>
        </div>
    );
}

function TrackCard({ track }: { track: TrackWithStats }) {
    const IconComponent = trackIcons[track.icon] || Route;

    return (
        <div
            className="group rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 transition-all hover:border-gray-700 hover:bg-gray-900/50"
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
                        <h3 className="text-lg font-semibold text-white">{track.name}</h3>
                        <p className="text-xs text-gray-500">{track.slug}</p>
                    </div>
                </div>
                <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        track.is_active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-gray-500/10 text-gray-400'
                    }`}
                >
                    {track.is_active ? 'Ativa' : 'Inativa'}
                </span>
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
                <Link
                    href={`/admin/fases?trilha=${track.id}`}
                    className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                >
                    <Layers className="h-4 w-4" strokeWidth={1.5} />
                    Ver Fases ({track.phases_count})
                </Link>
                <Link
                    href={`/admin/modulos?trilha=${track.id}`}
                    className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                    Ver Módulos
                    <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
            </div>
        </div>
    );
}