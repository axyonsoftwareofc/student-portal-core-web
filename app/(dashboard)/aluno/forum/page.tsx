// app/(dashboard)/aluno/forum/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MessageCircle, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { QuestionCard } from '@/components/student/forum/QuestionCard';
import { ForumFilters } from '@/components/student/forum/ForumFilters';
import { EmptyForum } from '@/components/student/forum/EmptyForum';
import { useForumQuestions } from '@/hooks/useForumQuestions';

interface Module {
    id: string;
    name: string;
}

export default function ForumPage() {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

    const {
        questions,
        isLoading,
        error,
        filters,
        setFilters,
        refresh,
    } = useForumQuestions(currentUserId);

    useEffect(() => {
        async function initialize() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUserId(user?.id || null);

                const { data: modulesData } = await supabase
                    .from('modules')
                    .select('id, name')
                    .eq('status', 'PUBLISHED')
                    .order('order_index');

                setModules(modulesData || []);
            } catch (err) {
                console.error('Erro ao inicializar:', err);
            } finally {
                setIsLoadingUser(false);
            }
        }

        initialize();
    }, [supabase]);

    const hasActiveFilters =
        filters.status !== 'all' ||
        !!filters.module_id ||
        !!filters.search ||
        filters.onlyMine === true;

    const clearFilters = () => {
        setFilters({
            status: 'all',
            module_id: null,
            search: '',
            onlyMine: false,
        });
    };

    if (isLoadingUser) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/20">
                        <MessageCircle className="h-6 w-6 text-sky-400" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Fórum de Dúvidas</h1>
                        <p className="text-gray-400">Tire suas dúvidas com a comunidade</p>
                    </div>
                </div>

                <Link href="/aluno/forum/nova">
                    <Button className="bg-sky-600 hover:bg-sky-500 w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Pergunta
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <ForumFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    modules={modules}
                    showMyQuestionsFilter={currentUserId !== null}
                />
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4 text-center">
                    <p className="text-rose-400">{error}</p>
                    <Button variant="outline" onClick={refresh} className="mt-3">
                        Tentar novamente
                    </Button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && questions.length === 0 && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && questions.length === 0 && (
                <EmptyForum
                    hasFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                />
            )}

            {/* Questions List */}
            {!error && questions.length > 0 && (
                <div className="space-y-3">
                    {questions.map((question) => (
                        <QuestionCard key={question.id} question={question} />
                    ))}
                </div>
            )}

            {/* Stats Footer */}
            {questions.length > 0 && (
                <div className="text-center text-sm text-gray-500">
                    {questions.length} pergunta{questions.length !== 1 ? 's' : ''} encontrada{questions.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}