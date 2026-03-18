// hooks/useForumQuestions.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    ForumQuestionWithDetails,
    CreateQuestionData,
    ForumFilters,
    QuestionStatus
} from '@/lib/types/forum';

interface UseForumQuestionsReturn {
    questions: ForumQuestionWithDetails[];
    isLoading: boolean;
    error: string | null;
    createQuestion: (data: CreateQuestionData) => Promise<{ success: boolean; error?: string; questionId?: string }>;
    updateQuestionStatus: (questionId: string, status: QuestionStatus) => Promise<{ success: boolean; error?: string }>;
    incrementViews: (questionId: string) => Promise<void>;
    deleteQuestion: (questionId: string) => Promise<{ success: boolean; error?: string }>;
    refresh: () => Promise<void>;
    filters: ForumFilters;
    setFilters: (filters: ForumFilters) => void;
}

export function useForumQuestions(userId?: string | null): UseForumQuestionsReturn {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [questions, setQuestions] = useState<ForumQuestionWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ForumFilters>({
        status: 'all',
        search: '',
        onlyMine: false,
    });

    const fetchQuestions = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('forum_questions_view')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('last_activity_at', { ascending: false });

            if (filters.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }

            if (filters.module_id) {
                query = query.eq('module_id', filters.module_id);
            }

            if (filters.lesson_id) {
                query = query.eq('lesson_id', filters.lesson_id);
            }

            if (filters.onlyMine && userId) {
                query = query.eq('user_id', userId);
            }

            if (filters.search) {
                query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setQuestions((data || []) as ForumQuestionWithDetails[]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar perguntas');
        } finally {
            setIsLoading(false);
        }
    }, [supabase, filters, userId]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const createQuestion = async (data: CreateQuestionData): Promise<{ success: boolean; error?: string; questionId?: string }> => {
        if (!userId) {
            return { success: false, error: 'Usuário não autenticado' };
        }

        try {
            const { data: newQuestion, error: insertError } = await supabase
                .from('forum_questions')
                .insert({
                    user_id: userId,
                    title: data.title,
                    content: data.content,
                    lesson_id: data.lesson_id || null,
                    module_id: data.module_id || null,
                    status: 'open',
                })
                .select('id')
                .single();

            if (insertError) throw insertError;

            await fetchQuestions();

            return { success: true, questionId: newQuestion.id };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao criar pergunta'
            };
        }
    };

    const updateQuestionStatus = async (questionId: string, status: QuestionStatus): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: updateError } = await supabase
                .from('forum_questions')
                .update({ status })
                .eq('id', questionId);

            if (updateError) throw updateError;

            setQuestions((prev: ForumQuestionWithDetails[]) =>
                prev.map((q: ForumQuestionWithDetails) =>
                    q.id === questionId ? { ...q, status } : q
                )
            );

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao atualizar status'
            };
        }
    };

    const incrementViews = async (questionId: string): Promise<void> => {
        try {
            await supabase.rpc('increment_question_views', { question_id: questionId });
        } catch (err) {
            console.error('Erro ao incrementar views:', err);
        }
    };

    const deleteQuestion = async (questionId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { error: deleteError } = await supabase
                .from('forum_questions')
                .delete()
                .eq('id', questionId);

            if (deleteError) throw deleteError;

            setQuestions((prev: ForumQuestionWithDetails[]) =>
                prev.filter((q: ForumQuestionWithDetails) => q.id !== questionId)
            );

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erro ao deletar pergunta'
            };
        }
    };

    const refresh = async (): Promise<void> => {
        await fetchQuestions();
    };

    return {
        questions,
        isLoading,
        error,
        createQuestion,
        updateQuestionStatus,
        incrementViews,
        deleteQuestion,
        refresh,
        filters,
        setFilters,
    };
}