// components/student/performance/ExerciseCard.tsx
'use client';

import Link from 'next/link';
import { CheckCircle, Clock, RotateCcw, Star, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubmissionStatus } from '@/lib/types/exercise-submissions';

interface ExerciseCardProps {
    id: string;
    title: string;
    lessonTitle: string;
    moduleId: string;
    lessonId: string;
    status: SubmissionStatus;
    grade: number | null;
    feedback: string | null;
    reviewedAt: string | null;
    createdAt: string;
}

export function ExerciseCard({
                                 title,
                                 lessonTitle,
                                 moduleId,
                                 lessonId,
                                 status,
                                 grade,
                                 feedback,
                                 reviewedAt,
                                 createdAt,
                             }: ExerciseCardProps) {
    const statusConfig: Record<SubmissionStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
        approved: { label: 'Aprovado', color: 'emerald', icon: CheckCircle },
        reviewed: { label: 'Corrigido', color: 'sky', icon: CheckCircle },
        needs_revision: { label: 'Revisão', color: 'rose', icon: RotateCcw },
        pending: { label: 'Pendente', color: 'amber', icon: Clock },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    const colorClasses: Record<string, { badge: string; icon: string }> = {
        emerald: { badge: 'bg-emerald-500/10 text-emerald-400', icon: 'text-emerald-400' },
        sky: { badge: 'bg-sky-500/10 text-sky-400', icon: 'text-sky-400' },
        rose: { badge: 'bg-rose-500/10 text-rose-400', icon: 'text-rose-400' },
        amber: { badge: 'bg-amber-500/10 text-amber-400', icon: 'text-amber-400' },
    };

    const colors = colorClasses[config.color];

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
        });
    };

    return (
        <Link
            href={`/aluno/estudar/${moduleId}/${lessonId}`}
            className="block rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 transition-all hover:bg-gray-900/50 hover:border-gray-700"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{title}</h4>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{lessonTitle}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {grade !== null && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800 text-sm">
                            <Star className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.5} />
                            <span className="font-bold text-white">{grade.toFixed(1)}</span>
                        </span>
                    )}
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', colors.badge)}>
                        <StatusIcon className={cn('h-3.5 w-3.5', colors.icon)} strokeWidth={1.5} />
                        {config.label}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>
                    {status === 'pending' ? 'Enviado' : 'Corrigido'} em {formatDate(reviewedAt || createdAt)}
                </span>
                {feedback && (
                    <span className="inline-flex items-center gap-1 text-sky-400">
                        <MessageSquare className="h-3 w-3" strokeWidth={1.5} />
                        Com feedback
                    </span>
                )}
            </div>

            {feedback && status !== 'pending' && (
                <div className="mt-3 p-3 rounded-md bg-gray-800/50 border border-gray-700/50">
                    <p className="text-xs text-gray-400 line-clamp-2">{feedback}</p>
                </div>
            )}
        </Link>
    );
}