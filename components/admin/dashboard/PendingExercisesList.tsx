// components/admin/dashboard/PendingExercisesList.tsx
'use client';

import Link from 'next/link';
import { ClipboardCheck, Clock, ArrowRight, User } from 'lucide-react';

interface PendingExercise {
    id: string;
    student_id: string;
    student_name: string;
    content_title: string;
    lesson_title: string;
    module_id: string;
    lesson_id: string;
    created_at: string;
}

interface PendingExercisesListProps {
    exercises: PendingExercise[];
    totalPending: number;
}

export function PendingExercisesList({ exercises, totalPending }: PendingExercisesListProps) {
    const formatRelativeTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins}min`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    if (exercises.length === 0) {
        return (
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6 text-center">
                <ClipboardCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-emerald-400 font-medium">Tudo em dia! 🎉</p>
                <p className="text-gray-500 text-sm mt-1">Nenhum exercício pendente</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/10 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-amber-950/20 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
                    <h3 className="font-medium text-amber-300">Aguardando Correção</h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                        {totalPending}
                    </span>
                </div>
                <Link
                    href="/admin/correcoes"
                    className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                    Ver todas
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
            </div>

            <div className="divide-y divide-amber-500/10">
                {exercises.map((exercise) => (
                    <Link
                        key={exercise.id}
                        href="/admin/correcoes"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-amber-950/20 transition-colors"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 flex-shrink-0">
                            <User className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {exercise.student_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {exercise.content_title}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <span className="text-xs text-amber-400/80">
                                há {formatRelativeTime(exercise.created_at)}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}