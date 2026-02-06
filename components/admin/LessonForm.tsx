// components/admin/LessonForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2, Video, FileText, PenTool, HelpCircle } from 'lucide-react';
import type { Lesson, LessonFormData, LessonType, LessonStatus, Module } from '@/lib/types/database';
import QuizEditor, { type QuizQuestion } from './QuizEditor';

interface LessonFormProps {
    lesson?: Lesson | null;
    modules: Module[];
    defaultModuleId?: string;
    onSubmit: (data: LessonFormData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    isLoading?: boolean;
}

const typeOptions: { value: LessonType; label: string; icon: typeof Video; description: string }[] = [
    { value: 'VIDEO', label: 'Vídeo', icon: Video, description: 'Aula em vídeo do YouTube' },
    { value: 'ARTICLE', label: 'Artigo', icon: FileText, description: 'Conteúdo em texto/markdown' },
    { value: 'EXERCISE', label: 'Exercício', icon: PenTool, description: 'Atividade prática' },
    { value: 'QUIZ', label: 'Quiz', icon: HelpCircle, description: 'Teste de conhecimento' },
];

const statusOptions: { value: LessonStatus; label: string }[] = [
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'PUBLISHED', label: 'Publicado' },
    { value: 'ARCHIVED', label: 'Arquivado' },
];

export default function LessonForm({
                                       lesson,
                                       modules,
                                       defaultModuleId,
                                       onSubmit,
                                       onCancel,
                                       isLoading
                                   }: LessonFormProps) {
    const [formData, setFormData] = useState<LessonFormData>({
        module_id: defaultModuleId || '',
        title: '',
        description: '',
        type: 'VIDEO',
        youtube_id: '',
        duration: '',
        content: '',
        quiz_data: [],
        status: 'DRAFT',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (lesson) {
            setFormData({
                module_id: lesson.module_id,
                title: lesson.title,
                description: lesson.description || '',
                type: lesson.type,
                youtube_id: lesson.youtube_id || '',
                duration: lesson.duration || '',
                content: lesson.content || '',
                quiz_data: (lesson.quiz_data as QuizQuestion[]) || [],
                status: lesson.status,
            });
        } else if (defaultModuleId) {
            setFormData(prev => ({ ...prev, module_id: defaultModuleId }));
        } else if (modules.length > 0) {
            setFormData(prev => ({ ...prev, module_id: modules[0].id }));
        }
    }, [lesson, modules, defaultModuleId]);

    const handleSubmit = async (e: React.FormEvent) => {
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

        if (formData.type === 'VIDEO' && !formData.youtube_id?.trim()) {
            setError('ID do YouTube é obrigatório para vídeos');
            return;
        }

        if (formData.type === 'QUIZ') {
            const questions = formData.quiz_data || [];
            if (questions.length === 0) {
                setError('Adicione pelo menos uma pergunta ao quiz');
                return;
            }

            // Validar cada pergunta
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.question.trim()) {
                    setError(`Pergunta ${i + 1} está vazia`);
                    return;
                }
                if (q.options.length < 2) {
                    setError(`Pergunta ${i + 1} precisa de pelo menos 2 opções`);
                    return;
                }
                if (q.options.some(o => !o.text.trim())) {
                    setError(`Pergunta ${i + 1} tem opções vazias`);
                    return;
                }
                if (!q.options.some(o => o.correct)) {
                    setError(`Pergunta ${i + 1} não tem resposta correta marcada`);
                    return;
                }
            }
        }

        const result = await onSubmit(formData);
        if (!result.success && result.error) {
            setError(result.error);
        }
    };

    // Extrair ID do YouTube de uma URL
    const extractYoutubeId = (input: string): string => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) return match[1];
        }
        return input;
    };

    const handleYoutubeInput = (value: string) => {
        const youtubeId = extractYoutubeId(value.trim());
        setFormData({ ...formData, youtube_id: youtubeId });
    };

    const handleQuizChange = (questions: QuizQuestion[]) => {
        setFormData({ ...formData, quiz_data: questions });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
                    {error}
                </div>
            )}

            {/* Módulo */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Módulo <span className="text-rose-400">*</span>
                </label>
                <select
                    value={formData.module_id}
                    onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    disabled={isLoading}
                >
                    <option value="">Selecione um módulo</option>
                    {modules.map(module => (
                        <option key={module.id} value={module.id}>
                            {module.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tipo */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Tipo de Conteúdo <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {typeOptions.map(option => {
                        const Icon = option.icon;
                        const isSelected = formData.type === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: option.value })}
                                disabled={isLoading}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                                    isSelected
                                        ? 'border-sky-500 bg-sky-500/10'
                                        : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                                }`}
                            >
                                <Icon className={`h-5 w-5 ${isSelected ? 'text-sky-400' : 'text-gray-500'}`} strokeWidth={1.5} />
                                <div>
                                    <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                        {option.label}
                                    </p>
                                    <p className="text-xs text-gray-500">{option.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Título */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Título <span className="text-rose-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    placeholder="Ex: Introdução ao Java"
                    disabled={isLoading}
                />
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Descrição
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors resize-none"
                    placeholder="Breve descrição da aula..."
                    disabled={isLoading}
                />
            </div>

            {/* Campos específicos por tipo */}
            {formData.type === 'VIDEO' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            YouTube (URL ou ID) <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.youtube_id}
                            onChange={(e) => handleYoutubeInput(e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                            placeholder="Cole a URL do YouTube ou o ID do vídeo"
                            disabled={isLoading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Ex: https://youtube.com/watch?v=abc123 ou abc123
                        </p>
                        {/* Preview do vídeo */}
                        {formData.youtube_id && (
                            <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-black">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${formData.youtube_id}`}
                                    title="Preview"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Duração
                        </label>
                        <input
                            type="text"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                            placeholder="Ex: 15:30"
                            disabled={isLoading}
                        />
                    </div>
                </>
            )}

            {formData.type === 'ARTICLE' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Conteúdo (Markdown)
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={8}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors font-mono text-sm"
                        placeholder="# Título&#10;&#10;Escreva o conteúdo em Markdown..."
                        disabled={isLoading}
                    />
                </div>
            )}

            {formData.type === 'EXERCISE' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Instruções do Exercício
                    </label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={6}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                        placeholder="Descreva as instruções do exercício..."
                        disabled={isLoading}
                    />
                </div>
            )}

            {formData.type === 'QUIZ' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Perguntas do Quiz
                    </label>
                    <QuizEditor
                        questions={formData.quiz_data || []}
                        onChange={handleQuizChange}
                        disabled={isLoading}
                    />
                </div>
            )}

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Status
                </label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LessonStatus })}
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

            {/* Botões */}
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
                    {lesson ? 'Salvar Alterações' : 'Criar Aula'}
                </button>
            </div>
        </form>
    );
}