// components/student/forum/QuestionDetail.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    ArrowLeft,
    MessageCircle,
    Eye,
    Clock,
    CheckCircle2,
    MoreVertical,
    Trash2,
    Lock,
    Unlock,
    BookOpen,
    Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { AnswerCard } from './AnswerCard';
import { AnswerForm } from './AnswerForm';
import { ForumQuestionWithDetails, ForumAnswerWithUser, QuestionStatus } from '@/lib/types/forum';

interface QuestionDetailProps {
    question: ForumQuestionWithDetails;
    answers: ForumAnswerWithUser[];
    currentUserId: string | null;
    userVotes: Set<string>;
    onCreateAnswer: (data: { question_id: string; content: string }) => Promise<{ success: boolean; error?: string }>;
    onUpvote: (answerId: string) => Promise<{ success: boolean; error?: string }>;
    onMarkBestAnswer: (answerId: string) => Promise<{ success: boolean; error?: string }>;
    onDeleteAnswer: (answerId: string) => Promise<{ success: boolean; error?: string }>;
    onDeleteQuestion: () => Promise<{ success: boolean; error?: string }>;
    onUpdateStatus: (status: QuestionStatus) => Promise<{ success: boolean; error?: string }>;
    isLoadingAnswers?: boolean;
}

export function QuestionDetail({
                                   question,
                                   answers,
                                   currentUserId,
                                   userVotes,
                                   onCreateAnswer,
                                   onUpvote,
                                   onMarkBestAnswer,
                                   onDeleteAnswer,
                                   onDeleteQuestion,
                                   onUpdateStatus,
                                   isLoadingAnswers = false,
                               }: QuestionDetailProps) {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const timeAgo = formatDistanceToNow(new Date(question.created_at), {
        addSuffix: true,
        locale: ptBR,
    });

    const isOwner = question.user_id === currentUserId;
    const isClosed = question.status === 'closed';

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

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta pergunta? Todas as respostas também serão excluídas.')) {
            return;
        }

        setIsDeleting(true);
        await onDeleteQuestion();
        setIsDeleting(false);
    };

    const handleToggleStatus = async () => {
        const newStatus: QuestionStatus = question.status === 'closed' ? 'open' : 'closed';
        await onUpdateStatus(newStatus);
        setIsMenuOpen(false);
    };

    const handleUpvote = async (answerId: string) => {
        await onUpvote(answerId);
    };

    const handleMarkBest = async (answerId: string) => {
        await onMarkBestAnswer(answerId);
    };

    const handleDeleteAnswer = async (answerId: string) => {
        await onDeleteAnswer(answerId);
    };

    return (
        <div className="space-y-6">
            {/* Back Link */}
            <Link
                href="/aluno/forum"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o fórum
            </Link>

            {/* Question Card */}
            <article className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        <UserAvatar
                            name={question.user_name}
                            avatarUrl={question.user_avatar_url}
                            size="lg"
                        />

                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
                                {question.title}
                            </h1>

                            <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
                                <span className="font-medium text-white">
                                    {question.user_name}
                                </span>
                                {isOwner && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-sky-500/20 text-sky-400">
                                        você
                                    </span>
                                )}
                                <span>•</span>
                                <span>{timeAgo}</span>
                            </div>

                            {/* Context */}
                            {(question.module_name || question.lesson_title) && (
                                <div className="flex items-center gap-3 mt-2 text-sm">
                                    {question.module_name && (
                                        <span className="inline-flex items-center gap-1 text-sky-400">
                                            <Layers className="h-3.5 w-3.5" />
                                            {question.module_name}
                                        </span>
                                    )}
                                    {question.lesson_title && (
                                        <span className="inline-flex items-center gap-1 text-gray-500">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {question.lesson_title}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Menu */}
                    {isOwner && (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-10 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px]">
                                        <button
                                            onClick={handleToggleStatus}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            {isClosed ? (
                                                <>
                                                    <Unlock className="h-4 w-4" />
                                                    Reabrir pergunta
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="h-4 w-4" />
                                                    Marcar como resolvida
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {isDeleting ? 'Excluindo...' : 'Excluir pergunta'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="mt-6 prose prose-invert prose-lg max-w-none">
                    <MarkdownRenderer content={question.content} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {answers.length} {answers.length === 1 ? 'resposta' : 'respostas'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {question.views_count} visualizações
                        </span>
                    </div>

                    <span
                        className={cn(
                            'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border',
                            status.className
                        )}
                    >
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                    </span>
                </div>
            </article>

            {/* Answers Section */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-sky-400" />
                    Respostas ({answers.length})
                </h2>

                {isLoadingAnswers ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500" />
                    </div>
                ) : answers.length === 0 ? (
                    <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8 text-center">
                        <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">
                            Nenhuma resposta ainda. Seja o primeiro a ajudar!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {answers.map((answer: ForumAnswerWithUser) => (
                            <AnswerCard
                                key={answer.id}
                                answer={answer}
                                currentUserId={currentUserId}
                                questionAuthorId={question.user_id}
                                hasVoted={userVotes.has(answer.id)}
                                onUpvote={handleUpvote}
                                onMarkBestAnswer={handleMarkBest}
                                onDelete={handleDeleteAnswer}
                                isQuestionOwner={isOwner}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Answer Form */}
            {!isClosed && currentUserId && (
                <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Responder
                    </h3>
                    <AnswerForm
                        questionId={question.id}
                        onSubmit={onCreateAnswer}
                    />
                </section>
            )}

            {/* Closed Message */}
            {isClosed && (
                <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 text-center">
                    <Lock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">
                        Esta pergunta foi marcada como resolvida e não aceita novas respostas.
                    </p>
                    {isOwner && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleStatus}
                            className="mt-3 text-sky-400"
                        >
                            <Unlock className="h-4 w-4 mr-1" />
                            Reabrir pergunta
                        </Button>
                    )}
                </div>
            )}

            {/* Login Prompt */}
            {!currentUserId && !isClosed && (
                <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 text-center">
                    <p className="text-gray-400">
                        Faça login para responder esta pergunta.
                    </p>
                    <Link href="/signin">
                        <Button className="mt-3 bg-sky-600 hover:bg-sky-500">
                            Entrar
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}