// components/admin/ModuleForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Module, ModuleFormData, ModuleStatus, Course } from '@/lib/types/database';

interface ModuleFormProps {
    module?: Module | null;
    courses: Course[];
    onSubmit: (data: ModuleFormData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    isLoading?: boolean;
}

const statusOptions: { value: ModuleStatus; label: string }[] = [
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'PUBLISHED', label: 'Publicado' },
    { value: 'ARCHIVED', label: 'Arquivado' },
];

export default function ModuleForm({
                                       module,
                                       courses,
                                       onSubmit,
                                       onCancel,
                                       isLoading
                                   }: ModuleFormProps) {
    const [formData, setFormData] = useState<ModuleFormData>({
        course_id: '',
        name: '',
        description: '',
        status: 'DRAFT',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (module) {
            setFormData({
                course_id: module.course_id,
                name: module.name,
                description: module.description || '',
                status: module.status,
            });
        } else if (courses.length > 0) {
            setFormData(prev => ({ ...prev, course_id: courses[0].id }));
        }
    }, [module, courses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.course_id) {
            setError('Selecione um curso');
            return;
        }

        if (!formData.name.trim()) {
            setError('Nome é obrigatório');
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
                    Curso <span className="text-rose-400">*</span>
                </label>
                <select
                    value={formData.course_id}
                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    disabled={isLoading}
                >
                    <option value="">Selecione um curso</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Nome do Módulo <span className="text-rose-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    placeholder="Ex: Fundamentos de Java"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Descrição
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors resize-none"
                    placeholder="Breve descrição do módulo..."
                    disabled={isLoading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Status
                </label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ModuleStatus })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    disabled={isLoading}
                >
                    {statusOptions.map(option => (
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
                    {module ? 'Salvar Alterações' : 'Criar Módulo'}
                </button>
            </div>
        </form>
    );
}