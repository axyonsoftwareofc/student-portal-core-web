// components/student/forum/AnswerForm.tsx
'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateAnswerData } from '@/lib/types/forum';
import { showToast } from '@/lib/toast';

interface AnswerFormProps {
    questionId: string;
    onSubmit: (data: CreateAnswerData) => Promise<{ success: boolean; error?: string }>;
    isLoading?: boolean;
}

export function AnswerForm({ questionId, onSubmit, isLoading = false }: AnswerFormProps) {
    const [content, setContent] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            showToast('error', 'Digite sua resposta');
            return;
        }

        if (content.trim().length < 10) {
            showToast('error', 'A resposta deve ter pelo menos 10 caracteres');
            return;
        }

        setIsSubmitting(true);

        const result = await onSubmit({
            question_id: questionId,
            content: content.trim(),
        });

        setIsSubmitting(false);

        if (result.success) {
            showToast('success', 'Resposta enviada!');
            setContent('');
        } else {
            showToast('error', result.error || 'Erro ao enviar resposta');
        }
    };

    const isValid = content.trim().length >= 10;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sua resposta
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escreva sua resposta aqui. Você pode usar Markdown para formatação..."
                    rows={6}
                    className={cn(
                        'w-full px-4 py-3 rounded-lg',
                        'bg-gray-800 border border-gray-700',
                        'text-white placeholder-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
                        'transition-all resize-none'
                    )}
                />
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                        Suporta Markdown: **negrito**, `código`, ```bloco de código```
                    </p>
                    <p className="text-xs text-gray-500">
                        {content.length} caracteres (mínimo 10)
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={!isValid || isSubmitting || isLoading}
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
                            Enviar Resposta
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}