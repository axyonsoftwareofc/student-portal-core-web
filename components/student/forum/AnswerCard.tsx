// components/student/forum/AnswerCard.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ThumbsUp, CheckCircle2, Crown, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { ForumAnswerWithUser } from '@/lib/types/forum';

interface AnswerCardProps {
    answer: ForumAnswerWithUser;
    currentUserId: string | null;
    questionAuthorId: string;
    hasVoted: boolean;
    onUpvote: (answerId: string) => Promise<void>;
    onMarkBestAnswer: (answerId: string) => Promise<void>;
    onDelete: (answerId: string) => Promise<void>;
    isQuestionOwner: boolean;
}

export function AnswerCard({
                               answer,
                               currentUserId,
                               questionAuthorId,
                               hasVoted,
                               onUpvote,
                               onMarkBestAnswer,
                               onDelete,
                               isQuestionOwner,
                           }: AnswerCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const timeAgo = formatDistanceToNow(new Date(answer.created_at), {
        addSuffix: true,
        locale: ptBR,
    });

    const isOwnAnswer = answer.user_id === currentUserId;
    const isTeacher = answer.user_role === 'admin';
    const canDelete = isOwnAnswer || isQuestionOwner;
    const canMarkBest = isQuestionOwner && !answer.is_best_answer;

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta resposta?')) return;

        setIsDeleting(true);
        await onDelete(answer.id);
        setIsDeleting(false);
        setIsMenuOpen(false);
    };

    const handleUpvote = async () => {
        if (!currentUserId) return;
        await onUpvote(answer.id);
    };

    const handleMarkBest = async () => {
        await onMarkBestAnswer(answer.id);
    };

    return (
        <article
            className={cn(
                'bg-gray-900/50 border rounded-xl p-4 transition-all',
                answer.is_best_answer
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : 'border-gray-800 hover:border-gray-700'
            )}
        >
            {/* Best Answer Badge */}
            {answer.is_best_answer && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-emerald-500/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">
                        Melhor Resposta
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <UserAvatar
                        name={answer.user_name}
                        avatarUrl={answer.user_avatar_url}
                        size="sm"
                    />

                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-white">
                                {answer.user_name}
                            </span>
                            {isTeacher && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    <Crown className="h-3 w-3" />
                                    Professor
                                </span>
                            )}
                            {isOwnAnswer && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-sky-500/20 text-sky-400">
                                    você
                                </span>
                            )}
                        </div>
                        <span className="text-sm text-gray-500">{timeAgo}</span>
                    </div>
                </div>

                {/* Menu */}
                {canDelete && (
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 top-8 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="mt-4 prose prose-invert prose-sm max-w-none">
                <MarkdownRenderer content={answer.content} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                {/* Upvote Button */}
                <button
                    onClick={handleUpvote}
                    disabled={!currentUserId}
                    className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                        hasVoted
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50'
                            : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-white',
                        !currentUserId && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <ThumbsUp className={cn('h-4 w-4', hasVoted && 'fill-current')} />
                    <span>{answer.upvotes_count}</span>
                </button>

                {/* Mark as Best Answer */}
                {canMarkBest && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkBest}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Marcar como melhor
                    </Button>
                )}
            </div>
        </article>
    );
}