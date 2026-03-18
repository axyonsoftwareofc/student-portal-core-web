// app/(dashboard)/aluno/forum/nova/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { QuestionForm } from '@/components/student/forum/QuestionForm';
import { useForumQuestions } from '@/hooks/useForumQuestions';

interface Module {
    id: string;
    name: string;
}

interface Lesson {
    id: string;
    title: string;
    module_id: string;
}

export default function NovaPeruntaPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const preSelectedModuleId = searchParams.get('modulo') || undefined;
    const preSelectedLessonId = searchParams.get('aula') || undefined;

    const { createQuestion } = useForumQuestions(currentUserId);

    useEffect(() => {
        async function initialize() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/signin');
                    return;
                }

                setCurrentUserId(user.id);

                const { data: modulesData } = await supabase
                    .from('modules')
                    .select('id, name')
                    .eq('status', 'PUBLISHED')
                    .order('order_index');

                setModules(modulesData || []);

                const { data: lessonsData } = await supabase
                    .from('lessons')
                    .select('id, title, module_id')
                    .eq('status', 'PUBLISHED')
                    .order('order_index');

                setLessons(lessonsData || []);

            } catch (err) {
                console.error('Erro ao inicializar:', err);
            } finally {
                setIsLoading(false);
            }
        }

        initialize();
    }, [supabase, router]);

    const handleCancel = () => {
        router.push('/aluno/forum');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    if (!currentUserId) {
        return null;
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Back Link */}
            <Link
                href="/aluno/forum"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o fórum
            </Link>

            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/20">
                    <HelpCircle className="h-6 w-6 text-sky-400" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Nova Pergunta</h1>
                    <p className="text-gray-400">Descreva sua dúvida para a comunidade</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <QuestionForm
                    modules={modules}
                    lessons={lessons}
                    onSubmit={createQuestion}
                    onCancel={handleCancel}
                    preSelectedModuleId={preSelectedModuleId}
                    preSelectedLessonId={preSelectedLessonId}
                />
            </div>
        </div>
    );
}