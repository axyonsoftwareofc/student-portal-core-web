// app/(dashboard)/admin/aulas/[id]/preview/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Video,
    FileText,
    PenTool,
    HelpCircle,
    Clock,
    ArrowLeft,
    Loader2,
    AlertCircle,
    BookOpen,
    Package,
    Circle,
    Paperclip,
    Eye,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Lesson, Module, Material } from '@/lib/types/database';

interface LessonWithDetails extends Lesson {
    module?: Module & {
        course?: {
            id: string;
            name: string;
        };
    };
}

export default function AulaPreviewPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const lessonId = params?.id as string;
    const moduleId = searchParams.get('modulo');

    const supabaseRef = useRef(createClient());
    const supabase = supabaseRef.current;

    const [lesson, setLesson] = useState<LessonWithDetails | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'materials'>('content');

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                const { data: lessonData, error: lessonError } = await supabase
                    .from('lessons')
                    .select(`
                        *,
                        module:modules (
                            *,
                            course:courses (id, name)
                        )
                    `)
                    .eq('id', lessonId)
                    .single();

                if (lessonError) throw lessonError;

                setLesson(lessonData as LessonWithDetails);

                const { data: materialsData } = await supabase
                    .from('materials')
                    .select('*')
                    .eq('lesson_id', lessonId)
                    .order('created_at', { ascending: true });

                setMaterials((materialsData as Material[]) || []);
            } catch (err) {
                console.error('Erro ao carregar aula:', err);
                setError('Erro ao carregar a aula');
            } finally {
                setIsLoading(false);
            }
        };

        if (lessonId) {
            fetchData();
        }
    }, [lessonId, supabase]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400 text-sm">Carregando preview...</p>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="space-y-4">
                <Link
                    href="/admin/aulas"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar para Aulas
                </Link>
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-300 font-medium mb-1">Aula não encontrada</p>
                        <p className="text-gray-500 text-sm">{error || 'Verifique se o link está correto'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const hasMaterials = materials.length > 0;

    const getTypeConfig = (type: string) => {
        const configs: Record<string, { icon: typeof Video; color: string; label: string }> = {
            VIDEO: { icon: Video, color: 'emerald', label: 'Vídeo' },
            ARTICLE: { icon: FileText, color: 'sky', label: 'Artigo' },
            EXERCISE: { icon: PenTool, color: 'amber', label: 'Exercício' },
            QUIZ: { icon: HelpCircle, color: 'violet', label: 'Quiz' },
        };
        return configs[type] || configs.VIDEO;
    };

    const typeConfig = getTypeConfig(lesson.type);
    const TypeIcon = typeConfig.icon;

    return (
        <div className="space-y-6">
            {/* Header com aviso de preview */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-amber-950/30 border border-amber-500/20">
                <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                    <div>
                        <p className="text-sm font-medium text-amber-300">Modo Preview</p>
                        <p className="text-xs text-amber-400/70">Visualizando como o aluno verá esta aula</p>
                    </div>
                </div>
                <Link
                    href="/admin/aulas"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar
                </Link>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{lesson.module?.course?.name || 'Curso'}</span>
                <span>›</span>
                <span>{lesson.module?.name || 'Módulo'}</span>
                <span>›</span>
                <span className="text-gray-300">{lesson.title}</span>
            </div>

            {/* Tabs */}
            {hasMaterials && (
                <div className="flex gap-1 border-b border-gray-800/50">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                            activeTab === 'content'
                                ? 'border-b-2 border-sky-500 text-white'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <TypeIcon className="h-4 w-4" strokeWidth={1.5} />
                        Conteúdo
                    </button>
                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                            activeTab === 'materials'
                                ? 'border-b-2 border-sky-500 text-white'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Paperclip className="h-4 w-4" strokeWidth={1.5} />
                        Materiais
                        <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-sky-500/10 text-sky-400">
                            {materials.length}
                        </span>
                    </button>
                </div>
            )}

            {activeTab === 'content' ? (
                <div className="space-y-6">
                    {/* Lesson Header */}
                    <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${typeConfig.color}-500/10 flex-shrink-0`}>
                            <TypeIcon className={`h-5 w-5 text-${typeConfig.color}-400`} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${typeConfig.color}-500/10 text-${typeConfig.color}-400`}>
                                    {typeConfig.label}
                                </span>
                                {lesson.duration && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                                        {lesson.duration}
                                    </span>
                                )}
                            </div>
                            <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                                {lesson.title}
                            </h1>
                            {lesson.description && (
                                <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Content based on type */}
                    {lesson.type === 'VIDEO' && (
                        <>
                            {lesson.youtube_id ? (
                                <div className="rounded-lg border border-gray-800/50 bg-gray-900/50 overflow-hidden">
                                    <div className="aspect-video bg-black">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${lesson.youtube_id}`}
                                            title={lesson.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-12 text-center">
                                    <Video className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                                    <p className="text-gray-400">Vídeo não disponível</p>
                                </div>
                            )}
                        </>
                    )}

                    {lesson.type === 'ARTICLE' && (
                        <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6 lg:p-8">
                            {lesson.content ? (
                                <div className="prose prose-invert prose-sky max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm sm:text-base">
                                        {lesson.content}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                                    <p className="text-gray-400">Conteúdo não disponível</p>
                                </div>
                            )}
                        </div>
                    )}

                    {lesson.type === 'EXERCISE' && (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4 sm:p-6 lg:p-8">
                            <h3 className="font-semibold text-amber-300 mb-4 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" strokeWidth={1.5} />
                                Instruções do Exercício
                            </h3>
                            {lesson.content ? (
                                <div className="whitespace-pre-wrap text-amber-100/80 leading-relaxed text-sm sm:text-base">
                                    {lesson.content}
                                </div>
                            ) : (
                                <p className="text-amber-100/60">Nenhuma instrução disponível</p>
                            )}
                        </div>
                    )}

                    {lesson.type === 'QUIZ' && (
                        <QuizPreview quizData={lesson.quiz_data} title={lesson.title} />
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Paperclip className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                        Materiais da Aula
                    </h2>

                    {materials.length > 0 ? (
                        <div className="space-y-2">
                            {materials.map((material) => (
                                <div
                                    key={material.id}
                                    className="flex items-center gap-3 rounded-lg border border-gray-800/50 bg-gray-900/30 p-3"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                                        <Package className="h-5 w-5 text-sky-400" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-200 text-sm truncate">
                                            {material.name}
                                        </p>
                                        <p className="text-xs text-gray-500">{material.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 rounded-lg border border-gray-800/50 bg-gray-900/30">
                            <Package className="h-10 w-10 text-gray-600 mx-auto mb-2" strokeWidth={1.5} />
                            <p className="text-gray-400 text-sm">Nenhum material disponível</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface QuizQuestion {
    id: string;
    question: string;
    options: { id: string; text: string; correct: boolean }[];
}

function QuizPreview({ quizData, title }: { quizData: unknown; title: string }) {
    const questions = (quizData as QuizQuestion[]) || [];

    if (questions.length === 0) {
        return (
            <div className="text-center py-12 rounded-lg border border-gray-800/50 bg-gray-900/30">
                <HelpCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-gray-400">Nenhuma pergunta configurada para este quiz</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-violet-500/20 bg-violet-950/20 p-6 sm:p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10">
                        <HelpCircle className="h-8 w-8 text-violet-400" strokeWidth={1.5} />
                    </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">Preview do Quiz</h3>
                <p className="mb-2 text-sm text-gray-400">{title}</p>
                <p className="mb-6 text-xs text-gray-500">
                    {questions.length} {questions.length === 1 ? 'questão' : 'questões'}
                </p>
            </div>

            <div className="space-y-4">
                {questions.map((question: QuizQuestion, index: number) => (
                    <div
                        key={question.id}
                        className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-5"
                    >
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <h4 className="font-medium text-gray-300 text-sm">
                                Questão {index + 1} de {questions.length}
                            </h4>
                        </div>

                        <p className="mb-4 text-white text-sm sm:text-base">{question.question}</p>

                        <div className="space-y-2">
                            {question.options.map((option) => (
                                <div
                                    key={option.id}
                                    className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                                        option.correct
                                            ? 'border-emerald-500/50 bg-emerald-500/10'
                                            : 'border-gray-800 bg-gray-900/50'
                                    }`}
                                >
                                    <Circle className={`h-4 w-4 flex-shrink-0 ${option.correct ? 'text-emerald-400' : 'text-gray-600'}`} strokeWidth={1.5} />
                                    <span className={option.correct ? 'text-emerald-300' : 'text-gray-200'}>{option.text}</span>
                                    {option.correct && (
                                        <span className="ml-auto text-xs text-emerald-400">✓ Correta</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}