// app/(dashboard)/aluno/estudar/[modulo]/[aula]/page.tsx
'use client';

import { useStudentExercise } from '@/hooks/useStudentExercise';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Video,
    FileText,
    PenTool,
    HelpCircle,
    Package,
    CheckCircle,
    Circle,
    Loader2,
    AlertCircle,
    RotateCcw,
    BookOpen,
    Clock,
    ChevronLeft,
    ChevronRight,
    StickyNote,
    ArrowLeft,
    X,
    Play,
    ExternalLink,
    Send,
    Pencil,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLessonContents } from '@/hooks/useStudentLessonContents';
import { useContentProgress } from '@/hooks/useContentProgress';
import { useLessonNote } from '@/hooks/useLessonNote';
import { NoteSidePanel } from '@/components/student/notes/NoteSidePanel';
import type { LessonContentWithProgress, LessonContentType, QuizQuestion } from '@/lib/types/lesson-contents';

const typeConfig: Record<LessonContentType, { icon: typeof Video; color: string; label: string }> = {
    VIDEO: { icon: Video, color: 'sky', label: 'Vídeo' },
    ARTICLE: { icon: BookOpen, color: 'emerald', label: 'Artigo' },
    EXERCISE: { icon: PenTool, color: 'amber', label: 'Exercício' },
    QUIZ: { icon: HelpCircle, color: 'violet', label: 'Quiz' },
    MATERIAL: { icon: Package, color: 'gray', label: 'Material' },
};

export default function AulaPage() {
    const params = useParams();
    const moduloId = params?.modulo as string;
    const aulaId = params?.aula as string;
    const { user } = useAuth();

    const {
        lesson,
        module,
        contents,
        completedCount,
        totalCount,
        progressPercentage,
        isLessonCompleted,
        isLoading,
        error,
        refetch,
    } = useStudentLessonContents(aulaId, user?.id || null);

    const { markAsComplete, saveQuizResult } = useContentProgress();

    const [activeContentIndex, setActiveContentIndex] = useState<number>(0);
    const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
    const [isSavingProgress, setIsSavingProgress] = useState<boolean>(false);

    const {
        note,
        isLoading: isLoadingNote,
        isSaving: isSavingNote,
        lastSavedAt,
        saveNote,
        deleteNote: deleteNoteAction,
    } = useLessonNote({
        studentId: user?.id || '',
        lessonId: aulaId,
        moduleId: moduloId,
        courseId: module?.course_id || '',
    });

    // Encontrar primeiro conteúdo não concluído
    useEffect(() => {
        if (contents.length > 0) {
            const firstIncomplete = contents.findIndex((c) => !c.is_completed);
            if (firstIncomplete !== -1) {
                setActiveContentIndex(firstIncomplete);
            } else {
                setActiveContentIndex(0);
            }
        }
    }, [contents]);

    const activeContent = contents[activeContentIndex];

    const handleMarkComplete = async (): Promise<void> => {
        if (!user?.id || !activeContent) return;

        setIsSavingProgress(true);
        const result = await markAsComplete({
            studentId: user.id,
            contentId: activeContent.id,
        });
        setIsSavingProgress(false);

        if (result.success) {
            await refetch();
            // Auto-avançar para próximo conteúdo
            if (activeContentIndex < contents.length - 1) {
                setActiveContentIndex(activeContentIndex + 1);
            }
        }
    };

    const handleQuizComplete = async (
        score: number,
        total: number,
        answers: Record<string, string>
    ): Promise<void> => {
        if (!user?.id || !activeContent) return;

        setIsSavingProgress(true);
        const result = await saveQuizResult({
            studentId: user.id,
            contentId: activeContent.id,
            score,
            total,
            answers,
        });
        setIsSavingProgress(false);

        if (result.success) {
            await refetch();
        }
    };

    const goToContent = (index: number): void => {
        setActiveContentIndex(index);
    };

    const goToNext = (): void => {
        if (activeContentIndex < contents.length - 1) {
            setActiveContentIndex(activeContentIndex + 1);
        }
    };

    const goToPrev = (): void => {
        if (activeContentIndex > 0) {
            setActiveContentIndex(activeContentIndex - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 text-sky-400 animate-spin mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400 text-sm">Carregando aula...</p>
                </div>
            </div>
        );
    }

    if (error || !lesson || !module) {
        return (
            <div className="space-y-4">
                <Link
                    href={`/aluno/estudar/${moduloId}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar
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

    if (contents.length === 0) {
        return (
            <div className="space-y-4">
                <Link
                    href={`/aluno/estudar/${moduloId}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Voltar ao módulo
                </Link>
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-300 font-medium mb-1">{lesson.title}</p>
                        <p className="text-gray-500 text-sm">Esta aula ainda não possui conteúdos</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className={`transition-all duration-300 ${isNotesOpen ? 'lg:mr-96' : ''}`}>
                <div className="space-y-6">
                    {/* Breadcrumb + Notes Button */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm overflow-x-auto pb-2 flex-1 min-w-0">
                            <Link
                                href="/aluno/estudar"
                                className="text-gray-500 hover:text-sky-400 transition-colors flex-shrink-0"
                            >
                                Estudar
                            </Link>
                            <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                            <Link
                                href={`/aluno/estudar/${moduloId}`}
                                className="text-gray-500 hover:text-sky-400 transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                            >
                                {module.name}
                            </Link>
                            <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" strokeWidth={1.5} />
                            <span className="text-gray-300 truncate max-w-[120px] sm:max-w-[250px]">
                                {lesson.title}
                            </span>
                        </div>

                        <button
                            onClick={() => setIsNotesOpen((prev) => !prev)}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-sm font-medium"
                        >
                            {isNotesOpen ? (
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            ) : (
                                <StickyNote className="h-4 w-4" strokeWidth={1.5} />
                            )}
                            <span className="hidden sm:inline">
                                {isNotesOpen ? 'Fechar' : 'Anotações'}
                            </span>
                        </button>
                    </div>

                    {/* Lesson Header + Progress */}
                    <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h1 className="font-nacelle text-xl sm:text-2xl font-semibold text-white">
                                    {lesson.title}
                                </h1>
                                {lesson.description && (
                                    <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                                )}
                            </div>
                            {isLessonCompleted && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    Concluída
                                </span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">
                                    Progresso: {completedCount}/{totalCount} conteúdos
                                </span>
                                <span className="text-sky-400 font-medium">{progressPercentage}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                                <div
                                    className="h-full bg-sky-500 transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Navigation */}
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {contents.map((content, index) => {
                            const config = typeConfig[content.type];
                            const Icon = config.icon;
                            const isActive = index === activeContentIndex;
                            const isCompleted = content.is_completed;

                            return (
                                <button
                                    key={content.id}
                                    onClick={() => goToContent(index)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                                        isActive
                                            ? 'border-sky-500 bg-sky-500/10'
                                            : isCompleted
                                                ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
                                                : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
                                    }`}
                                >
                                    <span className={`flex items-center justify-center h-6 w-6 rounded-full ${
                                        isCompleted
                                            ? 'bg-emerald-500/20'
                                            : isActive
                                                ? 'bg-sky-500/20'
                                                : 'bg-gray-800'
                                    }`}>
                                        {isCompleted ? (
                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.5} />
                                        ) : isActive ? (
                                            <Play className="h-3 w-3 text-sky-400" strokeWidth={1.5} />
                                        ) : (
                                            <Circle className="h-3 w-3 text-gray-600" strokeWidth={1.5} />
                                        )}
                                    </span>
                                    <div className="text-left">
                                        <p className={`text-sm font-medium ${
                                            isActive ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-gray-400'
                                        }`}>
                                            {index + 1}. {content.title}
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

                    {/* Active Content */}
                    {activeContent && (
                        <ContentViewer
                            content={activeContent}
                            onComplete={handleMarkComplete}
                            onQuizComplete={handleQuizComplete}
                            isSaving={isSavingProgress}
                        />
                    )}

                    {/* Navigation Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                        <button
                            onClick={goToPrev}
                            disabled={activeContentIndex === 0}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                            Anterior
                        </button>

                        <div className="flex items-center gap-1">
                            {contents.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToContent(index)}
                                    className={`h-2 rounded-full transition-all ${
                                        index === activeContentIndex
                                            ? 'w-6 bg-sky-500'
                                            : contents[index].is_completed
                                                ? 'w-2 bg-emerald-500'
                                                : 'w-2 bg-gray-700 hover:bg-gray-600'
                                    }`}
                                />
                            ))}
                        </div>

                        {activeContentIndex < contents.length - 1 ? (
                            <button
                                onClick={goToNext}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors"
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        ) : (
                            <Link
                                href={`/aluno/estudar/${moduloId}`}
                                className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                                Voltar ao módulo
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <NoteSidePanel
                isOpen={isNotesOpen}
                lessonTitle={lesson.title}
                noteContent={note?.content || ''}
                isSaving={isSavingNote}
                isLoading={isLoadingNote}
                lastSavedAt={lastSavedAt}
                onContentChange={saveNote}
                onDelete={deleteNoteAction}
                onClose={() => setIsNotesOpen(false)}
            />
        </div>
    );
}

// ============================================
// SUB-COMPONENTES
// ============================================

interface ContentViewerProps {
    content: LessonContentWithProgress;
    onComplete: () => Promise<void>;
    onQuizComplete: (score: number, total: number, answers: Record<string, string>) => Promise<void>;
    isSaving: boolean;
}

function ContentViewer({ content, onComplete, onQuizComplete, isSaving }: ContentViewerProps) {
    const config = typeConfig[content.type];
    const Icon = config.icon;

    return (
        <div className="space-y-6">
            {/* Content Header */}
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
                        {content.is_completed && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                                Concluído
                            </span>
                        )}
                    </div>
                    <h2 className="font-semibold text-lg text-white">{content.title}</h2>
                    {content.description && (
                        <p className="text-sm text-gray-500 mt-1">{content.description}</p>
                    )}
                </div>
            </div>

            {/* Content Body */}
            {content.type === 'VIDEO' && (
                <VideoContentView content={content} onComplete={onComplete} isSaving={isSaving} />
            )}
            {content.type === 'ARTICLE' && (
                <ArticleContentView content={content} onComplete={onComplete} isSaving={isSaving} />
            )}
            {content.type === 'EXERCISE' && (
                <ExerciseContentView content={content} onComplete={onComplete} isSaving={isSaving} />
            )}
            {content.type === 'QUIZ' && (
                <QuizContentView content={content} onComplete={onQuizComplete} isSaving={isSaving} />
            )}
            {content.type === 'MATERIAL' && (
                <MaterialContentView content={content} onComplete={onComplete} isSaving={isSaving} />
            )}
        </div>
    );
}

function VideoContentView({
                              content,
                              onComplete,
                              isSaving,
                          }: {
    content: LessonContentWithProgress;
    onComplete: () => Promise<void>;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-4">
            {content.youtube_id ? (
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
            ) : (
                <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-12 text-center">
                    <Video className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-gray-400">Vídeo não disponível</p>
                </div>
            )}

            {!content.is_completed && (
                <button
                    onClick={onComplete}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    ) : (
                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    )}
                    Marcar como concluído
                </button>
            )}
        </div>
    );
}

function ArticleContentView({
                                content,
                                onComplete,
                                isSaving,
                            }: {
    content: LessonContentWithProgress;
    onComplete: () => Promise<void>;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6">
                {content.content ? (
                    <div className="prose prose-invert prose-sky max-w-none">
                        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                            {content.content}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-gray-400">Conteúdo não disponível</p>
                    </div>
                )}
            </div>

            {!content.is_completed && (
                <button
                    onClick={onComplete}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    ) : (
                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    )}
                    Marcar como concluído
                </button>
            )}
        </div>
    );
}

function ExerciseContentView({
                                 content,
                                 onComplete,
                                 isSaving,
                             }: {
    content: LessonContentWithProgress;
    onComplete: () => Promise<void>;
    isSaving: boolean;
}) {
    const { user } = useAuth();
    const { submission, isLoading: isLoadingSubmission, isSaving: isSavingSubmission, submitAnswer, refetch } = useStudentExercise(
        content.id,
        user?.id || null
    );

    const [activeTab, setActiveTab] = useState<'text' | 'code' | 'link'>('code');
    const [answerText, setAnswerText] = useState<string>('');
    const [answerCode, setAnswerCode] = useState<string>('');
    const [answerUrl, setAnswerUrl] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // Carregar dados da submissão existente
    useEffect(() => {
        if (submission) {
            setAnswerText(submission.answer_text || '');
            setAnswerCode(submission.answer_code || '');
            setAnswerUrl(submission.answer_url || '');

            // Definir tab ativa baseado no que foi preenchido
            if (submission.answer_code) setActiveTab('code');
            else if (submission.answer_text) setActiveTab('text');
            else if (submission.answer_url) setActiveTab('link');
        }
    }, [submission]);

    const handleSubmit = async (): Promise<void> => {
        const result = await submitAnswer({
            answer_text: activeTab === 'text' ? answerText : undefined,
            answer_code: activeTab === 'code' ? answerCode : undefined,
            answer_url: activeTab === 'link' ? answerUrl : undefined,
        });

        if (result.success) {
            setIsEditing(false);
            await onComplete();
        }
    };

    const hasAnswer = answerText.trim() || answerCode.trim() || answerUrl.trim();

    const getStatusBadge = () => {
        if (!submission) return null;

        const statusConfig: Record<string, { label: string; color: string }> = {
            pending: { label: 'Aguardando correção', color: 'amber' },
            reviewed: { label: 'Corrigido', color: 'sky' },
            approved: { label: 'Aprovado', color: 'emerald' },
            needs_revision: { label: 'Precisa de revisão', color: 'rose' },
        };

        const config = statusConfig[submission.status] || statusConfig.pending;

        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-${config.color}-500/10 text-${config.color}-400`}>
                {config.label}
            </span>
        );
    };

    // Loading state
    if (isLoadingSubmission) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-sky-400 animate-spin" strokeWidth={1.5} />
            </div>
        );
    }

    // Se já submeteu e não está editando, mostrar resultado
    if (submission && !isEditing) {
        return (
            <div className="space-y-4">
                {/* Instruções */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4 sm:p-6">
                    <h3 className="font-semibold text-amber-300 mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" strokeWidth={1.5} />
                        Instruções do Exercício
                    </h3>
                    {content.content ? (
                        <div className="whitespace-pre-wrap text-amber-100/80 leading-relaxed">
                            {content.content}
                        </div>
                    ) : (
                        <p className="text-amber-100/60">Nenhuma instrução disponível</p>
                    )}
                </div>

                {/* Status da submissão */}
                <div className={`rounded-lg border p-4 sm:p-6 ${
                    submission.status === 'approved'
                        ? 'border-emerald-500/20 bg-emerald-950/20'
                        : submission.status === 'needs_revision'
                            ? 'border-rose-500/20 bg-rose-950/20'
                            : 'border-sky-500/20 bg-sky-950/20'
                }`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                                Resposta Enviada
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Enviado em {new Date(submission.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                            </p>
                        </div>
                        {getStatusBadge()}
                    </div>

                    {/* Nota e Feedback */}
                    {(submission.status === 'approved' || submission.status === 'reviewed' || submission.status === 'needs_revision') && (
                        <div className="space-y-3 mb-4">
                            {submission.grade !== null && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Nota:</span>
                                    <span className="text-lg font-bold text-white">
                                        {submission.grade.toFixed(1)} / 10
                                    </span>
                                </div>
                            )}
                            {submission.feedback && (
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Feedback do professor:</p>
                                    <div className="rounded-lg bg-gray-900/50 p-3 text-sm text-gray-300">
                                        {submission.feedback}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Preview da resposta */}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-400">Sua resposta:</p>
                        <div className="rounded-lg bg-gray-900/50 p-3 text-sm text-gray-300 max-h-32 overflow-y-auto">
                            {submission.answer_code && (
                                <pre className="font-mono text-xs whitespace-pre-wrap">{submission.answer_code}</pre>
                            )}
                            {submission.answer_text && !submission.answer_code && (
                                <p className="whitespace-pre-wrap">{submission.answer_text}</p>
                            )}
                            {submission.answer_url && (
                                <a
                                    href={submission.answer_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-400 hover:underline flex items-center gap-1"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    {submission.answer_url}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Botão de editar (só se ainda está pendente) */}
                    {submission.status === 'pending' && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            Editar resposta
                        </button>
                    )}

                    {submission.status === 'needs_revision' && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 transition-colors"
                        >
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            Revisar e reenviar
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Formulário de resposta
    return (
        <div className="space-y-4">
            {/* Instruções */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4 sm:p-6">
                <h3 className="font-semibold text-amber-300 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" strokeWidth={1.5} />
                    Instruções do Exercício
                </h3>
                {content.content ? (
                    <div className="whitespace-pre-wrap text-amber-100/80 leading-relaxed">
                        {content.content}
                    </div>
                ) : (
                    <p className="text-amber-100/60">Nenhuma instrução disponível</p>
                )}
            </div>

            {/* Formulário de resposta */}
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4 sm:p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <PenTool className="h-5 w-5 text-amber-400" strokeWidth={1.5} />
                    Sua Resposta
                </h3>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 border-b border-gray-800/50">
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'code'
                                ? 'border-b-2 border-sky-500 text-white'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        💻 Código
                    </button>
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'text'
                                ? 'border-b-2 border-sky-500 text-white'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        📝 Texto
                    </button>
                    <button
                        onClick={() => setActiveTab('link')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'link'
                                ? 'border-b-2 border-sky-500 text-white'
                                : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        🔗 Link
                    </button>
                </div>

                {/* Conteúdo das tabs */}
                {activeTab === 'code' && (
                    <textarea
                        value={answerCode}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswerCode(e.target.value)}
                        rows={12}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none font-mono text-sm"
                        placeholder="Cole seu código aqui..."
                    />
                )}

                {activeTab === 'text' && (
                    <textarea
                        value={answerText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswerText(e.target.value)}
                        rows={8}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none"
                        placeholder="Escreva sua resposta aqui..."
                    />
                )}

                {activeTab === 'link' && (
                    <input
                        type="url"
                        value={answerUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnswerUrl(e.target.value)}
                        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-white placeholder-gray-600 focus:border-sky-500 focus:outline-none"
                        placeholder="https://github.com/seu-usuario/seu-repositorio"
                    />
                )}

                {/* Botões */}
                <div className="flex gap-3 mt-4">
                    {isEditing && (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={!hasAnswer || isSavingSubmission}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSavingSubmission ? (
                            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                        ) : (
                            <Send className="h-4 w-4" strokeWidth={1.5} />
                        )}
                        {submission ? 'Atualizar Resposta' : 'Enviar Resposta'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function MaterialContentView({
                                 content,
                                 onComplete,
                                 isSaving,
                             }: {
    content: LessonContentWithProgress;
    onComplete: () => Promise<void>;
    isSaving: boolean;
}) {
    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800">
                        <Package className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-white">{content.title}</p>
                        <p className="text-sm text-gray-500">{content.material_category || 'Material'}</p>
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

            {!content.is_completed && (
                <button
                    onClick={onComplete}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    ) : (
                        <CheckCircle className="h-4 w-4" strokeWidth={1.5} />
                    )}
                    Marcar como concluído
                </button>
            )}
        </div>
    );
}

function QuizContentView({
                             content,
                             onComplete,
                             isSaving,
                         }: {
    content: LessonContentWithProgress;
    onComplete: (score: number, total: number, answers: Record<string, string>) => Promise<void>;
    isSaving: boolean;
}) {
    const [quizStarted, setQuizStarted] = useState<boolean>(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

    const questions = (content.quiz_data as QuizQuestion[]) || [];
    const totalQuestions = questions.length;

    const previousScore = content.progress?.quiz_score;
    const previousTotal = content.progress?.quiz_total;

    const calculateScore = (): number => {
        return questions.filter((q) => {
            const correctOption = q.options.find((o) => o.correct);
            return quizAnswers[q.id] === correctOption?.id;
        }).length;
    };

    const currentScore = calculateScore();

    const getFeedback = (score: number, total: number) => {
        const percentage = (score / total) * 100;
        if (percentage === 100) return { message: "Perfeito!", color: "emerald" };
        if (percentage >= 80) return { message: "Excelente!", color: "sky" };
        if (percentage >= 60) return { message: "Bom trabalho!", color: "amber" };
        return { message: "Continue praticando!", color: "rose" };
    };

    const handleSubmit = async (): Promise<void> => {
        setQuizSubmitted(true);
        await onComplete(currentScore, totalQuestions, quizAnswers);
    };

    const handleRetry = (): void => {
        setQuizStarted(false);
        setQuizSubmitted(false);
        setQuizAnswers({});
    };

    if (questions.length === 0) {
        return (
            <div className="text-center py-8 rounded-lg border border-gray-800/50 bg-gray-900/30">
                <HelpCircle className="h-10 w-10 text-gray-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-gray-400">Nenhuma pergunta configurada</p>
            </div>
        );
    }

    // Mostrar resultado anterior
    if (content.is_completed && !quizStarted && previousScore !== undefined && previousScore !== null) {
        const feedback = getFeedback(previousScore, previousTotal || totalQuestions);

        return (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-6 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-white mb-2">Quiz Concluído!</h3>
                <p className="text-3xl font-bold text-emerald-400 mb-2">
                    {previousScore}/{previousTotal || totalQuestions}
                </p>
                <p className="text-gray-400 mb-4">{feedback.message}</p>
                <button
                    onClick={() => setQuizStarted(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500"
                >
                    <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                    Refazer Quiz
                </button>
            </div>
        );
    }

    // Tela inicial
    if (!quizStarted && !quizSubmitted) {
        return (
            <div className="rounded-lg border border-violet-500/20 bg-violet-950/20 p-6 text-center">
                <HelpCircle className="h-12 w-12 text-violet-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-white mb-2">Pronto para o Quiz?</h3>
                <p className="text-gray-400 mb-4">
                    {totalQuestions} {totalQuestions === 1 ? 'questão' : 'questões'}
                </p>
                <button
                    onClick={() => setQuizStarted(true)}
                    className="px-6 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-500"
                >
                    Começar
                </button>
            </div>
        );
    }

    // Resultado após enviar
    if (quizSubmitted) {
        const feedback = getFeedback(currentScore, totalQuestions);

        return (
            <div className={`rounded-lg border border-${feedback.color}-500/20 bg-${feedback.color}-950/20 p-6 text-center`}>
                <CheckCircle className={`h-12 w-12 text-${feedback.color}-400 mx-auto mb-4`} strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-white mb-2">{feedback.message}</h3>
                <p className="text-3xl font-bold text-white mb-4">
                    {currentScore}/{totalQuestions}
                </p>
                <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700"
                >
                    <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                    Refazer
                </button>
            </div>
        );
    }

    // Quiz em andamento
    return (
        <div className="space-y-4">
            {questions.map((question, index) => (
                <div key={question.id} className="rounded-lg border border-gray-800/50 bg-gray-900/30 p-4">
                    <p className="text-xs text-gray-500 mb-2">
                        Questão {index + 1} de {totalQuestions}
                    </p>
                    <p className="text-white mb-4">{question.question}</p>
                    <div className="space-y-2">
                        {question.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: option.id })}
                                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                                    quizAnswers[question.id] === option.id
                                        ? 'border-violet-500 bg-violet-500/10'
                                        : 'border-gray-800 hover:border-gray-700'
                                }`}
                            >
                                {quizAnswers[question.id] === option.id ? (
                                    <CheckCircle className="h-4 w-4 text-violet-400" strokeWidth={1.5} />
                                ) : (
                                    <Circle className="h-4 w-4 text-gray-600" strokeWidth={1.5} />
                                )}
                                <span className="text-gray-200">{option.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <button
                onClick={handleSubmit}
                disabled={Object.keys(quizAnswers).length !== totalQuestions || isSaving}
                className="w-full rounded-lg bg-violet-600 py-3 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
                Enviar ({Object.keys(quizAnswers).length}/{totalQuestions})
            </button>
        </div>
    );
}