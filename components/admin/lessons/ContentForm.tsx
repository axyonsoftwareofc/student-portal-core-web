// components/admin/lessons/ContentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Loader2,
    Video,
    BookOpen,
    PenTool,
    HelpCircle,
    Package,
} from 'lucide-react';
import type {
    LessonContent,
    LessonContentFormData,
    LessonContentType,
    MaterialCategory,
    QuizQuestion,
} from '@/lib/types/lesson-contents';
import QuizEditor from '@/components/admin/QuizEditor';

interface ContentFormProps {
    content?: LessonContent | null;
    onSubmit: (data: LessonContentFormData) => Promise<{ success: boolean; error?: string }>;
    onCancel: () => void;
    isLoading?: boolean;
}

const typeOptions: { value: LessonContentType; label: string; icon: typeof Video; description: string }[] = [
    { value: 'VIDEO', label: 'Vídeo', icon: Video, description: 'Vídeo do YouTube' },
    { value: 'ARTICLE', label: 'Artigo', icon: BookOpen, description: 'Texto/Markdown' },
    { value: 'EXERCISE', label: 'Exercício', icon: PenTool, description: 'Atividade prática' },
    { value: 'QUIZ', label: 'Quiz', icon: HelpCircle, description: 'Teste de conhecimento' },
    { value: 'MATERIAL', label: 'Material', icon: Package, description: 'PDF, link, arquivo' },
];

const materialCategories: { value: MaterialCategory; label: string }[] = [
    { value: 'PDF', label: 'PDF' },
    { value: 'LINK', label: 'Link externo' },
    { value: 'GITHUB', label: 'GitHub' },
    { value: 'PRESENTATION', label: 'Apresentação' },
    { value: 'DOCUMENT', label: 'Documento' },
    { value: 'SPREADSHEET', label: 'Planilha' },
    { value: 'IMAGE', label: 'Imagem' },
    { value: 'VIDEO', label: 'Vídeo (arquivo)' },
    { value: 'AUDIO', label: 'Áudio' },
    { value: 'COMPRESSED', label: 'Arquivo compactado' },
    { value: 'OTHER', label: 'Outro' },
];

export default function ContentForm({
                                        content,
                                        onSubmit,
                                        onCancel,
                                        isLoading,
                                    }: ContentFormProps) {
    const [formData, setFormData] = useState<LessonContentFormData>({
        type: 'VIDEO',
        title: '',
        description: '',
        youtube_id: '',
        duration: '',
        content: '',
        quiz_data: [],
        material_url: '',
        material_category: 'PDF',
    });
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (content) {
            setFormData({
                type: content.type,
                title: content.title,
                description: content.description || '',
                youtube_id: content.youtube_id || '',
                duration: content.duration || '',
                content: content.content || '',
                quiz_data: (content.quiz_data as QuizQuestion[]) || [],
                material_url: content.material_url || '',
                material_category: content.material_category || 'PDF',
            });
        }
    }, [content]);

    const extractYoutubeId = (input: string): string => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
            /^([a-zA-Z0-9_-]{11})$/,
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) return match[1];
        }
        return input;
    };

    const handleYoutubeInput = (value: string): void => {
        const youtubeId = extractYoutubeId(value.trim());
        setFormData({ ...formData, youtube_id: youtubeId });
    };

    const handleQuizChange = (questions: QuizQuestion[]): void => {
        setFormData({ ...formData, quiz_data: questions });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            setError('Título é obrigatório');
            return;
        }

        if (formData.type === 'VIDEO' && !formData.youtube_id?.trim()) {
            setError('ID do YouTube é obrigatório para vídeos');
            return;
        }

        if (formData.type === 'MATERIAL' && !formData.material_url?.trim()) {
            setError('URL do material é obrigatória');
            return;
        }

        if (formData.type === 'QUIZ') {
            const questions = formData.quiz_data || [];
            if (questions.length === 0) {
                setError('Adicione pelo menos uma pergunta ao quiz');
                return;
            }

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
                if (q.options.some((o) => !o.text.trim())) {
                    setError(`Pergunta ${i + 1} tem opções vazias`);
                    return;
                }
                if (!q.options.some((o) => o.correct)) {
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-300 text-sm">
                    {error}
                </div>
            )}

            {/* Tipo */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Tipo de Conteúdo <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {typeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = formData.type === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: option.value })}
                                disabled={isLoading}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center ${
                                    isSelected
                                        ? 'border-sky-500 bg-sky-500/10'
                                        : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                                } ${content ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <Icon className={`h-5 w-5 ${isSelected ? 'text-sky-400' : 'text-gray-500'}`} strokeWidth={1.5} />
                                <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {content && (
                    <p className="mt-1.5 text-xs text-gray-500">
                        O tipo não pode ser alterado após a criação
                    </p>
                )}
            </div>

            {/* Título */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Título <span className="text-rose-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                    placeholder="Ex: Introdução às Variáveis"
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
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors resize-none"
                    placeholder="Breve descrição do conteúdo..."
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleYoutubeInput(e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                            placeholder="Cole a URL do YouTube ou o ID do vídeo"
                            disabled={isLoading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Ex: https://youtube.com/watch?v=abc123 ou abc123
                        </p>
                        {formData.youtube_id && (
                            <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-black max-w-md">
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, duration: e.target.value })}
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
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                        rows={10}
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
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                        rows={8}
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

            {formData.type === 'MATERIAL' && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            Categoria
                        </label>
                        <select
                            value={formData.material_category}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setFormData({ ...formData, material_category: e.target.value as MaterialCategory })
                            }
                            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white focus:border-sky-500 focus:outline-none transition-colors"
                            disabled={isLoading}
                        >
                            {materialCategories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            URL do Material <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="url"
                            value={formData.material_url}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, material_url: e.target.value })}
                            className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-colors"
                            placeholder="https://..."
                            disabled={isLoading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Cole o link do arquivo (Google Drive, GitHub, etc.)
                        </p>
                    </div>
                </>
            )}

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
                    {content ? 'Salvar Alterações' : 'Adicionar Conteúdo'}
                </button>
            </div>
        </form>
    );
}