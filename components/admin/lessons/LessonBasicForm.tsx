// components/admin/lessons/LessonBasicForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Module } from '@/lib/types/database';
import type { LessonFormData } from '@/hooks/useAllLessons';

interface LessonBasicFormProps {
    lesson?: {
        id: string;
        module_id: string;
        title: string;
        description: string | null;
        status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    } | null;
    modules: Module[];
    defaultModuleId?: string;
    onSubmit: (data: LessonFormData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    isLoading?: boolean;
}

const statusOptions: { value: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; label: string }[] = [
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'PUBLISHED', label: 'Publicado' },
    { value: 'ARCHIVED', label: 'Arquivado' },
];

export default function LessonBasicForm({
                                            lesson,
                                            modules,
                                            defaultModuleId,
                                            onSubmit,
                                            onCancel,
                                            isLoading
                                        }: LessonBasicFormProps) {
    const [formData, setFormData] = useState<LessonFormData>({
        module_id: defaultModuleId || '',
        title: '',
        description: '',
        status: 'DRAFT',
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (lesson) {
            setFormData({
                module_id: lesson.module_id,
                title: lesson.title,
                description: lesson.description || '',
                status: lesson.status,
            });
        } else if (defaultModuleId) {
            setFormData((prev) => ({ ...prev, module_id: defaultModuleId }));
        } else if (modules.length > 0) {
            setFormData((prev) => ({ ...prev, module_id: modules[0].id }));
        }
    }, [lesson, modules, defaultModuleId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        if (!formData.module_id) {
            setError('Selecione um módulo');
            return;
        }

        if (!formData.title.trim()) {
            setError('Título é obrigatório');
            return;
        }

        const result = await onSubmit(formData);
        if (!result.success && result.error) {
            setError(result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Módulo <span className="text-rose-400">*</span>
                </label>
                <select
                    value={formData.module_id}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({ ...formData, module_id: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    disabled={isLoading}
                >
                    <option value="">Selecione um módulo</option>
                    {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                            {module.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Título da Aula <span className="text-rose-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    placeholder="Ex: Variáveis e Tipos Primitivos"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Descrição
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors resize-none"
                    placeholder="Breve descrição da aula..."
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Status
                </label>
                <select
                    value={formData.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' })
                    }
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    disabled={isLoading}
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-3 justify-end pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {lesson ? 'Salvar' : 'Criar e Adicionar Conteúdos'}
                </button>
            </div>
        </form>
    );
}