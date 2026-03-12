// app/(dashboard)/admin/fases/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Layers,
    Route,
    GraduationCap,
    Play,
    Clock,
    ChevronRight,
    Loader2,
    AlertTriangle,
    ArrowLeft,
    X,
    FileText,
} from 'lucide-react';
import { usePhases, type PhaseWithTrack } from '@/hooks/usePhases';
import { useTracks } from '@/hooks/useTracks';

export default function FasesPage() {
    const searchParams = useSearchParams();
    const trilhaIdFromUrl = searchParams.get('trilha');

    const { tracks } = useTracks();
    const [filterTrack, setFilterTrack] = useState<string>('all');

    const { phases, isLoading, error } = usePhases(
        filterTrack !== 'all' ? filterTrack : undefined
    );

    // Aplicar filtro da URL
    useEffect(() => {
        if (trilhaIdFromUrl) {
            setFilterTrack(trilhaIdFromUrl);
        }
    }, [trilhaIdFromUrl]);

    // Obter nome da trilha filtrada
    const filteredTrackName = filterTrack !== 'all'
        ? tracks.find(t => t.id === filterTrack)?.name
        : null;

    const clearFilter = () => {
        setFilterTrack('all');
        window.history.replaceState({}, '', '/admin/fases');
    };

    // Estatísticas
    const totalPhases = phases.length;
    const totalHours = phases.reduce((acc, p) => acc + (p.estimated_hours || 0), 0);

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
            {/* Breadcrumb quando filtrado */}
            {filteredTrackName && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-950/20 border border-sky-500/20">
                    <Link
                        href="/admin/trilhas"
                        className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                        Voltar para Trilhas
                    </Link>
                    <span className="text-gray-600">|</span>
                    <span className="text-sm text-gray-300">
                        Filtrando fases de: <strong className="text-white">{filteredTrackName}</strong>
                    </span>
                    <button
                        onClick={clearFilter}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-3 w-3" strokeWidth={1.5} />
                        Limpar filtro
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Layers className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-nacelle text-2xl sm:text-3xl font-semibold text-white">
                            {filteredTrackName ? `Fases: ${filteredTrackName}` : 'Fases do Curso'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {totalPhases} fases • {totalHours}h estimadas
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtro por trilha */}
            {!filteredTrackName && (
                <div className="flex gap-4">
                    <select
                        value={filterTrack}
                        onChange={(e) => setFilterTrack(e.target.value)}
                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 px-4 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none transition-colors"
                    >
                        <option value="all">Todas as trilhas</option>
                        {tracks.map(track => (
                            <option key={track.id} value={track.id}>{track.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
                            <p className="text-xs text-gray-500">Estimadas</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                            <Route className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {new Set(phases.map(p => p.track_id)).size}
                            </p>
                            <p className="text-xs text-gray-500">Trilhas</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                            <FileText className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {phases.filter(p => p.objectives && p.objectives.length > 0).length}
                            </p>
                            <p className="text-xs text-gray-500">Com objetivos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Phases List */}
            {phases.length === 0 ? (
                <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                    <Layers className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Nenhuma fase encontrada</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {phases.map((phase) => (
                        <PhaseCard key={phase.id} phase={phase} />
                    ))}
                </div>
            )}

            {/* Info Box */}
            <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-4 sm:p-6">
                <h3 className="font-semibold text-sky-300 mb-2">ℹ️ Sobre as Fases</h3>
                <p className="text-sm text-sky-200/70">
                    As fases são marcos dentro de cada trilha e agrupam módulos relacionados.
                    Elas são fixas conforme o Mapa do Curso. Para adicionar conteúdo,
                    acesse a página de <strong>Módulos</strong> e vincule à fase desejada.
                </p>
            </div>
        </div>
    );
}

function PhaseCard({ phase }: { phase: PhaseWithTrack }) {
    return (
        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 transition-all hover:border-gray-700 hover:bg-gray-900/50">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    {/* Phase Number */}
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold"
                        style={{
                            backgroundColor: `${phase.track?.color || '#3b82f6'}20`,
                            color: phase.track?.color || '#3b82f6',
                        }}
                    >
                        {phase.number}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">
                                {phase.name}
                            </h3>
                            <span
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                style={{
                                    backgroundColor: `${phase.track?.color || '#3b82f6'}20`,
                                    color: phase.track?.color || '#3b82f6',
                                }}
                            >
                                {phase.track?.name}
                            </span>
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
                        </div>

                        {/* Objectives */}
                        {phase.objectives && phase.objectives.length > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-gray-800/30">
                                <p className="text-xs text-gray-500 mb-2">Objetivos:</p>
                                <ul className="space-y-1">
                                    {phase.objectives.slice(0, 3).map((obj, idx) => (
                                        <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                                            <span className="text-emerald-400">•</span>
                                            {obj}
                                        </li>
                                    ))}
                                    {phase.objectives.length > 3 && (
                                        <li className="text-xs text-gray-500">
                                            +{phase.objectives.length - 3} mais...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <Link
                        href={`/admin/modulos?fase=${phase.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sm text-sky-400 hover:bg-sky-500/20 transition-colors"
                    >
                        <GraduationCap className="h-4 w-4" strokeWidth={1.5} />
                        Módulos
                        <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                    </Link>
                </div>
            </div>
        </div>
    );
}