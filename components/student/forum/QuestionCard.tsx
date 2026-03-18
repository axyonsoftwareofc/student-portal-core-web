// components/student/forum/QuestionCard.tsx
'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Eye, CheckCircle2, Clock, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ForumQuestionWithDetails } from '@/lib/types/forum';

interface QuestionCardProps {
    question: ForumQuestionWithDetails;
}

export function QuestionCard({ question }: QuestionCardProps) {
    const timeAgo = formatDistanceToNow(new Date(question.created_at), {
        addSuffix: true,
        locale: ptBR,
    });

    const statusConfig = {
        open: {
            label: 'Aberta',
            icon: Clock,
            className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
        answered: {
            label: 'Respondida',
            icon: MessageCircle,
            className: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        },
        closed: {
            label: 'Resolvida',
            icon: CheckCircle2,
            className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
    };

    const status = statusConfig[question.status];
    const StatusIcon = status.icon;

    return (
        <Link href={`/aluno/forum/${question.id}`}>
            <article
                className={cn(
                    'bg-gray-900/50 border border-gray-800 rounded-xl p-4',
                    'hover:border-gray-700 hover:bg-gray-900/70 transition-all',
                    'cursor-pointer group'
                )}
            >
                {/* Header */}
                <div className="flex items-start gap-3">
                    <UserAvatar
                        name={question.user_name}
                        avatarUrl={question.user_avatar_url}
                        size="md"
                    />

                    <div className="flex-1 min-w-0">
                        {/* Title + Badges */}
                        <div className="flex items-start gap-2 flex-wrap">
                            {question.is_pinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30">
                                    <Pin className="h-3 w-3" />
                                    Fixado
                                </span>
                            )}
                            <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                                {question.title}
                            </h3>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400 flex-wrap">
                            <span>{question.user_name}</span>
                            <span>•</span>
                            <span>{timeAgo}</span>
                            {question.module_name && (
                                <>
                                    <span>•</span>
                                    <span className="text-sky-400">{question.module_name}</span>
                                </>
                            )}
                            {question.lesson_title && (
                                <>
                                    <span>→</span>
                                    <span className="text-gray-500 truncate max-w-[150px]">
                                        {question.lesson_title}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Preview do conteúdo */}
                        <p className="mt-2 text-gray-400 text-sm line-clamp-2">
                            {question.content}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {question.answers_count} {question.answers_count === 1 ? 'resposta' : 'respostas'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {question.views_count}
                        </span>
                    </div>

                    {/* Status Badge */}
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border',
                            status.className
                        )}
                    >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                    </span>
                </div>
            </article>
        </Link>
    );
}