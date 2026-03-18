// hooks/useForumAnswers.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ForumAnswerWithUser, CreateAnswerData } from '@/lib/types/forum';

interface UseForumAnswersReturn {
    answers: ForumAnswerWithUser[];
    isLoading: boolean;
    error: string | null;
    createAnswer: (data: CreateAnswerData) => Promise<{ success: boolean; error?: string }>;
    markAsBestAnswer: (answerId: string) => Promise<{ success: boolean; error?: string }>;
    toggleUpvote: (answerId: string) => Promise<{ success: boolean; error?: string }>;
    deleteAnswer: (answerId: string) => Promise<{ success: boolean; error?: string }>;
    refresh: () => Promise<void>;
    userVotes: Set<string>;
}

export function useForumAnswers(questionId: string, userId?: string | null): UseForumAnswersReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [answers, setAnswers] = useState<ForumAnswerWithUser[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

    const fetchAnswers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('forum_answers_view')
                .select('*')
                .eq('question_id', questionId)
                .order('is_best_answer', { ascending: false })
                .order('upvotes_count', { ascending: false })
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            setAnswers((data || []) as ForumAnswerWithUser[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar respostas');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, questionId]);

    const fetchUserVotes = useCallback(async () => {
        if (!userId) return;

        try {
            const { data } = await supabase
                .from('forum_answer_votes')
                .select('answer_id')
                .eq('user_id', userId);

            if (data) {
                setUserVotes(new Set(data.map((v: { answer_id: string }) => v.answer_id)));
            }
        } catch (err) {
            console.error('Erro ao buscar votos:', err);
        }
    }, [supabase, userId]);

    useEffect(() => {
        if (questionId) {
            fetchAnswers();
            fetchUserVotes();
        }
    }, [questionId, fetchAnswers, fetchUserVotes]);

    const createAnswer = async (data: CreateAnswerData): Promise<{ success: boolean; error?: string }> => {
        if (!userId) {
            return { success: false, error: 'Usuário não autenticado' };
        }

        try {
            const { error: insertError } = await supabase
                .from('forum_answers')
                .insert({
                    question_id: data.question_id,
                    user_id: userId,
                    content: data.content,
                });

            if (insertError) throw insertError;

            // Atualizar status da pergunta para 'answered' se ainda estiver 'open'
            await supabase
                .from('forum_questions')
                .update({ status: 'answered' })
                .eq('id', data.question_id)
                .eq('status', 'open');

            // Criar notificação para o autor da pergunta
            const { data: question } = await supabase
                .from('forum_questions')
                .select('user_id, title')
                .eq('id', data.question_id)
                .single();

            if (question && question.user_id !== userId) {
                await supabase.from('forum_notifications').insert({
                    user_id: question.user_id,
                    question_id: data.question_id,
                    type: 'new_answer',
                    message: `Nova resposta na sua pergunta: "${question.title}"`,
                });
            }

            await fetchAnswers();

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao criar resposta'
            };
        }
    };

    const markAsBestAnswer = async (answerId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Remover best_answer de todas as outras respostas desta pergunta
            await supabase
                .from('forum_answers')
                .update({ is_best_answer: false })
                .eq('question_id', questionId);

            // Marcar esta resposta como best_answer
            await supabase
                .from('forum_answers')
                .update({ is_best_answer: true })
                .eq('id', answerId);

            // Atualizar a referência na pergunta
            await supabase
                .from('forum_questions')
                .update({ best_answer_id: answerId, status: 'answered' })
                .eq('id', questionId);

            // Buscar dados para notificação
            const { data: answer } = await supabase
                .from('forum_answers')
                .select('user_id')
                .eq('id', answerId)
                .single();

            const { data: question } = await supabase
                .from('forum_questions')
                .select('title')
                .eq('id', questionId)
                .single();

            if (answer && question && answer.user_id !== userId) {
                await supabase.from('forum_notifications').insert({
                    user_id: answer.user_id,
                    question_id: questionId,
                    answer_id: answerId,
                    type: 'best_answer',
                    message: `Sua resposta foi marcada como a melhor em: "${question.title}"`,
                });
            }

            await fetchAnswers();

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao marcar melhor resposta'
            };
        }
    };

    const toggleUpvote = async (answerId: string): Promise<{ success: boolean; error?: string }> => {
        if (!userId) {
            return { success: false, error: 'Usuário não autenticado' };
        }

        const hasVoted = userVotes.has(answerId);

        try {
            if (hasVoted) {
                await supabase
                    .from('forum_answer_votes')
                    .delete()
                    .eq('answer_id', answerId)
                    .eq('user_id', userId);

                await supabase
                    .from('forum_answers')
                    .update({ upvotes_count: answers.find((a: ForumAnswerWithUser) => a.id === answerId)!.upvotes_count - 1 })
                    .eq('id', answerId);

                setUserVotes((prev: Set<string>) => {
                    const newSet = new Set(prev);
                    newSet.delete(answerId);
                    return newSet;
                });
            } else {
                await supabase.from('forum_answer_votes').insert({
                    answer_id: answerId,
                    user_id: userId,
                });

                await supabase
                    .from('forum_answers')
                    .update({ upvotes_count: answers.find((a: ForumAnswerWithUser) => a.id === answerId)!.upvotes_count + 1 })
                    .eq('id', answerId);

                setUserVotes((prev: Set<string>) => new Set(prev).add(answerId));
            }

            await fetchAnswers();

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao votar'
            };
        }
    };

    const deleteAnswer = async (answerId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('forum_answers')
                .delete()
                .eq('id', answerId);

            if (deleteError) throw deleteError;

            setAnswers((prev: ForumAnswerWithUser[]) =>
                prev.filter((a: ForumAnswerWithUser) => a.id !== answerId)
            );

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao deletar resposta'
            };
        }
    };

    const refresh = async (): Promise<void> => {
        await fetchAnswers();
    };

    return {
        answers,
        isLoading,
        error,
        createAnswer,
        markAsBestAnswer,
        toggleUpvote,
        deleteAnswer,
        refresh,
        userVotes,
    };
}