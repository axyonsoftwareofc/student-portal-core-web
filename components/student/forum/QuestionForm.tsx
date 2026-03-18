// components/student/forum/QuestionForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, X, BookOpen, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateQuestionData } from '@/lib/types/forum';
import { showToast } from '@/lib/toast';

interface Module {
    id: string;
    name: string;
}

interface Lesson {
    id: string;
    title: string;
    module_id: string;
}

interface QuestionFormProps {
    modules: Module[];
    lessons: Lesson[];
    onSubmit: (data: CreateQuestionData) => Promise<{ success: boolean; error?: string; questionId?: string }>;
    onCancel?: () => void;
    isLoading?: boolean;
    preSelectedModuleId?: string;
    preSelectedLessonId?: string;
}

export function QuestionForm({
                                 modules,
                                 lessons,
                                 onSubmit,
                                 onCancel,
                                 isLoading = false,
                                 preSelectedModuleId,
                                 preSelectedLessonId,
                             }: QuestionFormProps) {
    const router = useRouter();

    const [title, setTitle] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [moduleId, setModuleId] = useState<string>(preSelectedModuleId || '');
    const [lessonId, setLessonId] = useState<string>(preSelectedLessonId || '');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const filteredLessons = moduleId
        ? lessons.filter((l: Lesson) => l.module_id === moduleId)
        : [];

    const handleModuleChange = (newModuleId: string) => {
        setModuleId(newModuleId);
        setLessonId('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            showToast('error', 'Digite um título para sua pergunta');
            return;
        }

        if (!content.trim()) {
            showToast('error', 'Digite o conteúdo da sua pergunta');
            return;
        }

        if (title.trim().length < 10) {
            showToast('error', 'O título deve ter pelo menos 10 caracteres');
            return;
        }

        if (content.trim().length < 20) {
            showToast('error', 'A descrição deve ter pelo menos 20 caracteres');
            return;
        }

        setIsSubmitting(true);

        const result = await onSubmit({
            title: title.trim(),
            content: content.trim(),
            module_id: moduleId || null,
            lesson_id: lessonId || null,
        });

        setIsSubmitting(false);

        if (result.success) {
            showToast('success', 'Pergunta criada com sucesso!');
            if (result.questionId) {
                router.push(`/aluno/forum/${result.questionId}`);
            } else {
                router.push('/aluno/forum');
            }
        } else {
            showToast('error', result.error || 'Erro ao criar pergunta');
        }
    };

    const isFormValid = title.trim().length >= 10 && content.trim().length >= 20;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contexto (Módulo e Aula) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Módulo */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Layers className="inline h-4 w-4 mr-1" />
                        Módulo (opcional)
                    </label>
                    <select
                        value={moduleId}
                        onChange={(e) => handleModuleChange(e.target.value)}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-gray-800 border border-gray-700',
                            'text-white placeholder-gray-500',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                            'transition-all'
                        )}
                    >
                        <option value="">Selecione um módulo...</option>
                        {modules.map((module: Module) => (
                            <option key={module.id} value={module.id}>
                                {module.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Aula */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <BookOpen className="inline h-4 w-4 mr-1" />
                        Aula (opcional)
                    </label>
                    <select
                        value={lessonId}
                        onChange={(e) => setLessonId(e.target.value)}
                        disabled={!moduleId}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-gray-800 border border-gray-700',
                            'text-white placeholder-gray-500',
                            'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                            'transition-all',
                            !moduleId && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <option value="">Selecione uma aula...</option>
                        {filteredLessons.map((lesson: Lesson) => (
                            <option key={lesson.id} value={lesson.id}>
                                {lesson.title}
                            </option>
                        ))}
                    </select>
                    {!moduleId && (
                        <p className="text-xs text-gray-500 mt-1">
                            Selecione um módulo primeiro
                        </p>
                    )}
                </div>
            </div>

            {/* Título */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título da pergunta *
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Como usar o Spring Data JPA com relacionamentos?"
                    maxLength={255}
                    className={cn(
                        'w-full px-4 py-3 rounded-lg',
                        'bg-gray-800 border border-gray-700',
                        'text-white placeholder-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                        'transition-all'
                    )}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {title.length}/255 caracteres (mínimo 10)
                </p>
            </div>

            {/* Conteúdo */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição detalhada *
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Descreva sua dúvida com detalhes. Inclua o código que você tentou, o erro que apareceu, e o que você já tentou fazer para resolver..."
                    rows={8}
                    className={cn(
                        'w-full px-4 py-3 rounded-lg',
                        'bg-gray-800 border border-gray-700',
                        'text-white placeholder-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                        'transition-all resize-none'
                    )}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {content.length} caracteres (mínimo 20)
                </p>
            </div>

            {/* Dica */}
            <div className="bg-sky-950/30 border border-sky-900/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-sky-400 mb-2">
                    💡 Dicas para uma boa pergunta:
                </h4>
                <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Seja específico no título</li>
                    <li>• Inclua o código relevante</li>
                    <li>• Descreva o que você esperava vs. o que aconteceu</li>
                    <li>• Mencione o que você já tentou</li>
                </ul>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting || isLoading}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting || isLoading}
                    className="bg-sky-600 hover:bg-sky-500"
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4 mr-2" />
                            Publicar Pergunta
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}