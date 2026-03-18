// app/(dashboard)/aluno/forum/[questionId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { QuestionDetail } from '@/components/student/forum/QuestionDetail';
import { useForumAnswers } from '@/hooks/useForumAnswers';
import { ForumQuestionWithDetails, QuestionStatus } from '@/lib/types/forum';
import { showToast } from '@/lib/toast';

export default function QuestionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const questionId = params.questionId as string;

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [question, setQuestion] = useState<ForumQuestionWithDetails | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const {
        answers,
        isLoading: isLoadingAnswers,
        createAnswer,
        markAsBestAnswer,
        toggleUpvote,
        deleteAnswer,
        userVotes,
    } = useForumAnswers(questionId, currentUserId);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);

                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUserId(user?.id || null);

                const { data: questionData, error: questionError } = await supabase
                    .from('forum_questions_view')
                    .select('*')
                    .eq('id', questionId)
                    .single();

                if (questionError) {
                    if (questionError.code === 'PGRST116') {
                        setError('Pergunta não encontrada');
                    } else {
                        throw questionError;
                    }
                    return;
                }

                setQuestion(questionData as ForumQuestionWithDetails);

                // Incrementar visualizações
                await supabase
                    .from('forum_questions')
                    .update({ views_count: (questionData.views_count || 0) + 1 })
                    .eq('id', questionId);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar pergunta');
            } finally {
                setIsLoading(false);
            }
        }

        if (questionId) {
            fetchData();
        }
    }, [supabase, questionId]);

    const handleDeleteQuestion = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('forum_questions')
                .delete()
                .eq('id', questionId);

            if (deleteError) throw deleteError;

            showToast('success', 'Pergunta excluída com sucesso');
            router.push('/aluno/forum');

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir pergunta';
            showToast('error', errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const handleUpdateStatus = async (status: QuestionStatus): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: updateError } = await supabase
                .from('forum_questions')
                .update({ status })
                .eq('id', questionId);

            if (updateError) throw updateError;

            setQuestion((prev) => prev ? { ...prev, status } : null);

            const statusLabel = status === 'closed' ? 'resolvida' : 'reaberta';
            showToast('success', `Pergunta marcada como ${statusLabel}`);

            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
            showToast('error', errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    if (error || !question) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-rose-400 mb-4">{error || 'Pergunta não encontrada'}</p>
                <button
                    onClick={() => router.push('/aluno/forum')}
                    className="text-sky-400 hover:text-sky-300"
                >
                    Voltar para o fórum
                </button>
            </div>
        );
    }

    return (
        <QuestionDetail
            question={question}
            answers={answers}
            currentUserId={currentUserId}
            userVotes={userVotes}
            onCreateAnswer={createAnswer}
            onUpvote={toggleUpvote}
            onMarkBestAnswer={markAsBestAnswer}
            onDeleteAnswer={deleteAnswer}
            onDeleteQuestion={handleDeleteQuestion}
            onUpdateStatus={handleUpdateStatus}
            isLoadingAnswers={isLoadingAnswers}
        />
    );
}