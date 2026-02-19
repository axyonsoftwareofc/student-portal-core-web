// components/admin/lessons/LessonPreviewModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
    X,
    Video,
    BookOpen,
    PenTool,
    HelpCircle,
    Package,
    CheckCircle,
    Circle,
    Clock,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { LessonContent, LessonContentType, QuizQuestion } from '@/lib/types/lesson-contents';

interface LessonPreviewModalProps {
    lessonId: string;
    lessonTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

const typeConfig: Record<LessonContentType, { icon: typeof Video; color: string; label: string }> = {
    VIDEO: { icon: Video, color: 'sky', label: 'Vídeo' },
    ARTICLE: { icon: BookOpen, color: 'emerald', label: 'Artigo' },
    EXERCISE: { icon: PenTool, color: 'amber', label: 'Exercício' },
    QUIZ: { icon: HelpCircle, color: 'violet', label: 'Quiz' },
    MATERIAL: { icon: Package, color: 'gray', label: 'Material' },
};

export default function LessonPreviewModal({
                                               lessonId,
                                               lessonTitle,
                                               isOpen,
                                               onClose,
                                           }: LessonPreviewModalProps) {
    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [contents, setContents] = useState<LessonContent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    useEffect(() => {
        const fetchContents = async (): Promise<void> => {
            if (!isOpen || !lessonId) return;

            try {
                setIsLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase
                    .from('lesson_contents')
                    .select('*')
                    .eq('lesson_id', lessonId)
                    .order('order_index', { ascending: true });

                if (fetchError) throw fetchError;

                setContents((data as LessonContent[]) || []);
                setActiveIndex(0);
            } catch (err) {
                console.error('Erro ao carregar conteúdos:', err);
                setError('Erro ao carregar conteúdos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContents();
    }, [isOpen, lessonId, supabase]);

    if (!isOpen) return null;

    const activeContent = contents[activeIndex];

    const goToNext = (): void => {
        if (activeIndex < contents.length - 1) {
            setActiveIndex(activeIndex + 1);
        }
    };

    const goToPrev = (): void => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50 bg-amber-950/20">
                    <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                        <div>
                            <p className="text-sm font-medium text-amber-300">Modo Preview</p>
                            <h2 className="text-lg font-bold text-white">{lessonTitle}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-sky-400 animate-spin" strokeWidth={1.5} />
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" strokeWidth={1.5} />
                                <p className="text-gray-400">{error}</p>
                            </div>
                        </div>
                    ) : contents.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                                <p className="text-gray-400">Nenhum conteúdo nesta aula</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Sidebar - Lista de conteúdos */}
                            <div className="w-64 border-r border-gray-800/50 overflow-y-auto hidden lg:block">
                                <div className="p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                                        Conteúdos ({contents.length})
                                    </p>
                                    <div className="space-y-1">
                                        {contents.map((content, index) => {
                                            const config = typeConfig[content.type];
                                            const Icon = config.icon;
                                            const isActive = index === activeIndex;

                                            return (
                                                <button
                                                    key={content.id}
                                                    onClick={() => setActiveIndex(index)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                                                        isActive
                                                            ? 'bg-sky-500/10 border border-sky-500/30'
                                                            : 'hover:bg-gray-800/50'
                                                    }`}
                                                >
                                                    <span className={`flex items-center justify-center h-6 w-6 rounded ${
                                                        isActive ? 'bg-sky-500/20' : 'bg-gray-800'
                                                    }`}>
                                                        <Icon className={`h-3.5 w-3.5 ${
                                                            isActive ? 'text-sky-400' : 'text-gray-500'
                                                        }`} strokeWidth={1.5} />
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm truncate ${
                                                            isActive ? 'text-white font-medium' : 'text-gray-400'
                                                        }`}>
                                                            {content.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {config.label}
                                                            {content.duration && ` • ${content.duration}`}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-6">
                                    {activeContent && (
                                        <ContentPreview content={activeContent} />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer - Navigation */}
                {contents.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800/50">
                        <button
                            onClick={goToPrev}
                            disabled={activeIndex === 0}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                            Anterior
                        </button>

                        <div className="flex items-center gap-1">
                            {contents.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`h-2 rounded-full transition-all ${
                                        index === activeIndex
                                            ? 'w-6 bg-sky-500'
                                            : 'w-2 bg-gray-700 hover:bg-gray-600'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={goToNext}
                            disabled={activeIndex === contents.length - 1}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Próximo
                            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ContentPreview({ content }: { content: LessonContent }) {
    const config = typeConfig[content.type];
    const Icon = config.icon;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${config.color}-500/10 flex-shrink-0`}>
                    <Icon className={`h-5 w-5 text-${config.color}-400`} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${config.color}-500/10 text-${config.color}-400`}>
                            {config.label}
                        </span>
                        {content.duration && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" strokeWidth={1.5} />
                                {content.duration}
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl font-semibold text-white">{content.title}</h2>
                    {content.description && (
                        <p className="text-sm text-gray-500 mt-1">{content.description}</p>
                    )}
                </div>
            </div>

            {/* Content based on type */}
            {content.type === 'VIDEO' && content.youtube_id && (
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 overflow-hidden">
                    <div className="aspect-video bg-black">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${content.youtube_id}`}
                            title={content.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            {content.type === 'ARTICLE' && content.content && (
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                    <div className="prose prose-invert prose-sky max-w-none">
                        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                            {content.content}
                        </div>
                    </div>
                </div>
            )}

            {content.type === 'EXERCISE' && content.content && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-6">
                    <h3 className="font-semibold text-amber-300 mb-4 flex items-center gap-2">
                        <PenTool className="h-5 w-5" strokeWidth={1.5} />
                        Instruções do Exercício
                    </h3>
                    <div className="whitespace-pre-wrap text-amber-100/80 leading-relaxed">
                        {content.content}
                    </div>
                </div>
            )}

            {content.type === 'QUIZ' && (
                <QuizPreview quizData={content.quiz_data} />
            )}

            {content.type === 'MATERIAL' && (
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                            <Package className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-white">{content.title}</p>
                            <p className="text-sm text-gray-500">{content.material_category}</p>
                        </div>
                        {content.material_url && (
                            <a
                                href={content.material_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                                Abrir
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function QuizPreview({ quizData }: { quizData: QuizQuestion[] | null }) {
    const questions = quizData || [];

    if (questions.length === 0) {
        return (
            <div className="text-center py-8 rounded-lg border border-gray-800/50 bg-gray-900/30">
                <HelpCircle className="h-10 w-10 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-gray-400">Nenhuma pergunta configurada</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-violet-500/20 bg-violet-950/20 p-4 text-center">
                <p className="text-sm text-violet-300">
                    Preview do Quiz • {questions.length} {questions.length === 1 ? 'questão' : 'questões'}
                </p>
            </div>

            {questions.map((question, index) => (
                <div
                    key={question.id}
                    className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4"
                >
                    <p className="text-xs text-gray-500 mb-2">
                        Questão {index + 1} de {questions.length}
                    </p>
                    <p className="text-white mb-4">{question.question}</p>

                    <div className="space-y-2">
                        {question.options.map((option) => (
                            <div
                                key={option.id}
                                className={`flex items-center gap-3 rounded-lg border p-3 ${
                                    option.correct
                                        ? 'border-emerald-500/50 bg-emerald-500/10'
                                        : 'border-gray-800 bg-gray-900/50'
                                }`}
                            >
                                {option.correct ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                                ) : (
                                    <Circle className="h-4 w-4 text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                                )}
                                <span className={option.correct ? 'text-emerald-300' : 'text-gray-300'}>
                                    {option.text}
                                </span>
                                {option.correct && (
                                    <span className="ml-auto text-xs text-emerald-400">✓ Correta</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}