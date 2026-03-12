'use client';

import { Route, CheckCircle, Layers } from 'lucide-react';
import type { StudentTrack } from '@/lib/types/database';

interface ProgressTabProps {
    tracks: StudentTrack[];
    isLoading: boolean;
}

export function ProgressTab({ tracks, isLoading }: ProgressTabProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="h-24 rounded-lg bg-gray-800/30 animate-pulse" />
                ))}
            </div>
        );
    }

    if (tracks.length === 0) {
        return (
            <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                <Route className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-gray-400">Nenhuma trilha matriculada</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tracks.map((track) => {
                const phasesCount = track.phases_count ?? 0;
                const lessonsCount = track.lessons_count ?? 0;
                const completedLessons = track.completed_lessons ?? 0;
                const progressPercentage = track.progress_percentage ?? 0;
                const isComplete = progressPercentage === 100;

                return (
                    <div
                        key={track.id}
                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-5"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    isComplete ? 'bg-emerald-500/10' : 'bg-sky-500/10'
                                }`}>
                                    <Route className={`h-5 w-5 ${
                                        isComplete ? 'text-emerald-400' : 'text-sky-400'
                                    }`} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white">{track.name}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Layers className="h-3 w-3" strokeWidth={1.5} />
                                            {phasesCount} fases
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                                            {completedLessons}/{lessonsCount} aulas
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <span className={`text-lg font-bold ${
                                isComplete ? 'text-emerald-400' : 'text-sky-400'
                            }`}>
                                {progressPercentage}%
                            </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-800">
                            <div
                                className={`h-full transition-all duration-500 ${
                                    isComplete ? 'bg-emerald-500' : 'bg-sky-500'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>

                        {isComplete && (
                            <div className="mt-3 flex items-center gap-2 text-emerald-400">
                                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                <span className="text-sm font-medium">Trilha concluída! 🎉</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}